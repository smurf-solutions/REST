var fs          = require( 'fs' )
var cors        = require( 'cors' )
var https       = require( 'https' )
var crypto      = require( 'crypto' )
var helmet      = require( 'helmet' ) 
var express     = require( 'express' )
var mongodb     = require( 'mongodb' )
var compression = require( 'compression' )
var fileUpload  = require( 'express-fileupload') // as body-parser


let root_dir    = '/'
let config      = require( root_dir + 'etc/rest/server.config.json' )
let log         = function log( msg ) {
					fs.writeFile( root_dir + "var/log/RESTserver.log", JSON.stringify( msg, null, 4 ), function ( err ){} )
					console.log( msg )
				}
let parseJSON 	= function parseJSON( value ) { value = String( value )
					let toRepeat = true
					while( toRepeat ) { toRepeat = false
						value = value.replace(/%.{2}/g, 
							function ( c ){ try { c = decodeURIComponent( c ) } catch ( e ) { c = '%25'+c[1]+c[2]; toRepeat = true }; return c }
						) 
					}
					var ret = {}; try { eval( 'ret = (' + value + ')') } catch( err ) { ret = value } 
					return ret
				}
let unflatten = function unflatten(data) {
					if (Object(data) !== data || Array.isArray(data))
						return data;
					var regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
						resultholder = {};
					for (var p in data) {
						var cur = resultholder,
							prop = "",
							m;
						while (m = regex.exec(p)) {
							cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
							prop = m[2] || m[1];
						}
						cur[prop] = data[p];
					}
					return resultholder[""] || resultholder;
				};
