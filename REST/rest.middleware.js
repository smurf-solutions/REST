"use strict"
 
//var dbDriver = require( './dbdrivers/jsonfiles.js' )
var dbDriver = require( './dbdrivers/mongodb.js' )

var parser = require("./../lib/parser.js")

function send( res, ret, contentType ) {
	if( ret && ret.access == 'DENIDED' ) {
		res.statusCode = 401
		res.setHeader( 'WWW-Authenticate', 'Basic realm="SMART MongoDb"')
		res.end( JSON.stringify( ret ) )
	} else if( typeof ret === 'string' ){
		if( !contentType ) contentType = 'text/plain'
		res.setHeader('Content-Type', contentType)
		res.end( ret )
	} else {
		res.setHeader('Content-Type','application/json')
		res.end( JSON.stringify( ret ) )
	}
}

module.exports = function( req, res, next ) {
	var dbPrefix = new RegExp( req.dbPrefix, 'i' )
	var urlGetData = req.url.split( req.dbPrefix+"/" )[1]
	
	if( req.url.match( dbPrefix ) && urlGetData ) {
		var urlParts = urlGetData.split("?")
		var [ dbname, collection ] = urlParts[0].split("/"); if( !dbname ) dbname = ""; if( !collection ) collection = ""
		
		var params = parser.parseUrlParams( urlParts[1], 'find' )
		params.token = parser.parseAuth( req.headers ) 
		if( req.dbUrl ) params.dbUrl = req.dbUrl

		var dbInfo = { 
			//dbUrl: params.dbUrl.replace(/\/$/,'') + '/' + dbname, 
			dbUrl: params.dbUrl.replace( '<DATABASE>', dbname ), 
			collection: collection || "*", 
			user: params.token[0]  || "*", 
			pass: params.token[1]  || "*" 
		}

		var filter = params.filter  || {}
		var data   = params.data    || {}
		var fields = params.fields  || params.field || {}
		var opts   = params.opts    || {}
		
		var filename = urlParts[0].split(collection)[1].replace(/^\//g, '')
		if( collection === 'static_files' && filename &&  req.method == 'GET' ){
			dbInfo.user = require("./sysadmin.js").name 
			dbInfo.pass = require("./sysadmin.js").md5key
			filter = { _id: filename }	
			dbDriver.findOne( dbInfo, filter,fields,( ret ) => {
				if( ret && ret.content ) ret = ret.content
				send( res, ret, getTypeFromExt( filename.split(".").pop() ) ) 
			} )
		} else {
			//console.log( fields )
			switch( req.method ) {
				case 'GET'  :  switch( params.action ) {
							case 'save'   : dbDriver.save  ( dbInfo,         data, opts,( ret ) => send( res, ret ) ); break
							case 'insert' : dbDriver.insert( dbInfo,         data,      ( ret ) => send( res, ret ) ); break
							case 'update' : dbDriver.update( dbInfo, filter, data, opts,( ret ) => send( res, ret ) ); break
							case 'delete' :
							case 'remove' : dbDriver.remove( dbInfo, filter,            ( ret ) => send( res, ret ) ); break
							case 'findOne': dbDriver.findOne(dbInfo, filter,fields,     ( ret ) => send( res, ret ) ); break
							case 'findField':dbDriver.findField(dbInfo,filter,fields,   ( ret ) => send( res, ret ) ); break
							case 'find'   : 
							default       : dbDriver.find  ( dbInfo, filter,fields,opts,( ret ) => send( res, ret ) ); break
						}; break
				case 'POST'  :  
					let body = ''
					req.on('data', ( data ) => {
						body += data
						if (body.length > 1e6) request.connection.destroy() //1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
					})
					req.on('end', function(){
						data = parser.parseJson( body.toString() )
						switch( params.action ) {
							case 'insert' : dbDriver.insert( dbInfo,         data,       ( ret ) => send( res, ret ) ); break
							case 'update' : dbDriver.update( dbInfo, filter, data, opts, ( ret ) => send( res, ret ) ); break
							case 'find'   : // ако не е зададено
							case 'save'   : 
							default       : dbDriver.save( dbInfo,           data, opts, ( ret ) => send( res, ret ) ); break
						}
					}); 
					break
				case 'DELETE' : dbDriver.remove( dbInfo, filter, ( ret ) => send( res, ret ) ); break
				default       : send( res,{error:'ERROR'} )
			}
		}
	} else if( req.method=="POST" ) {
		require('fs').readFile( "index.html", 'utf8', function( err, data ){
				if( !err ) res.end( data.toString() )
		});
	} else {
		next()
	}
}

function getTypeFromExt( ext ){
	let type = 'text/plain'
	switch ( ext ){
		case 'ts'  : //type = 'text/plain'; break
		case 'js'  : type = 'application/javascript'; break
		case 'html': type = 'text/html'; break
		case 'css' : type = 'text/css'; break
		case 'zip' : type = 'application/zip'; break
		case 'wav' : type = 'audio/x-wav'; break
		case 'ttf' : type = 'application/x-font-ttf'; break
		case 'rtf' : type = 'application/rtf'; break
		default    : type = 'text/plain'
	}
	return type
}