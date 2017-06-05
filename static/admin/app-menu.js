var menu = document.createElement( "menu" )
menu.id = "app-menu"
menu.innerHTML = '<li class="triangle"></li>'
	
	+'<li><a href="/admin/dbmanager.html" data-title="Databse Manager">Db Manager</a></li>'
	+'<li><a href="/admin/usermanager.html" data-title="User Manager">User Manager</a></li>'
	+'<li><a href="/admin/filemanager.html" data-title="File Manager">File Manager</a></li>'
	+'<li><a href="/admin/docs.html" data-title="Documentation" style="font-weight:bold">(&nbsp;?&nbsp;)</a></li>'
	+'<li><a href="javascript:logout()" data-title="Logout">&times;</a></li>'
document.body.appendChild( menu )
function logout(){
	//var url = window.location.href.replace("://","://logout@")
	window.location.href = "/"
}