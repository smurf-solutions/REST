import { Component, NgModule } from '@angular/core';
import { RouterModule }        from '@angular/router';

@Component({
  moduleId: module.id,
	styleUrls: [ 'not-installed.css' ],
  templateUrl: 'not-installed.html'
})
export class NotInstalledComponent {}


@NgModule( {
  imports: [ RouterModule.forChild([{ path:'', component: NotInstalledComponent }]) ],
  declarations: [ NotInstalledComponent ]
})
export class NotInstalledModule {}
