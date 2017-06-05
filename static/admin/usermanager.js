dbSelector = {
	instance: document.querySelector( "#database-select" ),
	data: [],
	
	render: function() {
		let select = dbSelector.instance.querySelector( "select" )
		select.textContent = ""
		var firstOp = document.createElement( "option" )
		firstOp.textContent = "-"
		select.appendChild( firstOp )
		
		dbSelector.data.forEach( function( db ) {
			var opt = document.createElement( "option" )
			opt.value = db.name
			opt.textContent = db.name
			select.appendChild( opt )
		})
	},
	
	display: function() {
		ajax( "GET", "/admin/listDatabases", function( data ) {
			dbSelector.data = data.databases
			dbSelector.render()
		})
	}
}
/*
collsComponent = {
	instance: document.querySelector( "#collections-section" ),
	data: [],
	
	render: function(){
		this.instance.style.display = "block"
		
		let table = this.instance.querySelector( "table" )
		
		
		var tbody = table.querySelector( "tbody" )
		tbody.textContent = ""
		this.data.forEach( function( row ) {
			var tr = document.createElement( "tr" )
			var td = document.createElement( "td" )
			td.textContent = row.name
			tr.appendChild( td )
		
			tbody.appendChild( tr )
		})
	},
	
	display: function() {
		ajax( "GET", "/" + app.database, function( data ){
			collsComponent.data = data
			collsComponent.render()
		})
	}
}
*/
usersComponent = {
	roles: {  // list
		instance: document.querySelector( "#user-roles" ),
		allData: [],
		id_user: "",
		userData: "",
		
		getAllData: function( cb ) {  // rolse-list
			ajax("GET", "/"+app.database+"/db.roles?find={}", function( data ) {
				usersComponent.roles.allData = data.data
				cb()
			})
		},
	
		getUserData: function( cb ) {  // roles list
			ajax("GET", "/"+app.database+"/db.users/"+this.id_user+"?fields={roles:1}", function( data ) {
				usersComponent.roles.userData = data.roles
				cb()
			})
		},
		
		render: function() { // rolse list
			var selected = usersComponent.roles.userData ? usersComponent.roles.userData.split(",") : []
			usersComponent.roles.instance.style.display = "block"
			
			var content = usersComponent.roles.instance.querySelector( "[name=content]" )
			content.textContent = ""
			
			var tpl = usersComponent.roles.instance.querySelector( "[data-roles-template]" )
			usersComponent.roles.allData.forEach( function( row ){
				var newRow = tpl.cloneNode( true ).content
				newRow.querySelector( "[name=role-name]" ).textContent = row._id
				
				var check = newRow.querySelector( "[name='role']" )
				check.value = row._id
				check.checked = ( selected.indexOf( row._id ) > -1 )
				
				newRow.querySelector( "[name=read]"  ).textContent = typeof row.read == 'object' ? row.read.join( ", ") : row.read
				newRow.querySelector( "[name=write]" ).textContent = typeof row.write == 'object' ? row.write.join( ", ") : row.write
				newRow.querySelector( "[name=edit]" ).onclick = function(){usersComponent.roles.edit(row._id)}
				newRow.querySelector( "[name=remove]").onclick = function(){usersComponent.roles.remove(row._id)}
				
				content.appendChild( newRow )
			})
		},
		
		reload: function() { // roles-list
			usersComponent.roles.getAllData( usersComponent.roles.display )
		},
		display: function() {  // roles-list
			usersComponent.roles.getUserData( usersComponent.roles.render )
		},
		
		updateUserRoles: function() {  //rolse-list
			if( usersComponent.roles.id_user ) {
				var boxes = usersComponent.roles.instance.querySelectorAll( "#list-roles [type=checkbox]:checked" )
				var roles = []	
				for( var i = 0; i < boxes.length; i++ ) roles.push( boxes[i].value ) 
				
				var data = new FormData 
				data.append( "roles", roles )
				
				var url = "/" + app.database + "/db.users/" + usersComponent.roles.id_user
				ajax( "PATCH", url, usersComponent.reload, data )
			} else { alert( "No user selected !" ); usersComponent.roles.render() }
		},
		
		edit: function( id_role ) {  //roles-list
			dialogRole.id_role = id_role
			dialogRole.display()
		},
		
		remove: function( id_role ) {  // roles-list
			if( confirm( id_role + "\nDELETE ?") ){
				ajax( "DELETE", "/"+app.database+"/db.roles/"+id_role, function(){ 
					usersComponent.roles.reload()
				})
			}
		}
	},
	
	
// users-list
	
	instance: document.querySelector( "#users-section" ),
	data: [],
	
	reload: function(){
		usersComponent.getData( usersComponent.render )
	},
	
	getData: function( cb ) {  //users-list
		ajax( "GET", "/" + app.database + "/db.users?find={}&sort={_id:1}", function( data ){
			usersComponent.data = data.data
			cb()
		})
	},
	
	render: function() {	//users-list
		usersComponent.instance.style.display = "block"
		let table = usersComponent.instance.querySelector( "table" )
		let tbody = table.querySelector( "tbody" )
		tbody.textContent = ""
		var rowTemplate = usersComponent.instance.querySelector( "template[data-user-row]" )
		
		usersComponent.data.forEach( function( row ) {
			var tr = rowTemplate.cloneNode( true ).content.querySelector( "tr" )
			tr.setAttribute( "data-id", row._id )
			tr.onclick = function() { usersComponent.fillRoles(row._id) }
			if( usersComponent.roles.id_user == row._id ) tr.classList.add( "selected" )
			
			tr.querySelector( "[name=_id]" ).textContent = row._id
			tr.querySelector( "[name=name]" ).textContent = row.name
			tr.querySelector( "[name=email]" ).textContent = row.email
			tr.querySelector( "[name=roles]").textContent = (String)(row.roles).replace(/\,/g, ", ")
			
			var pwd = tr.querySelector( "[name=pwd]"  )
			pwd.onclick = function() { usersComponent.setPass( row._id ) }
			if( !row.pwd ) { pwd.style.color = "red"; pwd.textContent = "?" }

			tr.querySelector( "[name=edit]" ).onclick = function() { usersComponent.edit( row._id ) }
			tr.querySelector("[name=remove]").onclick = function() { usersComponent.remove( row._id ) }
			
			tbody.appendChild( tr )
		})
	},
	
	
	fillRoles: function( id_user ) {	// users-list
		usersComponent.roles.id_user = id_user
		usersComponent.roles.getUserData( usersComponent.roles.render )
		
		var list = usersComponent.instance.querySelector( "[name=users-list]" )
		var selected = list.querySelector( "tr.selected" )
		if( selected ) selected.classList.remove("selected")
		list.querySelector( "[data-id='"+id_user+"']" ).classList.add( "selected" ) 
	},
	
	display: function() {		// users-list
		usersComponent.roles.id_user = ""
		usersComponent.getData( usersComponent.render )
		usersComponent.roles.getAllData( usersComponent.roles.display )
	},
	edit: function( id_user ) {		// users-list
		dialogEditUser.id_user = id_user
		dialogEditUser.display()
	},
	remove: function( id_user ) {	// users-list
		if( confirm( id_user + "\n\nDELETE ?" ) ) {
			ajax( "DELETE", "/"+app.database+"/db.users/"+id_user, function( ret ){ app.route( "/" + app.database ) })
		}
	},
	setPass: function( id_user ){	// users-list
		var p = prompt( "Set password:", "" )
		if( p !== null ) { 
			var fd = new FormData; 
			fd.append( "pwd", ( p ? md5(p) : "" ) )
			ajax( "PATCH", "/"+app.database+"/db.users/"+id_user, usersComponent.reload,  fd )
		}
	}
}



