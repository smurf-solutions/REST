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
		ajax( "GET", "/admin/"+dbName+"/listCollections", function ( data ) {
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
		cloneTpl.querySelector(".title").textContent = row.name
		cloneTpl.setAttribute( "data-value", row.name)
		cloneTpl.setAttribute( "data-path", "/"+app.database+"/"+row.name )
		list.appendChild( cloneTpl )
	})
}
colls.selector.setActive = function( collName ){
	var list = colls.selector.instance.querySelector( "ul" )
	if(!list) return
	var old = list.querySelector(".active")
	if(old) old.classList.remove("active")
	list.querySelector( "[data-value='"+collName+"']" ).classList.add("active")
}



/*** TREE ***/

var tree = {
	list     : { instance: document.querySelector( "section#tree > ul" ) },
	selector : { instance: document.querySelector( "section#tree > ul" ) },
	//pager    : { instance: document.querySelector( "section#tree > header > input" ) },
	//filter   : { instance: document.getElementById( "tree-filter" ) },
	uploader : { instance: document.querySelector( "#upload-file-form" ) }
}

tree.list.load = function( dbName, collName ) {
	if( dbName && collName ){
		var filter = document.getElementById("tree-filter").value
		if( !filter.length ) filter = "."
		filter = filter.replace(/\./g, "\\.")
		ajax( "GET", "/"+dbName+"/"+collName+'/find?{_id:/'+filter+'/}&fields={_id:1}&options={sort:{_id:1},limit:300}', function ( data ){
			tree.list.render( data )
		})
	} else {
		tree.list.render( [] )
	}
}
tree.list.render = function( data ){
	tree.list.instance.textContent = ""
	let row_tpl = document.querySelector( "template.tree" ).content.querySelector( "li" )

	if( typeof data == 'object' && !data.error )
		data.forEach( function ( row ) {
			let li = row_tpl.cloneNode( true )
			li.querySelector(".title").textContent = row._id
			li.setAttribute( "data-path", row._id )
			tree.list.instance.appendChild( li )
		})
	if(!data.length) tree.list.instance.innerHTML = '<li style="color:#aaa;text-align:center">-- No records found --</div>'
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
		for( var i = 0; i < files.length; i++) {
			fData.append( dir, files[i] )
		}	
		ajax( "POST", path+"/insert", cb, fData)
	}	
}


/*** FILE ***/

