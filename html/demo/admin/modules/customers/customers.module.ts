import { NgModule }               from '@angular/core';
import { RouterModule }           from '@angular/router';

import { CustomersListModule }    from './list/customers-list.module.js';


@NgModule({
	imports: [
		RouterModule.forChild([{path:'',redirectTo:'/Customers/List',pathMatch:'full'}]),
		
		CustomersListModule
	]
})
export class CustomersModule {}