import { Component } from '@angular/core';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent {
  powerBIUrl: string = 'https://app.powerbi.com/view?r=YOUR_REPORT_ID';
}
