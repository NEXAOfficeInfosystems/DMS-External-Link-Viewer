import { HttpClient, HttpEvent, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonHttpErrorService } from './CommonHttpErrorService';
import { CommonError } from '../helpers/CommonError';

@Injectable({
  providedIn: 'root'
})
export class DocumentLibraryService {

  constructor(private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService) { }

  getDocuments(resource: any): Observable<HttpResponse<any[]> | CommonError> {
    const url = `DocumentLibraries`;
    const customParams = new HttpParams()
      .set('Fields', resource.fields)
      .set('OrderBy', resource.orderBy)
      .set('PageSize', resource.pageSize.toString())
      .set('Skip', resource.skip.toString())
      .set('SearchQuery', resource.searchQuery)
      .set('categoryId', resource.categoryId)
      .set('name', resource.name)
      .set('metaTags', resource.metaTags)
      .set('id', resource.id.toString())
      .set('Phase',resource.phase)
    return this.httpClient.get<any[]>(url, {
      params: customParams,
      observe: 'response'
    }).pipe(catchError(this.commonHttpErrorService.handleError));
  }

 

  getDocumentLibraryData(id: string): Observable<any> {
    
    return this.httpClient.get<any>('DocumentData/' + id);
  }


  

  getDocumentViewLibrary(id: string): Observable<any> {
    return this.httpClient.get<any>('document/view/' + id);
  }


}
