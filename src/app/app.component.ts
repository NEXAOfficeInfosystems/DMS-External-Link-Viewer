import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  errorMessage: string = "";
  download: boolean = false;
  downloadHref: any;
  constructor(private readonly http: HttpClient, private readonly sanitizer: DomSanitizer) { }
  //importing the HttpClient module
  shortCode = '';
  isLoading: boolean = true;
  iframeSrc: SafeResourceUrl = '';
  ngOnInit(): void {
    //get query parameters
    const urlParams = new URLSearchParams(window.location.search);
    this.shortCode = urlParams.get('s') ?? '';

    // Call the public API
    this.publicApi();
    // Call the private API
  }

  //function to handle the public api
  publicApi() {
    if (!this.shortCode) {
      this.setErrorState('Please verify your shared link!');
      return;
    }

    this.http.get(`${environment.apiBaseUrl}/${this.shortCode}`, {
      responseType: 'json',
      observe: 'response'
    }).subscribe({
      next: (response: any) => this.processApiResponse(response, environment),
      error: (error) => this.handleApiError(error)
    });
  }

  private processApiResponse(response: any, environment: any) {
    const responseBody = response.body;

    if (!responseBody?.documentBytes) {
      this.setErrorState('No document found!');
      return;
    }

    this.isLoading = false;

    if (responseBody.isProtected) {
      const password = prompt('This document is protected. Please enter the password:');
      if (!password) {
        this.setErrorState('Password is required to view this document.');
        return;
      }
      else {
        this.http.get(`${environment.apiBaseUrl}/verify/${this.shortCode}/${password}`).subscribe({
          next: (response: any) => {
            if (response?.status) {
              this.handleResponse(responseBody);
              this.download = !!responseBody.isAllowDownload;
              this.downloadHref = this.download ? responseBody.documentUrl : null;
            } else {
              this.setErrorState('Incorrect password. Please try again.');
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error verifying password:', error);
            this.setErrorState('An error occurred while verifying the password. Please try again.');
            this.isLoading = false;
            this.download = false;
            this.downloadHref = null;
            this.iframeSrc = "";
          }
        });
        return;
      }
    }

    this.handleResponse(responseBody);
    this.download = !!responseBody.isAllowDownload;
    this.downloadHref = this.download ? responseBody.documentUrl : null;
  }

  private handleApiError(error: any) {
    console.error('Error calling public API:', error);
    this.setErrorState('Oops! Something went wrong. Please try again later.');
  }

  private setErrorState(message: string) {
    this.isLoading = false;
    this.errorMessage = message;
    console.log(message);
  }

  handleResponse(response: any) {
    const byteCharacters = atob(response.documentBytes);
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    this.loadPdf(blob);
  }

  loadPdf(blob: Blob) {
    const url = URL.createObjectURL(blob);
    this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url); // Ensure sanitization
    console.log('PDF Blob URL:', this.iframeSrc);
  }



}
