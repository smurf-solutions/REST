import { Component }    from '@angular/core';


@Component({
	moduleId: module.id,
	templateUrl: './settings.component.html'
})
export class SettingsComponent {
	ngAfterViewInit() {
		this.statuses = [
			{id:1,icon:'hourglass_full',color:'red', name:'Чака плащане',closed: false,email:true},
			{id:2,icon:'local_atm', color:'black',name:'Платена',closed: true, email:false},
			{id:3,icon:'cancel', color:'pink',name:'Върната',closed: true, email:false},
		];
	}
} 