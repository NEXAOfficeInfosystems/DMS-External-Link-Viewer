import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from './core/services/encryption.service';
import { Subscription } from 'rxjs';
import { CommonService } from './core/services/CommonService'; // Assuming you have a CommonService for loader management
import { FileUploadService, FileUploadStatus } from './core/helpers/file-upload.service';
import { TranslationService } from './core/services/TranslationService';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
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
  showPassword: boolean = false;
  showPasswordError: boolean = false;
  url: any = null;
  isRtl: boolean = false;
  constructor(
    public translate: TranslateService,
    private fileUploadService: FileUploadService,
    private readonly http: HttpClient,
    private readonly sanitizer: DomSanitizer,
    private readonly router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private commonService: CommonService,
    private translationService: TranslationService, // Assuming you have a TranslationService for language management
    private encryptionService: EncryptionService
  ) {
    translate.addLangs(['en']);
    translate.setDefaultLang('en');
    this.setLanguage();
    this.uploadStatuses = this.fileUploadService.getAllUploadStatuses();



    this.fileUploadService.uploadStatus$.subscribe((statuses) => {
      this.uploadStatuses = statuses;
      this.updateCounts();

      if (this.uploadStatuses.length > 0 && this.uploadStatuses.some(status => status.status === 'completed' || status.status === 'failed')) {

        this.successCount = this.uploadStatuses.filter(status => status.status === 'completed').length;
        this.failureCount = this.uploadStatuses.filter(status => status.status === 'failed').length;
        this.totalCount = this.uploadStatuses.length;

        this.cdr.markForCheck();

        let message = '';
        if (this.successCount > 0 && this.failureCount > 0) {
          message = `File upload completed: ${this.successCount} successful, ${this.failureCount} failed.`;
        } else if (this.successCount > 0) {
          message = `File upload completed: ${this.successCount} successful.`;
        } else if (this.failureCount > 0) {
          message = `File upload completed: ${this.failureCount} failed.`;
        }
        this.toastr.clear();


        this.toastr.success(message);
        setTimeout(() => {
          this.showFileList = false;
        }, 60000);
      }





    });
  }
  updateCounts() {
    this.successCount = this.uploadStatuses.filter(status => status.status === 'completed').length;
    this.failureCount = this.uploadStatuses.filter(status => status.status === 'failed').length;
    this.totalCount = this.uploadStatuses.length;
  }
  showLoader: boolean = false;
  loaderSubscription: Subscription = new Subscription();
  ngOnInit(): void {


    const urlParams = new URLSearchParams(window.location.search);
    // console.log('URL Params:', urlParams);

    this.shortCode = urlParams.get('s') ?? '';
    // console.log('Short Code:', this.shortCode);

    const token = document.cookie.split('; ').find(row => row.startsWith('UserToken='))?.split('=')[1];
    // console.log('UserToken:', token);

    if (!token && !this.shortCode) {
      console.log('UserToken is missing. Navigating to /auth.');
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.has('s')) {
        // const encryptedPath = this.encryptionService.encrypt('/auth');
        const encryptedPath = EncryptionService.encryptToToken('/auth');
        const decryptedPath = EncryptionService.decryptFromToken(encryptedPath);

        this.router.navigate([decryptedPath]).then(() => {
          this.isLoading = false;
        });
      } else {
        this.isLoading = false;
      }
      return;
    }

    // console.log('Short code and UserToken are valid. Fetching document metadata.');

    if (!token && this.shortCode) {
      this.fetchDocumentMetadata();
    }

    this.loaderSubscription = this.commonService.loader$.subscribe((status: any) => {
      this.showLoader = status;
      this.cdr.detectChanges();
    });

    const lang = this.translationService.getSelectedLanguage() || 'en';
    this.translationService.setLanguage(lang).subscribe();
  }
  private langSubscription: Subscription | null = null;
  setLanguage() {
    const currentLang = this.translationService.getSelectedLanguage();
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    if (currentLang) {
      this.isRtl = currentLang === 'ar';
      this.langSubscription = this.translationService.setLanguage(currentLang)
        .subscribe(() => { });
    } else {
      const browserLang: any = this.translate.getBrowserLang();
      const lang = /en|es|ar|ru|cn|ja|ko|fr/.test(browserLang) ? browserLang : 'en';
      this.isRtl = lang === 'ar';
      this.langSubscription = this.translationService.setLanguage(lang).subscribe(() => { });
    }
  }




  uploadStatuses: FileUploadStatus[] = [];

  showFileList = true;
  successCount: number = 0;
  failureCount: number = 0;
  totalCount: number = 0;


  closeUpload(): void {
    this.fileUploadService.resetStatuses();
    this.showFileList = false;
    this.uploadStatuses = [];
    this.closeTooltip();
  }

  tooltipVisible: boolean = false;
  tooltipContent: string = '';
  tooltipPosition: { top: number; left: number } | null = null;


  toggleFileList(): void {
    this.showFileList = !this.showFileList;
  }



  showTooltip(message: any, event: MouseEvent): void {
    this.tooltipContent = message;
    this.tooltipVisible = true;
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.tooltipPosition = {
      top: rect.top + window.scrollY + rect.height + 5, // Position below the element
      left: rect.left + window.scrollX // Align with the left edge of the element
    };
    setTimeout(() => {
      this.closeTooltip();
    }, 1000 * 60);
  }

  get overallProgress(): number {
    if (this.uploadStatuses.length === 0) return 0;
    const totalProgress = this.uploadStatuses.reduce((sum, status) => sum + status.progress, 0);
    return Math.round(totalProgress / this.uploadStatuses.length);
  }

  closeTooltip(): void {
    this.tooltipVisible = false;
    this.tooltipContent = '';
    this.tooltipPosition = null;
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

    // Navigate to /auth if shortCode is invalid or missing
    // if (!this.shortCode) {
    //   alert("ssss")
    //   this.router.navigate(['/auth']);
    // }
  }

  showTestToast(): void {
    this.toastr.success('This is a test toast!', 'Success');
  }

  ngOnDestroy() {
    if (this.loaderSubscription) {
      this.loaderSubscription.unsubscribe();
    }
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  sidebarCollapsed = false;

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}

