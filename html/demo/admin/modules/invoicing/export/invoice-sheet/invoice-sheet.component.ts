import { Component }    from '@angular/core';

@Component({
	selector: 'invoice-sheet',
	moduleId: module.id,
	styleUrls: [ 'invoice-sheet.css' ],
	templateUrl: 'invoice-sheet.html',
	inputs: [ 'invoice', 'subtitle', 'customer', 'company', 'products', 'payment' ]
})
export class InvoiceSheetComponent {
}