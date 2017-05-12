import { NgModule }              from '@angular/core';
import { RouterModule }          from '@angular/router';
import { SysModules }            from '@sys/modules.js';

import { ExportComponent }       from './export.component.js';
import { InvoiceSheetComponent } from './invoice-sheet/invoice-sheet.component.js';


@NgModule({
	imports: [ SysModules, 
		RouterModule.forChild([{path:'Print',component:ExportComponent}])
	],
	declarations: [ ExportComponent, InvoiceSheetComponent ],
	exports: [ ExportComponent, InvoiceSheetComponent ]
})
export class ExportModule {}