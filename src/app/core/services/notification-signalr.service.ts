import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class NotificationSignalRService {
  private hubConnection!: signalR.HubConnection;
  private readonly hubUrl = `${environment.apiBaseUrl}/hubs/notifications`;

  private notificationUpdatedSubject = new Subject<any>();
  public notificationUpdated$ = this.notificationUpdatedSubject.asObservable();

  constructor(private cookieService: CookieService) {}

  /**
   * Starts SignalR connection using userId from cookie
   */
  public startConnection(): void {
    const userId = this.cookieService.get('MasterUserId');

    if (!userId) {
      console.warn('❗ Cannot start SignalR connection: ManagerUserId cookie is missing.');
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.hubUrl}?userId=${userId}`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('✅ SignalR connected.');
        this.registerOnServerEvents();
      })
      .catch(err => console.error('❌ SignalR connection error:', err));
  }

  /**
   * Registers event listeners for server-pushed events.
   */
  private registerOnServerEvents(): void {
    this.hubConnection.on('NotificationUpdated', (data: any) => {
      console.log('📩 Notification update received:', data);
      this.notificationUpdatedSubject.next(data);
    });

    this.hubConnection.onreconnecting(error => {
      console.warn('🔄 Reconnecting to SignalR...', error);
    });

    this.hubConnection.onreconnected(connectionId => {
      console.log(`✅ Reconnected to SignalR with ID: ${connectionId}`);
    });

    this.hubConnection.onclose(error => {
      console.warn('⚠️ SignalR connection closed.', error);
    });
  }

  /**
   * Stops the SignalR connection.
   */
  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection
        .stop()
        .then(() => console.log('🛑 SignalR connection stopped.'))
        .catch(err => console.error('❌ Error stopping SignalR:', err));
    }
  }
}
