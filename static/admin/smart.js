/***
KeyWords:
	data-template="url"
	data-json='{json:"goes",here:":)"}'
	data-url="url"
	data-if="javascript expresion"  data-else="content"

	//fuctions
	data-onsuccess, data-onerror
	data-onshow, data-onhide, data-onrefresh
***/

function setProgress(){
	var counter = parseInt( progress.getAttribute("data-counter")||0 )
	progress.setAttribute("data-counter", ++counter)
	progress.style.display = "block"
}
function removeProgress(){
	var counter = parseInt( progress.getAttribute("data-counter")||0 )
	progress.setAttribute("data-counter", --counter)
	if(counter == 0){
		progress.style.display= "none"
	}
}

// function dispatchToParent(element, eventName){
		// element.dispatchEvent(new Event(eventName,{bubbles:true}))
// }
// function dispatchToChildren(element,eventName){
		// element.querySelectorAll("[data-on"+eventName+"]").forEach(function(el){
			// el.dispatchEvent(new Event(eventName))
		// })
// }

/** Usage Templates
	<div   
		 data-url="url/to/data.json" 
		 data-json="..."
	>
		<div role="first"> ... </div>
		<div role="empty">  ... </div>
		<div role="last">   ... </div>
		<div>  ...body... </div>
		<script> ... </script>
	</div>
	||
	<div data-template="url/to/template.html"   
		 data-url="url/to/data.json"  
		 data-json="..."
	></div>
**/
var smartTemplate = function(element){

	var $data
	var $append
	var isTemplateReady = false
	var isDataReady = false
	var isIfReady = false
	
	element.instance = this

	function logError(msg, content, data){
		var tplName = element.getAttribute("data-template")||"[inline]"
		console.error( msg )
		console.info( 'Id: \'' +(element.id||"n/a") + '\'     Template: \'' + tplName+'\'')
		console.log(content)
		if(data) console.log(data)
	}
	

	
	function initEvents(){
		var atts = element.attributes
		for(var i=0;  i < atts.length; i++ ){
			if( atts[i].name.slice(0,7) == "data-on"){
				var attValue = atts[i].value 
				var s = attValue.indexOf('"') > -1 ? "'" : '"'
				eval(`element.addEventListener( "${atts[i].name.slice(7)}", function(event){
						event.preventDefault(); event.stopPropagation()
						eval( ${s}${attValue}${s} ) })` )
			}
			
		}
		if(!element.hasAttribute("data-onrefresh")){
			element.addEventListener("refresh", function(event){element.instance.refresh()})
		}
	}
	function initTemplate( cb ){
		if( isTemplateReady ) return
		
		function templateToAttributes(){
			function moveTemplateNodeToAttr( tplNode, attrib ){
				element.setAttribute(attrib, tplNode.outerHTML )
				tplNode.parentNode.removeChild( tplNode )
			}

			element.querySelectorAll("[data-template], [data-json], [data-url], [data-if]").forEach(function(el){
				el.innerHTML = el.innerHTML
				.replace(/\\\$\{/g,"${")
				.replace(/\$\{/g,"\\${")
				.replace(/<!--([\s\S]*?)-->/mig, '$1')
			})
			
			var children = element.children
			for(var i=children.length-1;i>-1;i--){
				var child = children[i]
				if( child.getAttribute("role") == "empty" ) moveTemplateNodeToAttr( child, "data-template-empty" )
				if( child.getAttribute("role") == "first" ) moveTemplateNodeToAttr( child, "data-template-first" )
				if( child.getAttribute("role") == "last" ) moveTemplateNodeToAttr( child, "data-template-last" )
				if( child.nodeName == "SCRIPT"){
					if(child.src){
						var http = new XMLHttpRequest
						element.setAttribute("data-template-script-src",child.src)
						http.addEventListener("load",function(e){ eval.call(window,this.responseText) })
						http.open("GET", child.src)
						http.send()
					} else {
						var script = child.textContent
							.replace(/(["|'].*)[\n](?!(([^"|']*["|']){2})*[^"|']*$)/g,'$1\\n$2')
						element.setAttribute("data-template-script",script)
					}
					child.parentNode.removeChild( child )
				}
				if( child.nodeName == "STYLE" ){
					var node = document.createElement("style")
					var pClass = "scope-"+Date.now()
					child.innerHTML.replace(/[\n\t]/g," ").split("}").forEach( line => {
						var [key,s] = line.split("{")
						if(key && s) node.innerHTML += "."+pClass+" " + key+"{"+s+"}\n"
					})
					child.parentElement.classList.add(pClass)
					document.head.appendChild(node)
					child.parentNode.removeChild( child )
				}
			}
			if(element.innerHTML) {
				element.setAttribute("data-template-content", element.innerHTML)
				element.textContent = ""
			}
			isTemplateReady = true
		}	
		
		initEvents()
		
		var src = element.getAttribute("data-template")
		if(src){
			setProgress()
			var http = new XMLHttpRequest
			http.addEventListener("load",function(){
				element.innerHTML = this.responseText
				templateToAttributes()
				if(cb) cb()
				removeProgress()
			})
			http.open("GET",src); http.send()
		} else {
			templateToAttributes()
			if(cb) cb()
		}
	}
	

	function initIf(cb){
		if( isIfReady ){
			if(cb) cb();
		} else {
			isIfReady = true
			if( element.hasAttribute("data-if") ){
				if(!$data) $data={}
				with( $data ){
					if(!eval(element.getAttribute("data-if")) ){
						element.innerHTML = element.getAttribute("data-else")
						isIfReady = false
						return false
					} else {
						if(cb) cb()
					}
				}
			} else {
				if(cb) cb()
			}
		}
	}
	
	function initData( cb ){
		if(	isDataReady ) return
		
		
		function dataFromAttributesToGlobal(){
			if(element.hasAttribute("data-json")){
				try { eval(`$data = ${element.getAttribute("data-json")}`)
				} catch(e){ console.error("Error: data-json for "+element+"(id="+element.id+") is not a JSON !"); console.log(element) }
			}
			isDataReady = true
		}
		
		if(element.hasAttribute("data-json") && element.hasAttribute("data-url")){
			var json = element.getAttribute("data-json")
			element.removeAttribute("data-json")
			try{
				eval("$append="+json)
			}catch(e){logError(e,json)}
		}
		
		var dataSrc = element.getAttribute("data-url")
		if(dataSrc){
			setProgress() 
			var http = new XMLHttpRequest
			http.addEventListener("load",function(){
				element.setAttribute("data-json", this.responseText)
				dataFromAttributesToGlobal()
				if(cb) cb()
				removeProgress()
			})
			http.open("GET",dataSrc); http.send()
		} else {
			dataFromAttributesToGlobal()
			if(cb) cb()
		}
	}
	
	
	function render(cb){
		function safeEval($tpl, $data, lastError){
			with($data){
				try{ return eval("`"+ $tpl +"`") } 
				catch(e){ 
					if(e.message !== lastError && e.message.substr(-15) == ' is not defined'){
						var $var = e.message.split(" ")[0]
						return safeEval($tpl,Object.assign($data,{[$var]:""}),e.message)
					}else logError(e.toString(),$tpl,$data) 
				}
			}
		}

		/** content **/
		if(!isTemplateReady || !isDataReady || !isIfReady) { return }
		
		var tplScript 	= element.getAttribute( "data-template-script"  )
		var tplEmpty 	= element.getAttribute( "data-template-empty"   )
		var tplFirst 	= element.getAttribute( "data-template-first"   )
		var tplContent  = element.getAttribute( "data-template-content" )
		var tplLast 	= element.getAttribute( "data-template-last"    )
		
		if(!$data) $data = {}
		if(!$append) $append = {}
		
		if(tplScript){
			with(Object.assign($data,$append)){
				try{ eval(tplScript) }
				catch(e){ logError(e.toString(),tplScript) }
			}
		}
		var newContent = ""
		if($data.length < 1 && tplEmpty) {
			newContent += safeEval(tplEmpty,$append)
		} else {
			if(Array.isArray($data)){
				if(tplFirst) {
					var sl = {"$data":[]}; $data.forEach(key=>{sl["$data"].push($data[key]) })
					newContent += safeEval(tplFirst,$append,sl)
				}
				$data.forEach(function($row,$i){
					var sl = {"$i":$i,"$row":{}}; Object.keys($row).forEach(key=>{sl["$row"][key] = $row[key] })
					newContent += safeEval(tplContent,Object.assign($row,sl,$append))
				})
				if(tplLast){
					var sl = {"$data":[]}; $data.forEach(key=>{sl["$data"].push($data[key]) })
					newContent += safeEval(tplLast,$append)
				}
			} else {
				var sl={"$data":[]}; Object.keys($data).forEach(key=>{sl["$data"][key] = $data[key] })
				newContent += safeEval(tplContent,Object.assign($data,$append))
			}
			
		}
					
		element.innerHTML = newContent
		
		if(element.nodeName === "DIALOG"){
			smartDialog(element)
		}
		
		var autoFocus = element.querySelector("[autofocus]");
		if(autoFocus) autoFocus.focus();

		
		/** inside events **/
		// element.querySelectorAll("[data-click-event]").forEach(function(el){
			// var clickEvent = new Event( el.getAttribute("data-click-event"),{ bubbles: true} )
			// el.addEventListener("click",function(){this.dispatchEvent(clickEvent)})
		// })
		// element.querySelectorAll("[data-change-event]").forEach(function(el){
			// var changeEvent = new Event( el.getAttribute("data-change-event"),{ bubbles: true} )
			// el.addEventListener("change",function(){this.dispatchEvent(changeEvent)})
		// })

		/** inside scripts **/
		["onclick","onkeyup","onsubmit","data-onrefresh"]
		.forEach(attr=>{
			element.querySelectorAll("["+attr+"]").forEach(el=>{
				var val = el.getAttribute(attr).toString()
				if(el.hasAttribute("data-old_"+attr)){
					val = el.getAttribute("data-old_"+ attr)
				} else {
					el.setAttribute("data-old_"+attr, val)
				}
				var newVal = 'window["$this"]=this;window["'+element.id+'"].exec(function($scope){eval($scope);'+val.replace(/this/g,"$this")+'})'
				el.setAttribute(attr,newVal)
			})
		})
		
		
		/** parse new the content **/
		initSMARTComponents(element)
		if(cb) cb()
	}
	
	initTemplate( function(){ initIf( function(){ initData( render) } ) })
	

	this.id = element.id
	this.loadData = function(url){
		if(url){
			isDataReady = false 
			isIfReady = false
			// isTemplateReady = false
			element.setAttribute("data-url", url)
			initData( function(){ initIf(render) } )
		} else { logError("Function 'reloadData' requires URL !", element ) }
	}
	this.refresh = 
	this.reload = function(){
		element = document.body.querySelector("#"+this.id)
		$data = null
		isIfReady = false
		isDataReady = false 
		
		initIf( function(){ initData( render ) } )
	}
	this.setData = function($data){
		element.removeAttribute("data-url")
		element.setAttribute("data-json", JSON.stringify($data))
		isDataReady = false 
		isIfReady = false
		isTemplateReady = true
		initData( function(){initIf(render)})
	}
	this.show = function(params){
		if(typeof params == 'object'){ 
			var oldData =  element.getAttribute("data-json")
			var newData  = Object.assign( oldData?JSON.parse(oldData):{}, params )
			this.setData( newData )
		} else if(params === true){
			this.refresh()
		} else {
			this.setData({_id:params})
		}
		
		element.querySelectorAll('[data-onshow]').forEach( function(child){
				child.dispatchEvent(new CustomEvent('show',{detail:params}))
			})
		element.style.display = "block"
	}
	this.hide = function(){
		element.style.display = "none"
	}
	this.element = document.getElementById(element.id)
	
	this.exec = function( js ){
		var cache = []
		function cyrcularRefRemove(key,value){
			if (typeof value === 'object' && value !== null)
				if (cache.indexOf(value) !== -1) return;
				else cache.push(value);
			return value;
		}
		if(typeof js == 'function'){
			var script =  element.getAttribute("data-template-script")
			js((script?script+";":"")+"var $data="+JSON.stringify($data,cyrcularRefRemove)+";")
		}
	}
}


/** Usage Forms:
	<form method="AJAX" 
		  action="path/to/submit/url" 
		  data-onsuccess=""
		  data-onerror=""
	>...</form>
**/
function smartForm(element){
	element.addEventListener("submit",function(event){
		event.preventDefault(); event.stopPropagation()
		var fData = new FormData(element)
		var http = new XMLHttpRequest
		
		setProgress()
		
		http.open("POST", element.getAttribute("action"))
		http.addEventListener("load",function(){
			var ret = JSON.parse(this.responseText)
			if( ret.error ){
				element.dispatchEvent(new CustomEvent("error",{detail:ret,bubbles:true}))
			} else {
				element.dispatchEvent(new CustomEvent("success",{detail:ret,bubbles:true}))
			}
			removeProgress()
		})
		http.addEventListener("error",alert)
		http.send(fData)
	})
	
	if( !element.getAttribute("data-onshow") ){
		element.addEventListener("show",function(event){
			element.reset()
		})
	} 
}



/** Usage Dialogs: 
	<dialog id="..." 
		data-onsuccess="..."
	>
		<button data-click-event="hide">Cancel</button>
	</dialog>
**/
function smartDialog(element){
	var closeButton = document.createElement("big")
	closeButton.innerHTML = "&times;"
	closeButton.setAttribute("onclick",'dispatchEvent(new Event("hide",{bubbles:true}))')
	closeButton.setAttribute( "style",'position:absolute; right:3px;top:3px; padding:0px 8px;cursor:pointer; font-size:1.8em;text-align:center;font-weight:bold; line-height: 28px; width: 28px; height: 28px; border-radius:3px;')
	closeButton.onmouseover = function(){this.style.background="rgba(0,0,0,0.05)"}
	closeButton.onmouseout = function(){this.style.background="transparent"}
	element.appendChild( closeButton )

	if(!element.onkeyup) element.onkeyup = function(e){
		if (e.keyCode === 27) window[element.id].hide()
	}
	
	if(!element.hasAttribute("data-onhide") )
		element.addEventListener("hide",function(){window[element.id].hide()})
	if(!element.hasAttribute("data-onclose") )
		element.addEventListener("close",function(){window[element.id].hide()})
}


/*** Toast ***/
function toast( message ){
	var toast = document.createElement("div")
	toast.setAttribute("class","toast")
	document.body.appendChild( toast )
	toast.innerHTML = message
	setTimeout(function(){ toast.remove() }, 3000)
}

////////////////
/***  INIT  ***/
////////////////
function initSMARTComponents(element){
	element.querySelectorAll("[data-template], [data-url], [data-json], [data-if]").forEach(function(el){
		if(!el.id) el.id = "$"+(new Date).getTime()
		if(typeof window[el.id] === 'undefined')
			window[el.id] = new smartTemplate(el)
		else smartTemplate(el)
	});
	element.querySelectorAll("form[method=AJAX]").forEach(function(el){
		new smartForm(el)
	})
	element.querySelectorAll("dialog:not([data-template]), dialog:not([data-url]), dialog:not([data-json])")
	.forEach(function(el){
		new smartDialog(el)
	})
}
document.body.innerHTML += '<progress id="progress" data-counter="0" style="position:fixed;top:0;left:0;height:6px;width:100%"></progress>'
initSMARTComponents(document)