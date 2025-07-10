import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { DataRoomApiService } from 'src/app/core/services/DataRoomApiService.service';
import { TranslationService } from 'src/app/core/services/TranslationService';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss']
})
export class NotificationsListComponent implements OnInit {
  notifications$: Observable<any[]> = of([]);
  userDetails$: Observable<any> = of(null);

  constructor(
    private dataRoomApiService: DataRoomApiService,
    private toastr: ToastrService,
    private router: Router,
    private translationService: TranslationService,
    private cookieservice: CookieService
  ) {}

  ngOnInit(): void {
    const userId = this.cookieservice.get('MasterUserId');
    this.userDetails$ = this.dataRoomApiService.getUserDetailsObservable();
    if (userId) {
      this.notifications$ = this.dataRoomApiService.getNotificationsObservable();
    }
  }
}
