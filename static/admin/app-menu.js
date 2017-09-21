var menu = document.createElement( "menu" )
menu.id = "app-menu"
menu.innerHTML = '<li class="triangle"></li>'
	
	+'<li><a href="/admin/dbmanager/index.html" data-title="Databse Manager" target="databse manager">Databse</a></li>'
	+'<li><a href="/admin/usermanager/index.html" data-title="User Manager" target="users manager">Users</a></li>'
	+'<li><a href="/admin/filemanager.html" data-title="File Manager" target="files manager">Files</a></li>'
	+'<li><a href="/admin/backupmanager.html" data-title="File Manager" target="backup mamager">Backup</a></li>'
	+'<li><a href="/admin/docs.html" data-title="Documentation" style="font-weight:bold" target="documentation">(&nbsp;?&nbsp;)</a></li>'
	+'<li><a href="javascript:logout()" data-title="Logout">&times;</a></li>'
document.body.appendChild( menu )
function logout(){
	//var url = window.location.href.replace("://","://logout@")
	window.location.href = "/"
}