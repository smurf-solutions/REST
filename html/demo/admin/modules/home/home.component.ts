import { Component }          from '@angular/core';

import { SysService }         from '@sys/services';
import { CollectionsService } from '@sys/services';
import { ToastyService }      from 'ng2-toasty';


@Component({
	moduleId: module.id,
	styleUrls: [ 'home.component.css' ],
	templateUrl: 'home.component.html'
})
export class HomeComponent {
	/*
	dbs = [
		{ title: 'Local', link: '//localhost:3000/collections/demo/'},
		{ title: 'Demo',  link: '//smurf-solutions.github.io/control_panel/collections/demo/' }
	];
	*/
	
	constructor(
		public app: SysService,
		public collections: CollectionsService,
		public toasty: ToastyService
	) {}
	
	
}