import { Component }    from '@angular/core';
import { SysService }   from '@sys/services';

@Component({
	//selector: 'export-invoices',
	moduleId: module.id,
	styleUrls: [ 'export.component.css' ],
	templateUrl: 'export.component.html'
})
export class ExportComponent {
	exportList = {dump:[]};
	
	constructor(
		public app: SysService
	){}
	
	ngOnInit() {
		this.app.restore(this, 'invoicing.listInvoices');
		this.app.layout.store();
		this.app.layout.leftbar.close();
	}
	ngOnDestroy() {
		this.app.layout.restore();
	}
	
	print() { window.print(); }
	email() { 
		let content = encodeURIComponent(document.getElementsByClassName('list-container')[0].innerHTML);
		content = 'hi';
		window.open('mailto:test@example.com?subject=subject&body='+content );
	}
	_download_(filename, content) {
		filename = 'Фактура.html';
		content = document.getElementsByClassName('list-container')[0].innerHTML;

		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
		element.setAttribute('download', filename);
		element.style.display = 'none';
		
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}
	download(id, filename) {
		filename = 'Фактури.html';
		content = document.getElementById(id).innerHTML;
		
		var blob = new Blob([content], {type: 'text/html'});
		if(window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveBlob(blob, filename);
		}else{
			var elem = window.document.createElement('a');
			elem.href = window.URL.createObjectURL(blob);
			elem.download = filename;        
			document.body.appendChild(elem);
			elem.click();        
			document.body.removeChild(elem);
		}
	}	
}
