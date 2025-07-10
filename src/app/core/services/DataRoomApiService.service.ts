import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonHttpErrorService } from './CommonHttpErrorService';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { environment } from 'src/environments/environment'; // Adjusted the path to correctly import the environment configuration
import { catchError, filter, map, tap } from 'rxjs/operators';
import { CommonError } from '../helpers/CommonError';

@Injectable({
  providedIn: 'root'
})
export class DataRoomApiService {

  private BaseapiUrl = `${environment.apiBaseUrl}`;

  private userDetailsSubject = new BehaviorSubject<any>(null);
  private notificationsSubject = new BehaviorSubject<any[]>([]); // NEW: notifications BehaviorSubject

  constructor(
       private httpClient: HttpClient,
    private cookieservice:CookieService,
    private commonHttpErrorService: CommonHttpErrorService,
    private router: Router
  ) {

  }

  login(email: string, password: string): Observable<any> {

    const apiUrl = `${this.BaseapiUrl}/api/DataRoomLogin`;
    const payload = { email, password ,IsExternal: true};
    return this.httpClient.post(`${apiUrl}/login`, payload).pipe(
      tap((response: any) => {
        if (response?.success && response?.token) {
          this.cookieservice.set('UserToken', response.token); 



          if (response?.user?.id) {
            this.cookieservice.set('MasterUserId', response.user.id); 

this.getUserDetailsById(response.user.id)

          
          }
        }
      })
    );
  }


//

// for user
 getUserNotifications(userId: any): Observable<any[]> {
    this.httpClient.get<any[]>(`${this.BaseapiUrl}/api/UserInformation/UserNotification/${userId}`).subscribe(
      (notifications: any[]) => {
        this.notificationsSubject.next(notifications); 
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching notifications:', error);
        this.notificationsSubject.next([]); 
      }
    );
    return this.notificationsSubject.asObservable(); 
  }
getNotificationsObservable(): Observable<any[]> {
  return this.notificationsSubject.asObservable();
}
markAsRead(notificationId: string, isRead: boolean): Observable<any> {
  return this.httpClient.put(`${this.BaseapiUrl}/api/UserInformation/MarkAsRead/${notificationId}`, {
    isRead: !isRead // send opposite to toggle
  });
}



updateUserDetails(userDetails: any): Observable<any | CommonError> {
  const apiUrl = `${this.BaseapiUrl}/api/UserInformation/UpdateUserDetails`;
  return this.httpClient.put<any>(apiUrl, userDetails).pipe(
    map(response => response),
    catchError((error: HttpErrorResponse) => {
      return throwError(() => error.error as CommonError);
    })
  );}

