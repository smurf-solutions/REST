import { NgModule }                from '@angular/core';
import { RouterModule }            from '@angular/router';
import { SysModules }              from '@sys/modules.js';

import { ListComponent }           from './list.component.js';
import { InvoicesTableComponent }  from './table/invoices-table.component.js';

import { ViewModule }              from './../view/view.module.js';
import { EditModule }              from './../edit/edit.module.js';


@NgModule({
	imports: [
		RouterModule.forChild([{path:'List',component:ListComponent}]),
		SysModules,
		
		ViewModule,
		EditModule
	],
	declarations: [
		ListComponent, InvoicesTableComponent,
	],
	exports: [ ListComponent ]
})
export class ListModule {}
