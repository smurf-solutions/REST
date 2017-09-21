var fs          = require( "fs" )
var http		= require( "http" )
var https       = require( "https" )
var express     = require( "express" )
var prepare     = require( "./modules/prepare.js" )
var access      = require( "./modules/access.js" )
var routes	    = require( "./modules/routs.js" )
let config 		= require( "/etc/rest/server.json" )
var cors        = require( "cors" )

var DEBUG		= config.DEBUG

let app = express()

if(DEBUG) app.use(cors())

/*** Preapre Server ***/
prepare.initThird( app )
app.use( prepare.parseDbQuery )
// app.use( [ "/admin/:database", "/:database/:collection*", "/:database*" ], access.authenticate ) 
		 
/*** Routing ***/
app.use( express.static( './static/' ) )
routes.files( app )
routes.admin( app )
routes.superAdmin( app )
routes.user( app )

app.get( ["/:database","*"], access.displayLoginPage )




/*** RUN ***/
http.createServer( app ).listen( config.http.port, function(){ 
	console.log( " DBASE | Http     | "+config.http.port + "    | -")
	console.log( " FILSE | Http     | "+config.http.port + "    | -")
})

https.createServer( { 
	key: fs.readFileSync( "/etc/ssl/private/" + config.https.certificate + '.key', 'utf8'), 
	cert: fs.readFileSync( "/etc/ssl/certs/" + config.https.certificate + '.cert', 'utf8')
}, app ).listen( config.https.port, function(){ 
	console.log( ' DBASE | Https    | '+config.https.port+"   | "+config.https.certificate )
	console.log( ' FILES | Https    | '+config.https.port+"   | "+config.https.certificate )
})
