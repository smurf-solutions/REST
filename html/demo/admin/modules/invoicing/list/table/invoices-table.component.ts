import { Component, Output, EventEmitter }   from '@angular/core';

@Component({
	selector: 'invoices-table',
	moduleId: module.id,

	templateUrl: 'invoices-table.component.html',
	inputs: [ 'invoices', 'selected', 'order', 'orderWay' ]
})
export class InvoicesTableComponent {
	@Output() selectedChange = new EventEmitter();
	@Output() orderChange = new EventEmitter();
	@Output() orderWayChange = new EventEmitter();
	
	getSum( key ) {
		if(!this.invoices) return 0;
		return this.invoices.reduce( (a,b)=>{return a + (b.data && b.data[key] ? parseFloat(b.data[key]) : 0) }, 0);
	}
	
	orderBy( key ) {
		if( this.order == key ) {
			this.orderWay = this.orderWay=='asc' ? 'desc' : 'asc';
			this.orderWayChange.emit( this.orderWay );
		} else {
			if( this.orderWay !== 'asc' ) {
				this.orderWay = 'asc';
				this.orderWayChange.emit( this.orderWay );
			}
			this.orderChange.emit(key);
		}
		
	}
}