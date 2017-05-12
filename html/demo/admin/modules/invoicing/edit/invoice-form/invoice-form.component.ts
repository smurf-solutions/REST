import { Component, ViewChild } from '@angular/core';
import { CommonModule }         from '@angular/common';
import { FromsModule }          from '@angular/forms';
import { MdSnackBar }           from '@angular/material';
import { ToastyService }        from 'ng2-toasty';

import { CollectionsService }   from '@sys/services';


@Component({
	moduleId: module.id,
	selector: 'invoice-form',
	templateUrl: 'invoice-form.component.html',
	inputs: [ 'data','customer','payment', 'products'
			//'number','date','date_pay','customer','mrp',
				//'uic','email','phone','city','country','address', 'payment','note'
				]
})
export class InvoiceFormComponent {
	data = {};
	payment = {};
	customer = {company:{},address:{},contacts:{}};
	products = [];
	
	constructor (
		private service: CollectionsService,
		public snackBar: MdSnackBar,
		private toasty:ToastyService
	){}
	
	save() {
		let data = {
			//"id":"585",
			data: this.data,
			payment: this.payment,
			customer: this.customer,
			products: this.products
			/*
			"data": {
				"number": this.number,
				"date": this.date,
				"sum": 0,
				"vat": 0,
				"discount": 0,
				"total": 0,
				"note": this.note,
				"date_pay": this.date_pay
			},
			"payment": {
				"type": this.payment,
				"title": this.payment
			},
			"customer": {
				"company": {
					"name": this.customer,
					"uic": this.uic,
					"mrp": this.mrp
				},
				"address": {
					"country": this.country,
					"city": this.city,
					"locale": this.address
				},
				"contacts": {
					"phone": this.phone,
					"email": this.email
				}
			},
			*/
		};
		
		//this.toasty.warning({title:'ДЕМО', msg:'Записите са забранени !'});
		//return;
		
		this.service.post( 'invoices', data ).subscribe( res => {
			console.log(res)
			//let res = JSON.parse( res._body );
			 /*
			if( res.success ) {
				this.toasty.success("Записът е успеше");
			} else {
				this.toasty.error("Нещо се е прецакало")
			}*/
		});
	}
}
