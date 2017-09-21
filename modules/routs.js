var http 		= require('http')
var https		= require('https')
var prepare     = require( "./prepare.js" )
let u 			= require("./utils.js")

function callDbFunction ( req, res, next, data ) { 
	function cb(err,ret){
		if( ret && ret.constructor.name.substr(-6) == 'Cursor' ){ //Cursor, BulkWriteResult
			ret.toArray( cb )
			if(req.db) req.db.close()
		} else {
			if(err) ret = {error:err} 
			try{ 
				ret = JSON.stringify( ret ) 
			} catch(e){ 
				ret = '{"ok":1,"warning":"'+e.toString()+'"}' 
			}
			if(req.db) req.db.close()
			
			/** QUERIES */
			// callback
			if( !err && req.query.callback ) {
				ret= req.query.callback+"("+ret+")"
				res.writeHead( 200, {"Content-Type": "application/javascript; charset=utf-8"})
				res.end( ret )

			// return
			} else if( !err && req.query.return ){
				u.readFile( u.parseUrl(req, req.query.return), function(err,content){
					if(err){ res.end(err) }
					else u.writeFile( 
							content.toString().replace("__RESULT_DATA__",ret), 
							req.query.return, 
							res 
						)
				})

			// redirect
			} else if( req.query.redirect ) {
				var url = req.query.redirect
				res.redirect( url.replace("__RESULT_DATA__", ret ) )
			} else {

				// - download
				if(typeof req.query.download !== 'undefined' ){
					if(req.query.download) id = req.query.download
					else id = req.params.db+"-"+req.params.coll+"-"+(new Date).toJSON()+".json"
					u.writeFile( ret, id, res, 1 )
				// - 
				} else {
					res.writeHead( 200, {"Content-Type": "application/json; charset=utf-8"})
					res.end( ret )
				}
			}
		}
	}
			
	var obj  = req.collection || req.db
	var func = req.params.func
	var args = req.parsedQuery 
	
	if( data ) {
		cb( null, data )
	} else try { switch( args.length ){
				case  4: obj[ func ]( args[0], args[1], args[2], args[3], cb ); break
				case  3: obj[ func ]( args[0], args[1], args[2], cb ); break
				case  2: obj[ func ]( args[0], args[1], cb ); break
				case  1: obj[ func ]( args[0], cb ); break
				default: obj[ func ]( cb )
		}	} catch( e ) { cb(e)}
}



exports.superAdmin = function( app ){
	app.get( "/admin/:func", 
		prepare.initDb,
		function( req, res, next ){
			req.collection = req.db.admin()
			callDbFunction( req, res ,next )
		}
	)
}

exports.admin = function( app ){
	app.get( "/admin/:db/listCollections", 
		prepare.initDb, 
		function(req,res,next){ callDbFunction( req,res,next, req.db.listCollections() ) }
	)
	app.get( [ /*"/admin/:db/:coll/:func",*/ "/admin/:db/:func" ], 
		prepare.initDb, 
		callDbFunction
	)
}

exports.user = function( app ){
	app.all( ["/:db/:coll/:func","/:db/:coll"], 
		prepare.initDb, 
		function( req, res, next ){
			if( typeof req.params.func == 'undefined' ) {
				req.params.func = "find"
			}
			if( !req.bodyIsInserted && req.body ){
				req.parsedQuery.push( req.body )
			}
			
			/** findOneAndDuplicate( findQuery, changedData, optionsForBoth, callBack ) **/
			if((req.params.func == "findOneAndDuplicate" || req.params.func == "findOneAndInsert") 
				&& req.parsedQuery[0]
			){
				req.collection.findOne( req.parsedQuery[0], req.parsedQuery[2]||{}, function(err,doc){
					if(err) res.end( err.toString() )
					else if(!doc || !doc._id) res.end('{error:"Record Not Found"}')
					else {	delete doc._id
							Object.assign( doc, req.parsedQuery[1]||{} )
							req.params.func = "insert"
							req.parsedQuery = [ doc, req.parsedQuery[2]||{} ]
							callDbFunction(req,res,next)
						}
				})
			} else {
				callDbFunction( req, res, next )
			}
		}
	)}


exports.files = function( app ){
	app.get( "/:db/:coll/:id*", 
		prepare.initDb,
		function( req, res, next){
			var id = req.params.id + (typeof req.params[0] !== 'undefined' ? req.params[0] : "")
			// Всички файлове трябва да имат разширение !
			if( id.split("/").pop().indexOf(".") < 0 ) { 
				next(); return
			}
			if(!req.collection) req.collection=req.db.collection(req.params.coll)
			req.collection.findOne({_id:id}, function(err,doc){
				if(req.db) req.db.close()
				if( err ) {
					res.writeHead( 200, {"Content-Type": "application/json"})
					res.end( JSON.stringify( err ) )
				} else {
					var ver = req.query.ver || 0
					if( doc && doc[ver] ) {
						if(req.query.download) id = req.query.download
						u.writeFile( doc[ver], id, res, typeof req.query.download !== 'undefined' )
					} else {
						res.writeHead( 404, {"Content-Type":"text/plain"} )
						res.end( "404 Not Found" )
					}
				}
			})
		}
	)
}