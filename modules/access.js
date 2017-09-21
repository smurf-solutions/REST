var loginPage 	= 'static/index.html'

var fs          = require( "fs" )
var crypto		= require( "crypto" )
var adminConfig = require( "/etc/rest/admin.json" )


var userRights      = 
{
	"find":["find"],
	"findOne":["find"],
	"aggregate":["find"],
	"count":["find"],
	"disting":["find"],	
	"geoHaystackSearch":["find"],
	"geoNear":["find"],
	"isCaped":["find"],

	"replaceOne":["update"],
	"updateOne":["update"],
	"updateMany":["update"], 

	"insertOne":["insert"],
	"insertMany":["insert"],
	
	"deleteOne":["delete"],
	"deleteMany":["delete"],
		//+ --- 
	"updateOne:upsert":["update","insert"],
	"updateMany:upsert":["update","insert"],
	"findOneAndDelete":["find","delete"],
	"findOneAndReplace":["read","update"],
	"findOneAndReplace:upsert":["read","update","insert"],
	"findOneAndUpdate":["read","update"],
	"findOneAndUpdate:upsert":["read","update","insert"],
	"findOneAndDuplicate":["read","insert"],
	
		// admin
	"listCollections":["admin"],
	"renameCollection":["admin"],
	"createCollection":["admin"], 
	"dropCollection":["admin"],
	"dropDatabase":["admin"],
	"stats":["admin"],
	"command":["admin"],
	"ping":["admin"],
	"indexInformation":["admin"],
	"addUser":["admin"],
	"removeUser":["admin"],
	
		// super admin
	"buildInfo":["superadmin"],
	"command":["superadmin"],
	"listDatabases":["superadmin"],
	"logout":["superadmin"],
	"ping":["superadmin"],
	"serverStatus":["superadmin"],
	"validateCollection":["superadmin"]
}


var rights      = 
{
	'find':[
		"find",
		"findOne",
		"aggregate",
		"count",
		"disting",	
		"geoHaystackSearch",
		"geoNear",
		"isCaped",
			//+ --- 
		"findOneAndDelete",
		"findOneAndReplace",
		"findOneAndUpdate",
		"findOneAndDuplicate"
	],
	'update':[
		"replaceOne",
		"updateOne",
		"updateMany", 
			//+ --- find
		"findOneAndReplace",
		"findOneAndUpdate"
	],
	'insert': [
		"insertOne",
		"insertMany",
		"updateOne",// {upsert:1}
		"updateMany",// {upsert:1}
			//+ --- find
		"findOneAndReplace",// {upsert:1}
		"findOneAndUpdate",// {upsert:1}
		"findOneAndDuplicate"
	],
	'delete': [
		"deleteOne",
		"deleteMany",
			//+ --- find
		"findOneAndDelete"
	],
	"admin": [
		"listCollections",
		"renameCollection",
		"createCollection",    
		"dropCollection",
		"dropDatabase", 
		"stats",
		"command",
		"ping",
		"indexInformation",
		"addUser",
		"removeUser"
	],
	"superadmin": [
		"buildInfo",
		"command",
		"listDatabases",
		"logout",
		"ping",
		"serverStatus",
		//"setProfilingLevel",
		"validateCollection"
	] 
 }


let auth        = function( req ){
					var user = { name:"", pass:""}
					let a = req.headers.authorization || req.headers.Authorization || false
					if( a ) {
						let c = Buffer.from( a.split(" ")[1], 'base64' ).toString().split(":")
						user = { name: c[0], pass: crypto.createHash('md5').update( c[1] ).digest('hex') }
					}
					return user
				}
let refuseAccess = function( req, res, next ) {
					if( req.db ) req.db.close()
					res.statusCode = 401
					res.setHeader( 'WWW-Authenticate', 'Basic realm="SMART MongoDb"')
					displayLoginPage( req, res, next )
				} 


				
let displayLoginPage = function( req, res, next ){
	if( req.db ) req.db.close()
	fs.readFile( loginPage, function( err, data ){
		if( err ) next()
		else { 
			if( req.params.database )
				data = data.toString().replace( /SMURF Ltd/g, req.params.database )
			res.setHeader('Content-type', 'text/html' );
			res.end(data);
		}
	})
}

				
let authenticate = function( req, res, next ){
	var creds = auth( req )
	
	if( !req.params.database || !req.params.collection ) { next(); return }
	
	if( creds.name === adminConfig.name && creds.pass == adminConfig.md5key ) {
		next(); return
	} else if( req.params.database == 'admin' || !req.db || !req.params.func ) {
		refuseAccess( req, res, next ); return
	} else { 
				// switch( req.method ) {
					// case "listDatabases":
					// case "GET"    : var access = "read"; break
					// case "POST"   : 
					// case "PUT"    : 
					// case "PATCH"  : 
					// case "DELETE" : var access = "write"; break
					// ////////////////////////////////
					// case "FIND"   : var access = "read"; break
					// case "INPUT"  : 
					// case "UPDATE" : 
					// case "REMOVE" : var access = "write"; break
					// ////////////////////////////////
					// default       : refuseAccess( req, res, next ); return
				// }
			var access = "none"
			switch( req.params.func ){
				case "find": 
					access = "read"; break
				default : refuseAccess( req, res, next ); return
			}
			req.db.collection( 'db.users' ).findOne({ _id:creds.name, pwd:creds.pass },{ roles:true },function( err, foundUser ){
				if( foundUser ) {
					var roles = Array.isArray( foundUser.roles ) ? foundUser.roles : [ foundUser.roles ]
					roles.push("*")
					let query = { _id:{ $in:roles }, [access]:{ $in:[ req.params.collection, "*" ] } }
					req.mongodb.collection( 'db.roles' ).findOne( query, function _( err, ret ) {
						if( ret && ret._id ) next()
						else refuseAccess( req, res, next )
					})
				} else {
					let query = { _id:"*", [access]:{ $in:[ req.params.collection, "*" ] } }
					req.mongodb.collection( 'db.roles' ).findOne( query, function _( err, ret ) {
						if( ret && ret._id ) next()
						else refuseAccess( req, res, next )
					})
					//refuseAccess( req, res, next )
				}
			})
	}
}



exports.authenticate = authenticate
exports.displayLoginPage = displayLoginPage