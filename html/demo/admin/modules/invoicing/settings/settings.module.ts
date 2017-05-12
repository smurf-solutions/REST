import { NgModule }          from '@angular/core';
import { RouterModule }      from '@angular/router';
import { SysModules }        from '@sys/modules.js';

/*
import { CommonModule }      from '@angular/common';
import { MaterialModule }    from '@angular/material';
import { FlexLayoutModule }  from '@angular/flex-layout';
*/
import { SettingsComponent } from './settings.component.js';


@NgModule({
	imports: [ SysModules,
		RouterModule.forChild([{path:'Settings',component:SettingsComponent}])
	],
	declarations: [ SettingsComponent ],
	exports: [ SettingsComponent ]
})
export class SettingsModule {}