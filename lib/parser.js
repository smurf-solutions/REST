"use strict"

function parseJson( value ) {
	let toRepeat = true
	while( toRepeat ) {
		toRepeat = false
		value = value.replace(/%.{2}/g, function( c ){  
			try { 
				c = decodeURIComponent( c )
			} catch ( e ) {
				c = '%25'+c[1]+c[2]
				toRepeat = true
			}
			return c
		}) 
	}

	var ret = {}
	try {
		eval( 'ret = (' + value + ')')
	} catch( err ) { ret = { _id:0 }  }
	return ret
}

function parseUrlParams( path, def = 'find' ) {
	var params = { action: def, filter: {}, data: {}, fields: {}, opts: {} }
	
	if( path ) {
		path.split('&').forEach(function(v){
			var [ key, value ] = v.split("=")
			switch( key ) {
				//case 'findField'  : params.action = "findField"; params.filter = parseJson( value ); break
				case 'field'      : params.fields = String(value); break
				
				case 'findOne'    : params.action = "findOne"; params.filter = parseJson( value ); break
				//case 'fields'     : params.fields = parseJson( value ); break
				
				case 'options'    : params.opts = parseJson( value ); break
				
				case 'find'       : params.action = "find"; params.filter = parseJson( value ); break
				case 'projection' :
				case 'fields'     : params.fields = parseJson( value ); break
				/*options = {
					"limit": 20,
					"skip": 10,
					"sort": "title"
				}*/
					
				case 'update'     : params.action = "update"; params.filter = parseJson( value ); break
				case 'data'       : params.data = parseJson( value ); break
				 /*options: {
					 upsert: <boolean>,
					 multi: <boolean>,
					 writeConcern: <document>,
					 collation: <document>
				   }*/
					
				case 'insert'     : params.action = "insert"; params.data = parseJson( value ); break
				
				case 'save'       : params.action = "save"; params.data = parseJson( value ); break 
				
				case 'delete'     :
				case 'remove'     : params.action = "remove"; params.filter = parseJson( value ); break
				//case 'onlyOne'    : params.onlyOne = true; break
				
				case '_id'        : 
				case 'id'         : params.filter = {_id: decodeURIComponent(value) }; console.log( params.filter ); break
			}
		});
	}
	return params
}

function parseBasicAuth( header ) {
	let ret = ['*','*']
	let auth = header.authorization || header.Authorization || false
	if( auth ) {
		ret = auth.split(" ")[1]
		ret = Buffer.from( ret, 'base64' )
		ret = ret.toString().split(":")
		ret[1] = require('crypto').createHash('md5').update( ret[1] ).digest('hex')
	}
	return ret
}


exports.parseUrlParams = parseUrlParams
exports.parseAuth = parseBasicAuth
exports.parseJson = parseJson
