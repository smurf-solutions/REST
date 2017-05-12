import { NgModule }                from '@angular/core';
import { RouterModule }            from '@angular/router';
import { SysModules }              from '@sys/modules.js';

import { EditPageComponent }       from './edit-page.component.js';
import { EditModalComponent }      from './edit-modal.component.js';
import { InvoiceFormComponent }    from './invoice-form/invoice-form.component.js';


@NgModule({
	imports: [
		SysModules,
		RouterModule.forChild([{path:'Edit',component:EditPageComponent}]),
	],
	declarations: [ EditPageComponent, EditModalComponent, InvoiceFormComponent ],
	exports: [ EditPageComponent, EditModalComponent ],
	entryComponents: [ EditModalComponent ]
})
export class EditModule {}
