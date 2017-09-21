/* Manager */
	
RouteService = {
	defaultRoute : "/listDatabases",
	originalUrl  : "",
	
	route        : "",
	database     : "",
	collection   : "",
	documentId   : "",
	backUrl      : "",
	
	init: function() {
		let url = this.originalUrl.split( "?" )[0]
		
		this.route = url !== this.defaultRoute ? url : ""
		
		let r = this.route.replace( /^\//, "" ).replace( /\/$/,"" ).split( "/" )
		this.database   = r[0] ? r[0] : ""
		this.collection = r[1] ? r[1] : ""
		this.documentId  = r[0] && r[1] && r[2] ? this.route.split( this.database+"/"+this.collection+"/" )[1] : ""
		switch( r.length ) {
			case 1 : this.backUrl = ""; break
			case 2 : this.backUrl = "/"+r[0]; break
			default: this.backUrl = "/"+r[0]+"/"+r[1]
		}
	},
}

DatabasesComponent = {
	instance : document.querySelector( "#databases-table" ),
	template : document.querySelector( "#databases-template" ).content,
	dataUrl  : "/admin/listDatabases",
	data     : [],
	
	getData: function( callback ) {
		ajax( "GET", DatabasesComponent.dataUrl, function ( data ) {
			DatabasesComponent.data = data.databases
			callback()
		}) 
	},

	render: function() {
		DatabasesComponent.instance.style.display = "table"

		var tbody = DatabasesComponent.instance.querySelector( "tbody" )		
		tbody.innerHTML = ""		
		
		DatabasesComponent.instance.querySelector( "caption [name=docs]" ).textContent = DatabasesComponent.data.length
		
		var size = 0;
		DatabasesComponent.data.forEach( function ( row ){
			var tr = document.importNode( DatabasesComponent.template.querySelector( "tr" ), true )
			
			var b = tr.querySelectorAll( "th button-icon" )
			b[0].onclick = function (){ routeTo( '/' + row.name ) }
			b[1].onclick = function () { DatabasesComponent.remove( row.name ) }
			
			var td = tr.querySelectorAll( "td" )
			td[0].textContent = row.name
			td[1].textContent = fileSize( row.sizeOnDisk )
			td[2].textContent = row.empty
			tbody.appendChild( tr )
			
			size += parseInt( row.sizeOnDisk ) 
		})
		DatabasesComponent.instance.querySelector( "[name=sum-size]" ).textContent = fileSize( size )
	},
	
	display: function() {
		this.getData( this.render );
	},
	
	remove: function( database ) {
		if( confirm( database + "\n\nDELETE ?") ) {
			ajax( "GET", '/admin/'+database+'/dropDatabase', function ( ret ){
				DatabasesComponent.display()
			} )
		}
	}
}

CollectionsComponent = {
	instance : document.querySelector( "#collections-table" ),
	template : document.querySelector( "#collections-template" ).content,
	dataUrl  : "",
	data     : [],
	
	getData: function( callback ) {
		ajax( "GET", "/admin"+CollectionsComponent.dataUrl+"/listCollections", function ( data ) {
			CollectionsComponent.data = data
			callback()
		}) 
	},
	render: function() {
		let tbody = CollectionsComponent.instance.querySelector( "tbody" )
		
		CollectionsComponent.instance.style.display = "table"
		tbody.innerHTML = ""
		
		CollectionsComponent.instance.querySelector( "caption [name=docs]" ).textContent = CollectionsComponent.data.length
		CollectionsComponent.instance.querySelector( "caption [name=title]" ).textContent= RouteService.route
		
		CollectionsComponent.data.forEach( function ( row ){
			var tr = document.importNode( CollectionsComponent.template.querySelector( "tr" ), true )
			
			let b = tr.querySelectorAll( "th button-icon" )
			b[0].onclick = function (){ routeTo( '/' + RouteService.database + "/" + row.name ) }
			b[1].onclick = function () { CollectionsComponent.remove( row.name ) }
			
			var td = tr.querySelectorAll( "td" )
			td[0].innerHTML   = '<a href="javascript: CollectionsComponent.rename(\''+row.name+'\')" data-title="Rename">' + row.name + '</a>'
			td[1].textContent = row.type
			td[2].textContent = JSON.stringify( row.options )
			td[3].textContent = JSON.stringify( row.info )
			td[4].textContent = JSON.stringify( row.idIndex )
			tbody.appendChild( tr )
		})
	},
	display: function() {
		this.getData( CollectionsComponent.render );
	},
	rename: function( oldName ) {
		let newName = prompt( "\nRename", oldName )
		if( newName ) {
			let url = "/"+RouteService.database+"/"+oldName+'/rename?newName="'+newName+'"'
			ajax( "GET", url, function ( ret ){
				CollectionsComponent.display()
			} )
		}
	},
	remove: function( collection ) {
		let url = "/"+RouteService.database+"/"+collection+"/drop"
		if( confirm( "/"+RouteService.database + "/" + collection + "\n\nDELETE ?") ) {
			ajax( "GET", url, function ( ret ){
				CollectionsComponent.display()
			} )
		}
	}
}

DocumentsComponent = {
	instance : document.querySelector( "#documents-table" ),
	dataUrl  : "",
	_cache   : {},
	
	data     : [],
	page     : 1,
	allPages : 1,
	allDocs  : 0,
	perPage  : 10,
	sort     : {mimeType:-1}, //{_id:1},
	
	getData: function( callback ) {
		let url = DocumentsComponent.dataUrl + "/find?{}&{}&options={"
			+"limit:"+DocumentsComponent.perPage+","
			+"skip:"+(DocumentsComponent.page-1)*DocumentsComponent.perPage+","
			+"sort:"+ JSON.stringify( DocumentsComponent.sort)+"}"
		var counter = 0
		ajax( "GET", url, function ( ret ) {
			DocumentsComponent.data = ret
			if( counter++ ) callback()
		})
		ajax( "GET", DocumentsComponent.dataUrl+"/count", function(number){
			DocumentsComponent.allDocs = parseInt(number)
			DocumentsComponent.page = parseInt( DocumentsComponent.page )
			DocumentsComponent.allPages = Math.ceil( number / DocumentsComponent.perPage )
			if( counter++ ) callback()
		})

	},
	render: function( data ) {
		let instance = DocumentsComponent.instance
		
		var pageSelect = instance.querySelector( "[name=page]" )
		pageSelect.textContent = ""
		for( var i = 1; i <= DocumentsComponent.allPages; i++ ){
			var opt = document.createElement( "option" )
			opt.value = i
			opt.textContent = i
			opt.selected = i == DocumentsComponent.page
			pageSelect.appendChild( opt )
		}
		
		instance.style.display = "table"
		instance.querySelector( ".title" ).textContent = DocumentsComponent.dataUrl
		instance.querySelector( "[name=all-pages]" ).textContent = DocumentsComponent.allPages
		instance.querySelector( "[name=docs]" ).textContent = DocumentsComponent.data.length
		instance.querySelector( "[name=all-docs]" ).textContent = DocumentsComponent.allDocs
		instance.querySelector( "[name=per-page]" ).textContent = DocumentsComponent.perPage
		
		let tbody = instance.querySelector( "tbody" )
		tbody.textContent = ""
		DocumentsComponent.data.forEach( function ( row ) {
			var tr = document.createElement( "tr" )

			var thEdit = document.createElement( "th" )
			thEdit.innerHTML = '<button-icon data-title="Edit">&#x270E;</button-icon>'
			thEdit.onclick = function( e ) { e.preventDefault(); routeTo( '/'+RouteService.database+"/"+RouteService.collection+"/"+row._id  ) }
			tr.appendChild( thEdit )
			
			Object.keys( row ).sort().forEach( function ( field ) {
				var th = document.createElement( "th" )
				th.textContent = field
				th.style.background = "#fafafa"
				tr.appendChild( th )

				var td = document.createElement( "td" )
				var c = row[field]
				if( typeof row[field] == 'object') 
					c = JSON.stringify( c )
				var len = c.toString().length
				td.textContent =  len < 100 ?  c : c.substr(0,100)+"  ... " + fileSize(len) + " "
				tr.appendChild( td )
			})
			tbody.appendChild( tr )
		})
		
	},
	display: function() {
		DocumentsComponent.page = DocumentsComponent._cache[ RouteService.originalUrl + '_page'] || 1
		DocumentsComponent.getData( DocumentsComponent.render );
	},
	gotoPage: function( page ) {
		DocumentsComponent._cache[ RouteService.originalUrl + '_page'] = page
		DocumentsComponent.page = page
		DocumentsComponent.display()
	}
}


DocumentComponent = {
	instance: document.querySelector( "#dialog-edit-document" ),
	_id   : null,
	data  : "",
	
	loadData: function( cb ) {
		let url = "/" + RouteService.database + "/" + RouteService.collection + "/findOne?{_id:\"" + RouteService.documentId+"\"}"
		ajax( "GET", url, function ( ret ) {
			DocumentComponent._id = ret._id
			DocumentComponent.data = ret
			cb()
		})
	},
	
	render: function() {
		DocumentComponent.instance.style.display = "block"
		DocumentComponent.instance.querySelector( "[autofocus]" ).focus()
		
		DocumentComponent.instance.querySelector( "[name=database]" ).value = RouteService.database
		DocumentComponent.instance.querySelector( "[name=collection]" ).value = RouteService.collection
		DocumentComponent.instance.querySelector( "[name=data]" ).value = typeof DocumentComponent.data == 'object' ? JSON.stringify( DocumentComponent.data, null, 4 ) : DocumentComponent.data
		DocumentComponent.instance.querySelector( "[name=delete]" ).style.display = DocumentComponent._id ? "inline-block" : "none"
		DocumentComponent.instance.querySelector( "[name=title]" ).textContent = DocumentComponent._id ? DocumentComponent._id : "New docment"
	},
	
	display: function() {
		this.loadData( this.render )
	},
	
	save: function( cb ) {
		var form = DocumentComponent.instance
		var url = "/" + form.querySelector( "[name=database]" ).value 
				+ "/" + form.querySelector( "[name=collection]" ).value
				+ '/save'
				//+ ( DocumentComponent._id ? "" : "?insert" )
				//+ ( DocumentComponent._id ? "/" + DocumentComponent._id : "" )
		try {
			eval( 'var jsonData = ' + form.querySelector( "[name=data]" ).value + ';' )
		} catch( e ) { alert( e ); throw e }
		
		ajax( "POST", url, cb, appendFormData( new FormData, jsonData ) )
	},
	remove: function( cb ) {
		let url = "/" + RouteService.database + "/" + RouteService.collection + "/remove?{_id:\"" + DocumentComponent._id +"\"}"
		if( confirm( "/"+RouteService.database + "/" + RouteService.collection+"/"+DocumentComponent._id + "\n\nDELETE ?") ) {
			ajax( "GET", url, function ( ret ){
				cb()
			} )
		}
	}
}

/////////////

function routeTo( url ) {
	let allViews = document.querySelectorAll( ".view" )
	
	if( url == ":newDocument" ) {
		RouteService.backUrl = RouteService.originalUrl
		DocumentComponent._id = null
		DocumentComponent.data = ""
		DocumentComponent.render()
		return;
	} 
	
	RouteService.originalUrl = url || RouteService.defaultRoute
	RouteService.init()
	
	if( RouteService.database == "" ) {
		for( var i = 0; i < allViews.length; i++) allViews[i].style.display = "none"
		DatabasesComponent.display()
	} else if( RouteService.collection == "" ) {
		for( var i = 0; i < allViews.length; i++) allViews[i].style.display = "none"
		CollectionsComponent.dataUrl = "/" + RouteService.database
		CollectionsComponent.display()
	} else if( RouteService.documentId == "" ) {
		for( var i = 0; i < allViews.length; i++) allViews[i].style.display = "none"
		DocumentsComponent.dataUrl = "/" + RouteService.database + "/" + RouteService.collection
		DocumentsComponent.display()
	} else {
		DocumentComponent.display()
	}
}

function routeBack() {
	routeTo( RouteService.backUrl )
}
function closeDialog() {
	let allDialogs = document.querySelectorAll( "dialog.view" )
	for( var i = 0; i < allDialogs.length; i++) allDialogs[i].style.display = "none"
	
	RouteService.originalUrl = RouteService.backUrl
	RouteService.init()
}

////////////
let TERMINAL = {
	instance: document.querySelector( "dialog#tools-terminal" )
}
TERMINAL.open = function( path ){
	TERMINAL.instance.querySelector( "[name=path]" ).value = path
	TERMINAL.instance.style.display = "block"
	TERMINAL.instance.querySelector( "[name=method]" ).focus()
}
TERMINAL.close = function(){
	TERMINAL.instance.style.display = "none"
}

TERMINAL.execute = function() {
	var method = TERMINAL.instance.querySelector( "[name=method]" ).value
	var path = TERMINAL.instance.querySelector( "[name=path]" ).value.replace( /\/$/, "")
	var params = TERMINAL.instance.querySelector( "[name=params]" ).value.replace( /^\//, "")
	var body = TERMINAL.instance.querySelector( "[name=body]" ).value
	var url = ( "/" + path + "/" + params ).replace( /\/\//g, "/")
	ajax( method, url, function( ret ){
		console.log( ret )
		alert( JSON.stringify( ret ) )
	}, appendFormData(new FormData, body) )
}

let app = {}
app.openTerminal = function( type ) {
	if( type ) {
		var path = RouteService.route
		TERMINAL.open( path )
	} else TERMINAL.close()
}
app.onExecuteTerminalCommand = function(){
	TERMINAL.execute()
}

routeTo('/')