var file = {
	head: { 
		instance: document.querySelector( "section#file > header" ),
		iSave: document.querySelector( "section#file > header [name=save]" ),
		iRename: document.querySelector( "section#file > header [name=rename]" ),
		iDelete: document.querySelector( "section#file > header [name=delete]" ),
		iDownload: document.querySelector( "section#file > header [name=download]" )
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

file.head.render = function( url, /*mimeType,*/ size ){
	var save     = false,
		rename   = true,
		remove   = true,
		download = true
	
	var filename = url.split("/").pop()
	var ext 	 = filename.split(".").pop().toLowerCase()
	var isFile   = filename.indexOf(".") > -1 
	
	if( !isFile ) {
			save = false
	} else {
		if(["txt","html","css","js","ts"].indexOf(ext) > -1)
			save = true
	}
	
	file.head.iSave.style.display     = save     ? "inline-block" : "none"
	file.head.iRename.style.display   = rename   ? "inline-block" : "none"
	file.head.iDelete.style.display   = remove   ? "inline-block" : "none"
	file.head.iDownload.style.display = download ? "inline-block" : "none"
	
	file.head.instance.querySelector( "label" ).innerHTML = '<a target="_null" data-title="Onpen in new tab" href="'+url+'">' + url + '</a>'
		+'&nbsp;&nbsp;&nbsp;<span class="fileSize">'+size+'</span>'
}

file.editor.saveProgress = function(){
	var progress = {
		pos: file.editor.iAce.selection.getCursor(),
		sel: file.editor.iAce.getSelectionRange()
	}
	localStorage.setItem( app.getUrl(), JSON.stringify(progress) )
}
file.editor.readProgress = function(){
	var progress = JSON.parse(localStorage.getItem( app.getUrl() ))
	if( progress ){
		if( progress.pos ) file.editor.iAce.gotoLine( progress.pos.row+1, progress.pos.column, true )
		if( progress.sel ) file.editor.iAce.selection.setRange( progress.sel )
	}
	file.editor.iAce.focus()
}

file.editor.load = function( url ){
	var fileName = url.split("/").pop()
	if( fileName !== "-" && fileName !== "" ){
		ajax( "GET", app.getPath()+"/findOne?{_id:\""+app.document+"\"}", function ( data ){
			if(data){
				var size = data[0] ? data[0].length : 0
				file.head.render( url, /*data.mimeType,*/ size ? " "+fileSize( size ) : "" )
				var ext = app.document.split(".").pop().toLowerCase()
				if( ['txt','html','xml','css','js','ts','json'].indexOf(ext) > -1 ){
						file.editor.renderText( data ); 
				} else if( ['png','gif','jpg','jpeg','ico'].indexOf(ext) >-1 ) {
						file.editor.renderImage( url )
				} else {
					file.editor.renderInfo( data )
				}
			} else file.editor.renderInfo("")
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

file.editor._isAceInited = false
file.editor._initAce = function(){
	file.editor.iAce.$blockScrolling = Infinity
	file.editor.iAce.commands.addCommand({
		name: 'Save', bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
		exec: function (editor) {
			app.onSaveFile()
		}, readOnly: false 
	});
	file.editor.iAce.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false
    });
	file.editor._isAceInited = true
}
file.editor.renderText = function( d ){
	var data = d["0"]
	file.editor.iEditor.hidden = false
	file.editor.iImage.hidden = true
	file.editor.iInfo.hidden = true
	
	if( !file.editor._isAceInited )
		file.editor._initAce()
	
	var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
	if( base64regex.test( data ) ) data = atob(data)
	data = data || ""
	file.editor.iAce.setValue( data )
	
	var mode = d._id.split(".").pop().toLowerCase()
	if( ["js","ts"].indexOf(mode) > -1 ) mode = "javascript"
	if( ["txt"].indexOf(mode) > -1 ) mode = "text"
	file.editor.iAce.session.setMode("ace/mode/" + mode )

	file.editor.iAce.clearSelection()

	file.head.iSave.style.display = "inline-block"
	file.editor.readProgress()
}
file.editor.renderInfo = function( data ){
	file.editor.iEditor.hidden = true
	file.editor.iImage.hidden = true
	file.editor.iInfo.hidden = false

	if(!data) data={_id:0,0:""}

	var buff = data[0]||""
	var url = "/"+app.database+"/"+app.collection+'/find'+(app.document?'?{_id:"'+app.document+'"}':'')
	file.editor.iInfo.innerHTML = "<table>"
			+ "<tr><th>ID:</th><td>" + (data._id || "") + "</td></tr>"
			+ "<tr><th>File Size:</th><td>" + fileSize(buff.length) + "</td></tr>"
			+ "<tr><th>URL:</th><td><a href='" + url + "' target='_null'>"+url+"</a></td></tr>"
		+"</table>"
}

file.modifier.rename = function( url, oldName, cb ) {
	var newName = prompt( "Rename file:", oldName )
	if( newName ) {
		url = url.replace(oldName,"")
		ajax( "GET", url+'findOneAndDuplicate?{_id:"'+oldName+'"}&{_id:"'+newName+'"}', function(doc){
			if( doc && doc.result && doc.result.ok == 1 ){
				ajax("GET", url+'remove?{_id:"'+oldName+'"}', cb )
			}  else if( doc.error ){
				alert( doc.error.errmsg )
			} else {
				alert("Unknown ERROR !")
			}
		} )
	}
}
file.modifier.remove = function( url ) {
	if( confirm( "DELETE file:\n"+url ) ){
		var url = app.getPath() + "/remove?{_id:\""+app.document+"\"}"
		ajax("GET", url, function(ret){ if( ret.ok ){
			toast("File deleted")
			app.onCollectionChanged( app.collection )
		}})
	}
}
file.modifier.save = function( path, fileName ) {
	fileName = fileName.replace(/^\//, "").replace(/\/$/, "")
	var url = path+"/update?{_id:\"" + fileName+"\"}&{$set:__FORM_DATA__}"
	
	var fdata = new FormData
	fdata.append("0", file.editor.iAce.getValue())

	ajax( "POST", url, function ( d ){
		if( d.ok && d.ok == 1 ) {
			if(typeof d.nModified !== 'undefined' && d.nModified==0){
				toast( "No change was made" )
			} else 
				toast( "The change is SAVED" )
		} else alert(d)
	}, fdata)
}
file.modifier.newFile = function( path ){
	path = path.replace(/\/$/,"")+"/"
	var url = prompt( "File URL:", path )
	if( url ) {
		let [db,coll] = url.replace(/^\//,"").split("/")
		var id = "/"+url.replace(path,"")
		var hasExt = id.indexOf(".") > -1
		
		if(!db || !coll || !id || !hasExt ){
			alert("Wrong File URL: "+url)
		} else {
			url = "/"+db+"/"+coll+'/insert?{_id:"'+id+'","0":""}'
			ajax( "GET", url, function (ret){
				if(ret.result && ret.result.ok && ret.result.ok == 1){
					app.onCollectionChanged( app.collection )
					toast("New File created")
				} else {
					alert(ret)
				}
			})
		}
	}
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
	// on leave save progress
	var prevWasAce =  file.editor.iEditor.offsetParent !== null
	if( prevWasAce ) file.editor.saveProgress()
	
	app.database = dbName
	app.collection = ""
	app.document = ""
	colls.selector.load( dbName )
	tree.list.load( app.database, "" )
	file.editor.load("")
}

app.onCollectionChanged = function( collName ){
	// on leave save progress
	var prevWasAce =  file.editor.iEditor.offsetParent !== null
	if( prevWasAce ) file.editor.saveProgress()
		
	app.collection = collName
	app.document = ""
	colls.selector.setActive( collName )
	tree.list.load( app.database, app.collection )
	app.onTreeSelectionChanged( "" )
}

app.onTreeSelectionChanged = function( path ) {
	// on leave save progress
	var prevWasAce =  file.editor.iEditor.offsetParent !== null
	if( prevWasAce ) file.editor.saveProgress()

	// 
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
app.afterUploadedFile = function( res ) {
	if( res.error ) alert( res.error.errmsg )
	else tree.list.load( app.database, app.collection )
}
app.reloadTree = function(){
	app.reloadCollections()
	tree.list.load( app.database, app.collection )
}
app.reloadCollections = function(){
	colls.selector.load( app.database )
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
app.onDownload = function(){
	window.open(app.getUrl()+"?download","_self")
}
app.onInportFromJSON = function(){
	var input, file, fr, progressbar;
	progressbar = document.querySelector( "progress" ) || {style:{display:""},value:0}
	
	input = document.getElementById('selectJSONfile')
	if (!input.files[0]) {
		alert("Please select a file before clicking 'Load'");
    } else {
		  progressbar.style.display = "block"
		  file = input.files[0];
		  fr = new FileReader();
		  fr.onload = receivedText;
		  fr.readAsText(file);
    }

    function receivedText(e) {
		function cb(ret){
			counter -= 1
			if( counter < 1 ){ 
				progressbar.style.display = "none"
				app.reloadTree()
			}
			if(ret.error) {
				alert(ret.error.errmsg)
			}
		}
			
		var counter = 0
		if(!app.database || !app.collection){
			alert("Select database and collection, please!")
			progressbar.style.display = "none"
		} else {
			try{
				var data = JSON.parse(e.target.result);
				var url = "/"+app.database+"/"+app.collection+"/insert"
				if(Array.isArray(data)){
					counter = data.length
					data.forEach(function(row){
						ajax("POST",url,cb,appendFormData(new FormData, row))
					})
				}else{
					counter = 1
					ajax("POST",url,cb,appendFormData(new FormData,data))
					
				}
			} catch(e){
				alert(e.toString() )
				progressbar.style.display = "none"
			}
			
		}
    }
}


app.onInit = function(){
	dbs.selector.load()
	file.editor.load( "" )
}()