dialogEditUser = {
	instance: document.querySelector( "#dialog-edit-user" ),
	id_user: "",
	data: {},
	
	loadData: function( cb ) {
		ajax( "GET", "/"+app.database+"/db.users/"+dialogEditUser.id_user, function( data ){
			dialogEditUser.data = data
			cb()
		})
	},
	render: function() {
		dialogEditUser.instance.style.display = "block"
		
		dialogEditUser.instance.querySelector( ".title" ).innerHTML = dialogEditUser.data._id ? "<i>User:</i> <b>" + dialogEditUser.data._id + "</b>" : "New user"
		dialogEditUser.instance.querySelector( "[name=_id]" ).value = dialogEditUser.data._id || ""
		dialogEditUser.instance.querySelector( "[name=name]" ).value = dialogEditUser.data.name || ""
		dialogEditUser.instance.querySelector( "[name=email]" ).value = dialogEditUser.data.email || ""
		dialogEditUser.instance.querySelector( "[name=_id]" ).focus()
	},
	display: function( ) {
		if( dialogEditUser.id_user ) dialogEditUser.loadData( dialogEditUser.render )
		else {
			dialogEditUser.data = {_id:0}
			dialogEditUser.render()
		}
	},
	close: function() {
		dialogEditUser.instance.style.display = "none"
	},
	save: function() {
		let form = dialogEditUser.instance.querySelector( "form" )
		let data = new FormData( form )
		let method = dialogEditUser.id_user ? "PATCH" : "PUT"
		ajax( method, "/" + app.database + "/db.users/" + dialogEditUser.id_user, function(){
			usersComponent.reload()
			dialogEditUser.close()
		}, data )
	}
}


