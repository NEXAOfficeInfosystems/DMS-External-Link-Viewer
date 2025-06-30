import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DataRoomApiService } from 'src/app/core/services/DataRoomApiService.service';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  userDetails$: Observable<any> = new Observable();

  constructor(private dataRoomApiService: DataRoomApiService,
    private cookieservice: CookieService
  ) {}

ngOnInit(): void {
  const userId = this.cookieservice.get('MasterUserId');
  this.dataRoomApiService.getUserDetailsById(userId);
  this.userDetails$ = this.dataRoomApiService.getUserDetailsObservable();
}


@Output() toggleSidebar = new EventEmitter<void>();
 
  onToggle() {
    this.toggleSidebar.emit();
  }

}



