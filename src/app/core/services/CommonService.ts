import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
@Injectable({ providedIn: 'root' })
export class CommonService {
  private BaseapiUrl = `${environment.apiBaseUrl}`;
  constructor(
    private httpClient: HttpClient,
  ) { }

  private loader = new BehaviorSubject<boolean>(false);
  loader$ = this.loader.asObservable();

  callLoader(status: boolean) {
    this.loader.next(status);
  }


  resetLoader() {
    this.loader.next(false);
  }

  getuuid(): string {
    return crypto.randomUUID();
  }

downloadDocument(documentId: string, isVersion: boolean): Observable<HttpEvent<Blob>> {
  const url = `${this.BaseapiUrl}/api/DocumentUpload/Download/${documentId}?isVersion=${isVersion}`;
  return this.httpClient.get(url, {
    reportProgress: true,
    observe: 'events',
    responseType: 'blob',
  });
}


}