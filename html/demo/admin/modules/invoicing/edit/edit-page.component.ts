import { Component }    from '@angular/core';
import { CommonModule } from '@angular/common';

import { SysService }   from '@sys/services';


@Component({
	//selector: 'edit-component',
	moduleId: module.id,
	templateUrl: 'edit-page.component.html'
})
export class EditPageComponent {
	constructor(
		public app: SysService
	){}

	ngOnInit() {
		this.app.layout.store();
		this.app.layout.leftbar.open();
	}

	ngOnDestroy() {
		this.app.layout.restore();
	}
}
