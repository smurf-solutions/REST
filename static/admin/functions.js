
/** Make HTTP Request **/
function ajax( method, url, cb, formData ) {
	if( typeof formData == 'undefined' || formData instanceof FormData ) {
		var progressbar = document.querySelector( "progress" ) || {style:{display:""},value:0}
		progressbar.style.display = "block"
		
		var http = new XMLHttpRequest()
		http.onreadystatechange = function() { 
			//progressbar.value =  http.readyState * 25
			
			if ( http.readyState == 4 ){ 
				progressbar.style.display = "none"
				if( http.status == 200 ) {
					try { var j = JSON.parse( http.responseText ); if( j.error ) alert( "\nERROR\n" + j.error ) } 
					catch ( e ) { var j = http.responseText }
					if( j.error ) alert( j.error )
					if( cb ) cb( j )
				} else if( http.status == 401 ) {
					location.reload()
				} else {
					alert( http.statusText || "Server error" )
					if( cb ) cb( [] )
				}
			}		
		}
		try {
			http.open( method, url, true )
			http.send( formData || null )
		} catch ( e ) { alert( e ); throw e }
	} else {
		var msg = "STOP \nTrying to submit NONE FormData to " + url + ""
		console.error( msg ); alert( msg )
	}
}


/** Convert bites in  human readble string **/
function fileSize(b) { b = b?b:0
    var s=1024, u = 0; while (b >= s || -b >= s) { b /= s; u++ }
    return (u ? b.toFixed(1) + ' ' : b) + ' KMGTPEZY'[u] + 'B'
}


/** Add JSON to FormData **/
function appendFormData( formData, jsonData, key ){
    key = key || '';
	if( Array.isArray( jsonData ) )
		for( var i = 0; i < jsonData.length; i++ ) appendFormData( formData, jsonData[i], key ? key + "["+i+"]" : "" )
	else if ( typeof jsonData === 'object' )
		for( var k in jsonData ) appendFormData( formData, jsonData[k], (key ? key+".": "") + k )
    else formData.append( key, jsonData );
	return formData
}

/*** Toast ***/
function toast( message ){
	var toast = document.createElement("div")
	toast.setAttribute( "style", "background:#000;color:#fff;padding:15px 25px;position:fixed;bottom:0;left:48%;border-radius:5px 5px 0 0" )
	document.body.appendChild( toast )
	toast.textContent = message
	setTimeout(function(){ toast.remove() }, 3000)
}

