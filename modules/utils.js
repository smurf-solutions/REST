var mongodb     = require( 'mongodb' )
var mime 		= require("mime")


/** strValue is String, returns Object **/
let parseJSON  = function parseJSON( strValue ) { strValue = String( strValue )
					let toRepeat = true
					while( toRepeat ) { toRepeat = false
						strValue = strValue.replace(/%.{2}/g, 
							function ( c ){ try { c = decodeURIComponent( c ) } catch ( e ) { c = '%25'+c[1]+c[2]; toRepeat = true }; return c }
						) 
					}
					var objRet = {}; try { eval( 'objRet = (' + strValue + ')') } catch( err ) { objRet = strValue } 
					return objRet
				}
				
/** obj is Object, returns  Object **/
let unflatten = function unflatten( obj ) {
					if (Object(obj) !== obj || Array.isArray(obj))
						return obj;
					var regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
						resultObject = {};
					for (var p in obj) {
						var cur = resultObject,
							prop = "",
							m;
						while (m = regex.exec(p)) {
							cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
							prop = m[2] || m[1];
						}
						cur[prop] = obj[p];
					}
					return resultObject[""] || resultObject;
				};

/**  sanitize **/
let sanitize = function sanitize( obj ) {
					if( !obj || typeof obj !== 'object' ) 
						return obj

					if( typeof obj._id == 'string' ) 
						obj._id = obj._id.replace( /^\//, "" )
					
					if( obj._id && obj._id.toString().length == 24 ) try{ 
						obj._id = new mongodb.ObjectId( obj._id ) 
					} catch( err ) {}

					if( !obj.$set ) 
						obj = unflatten( obj )
						
					return obj
				}			


/** URL parse **/
function parseUrl( req, strUrl ){
	var url = require('url').parse(strUrl)
	
	if( !url.protocol ) url.protocol = req.protocol.replace(":","") + ":"
	if( !url.host ) {
		url.host = req.hostname
		url.hostname = req.hostname
		url.port = req.port
	}
	if( url.protocol == 'https:'){
		url.rejectUnauthorized = false
		url.headers = {
			  'Authorization': 'Basic ' + req.headers.authorization || req.headers.Authorization //new Buffer(username + ':' + passw).toString('base64')
		   }  
	}
	return url
}

				
/** reads file content from url **/
function readFile( objUrl, cb){
	var urlParse	= require('url').parse
	var http 		= require('http')
	var https 		= require('https')
	
	if(typeof objUrl == "string")
		objUrl = urlParse(objUrl)
	
	var clientReq = objUrl.protocol == 'https:' ? https : http
	
	try{ 
		clientReq.get(objUrl, function(conn){
			if( conn.statusCode !== 200 ){
				cb( conn.statusCode+" "+conn.statusMEssage)
			} else {
				let rawData = new Buffer(0)
				conn.setEncoding('utf8')
				conn.on('data', (chunk) => { rawData += chunk })
				conn.on('end', () => { cb(null,rawData) })
			}
		}).on('error', (e) => { cb(e.toString()) })
	} catch(e){ cb( e.toString() ) }
}

				
/** writes content to socket as file **/
function writeFile( content, filename, socket, forceDownload ) {
	if( content && typeof content == 'object' && content.type == "Buffer" )
		content = content.data
	
	if( content && content._bsontype == 'Binary' ) 
		content = content.buffer

	var header = {
		"Content-Type": mime.lookup(filename), //+ "; charset=utf-8",
		"Content-Length": content.length }
	if( forceDownload ) 
		header["Content-disposition"] = 'attachment;filename='+filename.split("/").pop()
	
	socket.writeHead(200, header)
	socket.end(new Buffer(content,'utf-8'))
}


/** **/
function sanitizeCollectionName( coll ){
	coll = coll.replace(/\$/g,"")
	return coll
}

exports.parseJSON = parseJSON		
exports.unflatten = unflatten
exports.sanitize  = sanitize
exports.parseUrl = parseUrl
exports.readFile = readFile
exports.writeFile = writeFile
exports.sanitizeCollectionName = sanitizeCollectionName