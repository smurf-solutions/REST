import { NgModule }                from '@angular/core';
import { RouterModule }            from '@angular/router';
import { SysModules }              from '@sys/modules.js';

//import { ViewComponent }           from './view.component.js';
import { InvoiceViewComponent }    from './invoice-view/invoice-view.component.js';


@NgModule({
	imports: [
		SysModules,
		//RouterModule.forChild([{path:'View',component:ViewComponent}]),
	],
	declarations: [ InvoiceViewComponent ],
	exports: [ InvoiceViewComponent ],
	entryComponents: [ InvoiceViewComponent ]
})
export class ViewModule {}
