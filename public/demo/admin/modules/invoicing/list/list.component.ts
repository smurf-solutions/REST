import { Component, ViewChild }    from '@angular/core';
import { ViewContainerRef }        from '@angular/core';
import { MdDialog }                from '@angular/material';

import { SysService }              from '@sys/services';
import { CollectionsService }      from '@sys/services';
import * as InvoicingConfig        from './../invoicing.config.js';

import { InvoiceViewComponent }    from './../view/invoice-view/invoice-view.component.js';
import { EditModalComponent }      from './../edit/edit-modal.component.js';


@Component({
	moduleId: module.id,
	styleUrls: [ 'list.component.css' ],
	templateUrl: 'list.component.html'
})
export class ListComponent {
	@ViewChild('invoicing_bar') invoicing_bar;
	loginChanged: any;
	invoice: Array;
	
	dialogConfig = { disableClose: false,
		width: '600px', height: '', position: { top: '', bottom: '', left: '', right: ''}
	}

	listInfo = InvoicingConfig.listConfig;
	exportList = {};
	

	constructor( 
		public app: SysService,
		public collections: CollectionsService,
		public dialog: MdDialog
	){}
	
	editInvoiceModal( invoice ) {
		let dialogRef = this.dialog.open( EditModalComponent, this.dialogConfig );
		if( invoice ) {
			dialogRef.componentInstance.title    = 'Редакция на фактура';
			dialogRef.componentInstance.invoice  = invoice.data;
			dialogRef.componentInstance.customer = invoice.customer;
			dialogRef.componentInstance.payment  = invoice.payment;
		} else {
			dialogRef.componentInstance.title    = 'Нова фактура';
			dialogRef.componentInstance.invoice  = {};
			dialogRef.componentInstance.customer = {company:{},address:{},contacts:{}};
			dialogRef.componentInstance.payment  = {};
		}
		//dialogRef.afterClosed().subscribe( res=> { alert(res} );
	}
	
	ngOnInit() {
		this.load();
		this.app.restore(this, 'invoicing.listInvoices');
	
		/*this.loginChangedEmitter = this.collections.loginChangedEmitter.subscribe( em => {
			alert(" subriber from COMPNENT");
		});*/
	
	}
	ngOnDestroy() {
		this.app.store( this, 'invoicing.listInvoices', [ 'http', 'invoices' ] );
		//this.loginChangedEmitter.unsubscribe();
	}
	
	load() {
		this.selected = null;
		this.collections
			.get( 'invoices' )
			.subscribe( res => this.invoices = res.data );
	}
	
	
	
	/*
	getPageItems() {
		let s = this.search;
		this.pageItems = this.invoices
		
		if(this.pageItems) {
			if( s ) this.pageItems = this.pageItems
						.filter( i =>  i.data.number.toString().indexOf(s)  > -1
									|| i.data.sum.toString().indexOf(s)     > -1
									|| i.data.total.toString().indexOf(s)   > -1
									|| i.customer.company.name.indexOf(s)   > -1
									|| i.customer.address.locale.indexOf(s) > -1
								);
			this.pageItems = this.pageItems.slice( this.listInfo.perPage*(this.listInfo.page-1), this.listInfo.perPage*this.listInfo.page );
			this.listInfo.all = this.invoices.length;
			this.listInfo.founded = this.pageItems.length;		
		}
		return this.pageItems;
	}
	*/
	
	getPagesNum() {
		return Math.ceil(this.listInfo.founded / this.listInfo.perPage);
	}
	
	select( invoice ) {
		this.selected = invoice; 
		this.app.layout.leftbar.close(); 
		if(this.invoicing_bar) this.invoicing_bar.open();
	}
}