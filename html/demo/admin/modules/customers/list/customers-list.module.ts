import { NgModule }                from '@angular/core';
import { RouterModule }            from '@angular/router';
import { CommonModule }            from '@angular/common';
import { MaterialModule }          from '@angular/material';
import { FlexLayoutModule }        from '@angular/flex-layout';
import { FormsModule }             from '@angular/forms';

import { PipeModules }             from '@sys/pipes';

import { CustomersListComponent }  from './customers-list.component.js';


@NgModule({
	declarations: [ CustomersListComponent ],
	imports: [ 
		RouterModule.forChild([{path:'List',component:CustomersListComponent}]),
		CommonModule,
		MaterialModule,
		FlexLayoutModule,
		FormsModule,
		
		PipeModules
	],
	exports: [ CustomersListComponent ]
})
export class CustomersListModule {}