let sanitize 	= function sanitize( obj ) {
					if( typeof obj !== 'object' ) return {}

					if( typeof obj._id == 'string' ) obj._id = obj._id.replace( /^\//, "" )
					
					if( obj._id && obj._id.toString().length ==24 ) try{ 
						obj._id = new mongodb.ObjectId( obj._id ) 
					} catch( err ) {}
					
					if( !obj.$set ) obj = unflatten( obj )
						
					return obj
				}
let auth        = function( req ){
					var user = { name:"", pass:""}
					let a = req.headers.authorization || req.headers.Authorization || false
					if( a ) {
						let c = Buffer.from( a.split(" ")[1], 'base64' ).toString().split(":")
						user = { name: c[0], pass: require('crypto').createHash('md5').update( c[1] ).digest('hex') }
					}
					return user
				}
let refuseAccess = function( req, res, next ) {
					if( req.mongodb ) req.mongodb.close()
					res.statusCode = 401
					res.setHeader( 'WWW-Authenticate', 'Basic realm="SMART MongoDb"')
					displayLoginPage( req, res, next )
				} 

displayLoginPage = function( req, res, next ){
	if( req.mongodb ) req.mongodb.close()
	let file = root_dir + 'static/index.html'// + req.params.database
	fs.readFile( file, function( err, data ){
		if( err ) next()
		else { 
			data = data.toString().replace( /SMURF Ltd/g, req.params.database )
			res.setHeader('Content-type', 'text/html' );
			res.end(data);
		}
	})
}			

				
let app = express()

app.use( helmet() )
app.use( function mdw_CheckURI( req, res, next ) {
	try { decodeURIComponent(req.path); next() } 
	catch(e) { res.end( '{"error":"MongoError"}' ) }
}) 
app.use( cors() )
/*
// Website you wish to allow to connect
response.setHeader('Access-Control-Allow-Origin', '*');

// Request methods you wish to allow
response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

// Request headers you wish to allow
response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

// Set to true if you need the website to include cookies in the requests sent
// to the API (e.g. in case you use sessions)
response.setHeader('Access-Control-Allow-Credentials', true);
*/
app.use( compression() )
app.use( fileUpload({ limits: { fileSize: 16 * 1024 * 1024 } }) ) // and use as body-parser



/*** Init Database ***/
app.use( [ "/admin/:action/:database/:collection*", "/admin/:action/:database*", "/admin/:action*",
			"/:database/:collection*", "/:database"], 
function mdw_InitDb( req, res, next ) {
		let database = req.params.database || ""
		let dbUrl = config.dbUrl.replace( '<DATABASE>', database.replace( /[\.\$\%\ ]/g, "") )
		
		mongodb.MongoClient.connect( dbUrl, function _( err, db ) {
			if( err ) { res.end( '{"error":"MongoError"}' )
			} else { req.mongodb = db; next() }
		})
})

/*** Authenticate ***/
app.use( [ "/:database/:collection*", "/:database*", "*" ], function mdw_Authenticate( req, res, next ){
	var creds = auth( req )
	var admin = require( root_dir + "etc/rest/admin.config.json" )

	if( !req.params.collection ) { next(); return }
	
	if( creds.name === admin.name && creds.pass == admin.md5key ) {
		next(); return
	} else if( req.params.database == 'admin' || !req.mongodb ) {
		refuseAccess( req, res, next ); return
	} else { switch( req.method ) {
					case "GET"    : var access = "read"; break
					case "NOTIFY" : 
					case "POST"   : 
					case "PUT"    : 
					case "PATCH"  : 
					case "DELETE" : var access = "write"; break
					default       : refuseAccess( req, res, next ); return
				}
		req.mongodb.collection( 'db.users' ).findOne({ _id:creds.name, pwd:creds.pass },{ roles:true },function( err, foundUser ){
			if( foundUser ) {
				var roles = Array.isArray( foundUser.roles ) ? foundUser.roles : [ foundUser.roles ]
				let query = { _id:{ $in:roles }, [access]:{ $in:[ req.params.collection, "*" ] } }
				req.mongodb.collection( 'db.roles' ).findOne( query, function _( err, ret ) {
					if( ret && ret._id ) next()
					else refuseAccess( req, res, next )
				})
			} else refuseAccess( req, res, next )
		})
	}
})

/*** Static files ***/
app.use( express.static( root_dir + 'static/' ) )
app.get( "/:database", function ( req, res, next ) {
	displayLoginPage( req, res, next )
})





/*** Admin ***/
// 1. listDatabses
app.all( "/admin/listDatabases", function adm_listDatabases( req, res, next ){
	req.mongodb.admin().listDatabases( function _( err, dbs ){
		req.mongodb.close()
		res.end( JSON.stringify( dbs ) )
	})
})
// 2. dropDatabase
app.all( "/admin/dropDatabase/:database", function adm_dropDatabase( req, res, next ) {
	req.mongodb.dropDatabase( function _( err, ret ){
		if( err ) res.end( JSON.stringify( {error:err.message} ) ) 
		else { req.mongodb.close(); res.end( '{success:1}' ) }
	})
} )
// 3. renameDatabase
app.all( "/admin/renameDatabase/:from_db-:to_db", function adm_renameDatabase( req, res, next) {
	req.mongodb.close()
	res.end( '{"error":"Not supported"}' )
})
// 4. dropCollection
app.all( "/admin/dropCollection/:database/:collection", function adm_dropCollection( req, res, next){
	req.mongodb.dropCollection( req.params.collection, function _( err, ret ){
		if( err ) res.end( JSON.stringify( {error:err.message} ) ) 
		else { req.mongodb.close(); res.end( '{success:1}' ) }
	})
} )
// 5. renameCollection
app.all( "/admin/renameCollection/:database/:from_collection-:to_collection", function adm_renameCollection( req, res, next ){
	req.mongodb.renameCollection( req.params.from_collection, req.params.to_collection, function _( err, ret ){
		if( err ) res.end( JSON.stringify( {error:err.message} ) ) 
		else { req.mongodb.close(); res.end( '{success:1}' ) }
	})
} )



/*** DB ***/

// = listCollections
app.get( "/:database/listCollections", function adm_listCollections( req, res, next ) {
	req.mongodb.listCollections().toArray( function _( err, collections ){
		req.mongodb.close()
		collections.sort( function _( a, b ){ return a.name.localeCompare( b.name ) } )
		res.end( JSON.stringify( collections ) )
	})
})


/*** file index.html ***/
app.get( "/:database/:collection", function( req, res, next ){
	if( typeof req.query.filter !== 'undefined' || typeof req.query.find !== 'undefined' ) {
		next()
	} else {
		let collection = req.mongodb.collection( req.params.collection )
		collection.findOne( {_id:"index.html"}, function( err, ret ) {
			req.mongodb.close()
			if( err ) res.send( JSON.stringify( {error:err.message} ) )
			else {
				res.setHeader('Content-type', 'text/html' );
				res.end( ret ? ret["0"] : "" )
			}
		})
	}
})
// = find
app.get( '/:database/:collection', function find( req, res, next ){
	let filter = sanitize( parseJSON( req.query.find || req.query.filter ) )
	let fields = sanitize( parseJSON( req.query.fields ) )
	let sort   = parseJSON( req.query.sort ) 
	let limit  = parseInt( req.query.limit )
	let skip   = req.query.page ? (parseInt( req.query.page )-1) * limit : parseInt( req.query.skip )
	let page   = req.query.page ? req.query.page : 1
	
	if( typeof sort == 'string' ) {
		var way = 1
		if( sort[0] == '-' ) { sort = sort.substring( 1 ); way = -1 }
		sort = {[sort]:way}
	}
	if( typeof fields == 'string' ) fields = { _id:0, [fields]:1 }
	
	let cursor = req.mongodb.collection( req.params.collection )
	cursor.find( filter ).count( function _( err, allFounded ){
		let c2 = cursor.find( filter, fields )
		if( sort ) c2 = c2.sort( sort );  if( skip ) c2 = c2.skip( skip );  if( limit ) c2 = c2.limit( limit )
		c2.toArray( function _( err, documents ){
			req.mongodb.close()
			let len = typeof documents == 'object' ? documents.length : 0
			let pages = limit ? Math.ceil( allFounded / limit ) : 1
			res.send( JSON.stringify( { page: page, pages: pages, founded: allFounded, returned: len, data: documents } ) )
		})
	})
})
// = findOne || GET File
app.get( '/:database/:collection/:id*', function findOne( req, res, next ) {
	let fields = parseJSON( req.query.ver ? req.query.ver : req.query.fields )
	let id = req.params.id + (typeof req.params[0] !== 'undefined' ? req.params[0] : "")
	var filter = sanitize({ _id:id })
	
	var isFile = false
	if( typeof fields !== 'object' ) {
		var wantedField = fields || "0"
		fields = {[ fields || "0" ]:1}
		isFile = true
	} 

	
	let collection = req.mongodb.collection( req.params.collection )
	collection.findOne( filter, {mimeType:1}, function( err, mimeDoc ) {
		if( err ) res.send( JSON.stringify( {error:err.message} ) )
		else collection.findOne( filter, sanitize(fields), function ( err, document ){
			req.mongodb.close()
			if( err ) res.send( JSON.stringify( {error:err.message} ) )
			else if( !document ) res.end()
			else if( mimeDoc && mimeDoc.mimeType && isFile ) {
				var notFound = typeof document[wantedField] === 'undefined' ? true : false
				var code =  notFound ? 404 : 200
				var data = notFound ? "404 Not Found" : document[wantedField]
				if( data && data._bsontype == 'Binary' ) 
					data = data.buffer
				let headParams = { 	'Content-Type': notFound ? "text/plain" : mimeDoc.mimeType, 
									'Content-Length': data.length
								 }
				if( typeof req.query.download !== 'undefined' ) 
					headParams['Content-disposition'] = 'attachment;filename=' + document._id.split("/").pop()
				
				res.writeHead( code, headParams )
				res.end( data );
			} else {
				res.send( document )
			}
		
		})
	})
})

// = insert
		function createJsonForFile( dir, reqFile ) {
			return { 	_id      : (dir + reqFile.name).replace( /\/\//g, "/").replace( /^\//, "" ),
						fileSize : reqFile.data.length,
						mimeType : reqFile.mimetype,
						"0"  : reqFile.data
					}
		}
app.put( '/:database/:collection', function inser( req, res, next ) {
		if( req.files ){
			/**  files = { dir1:[{file},...], dir2:{file2} }  */
			var bson = [] 
			for( var prop in req.files ) {
				if( Array.isArray( req.files[prop] ) ) {
					for( var i = 0; i < req.files[prop].length; i++ ) 
						bson.push( createJsonForFile( prop, req.files[prop][i] ) )
				} else {
					bson.push( createJsonForFile( prop, req.files[prop] ) )
				}
			}
			req.mongodb.collection( req.params.collection )
			.insert( bson, {safe:false}, function( err, ret ){
				req.mongodb.close()
				if( err ) res.send( JSON.stringify( {error:err.message,code:err.code} ) )
				else { res.end( JSON.stringify( {success: ret.insertedCount, insertedIds: ret.insertedIds} ) )  }
			})
		} else {
			req.mongodb.collection( req.params.collection )
			.insert( sanitize( req.body ), function ( err, ret ){
				req.mongodb.close()
				if( err ) res.send( JSON.stringify( {error:err.message,code:err.code} ) )
				else { res.end( JSON.stringify( {success: ret.insertedCount, insertedIds: ret.insertedIds} ) )  }
			})
		}
})
// = dublicate
//app.put( '/:database/:collection/:id*', function inser( req, res, next ) {
	// var copyFrom = req.params.id
	// var copyTo = req.body._id || null
// }

// = update
app.post( '/:database/:collection/:id*', function update( req, res, next ) {
	let id = req.params.id + (typeof req.params[0] !== 'undefined' ? req.params[0] : "")
	let filter = {_id:id}
	let options = { upsert: (req.query.upsert?true:false) }
	req.mongodb.collection( req.params.collection )
		.update( sanitize(filter), sanitize(req.body), options, function _( err, ret ){
			req.mongodb.close()
			if( err ) res.end( JSON.stringify({ error:err.message, code:err.code }) )
			else res.end( JSON.stringify({ success: ret.result.nModified }) )
		} )
})

// = $set
app.patch( '/:database/:collection/:id*', function set( req, res, next){
	let id = req.params.id + (typeof req.params[0] !== 'undefined' ? req.params[0] : "")
	let filter = sanitize({_id:id})
	if( req.body._id && req.body._id !== id && Object.keys(req.body).length == 1 ){
		var collection = req.mongodb.collection( req.params.collection )
		collection.findOne( filter, function ( err, document ){
			if( err ) { req.mongodb.close(); res.send( JSON.stringify( {error:err.message} ) ) }
			else if(document) {
				document._id = sanitize( {_id:req.body._id} )['_id']
				collection.insert( document, function( err, ret ){
					req.mongodb.close()
					if( err ) res.send( JSON.stringify( {error:err.message,code:err.code} ) )
					else collection.remove( filter, function( err, ret ){
						if( err ) res.end( JSON.stringify({ error:err.message, code:err.code }) )
						else res.end( JSON.stringify( {success:ret.result.n} ) )
					})
				})
			} else res.end( '{"error":"WRONG ID !!!"}' )
		})
	} else {
		let data = {$set:req.body}
		req.mongodb.collection( req.params.collection )
			.update( sanitize(filter), sanitize(data), function _( err, ret ){
				req.mongodb.close()
				if( err ) res.end( JSON.stringify({ error:err.message, code:err.code }) )
				else res.end( JSON.stringify({ success:ret.result.nModified }) )
			})
	} 
})

// = remove
app.delete( '/:database/:collection/:id*', function remove( req, res, next){
	let id = req.params.id + (typeof req.params[0] !== 'undefined' ? req.params[0] : "")
	let filter = {_id:id}
	req.mongodb.collection( req.params.collection )
		.remove( sanitize(filter), function _( err, ret ){
			if( err ) {req.mongodb.close(); res.end( JSON.stringify({ error:err.message, code:err.code }) ) }
			else if( ret.result.n > 0 ) { req.mongodb.close(); res.end( JSON.stringify( {success:ret.result.n} ) ) }
			else req.mongodb.collection(req.params.collection).remove({_id:id.toString().trim()},function(err,ret){
					req.mongodb.close()
					if( err ) res.end( JSON.stringify({ error:err.message, code:err.code }) )
					else res.end( JSON.stringify( {success:ret.result.n} ) )
				})
		})
})

// = mail
app.notify( '/:database/:collection', function(  req, res, next ) {
	req.mongodb.close()
	res.end("NOTIFY")
})

/*** //Rounting ***/


https.createServer( { 
	key: fs.readFileSync( root_dir + "etc/ssl/private/" + config.certificate + '.key', 'utf8'), 
	cert: fs.readFileSync( root_dir + "etc/ssl/certs/" + config.certificate + '.cert', 'utf8')
}, app ).listen( config.port, function _(){ log( config ) } )

