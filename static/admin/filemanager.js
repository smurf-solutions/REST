'use strict'


/*** DBs ***/

var dbs = {
	selector: { instance: document.querySelector( "select.dbs" ) },
}

dbs.selector.load = function( ) {
	ajax( "GET", "/admin/listDatabases", function ( ret ) {
		dbs.selector.render( ret.databases )
	})
} 
dbs.selector.render = function( data ) {
	dbs.selector.instance.textContent = ""
	dbs.selector.render_insertOption({ title: "-", value:"" })
	data.forEach( function _( row ) {
		dbs.selector.render_insertOption({ title:row.name, value: row.name })
	})
}
dbs.selector.render_insertOption = function( a ){
	var o = document.createElement( "option" )
	o.textContent = a.title
	o.value = a.value
	dbs.selector.instance.appendChild( o )
}


/*** COLLECTIONS ***/

var colls = {
	selector: { instance: document.querySelector( "#collections" ) } //"select.colls" ) }
}

colls.selector.load = function( dbName ){
	if( dbName ) {
		ajax( "GET", "/"+dbName+"/listCollections", function ( data ) {
			colls.selector.render( data )
		})
	} else {
		colls.selector.render( [] )
	}
}
colls.selector.render = function( data ) {
	let list = colls.selector.instance.querySelector( "ul" )
	var liTpl  = colls.selector.instance.querySelector( "template" ).content.querySelector( "li" )
	
	list.textContent = ""
	data.forEach( function ( row ){
		var cloneTpl = liTpl.cloneNode( true )
		cloneTpl.textContent = row.name
		cloneTpl.setAttribute( "data-value", row.name )
		list.appendChild( cloneTpl )
	})
}
colls.selector.setActive = function( collName ){
	var list = colls.selector.instance.querySelector( "ul" )
	var old = list.querySelector(".active")
	if(old) old.classList.remove("active")
	list.querySelector( "[data-value='"+collName+"']" ).classList.add("active")
}



/*** TREE ***/

var tree = {
	list     : { instance: document.querySelector( "section#tree > ul" ) },
	selector : { instance: document.querySelector( "section#tree > ul" ) },
	pager    : { instance: document.querySelector( "section#tree > header > input" ) },
	filter   : { instance: document.querySelector( "section#tree > header > select" ) },
	uploader : { instance: document.querySelector( "#upload-file-form" ) }
}

tree.list.load = function( dbName, collName ) {
	if( dbName && collName ){
		ajax( "GET", "/"+dbName+"/"+collName+'?filter={mimeType:{$exists:1,$ne:""}}&fields={_id:1}', function ( data ){
			tree.list.render( data.data )
		})
	} else {
		tree.list.render( [] )
	}
}
tree.list.render = function( data ){
	tree.list.instance.textContent = ""
	let row_tpl = document.querySelector( "template.tree" ).content.querySelector( "li" )

	data.forEach( function ( row ) {
		let li = row_tpl.cloneNode( true )
		li.textContent = row._id
		li.setAttribute( "data-path", row._id )
		tree.list.instance.appendChild( li )
	})
	if(!data.length) tree.list.instance.innerHTML = '<li style="color:#aaa;text-align:center">-- No files found --</div>'
}


tree.selector.change = function( path ){
	var selected = tree.selector.instance.querySelectorAll( "li.active" )
	for( let i=0; i < selected.length; i++ ) selected[i].classList.remove( "active" )
	var selected = tree.selector.instance.querySelector( "li[data-path='"+path+"']" )
	if( selected ) selected.classList.add( "active" )
}

