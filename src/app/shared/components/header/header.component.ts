import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DataRoomApiService } from 'src/app/core/services/DataRoomApiService.service';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { TranslationService } from 'src/app/core/services/TranslationService';
import * as signalR from '@microsoft/signalr';

import {environment} from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { EncryptionService } from 'src/app/core/services/encryption.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  userDetails$: Observable<any> = new Observable();

  constructor(private dataRoomApiService: DataRoomApiService,

private toastr: ToastrService,
  private router: Router,
    private translationService:TranslationService,
    private cookieservice: CookieService
  ) {}
 hubConnection!: signalR.HubConnection; 
 UserDetails:any;
ngOnInit(): void {
  const userId = this.cookieservice.get('MasterUserId');
  this.dataRoomApiService.getUserDetailsById(userId);
  this.userDetails$ = this.dataRoomApiService.getUserDetailsObservable();
this.userDetails$.subscribe(data => {
  console.log("Decrypted user details inside component:", data);


  this.UserDetails = data;
});

   this.fetchNotifications();

//    this.hubConnection.on("SendNotificationDataRoom", (notification:any) => {
//   console.log("Received Notification:", notification);

// });


//  this.hubConnection = new signalR.HubConnectionBuilder()
//       .withUrl( `${environment.apiBaseUrl}/userhub`, ) 
//       .withAutomaticReconnect()
//       .build();

//     this.hubConnection
//       .start()
//       .then(() => console.log("SignalR connected"))
//       .catch(err => console.error("SignalR connection error:", err));

//     this.hubConnection.on("SendNotificationDataRoom", (notification) => {
//       console.log("Received Notification:", notification);
//       // Show toast or update notification panel

//       this.toastr.info(notification.message, notification.title);

//     });


}

 notifications: any[] = [];
unreadCount = 0;
showDropdown = false;

 fetchNotifications(): void {
    const userId = this.cookieservice.get('MasterUserId');
    if (!userId) return;

    this.dataRoomApiService.getUserNotifications(userId).subscribe({
      next: (data:any) => {
        this.notifications = data;
        this.unreadCount = data.filter((n:any) => !n.IsRead).length;
      },
      error: (err) => {
        console.error('Error fetching notifications:', err);
      }
    });
  }
get unreadNotifications(): any[] {
  return this.notifications.filter(n => !n.IsRead);
}

toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.fetchNotifications();
    }
  }


@Output() toggleSidebar = new EventEmitter<void>();
 
  onToggle() {
    this.toggleSidebar.emit();
  }

  changeLang(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const lang = selectElement.value;
    this.translationService.setLanguage(lang).subscribe(() => {
      // Flip layout direction without reloading the page
      const direction = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', direction);
      document.documentElement.setAttribute('lang', lang);

      // Optionally update other visual states or CSS classes here if needed
    });
  }
onNotificationClick(notif: any): void {
  this.dataRoomApiService.markAsRead(notif.id, notif.isRead).subscribe({
    next: () => {
      // Toggle read status based on current state
      notif.isRead = !notif.isRead;
      this.unreadCount = this.notifications.filter(n => !n.isRead).length;
    },
    error: (err) => {
      console.error('Error marking notification as read', err);
    }
  });

  this.showDropdown = false;
  this.handleNotificationAction(notif);
}
handleNotificationAction(notif: any): void {
  if (notif.type === 'DataRoom' && notif.dataRoomId) {
    this.fetchNotifications();

    const targetPath = `/layout/data-room-detail/${notif.dataRoomId}`;
    const token = EncryptionService.encryptToToken(targetPath);

    const currentUrl = this.router.url;

    if (!currentUrl.includes(`/p${token}`)) {
      this.router.navigate(['/p', token]);
    }
  } else {
    console.log('No action configured for this notification');
  }
}

navigateToAllNotifications(): void {
  this.showDropdown = false;
 
  const targetPath = '/layout/notilist';
  const token = EncryptionService.encryptToToken(targetPath);

  const currentUrl = this.router.url;

  if (!currentUrl.includes(`/p${token}`)) {
    this.router.navigate(['/p', token]);
  }
}


}


