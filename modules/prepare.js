var helmet      		= require( 'helmet' )
var compression 		= require( 'compression' )
var multipartBodyParser = require( 'express-fileupload') // as body-parser
var jsonBodyParser  	= require( 'body/any' )
var DB 		    		= require( 'mongodb' )
let u 					= require("./utils.js")

//let openedConnections = {}
 
let initThird = function(app){
	app.use( helmet() )
	app.use( function mdw_CheckURI( req, res, next ) {
		try { decodeURIComponent(req.path); next() } 
		catch(e) { res.end( e.toString() ) }
	}) 
	app.use( compression() )
	app.use( multipartBodyParser({ limits: { fileSize: 16 * 1024 * 1024 } }) ) // 16 MB
	app.use((req,res,next)=>{ 
		var opts = {JSON: {parse: u.parseJSON}, limit:2*1024} // 2 MB
		jsonBodyParser(req, res, opts, (err, body)=>{ if (!err) req.body = body; next() })
	})
}

let moveFilesToBody = function(req,res,next){
		function getFileAsJSON( dir, file, body ){
			var newFile = { _id: dir + file.name, "0": file.data }
			Object.assign( newFile, body)
			return newFile
		}
		
	if(req.files){
		var dirs = Object.keys(req.files)
		dirs.forEach( dir => {
			if(Array.isArray( req.files[dir] )){
				var oldBody = req.body; 
				req.body = []
				req.files[dir].forEach( file => {
					req.body.push( getFileAsJSON(dir,file,oldBody)) 
				})
			} else {
				req.body = getFileAsJSON( dir, req.files[dir], req.body )
			}
		})
		
	}
	if(next) next()
}

let parseDbQuery = function( req, res, next ){
	moveFilesToBody(req,res)
	var body = JSON.stringify(req.body||"")
	req.bodyIsInserted = false
	req.parsedQuery = []
	
	function parse( value, body ){
		if(  typeof value == 'string' 
			&& value.indexOf("__FORM_DATA__") > -1 
		){
			req.bodyIsInserted = true
			value = value.replace("__FORM_DATA__", body )
		}
		return u.sanitize(u.parseJSON( value ))
	}
	
	decodeURI( req._parsedUrl.query )
	.split(/(\&)(?=(?:[^"]|"[^"]*")*$)/)
	.filter((a)=>a!=="&")
	.forEach(( p )=>{
		let k = p.split(/(\=)(?=(?:[^"]|"[^"]*")*$)/).filter((a)=>a!=="=")
		if( ['callback','redirect','return','download'].indexOf(k[0]) < 0 ){
			var theValue = parse( k[1]?k[1]:k[0], body )
			if(theValue) 
				req.parsedQuery.push( theValue )
		}
	})
	next()
}

let initDb = function( req, res, next ) {
		let database = (req.params.db || "").replace( /[\.\$\%\ ]/g, "")
		let dbUrl = require('/etc/rest/db.json').dbUrl.replace( '<DATABASE>', database )
		
		if(req.db) req.db.close()
		DB.MongoClient.connect( dbUrl, function _( err, db ) {
			if( err ) { res.end( JSON.stringify( err ) )
			} else { 
				req.db = db;
				if( req.params.coll ) {
					req.params.coll = u.sanitizeCollectionName(req.params.coll)
					req.collection = req.db.collection( req.params.coll )
				}
				next() 
			}
		})
}




exports.initThird = initThird
// exports.parseId = parseId
exports.moveFilesToBody = moveFilesToBody
exports.parseDbQuery = parseDbQuery 
exports.initDb = initDb