tree.uploader.getFile = function() {
	var input = tree.uploader.instance.querySelector( "input" )
	input.value = ""
	input.click()
}
tree.uploader.pushFiles = function( path, cb ) {
	var files = tree.uploader.instance.querySelector( "input[type=file]" ).files
	
	var message = "Upload "+files.length+" file(s)"
	for( var i = 0; i < files.length; i++ ) message += "\n     ("+(i+1)+") "+files[i].name+""
	var dir = prompt( message +" \nTo directory:" )

	if( dir !== null ){
		var fData = new FormData
		dir = ( dir+"/" ).replace( /^\//, "").replace(/\/\//g,"/")
		//fData.append( "directory", dir  )
		for( var i = 0; i < files.length; i++) {
			fData.append( dir, files[i] )
		}		
		ajax( "PUT", path, cb, fData)
	}	
}


/*** FILE ***/

var file = {
	head: { 
		instance: document.querySelector( "section#file > header" ),
		iSave: document.querySelector( "section#file > header [name=save]" ),
		iRename: document.querySelector( "section#file > header [name=rename]" ),
		iDelete: document.querySelector( "section#file > header [name=delete]" ),
		iMime: document.querySelector( "section#file > header [name=mime]" )
	},
	editor: { 
		iAce: ace.edit("file-editor"),
		iEditor: document.querySelector( "#file-editor" ),
		iImage: document.querySelector( "#image-editor" ),
		iInfo: document.querySelector( "#info-editor" ),
		aceModes: { "htm":"html","html":"html", "js":"javacript","ts":"typescript", "json":"json", "css":"css" }
	},
	modifier: {}
}

file.head.render = function( url, mimeType ){
	var save   = false,
		rename = true,
		remove = true,
		mime   = true
	var isFile = url.replace(/^\//,"").split("/").length > 2
	
	if( !isFile ) save = rename = remove = mime = false
	else switch( mimeType ){
		case 'text/html':
		case 'text/plain': save = true
	}
	
	file.head.iSave.style.display   = save   ? "inline-block" : "none"
	file.head.iRename.style.display = rename ? "inline-block" : "none"
	file.head.iDelete.style.display = remove ? "inline-block" : "none"
	file.head.iMime.style.display   = mime   ? "inline-block" : "none"
	
	file.head.instance.querySelector( "label" ).innerHTML = '<a target="_null" data-title="Onpen in new tab" href="'+url+'">' + url + '</a>' 
}

file.editor.load = function( url ){
	var fileName = url.split("/").pop()
	if( fileName !== "-" && fileName !== "" ){
		ajax( "GET", url+"?fields={}", function ( data ){
			file.head.render( url, data.mimeType )
			switch( data.mimeType ) {
				case "text/html":
				case "text/plain":
				case "text/css":
				case "application/x-javascript": case "application/javascript": case "text/javascript": case "text/js":
				case "application/json": file.editor.renderText( data ); break
				
				case "image/png":
				case "image/gif":
				case "image/x-icon":
				case "image/jpeg": file.editor.renderImage( url ); break 
				
				default : file.editor.renderInfo( data )
			}
		})
	} else {
		file.editor.renderInfo( "" )
	}
}
file.editor.renderImage = function( url ){
	file.editor.iEditor.hidden = true
	file.editor.iImage.hidden = false
	file.editor.iInfo.hidden = true

	file.editor.iImage.src = url
}
file.editor.renderText = function( d ){
	var data = d["0"]
	file.editor.iEditor.hidden = false
	file.editor.iImage.hidden = true
	file.editor.iInfo.hidden = true
	
	var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
	if( base64regex.test( data ) ) data = atob(data)
	file.editor.iAce.$blockScrolling = Infinity
	file.editor.iAce.setValue( data || "" )
	file.editor.iAce.session.setMode("ace/mode/" + d.mimeType.split("/")[1])
	file.editor.iAce.commands.addCommand({
		name: 'Save', bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
		exec: function(editor) {
			app.onSaveFile()
		}, readOnly: false 
	});
	file.editor.iAce.clearSelection()
	
	file.head.iSave.style.display = "inline-block"
}
file.editor.renderInfo = function( data ){
	file.editor.iEditor.hidden = true
	file.editor.iImage.hidden = true
	file.editor.iInfo.hidden = false
	
	file.editor.iInfo.innerHTML = "<table>"
			+ "<tr><th>URL:</th><td>" + (data._id || "") + "</td></tr>"
			+ "<tr><th>File Size:</th><td>" + fileSize(data.fileSize) + "</td></tr>"
			+ "<tr><th>Mime Type:</th><td>" + (data.mimeType || "") + "</td></tr>"
		+"</table>"
}

file.modifier.rename = function( url, fileName, cb ) {
	var newName = prompt( "Rename file:", fileName )
	if( newName ) {
		ajax( "PATCH", url, cb, appendFormData( new FormData, {_id:newName} ) )
	}
}
file.modifier.remove = function( url ) {
	if( confirm( "Delete file:\n"+url ) )
	ajax("DELETE",url,function(ret){ if(ret.success){
		app.onCollectionChanged( app.collection )
		toast("File deleted") 
	}})
}
file.modifier.save = function( path, fileName ) {
	fileName = fileName.replace(/^\//, "").replace(/\/$/, "")
	var url = path + "/" + fileName
	var content = file.editor.iAce.getValue()
	var fdata = new FormData
	fdata.append("0", content)
	ajax( "PATCH", url, function( d ){
		if( d.success ) toast( "The change is recorded" )
	}, fdata)
}
file.modifier.newFile = function( path ){
	var url = prompt( "File Path / Name:", path.replace(/\/$/,"")+"/" )
	if( url ) {
		var ext = url.split(".").pop()
		//var ext_mime = {"html":"text/html","css":"text/css","js":"application/javascript"}
		ajax( "POST", url+"?upsert=1", function(ret){ 
			app.onCollectionChanged( app.collection )
			toast("New File created")
		}, appendFormData( new FormData, {mimeType: "text/"+ext //(ext_mime[ext] || "text/plain") 
			} ) )
	}
}
file.modifier.mime = function( url ){
	ajax( "GET", url+"?fields=mimeType", function( mime ){
		mime = prompt( "New mime Type:", mime )
		if( mime ) {
			ajax( "PATCH", url, function( ret ){
				if( ret.success ) app.onTreeSelectionChanged( app.document )
			}, appendFormData( new FormData, {mimeType:mime}) )
		}
	})
}



/*** The APP ***/

let app = {
	database: "",
	collection: "",
	document: ""
}
app.getPath = function(){
	let path = ""
	path += app.database   ? "/" + app.database   : ""
	path += app.collection ? "/" + app.collection : "" 
	return path
}
app.getUrl = function(){
	let path = ""
	path += app.database   ? "/" + app.database   : ""
	path += app.collection ? "/" + app.collection : "" 
	path += app.document   ? "/" + app.document   : ""
	return path
}

//
app.onDatabaseChanged = function( dbName ) {
	app.database = dbName
	app.collection = ""
	app.document = ""
	colls.selector.load( dbName )
	tree.list.load( app.database, "" )
	file.editor.load("")
}

app.onCollectionChanged = function( collName ){
	app.collection = collName
	app.document = ""
	colls.selector.setActive( collName )
	tree.list.load( app.database, app.collection )
	app.onTreeSelectionChanged( "" )
}

app.onTreeSelectionChanged = function( path ) {
	app.document = path
	tree.selector.change( app.document )
	file.editor.load( app.getUrl() )
}

app.onRenameFile = function(){
	file.modifier.rename( app.getUrl(),  app.document, app.afterRenamedFile )
}
app.afterRenamedFile = function(){
	tree.list.load( app.database, app.collection )
	app.onTreeSelectionChanged( "" )
}
app.onChangeMime = function(){
	file.modifier.mime( app.getUrl() )
}
app.onUploadFile = function( fileName ) {
	if( app.database && app.collection ) {
		if( !fileName ) {
			tree.uploader.getFile()
		} else {
			tree.uploader.pushFiles( "/" + app.database + "/" + app.collection, app.afterUploadedFile )
		}
	} else {
		alert( "Select Databse and Collection first !" )
	}
}
app.afterUploadedFile = function() {
	tree.list.load( app.database, app.collection )
}
app.reloadTree = function(){
	tree.list.load( app.database, app.collection )
}

app.onSaveNewFile = function(){
	file.modifier.newFile( app.getPath() )
}
app.onSaveFile = function(){
	file.modifier.save( app.getPath(), app.document )
}
app.onDeleteFile = function(){
	file.modifier.remove( app.getUrl() )
}


app.onInit = function(){
	dbs.selector.load()
	file.editor.load( "" )
}()