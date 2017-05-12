import { Component }           from '@angular/core';
import { ToastyService }       from 'ng2-toasty';

import { SysService }          from '@sys/services';
import { CollectionsService }  from '@sys/services';



@Component({
	moduleId: module.id,
	templateUrl: 'customers-list.component.html'
})
export class CustomersListComponent {
	customers = [];
	
	constructor(
		public app: SysService,
		public collections: CollectionsService,
		public toasty: ToastyService
	){}
	
	ngOnInit() {
		this.load();
	}
	
	load() {
		this.collections
			.get('customers')
			.subscribe( res => this.customers = res.data );
	}
	
	newCustomer() {
		this.toasty.warning("Демо");
	}
}