dialogRole = {
	instance: document.querySelector( "#dialog-role" ),
	_id:      document.querySelector( "#dialog-role [name=_id]" ),
	iRead:    document.querySelector( "#dialog-role [name=read-wrap]" ),
	iWrite:   document.querySelector( "#dialog-role [name=write-wrap]" ),
	template: document.querySelector( "#template-role-row" ),
	
	allCollections: [],
	access: {read:[],write:[]},
	id_role:  "",
	
	load: function( cb ) {
		ajax( "GET", "/"+app.database+"/listCollections", function( data ){
			dialogRole.allCollections = data
			ajax( "GET", "/"+app.database+"/db.roles/"+dialogRole.id_role+"?fields={}", function( data ){
				dialogRole.access.read = typeof data.read == 'string' ? data.read.split(",") : data.read
				dialogRole.access.write = typeof data.write == 'string' ? data.write.split(",") : data.write
				cb()
			})
		})
	},
	render: function() {
		dialogRole.instance.style.display = "block"
		dialogRole.instance.querySelector( "[name=title]" ).innerHTML = dialogRole.id_role ? "<i>Edit:</i> <b>"+dialogRole.id_role+"</b>" : "New Role"
		dialogRole._id.focus()
		dialogRole._id.value = dialogRole.id_role
		dialogRole.iRead.textContent = ""
		dialogRole.iWrite.textContent = ""
		
		var collections = [{name:"*"}].concat( dialogRole.allCollections )
		collections.forEach( function( row ) {
			// Read
			let tml = dialogRole.template.cloneNode( true ).content
			let role = tml.querySelector( "[name='roles']" )
			role.value = row.name
			role.name = "read"
			if( dialogRole.access.read && dialogRole.access.read.indexOf( row.name ) >-1  ) role.checked = true
			tml.querySelector( "[name=label]" ).textContent = row.name
			
			dialogRole.iRead.appendChild( tml )
			
			// Write
			tml = dialogRole.template.cloneNode( true ).content
			role = tml.querySelector( "[name='roles']" )
			role.value = row.name
			role.name = "write"
			if( dialogRole.access.write && dialogRole.access.write.indexOf( row.name ) >-1  ) role.checked = true
			tml.querySelector( "[name=label]" ).textContent = row.name

			dialogRole.iWrite.appendChild( tml )
		})
	},
	display: function() {
		dialogRole.load( dialogRole.render )
	},
	displayNew: function() {
		dialogRole.id_role = ""
		dialogRole.access = {read:[],write:[]}
		dialogRole.display()
	},
	
	keyboard: function( event ) {
		switch( event.key ) {
			case "Esc":
			case "Escape": dialogRole.close(); break
			case "Enter" : dialogRole.save(); break
		}
	},
	
	close: function() {
		dialogRole.instance.style.display = "none"
	},
	save: function() {
		var form = dialogRole.instance.querySelector("form")
		var fdata = new FormData( form )
		
		if( form.querySelectorAll( "[name=read]:checked" ).length == 0 )  fdata.append( "read", "" )
		if( form.querySelectorAll( "[name=write]:checked" ).length == 0 ) fdata.append( "write","" )
			
		var method = dialogRole.id_role ? "PATCH" : "PUT"
		ajax( method, "/"+app.database+"/db.roles/"+dialogRole.id_role, function( ret ){
			if( ret.success ){
				usersComponent.roles.getAllData( usersComponent.roles.display )
			}
			dialogRole.close();
		}, fdata )
	}
}



//**** APP ****/

app = {
	database: "",
	collection: "",
	
	route: function( route ) {
		var views = document.querySelectorAll( ".view" )
		for( var i = 0; i < views.length; i ++ )  views[i].style.display = "none"
		
		route = route && route != '-' ? route.replace( /^\//, "") : "";
		let [ database, collection ] = route.split( "/" )
		this.database = database; this.collection = collection
		
		if( !this.database ) {
			dbSelector.display()
			document.querySelector( ".nodata" ).style.display = "block"
		} else if( !this.collection ) {
			//collsComponent.display()
			usersComponent.display()
		}
	}
}


app.route( "/" )