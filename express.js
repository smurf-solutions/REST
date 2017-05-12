var fs          = require( 'fs' )
var http        = require( 'http' )
var https       = require( 'https' )
var express     = require( 'express' )
var compression = require( 'compression' )
var cors        = require( 'cors' )
var opn         = require( 'opn' )
var REST        = require( './REST/rest.middleware.js' )
var config      = require( '/etc/server/server.config.json' )


var app = express()

app.use( function( req,res,next ) { req.dbUrl = config.dbUrl; next() } )
app.use( function( req,res,next ) { req.dbPrefix = config.dbPrefix; next() })
app.use( compression() )
app.use( cors() )
app.use( REST )
app.use( express.static( config.folder ) )


var url = (config.https?'https://':'http://')+'localhost:'+config.port

if( !config.https ) {
	var httpServer = http.createServer( app )
	httpServer.listen( config.port, function(){ console.log( config ); if(config.browser) opn(url,{ app:config.browser}) } )
} else {
	var privateKey  = fs.readFileSync( config.https+'.key', 'utf8')
	var certificate = fs.readFileSync( config.https+'.cert', 'utf8')
	var httpsServer = https.createServer( { key: privateKey, cert: certificate }, app )
	httpsServer.listen( config.port, function(){ console.log( config ); if(config.browser) opn(url,{ app:config.browser}) } )
}
