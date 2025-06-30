import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss']
})
export class MainContentComponent {
  
  selectedTabIndex = 0;

  onTabChange(index: number) {
    this.selectedTabIndex = index;
  }

}
