"use strict"
//let dbUrl = 'mongodb://127.0.0.1:27017/'

let mongodb = require('mongodb')
let flatten = require('./../../lib/flatten').flatten
let sysadmin = require("/etc/rest/admin.config.json")

function sanitize( obj ) {
	if( typeof obj !== 'object' ) return {}
	if( obj._id ) try{ obj._id = new mongodb.ObjectId( obj._id ) } catch( err ) {}
	if( obj.$set ) obj.$set = flatten( obj.$set )
	if( obj._id && obj._id == '$autoInc' ) {
		obj._id
	}
	return obj
}
/*
Две таблици: users и users.roles
	users: описва кои роли има потребителя
	users.roles: описва на кои таблици какъв достъп имат ролите
*/
function authenticate( access, dbInfo, callback1, callback2 ) {
	if( dbInfo.collection !== 'system' ) {
		if( dbInfo.user === sysadmin.name 
			&& dbInfo.pass === sysadmin.md5key ) {
			callback2( callback1 )
		}else{
			dbInfo.db.collection( 'users' ).findOne({_id:dbInfo.user,pwd:dbInfo.pass},{roles:true},function( err,user ){
				if( user ) {
					let find = { _id: {$in:user.roles}, [access]: {$in:[dbInfo.collection,"*"]} }
					dbInfo.db.collection( 'users.roles' ).find(find).toArray( function( err,ret ) {
						if( (ret && ret.length > 0) || user.roles.indexOf('superAdmin') > -1 ) {
							callback2( callback1 )
						} else { callback1( { access: 'DENIDED' } ) }
					})
				} else { callback1( { access: 'DENIDED' } ) }
			})
		}
	} else { callback1({ access: 'DENIDED' }) }
}



/*function findField( dbInfo, filter, field, callback ) {
	mongodb.MongoClient.connect( dbInfo.dbUrl, function(err, db) {
		if(err) callback( { error: err.errmsg } )
		else authenticate( 'read', Object.assign(dbInfo,{db:db}), callback, function( callback ) {
			field =  {[field]:1}
			db.collection( dbInfo.collection )
			  .findOne( sanitize( filter ), field, function( err, document ){
					callback( document?document[field]:null ); //db.close()
			  })
		})
	})
}*/
function findOne( dbInfo, filter, fields, callback ) {
	mongodb.MongoClient.connect( dbInfo.dbUrl, function(err, db) {
		if(err) callback( { error: 'MongoError' } )
		else authenticate( 'read', Object.assign(dbInfo,{db:db}), callback, function( callback ) {
			db.collection( dbInfo.collection )
			  .findOne( sanitize( filter ), (typeof fields=='string'?{_id:0}:fields), function( err, document ){
				    if(typeof fields=='string') document = document[fields]
					callback( document ); //db.close()
			  })
		})
	})
}
function find( dbInfo, filter, fields, opts, callback ) {
	mongodb.MongoClient.connect( dbInfo.dbUrl, function(err, db) {
		if(err) callback( { error: 'MongoError' } )
		else authenticate( 'read', Object.assign(dbInfo,{db:db}), callback, function( callback ) {
					let cursor = db.collection( dbInfo.collection ).find( sanitize( filter ), fields, opts )
					cursor.count( function(err,count){
						cursor.toArray(function( err, documents ){
							callback( { count: count, data: documents } ); //db.close()
						})
					} )
			})
	})
}
function save( dbInfo, data, opts, callback ) {
	mongodb.MongoClient.connect( dbInfo.dbUrl, function(err,db) {
		if(err) callback({ error: 'MongoError' })
		else authenticate( 'write', Object.assign(dbInfo,{db:db}), callback, function( callback ) {
				if( typeof data._id !== 'undefined' 
					&& ( data._id == 0 || data._id === false || data._id === null) ) {
						delete data._id
					}
				db.collection( dbInfo.collection || '*' ).save( data, opts, function(err,res){
					if( err || !res ) { callback( {  error: err.errmsg ? err.errmsg : 'Wrong query' } ) }
					else {
						let rt = { success: res.result.n } 
						if( typeof res.result.upserted !== 'undefined' ) 
							rt.insertedIds = res.result.upserted.map( function(a){ return a._id })
						if( typeof res.ops !== 'undefined' ) 
							rt.insertedIds = res.ops.map(function(a){ return a._id })
						callback( rt )
					}; //db.close()
				})
			} )
	})
}
function update( dbInfo, filter, data, opts, callback ) { 
	mongodb.MongoClient.connect( dbInfo.dbUrl, function(err, db) {
		if(err) callback( { error: 'MongoError' } )
		else authenticate( 'write', Object.assign(dbInfo,{db:db}), callback, function( callback ) {
					if( data._id && data._id == 0 ) delete data._id
					db.collection( dbInfo.collection || '*' ).update( sanitize(filter), data, opts, function(err,res){
						if( err ) callback( { error: err.errmsg } )
						else      callback( { success: res.result.nModified } )
						//db.close()
					})
				})
	})
}
function insert( dbInfo, data, callback ) {
	mongodb.MongoClient.connect( dbInfo.dbUrl, function( err, db ) {
		if( err ) callback( { error: 'MongoError' } )
		else authenticate( 'write', Object.assign(dbInfo,{db:db}), callback, function( callback ) {
					db.collection( dbInfo.collection )
					   .insert( data, function( err, res ){
							if( err || !res ) {
								let msg = err.errmsg ? err.errmsg : 'Wrong query'
								if( err && err.getOperation && err.getOperation()._id == 0 ) msg = 'Wrong request'
								callback( { error : msg } )
							} else      callback({ succes : res.insertedCount, insertedIds : JSON.stringify(res.insertedIds) })
							//db.close()
					   } )
			})
	})	
}
function remove( dbInfo, filter, callback ) {
	mongodb.MongoClient.connect( dbInfo.dbUrl, function(err, db) {
		if( err ) callback( { error: 'MongoError' } )
		else authenticate( 'write', Object.assign(dbInfo,{db:db}), callback, function( callback ) {
					db.collection( dbInfo.collection || '*' ).remove( sanitize(filter), function(err,res){
						if( err ) callback( { error: err.errmsg } )
						else callback( { success: res.result.n } )
						//db.close()
					})
				})
	})
}


/*
type: databse, collection
action: list, rename, copy, drop
listDatabases, 
-------------------------
*/
function admin( adminFunction, dbInfo, filter, callback ) {
	mongodb.MongoClient.connect( dbInfo.dbUrl, function( err, db ) {
		if( err ) callback( { error: 'MongoError' } )
		else authenticate( 'write', Object.assign(dbInfo,{db:db}), callback, function( callback ) {
			db = db.admin()[adminFunction]( function( err, ret ) {
					if( err ) callback( { error: err.msg } )
					else callback( { count: ret.length, data: ret } );
				})
			})
	})	
}


exports.find    = find
//exports.findField = findField
exports.findOne = findOne
exports.save    = save
exports.update  = update
exports.insert  = insert
exports.remove  = remove
exports.admin   = admin