 getAllActiveExpiredDataRooms(masterUserId: string): Observable<any> {

   const apiUrl = `${this.BaseapiUrl}/api/ActiveExpiredAuditRoom`;
  const url = `${apiUrl}/Active-Expired/${masterUserId}`;
  return this.httpClient.get<any>(url).pipe(
    map(response => response)
  );
}


getDataRoomDetailsById(userId: any, dataroomid: any): Observable<any | CommonError> {
  const apiUrl = `${this.BaseapiUrl}/api/ActiveExpiredAuditRoom/DataRoomDetails/${userId}/${dataroomid}`;
  return this.httpClient.get<any>(apiUrl).pipe(
    map(response => response),
    catchError((error: HttpErrorResponse) => throwError(() => error.error as CommonError))
  );
}



deleteDocumentFromDataRoom(documentId: any, dataRoomId: any, deletedBy: any): Observable<any> {

  

  const url = `${this.BaseapiUrl}/api/DocumentUpload/DeleteFromDataRoom?documentId=${documentId}&dataRoomId=${dataRoomId}&deletedBy=${deletedBy}`;
  return this.httpClient.delete(url);
}

getUserDetailsById(userId: any): void {
  if (!userId) {
    userId = this.cookieservice.get('MasterUserId');
  }


  const apiUrl = `${this.BaseapiUrl}/api/UserInformation/UserInfo/${userId}`;
  this.httpClient.get(apiUrl).subscribe(
    (response: any) => {
      this.userDetailsSubject.next(response);
    },
    (error: HttpErrorResponse) => {
      console.error('Error fetching user details:', error);
    }
  );
}

getUserDetailsObservable(): Observable<any> {
  return this.userDetailsSubject.asObservable();
}



// end of user




getAllDataRoomDetailsById(id: any, clientId: any, companyId: any): Observable<any | CommonError> {
  const url = `DataRoom/${id}/files?clientId=${clientId}&companyId=${companyId}`;
  return this.httpClient.get<any>(url).pipe(
    map(response => response),
    catchError((error: HttpErrorResponse) => {
      return throwError(() => error.error as CommonError);
    })
  );

  
}


//all audit logs
getAllAuditLog(clientId:any,companyid:any): Observable<any | CommonError> {
  const url = `DataRoom/GetAll-DataRoom-Audit-log?clientId=${clientId}&companyId=${companyid}`;
  return this.httpClient.get<any>(url).pipe(
    map(response => response),
    catchError((error: HttpErrorResponse) => throwError(() => error.error as CommonError))
  );
}
//get dataroom log by datarrom by id 
getAllAuditLogByDataRoomId(dataRoomId: any, clientId: any, companyId: any): Observable<any | CommonError> {
  const url = `DataRoom/DataRoom-Audit-log-by-Id?dataRoomId=${dataRoomId}&clientId=${clientId}&companyId=${companyId}`;
  return this.httpClient.get<any>(url).pipe(
    map(response => response),
    catchError((error: HttpErrorResponse) => throwError(() => error.error as CommonError))
  );
}



// de;ete data room by id 
deleteDataRoomById(dataRoomId: any, forceDelete: boolean = false): Observable<any | CommonError> {
  const url = `DataRoom/${dataRoomId}?forceDelete=${forceDelete}`;
  return this.httpClient.delete<any>(url).pipe(
    map(response => response),
    catchError((error: HttpErrorResponse) => throwError(() => error.error as CommonError))
  );
}

///expired delet dataroom


deleteExpiredDataRoomById(dataRoomId: any): Observable<any | CommonError> {
  const url = `DataRoom/expired-dataroom/${dataRoomId}`;
  return this.httpClient.delete<any>(url).pipe(
    map(response => response),
    catchError((error: HttpErrorResponse) => throwError(() => error.error as CommonError))
  );
}


//update user access

updateUserAccess(userAccessData: any): Observable<any | CommonError> {
  const url = `DataRoom/update-user-access`;
  return this.httpClient.put<any>(url, userAccessData).pipe(
    map(response => response),
    catchError((error: HttpErrorResponse) => throwError(() => error.error as CommonError))
  );

}


//create user access
createUserAccess(userAccessData: any): Observable<any | CommonError> {

  const url = `DataRoom/create-user-access`;
  return this.httpClient.post<any>(url, userAccessData).pipe(
    map(response => response),
    catchError((error: HttpErrorResponse) => throwError(() => error.error as CommonError))
  );
}



//delete user access by id

deleteUserAccessById(data: { id: any; dataRoomId: any }): Observable<any | CommonError> {
  const url = `DataRoom/DeleteUserAccess`;
  const params = new HttpParams()
    .set('id', data.id)
    .set('dataRoomId', data.dataRoomId);

  return this.httpClient.delete<any>(url, { params }).pipe(
    map(response => response),
    catchError((error: HttpErrorResponse) => throwError(() => error.error as CommonError))
  );
}

///add from dataroom file
AddDocumentFromDataRoom(values: any): Observable<any> {

   const url = `${this.BaseapiUrl}/api/DocumentUpload/AddDocumentFromDataRoom`
  // const url = `api/DocumentUpload/AddDocumentFromDataRoom`;
  const formData = new FormData();
formData.append('MasterUserId', values.MasterUserId ?? '');
  formData.append('Documents', JSON.stringify(values.Documents || []));
  formData.append('DataRoomId', values.DataRoomId ?? '');
  formData.append('Permission', values.Permission ?? '');
  formData.append('CompanyId', values.CompanyId?.toString() ?? '0');
  formData.append('ClientId', values.ClientId ?? '');


  values.files.forEach((fileWrapper: any) => {
    const file = fileWrapper.fileRef;
    if (file instanceof File || file instanceof Blob) {
      formData.append('files', file, fileWrapper.documentName);
    } else {
      console.warn('Skipping invalid file', fileWrapper.documentName);
    }
  });

  return this.httpClient.post<any>(url, formData, {
    observe: 'events',
    reportProgress: true
  }).pipe(
    filter((event: HttpEvent<any>) =>
      event.type === HttpEventType.UploadProgress || event.type === HttpEventType.Response
    ),
    map(event => {
      switch (event.type) {
        case HttpEventType.UploadProgress:
          const percentDone = Math.round((100 * event.loaded) / (event.total || 1));
          return { status: 'progress', percent: percentDone };
        case HttpEventType.Response:
          return { status: 'complete', response: event.body };
        default:
          return { status: 'unknown' };
      }
    })
  );
}




}
