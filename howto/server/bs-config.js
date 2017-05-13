"use strict";

var config = require( './server.config.json' )
//var browserSync = require('browser-sync').create()

module.exports = {
	port: config.port,
	files : ["**/*.{no-watch}"], watchOptions : { ignored: ['node_modules'] },
	server : {
        baseDir : './'+config.folder,
		middleware : {
			0 : null,
			1 : null,
			//2 : require('comporession')(),
			3 : function( req,res,next ) { req.dbUrl = config.dbUrl;next() },
			4 : function( req,res,next ) { req.dbPrefix = config.dbPrefix;next() },
			5 : require("./REST/rest.middleware.js")
        }
    },
	logLevel: "debug",
	ui: null,
	https: config.https ? true : false,
	cors : true,
	notify: false,
}