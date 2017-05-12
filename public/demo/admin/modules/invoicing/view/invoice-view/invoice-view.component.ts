import { Component } from '@angular/core';


@Component({
	selector: 'invoice-view',
	moduleId: module.id,
	styleUrls: [ 'invoice-view.component.css' ],
	templateUrl: 'invoice-view.component.html',
	inputs: [ 'invoice', 'customer', 'products', 'payment' ]
})
export class InvoiceViewComponent {

}