import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  errorMessage = '';
  download = false;
  downloadHref: string | null = null;
  shortCode = '';
  isLoading = true;
  fileName = '';
  iframeSrc: SafeResourceUrl = '';
  isProtected = false;
  showPasswordPrompt: boolean = false;
  password: string = '';
  showPasswordError: boolean = false;
  url: any = null;
  constructor(
    private readonly http: HttpClient,
    private readonly sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);
    this.shortCode = urlParams.get('s') ?? '';
    this.fetchDocumentMetadata();
  }

  private fetchDocumentMetadata(): void {
    if (!this.shortCode) {
      this.setErrorState('Please verify your shared link!');
      return;
    }

    this.http.get(`${environment.apiBaseUrl}/${this.shortCode}`).subscribe({
      next: (res: any) => this.handleMetadataResponse(res, this.shortCode),
      error: (error) => this.handleApiError(error)
    });
  }

  private handleMetadataResponse(res: any, shortCode: string): void {
    this.download = !!res.isAllowDownload;
    this.isProtected = !!res.isProtected;
    this.fileName = res.documentName;
    this.downloadHref = environment.apiBaseUrl + res.documentUrl;
    this.fetchDocumentBlob();
  }

  private fetchDocumentBlob(): void {
    if (!this.downloadHref) {
      this.setErrorState('No document found for the provided short code.');
      return;
    }

    this.http.get(this.downloadHref, {
      headers: new HttpHeaders({ 'Accept': '*/*' }),
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (response: HttpResponse<Blob>) => this.handleBlobResponse(response),
      error: (error) => this.handleApiError(error)
    });
  }

  private handleBlobResponse(response: HttpResponse<Blob>): void {
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      response.body?.text().then((text: string) => {
        const json = JSON.parse(text);
        this.handleJsonDocument(json);
      });
      return;
    }

    const blob = new Blob([response.body!], { type: contentType });
    this.url = URL.createObjectURL(blob);

    const isProtected = this.isProtected || response.headers.get('X-Document-Protected') === 'true';
    if (isProtected) {
      this.showPasswordPrompt = true;
      this.password = '';
      this.isLoading = false;
      return;
    }

    this.displayFile(this.url, contentType);
  }
  submitPassword(): void {
    if (!this.password) {
      this.showPasswordError = true;
      return;
    } else {
      this.showPasswordError = false;
    }
    this.isLoading = true;
    this.promptPasswordAndVerify(this.url, () => {
      this.showPasswordPrompt = false;
      this.displayFile(this.url, 'application/pdf'); // You may want to detect contentType
    });
  }
  private handleJsonDocument(json: any): void {
    if (json.isProtected) {
      this.showPasswordPrompt = true;
      this.password = '';
      this.isLoading = false;
    } else {
      this.processApiResponse(json);
    }
  }

  private promptPasswordAndVerify(url: string | null, onSuccess: () => void): void {
    // Use the password from the input field
    this.http.get(`${environment.apiBaseUrl}/verify/${this.shortCode}/${this.password}`).subscribe({
      next: (res: any) => {
        if (res?.status) {
          this.showPasswordPrompt = false;
          this.showPasswordError = false;
          onSuccess();
        } else {
          this.showPasswordError = true;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error verifying password:', err);
        this.showPasswordError = true;
        this.isLoading = false;
      }
    });
  }

  private displayFile(url: string, contentType: string): void {
    const mimeType = contentType;
    const fileType = this.getFileExtension(this.downloadHref || '') || 'pdf';

    if (this.isDisplayable(mimeType, fileType)) {
      this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.download = true;
    } else {
      this.downloadHref = url;
      this.download = true;
      this.errorMessage = `Preview not supported. <a href="${url}" download="${this.fileName}">Download the file to view.</a>`;
    }
    this.isLoading = false;
  }

  private processApiResponse(response: any): void {
    this.isLoading = false;
    let url: string | null = null;
    let fileType = this.getFileExtension(response.documentUrl || '') || 'pdf';
    const mimeType = this.getMimeType(fileType);

    if (response.documentBytes) {
      const byteCharacters = atob(response.documentBytes);
      const byteArray = new Uint8Array([...byteCharacters].map(c => c.charCodeAt(0)));
      const blob = new Blob([byteArray], { type: mimeType });
      url = URL.createObjectURL(blob);
    } else if (response.documentUrl) {
      url = response.documentUrl;
    }

    this.downloadHref = url;
    this.download = !!response.isAllowDownload;

    if (url && this.isDisplayable(mimeType, fileType)) {
      this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } else if (url) {
      this.downloadHref = url;
      this.download = true;
      this.errorMessage = `Preview not supported. <a href="${url}" download>Download the file to view.</a>`;
    } else {
      this.setErrorState('Unsupported file type or missing file URL.');
    }
  }

  private isDisplayable(mimeType: string, fileType: string): boolean {
    const displayableContentTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'text/plain',
      'text/csv',
      'text/html',
      'application/xml',
      'application/json',
      'audio/',
      'video/'
    ];
    const displayableTypes = [
      'pdf', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'txt', 'csv', 'html', 'xml', 'json',
      'mp3', 'wav', 'ogg', 'mp4', 'webm', 'flv', 'avi', 'mkv'
    ];
    return (
      displayableContentTypes.some(type =>
        type.endsWith('/') ? mimeType.startsWith(type) : mimeType === type
      ) ||
      displayableTypes.includes(fileType)
    );
  }

  private getFileExtension(url: string): string {
    return url.split('.').pop()?.toLowerCase() || '';
  }

  private getMimeType(extension: string): string {
    const mimeMap: { [key: string]: string } = {
      pdf: 'application/pdf',
      pdfa: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
      csv: 'text/csv',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
      mp4: 'video/mp4',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      webm: 'video/webm',
      flv: 'video/x-flv',
      avi: 'video/x-msvideo',
      mkv: 'video/x-matroska',
      json: 'application/json',
      xml: 'application/xml',
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      md: 'text/markdown',
      epub: 'application/epub+zip'
    };
    return mimeMap[extension] || 'application/octet-stream';
  }

  private handleApiError(error: any): void {
    console.error('API Error:', error);
    this.setErrorState(error?.error?.error || 'An error occurred while fetching the document.');
    this.isLoading = false;
    this.download = false;
    this.downloadHref = null;
    this.iframeSrc = '';
  }

  private setErrorState(message: string): void {
    this.isLoading = false;
    this.errorMessage = message;
    this.download = false;
    this.downloadHref = null;
    this.iframeSrc = '';
    console.log(message);
  }
}

