import { NgModule }                from '@angular/core';
import { RouterModule }            from '@angular/router';
import { SysModules }              from '@sys/modules.js';

import { AdminUsersListComponent } from './list/admin-users-list.component.js';


@NgModule({
	imports: [ 
		SysModules,
		RouterModule.forChild([{ path:'', component: AdminUsersListComponent }]),
	],
	declarations: [ AdminUsersListComponent ],
	exports: [ AdminUsersListComponent ]
})
export class AdminUsersModule {}