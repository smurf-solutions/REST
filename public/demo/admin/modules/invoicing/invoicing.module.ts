import { NgModule }                   from '@angular/core';
import { RouterModule }               from '@angular/router';
//import { MaterialModule }             from '@angular/material';

import { ListModule }                 from './list/list.module.js';
import { ViewModule }                 from './view/view.module.js';
import { EditModule }                 from './edit/edit.module.js';
import { ExportModule }               from './export/export.module.js';
import { SettingsModule }             from './settings/settings.module.js';



@NgModule({
	imports: [
		//MaterialModule.forRoot(),
		RouterModule.forChild([{ path:'',redirectTo:'/Invoicing/List', pathMatch:'full' }]),
		ListModule,
		ViewModule,
		EditModule,
		SettingsModule,
		ExportModule
	]
})
export class InvoicingModule {}
