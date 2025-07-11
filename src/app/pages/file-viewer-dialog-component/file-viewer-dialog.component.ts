import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/core/services/CommonService';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-file-viewer-dialog',
  templateUrl: './file-viewer-dialog.component.html',
  styleUrls: ['./file-viewer-dialog.component.css']
})
export class FileViewerDialogComponent implements OnInit {
  fileUrl: any = '';
  fileExtension: string = '';
  isLoading = false;
  progress = 0;
  token = '';

  @ViewChild('iframe') iframe!: ElementRef<HTMLIFrameElement>;

  constructor(
    public dialogRef: MatDialogRef<FileViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private commonService: CommonService,
    private sanitizer: DomSanitizer,
    private toastrService: ToastrService
  ) {
    this.fileExtension = data.fileExtension?.toLowerCase() || '';
    this.fileUrl = data.fileUrl || '';
    this.Documents = data.Documents
    // console.log(data, 'File Viewer Dialog Data');
  }

  Documents: any;

  ngOnInit(): void {
    const officeTypes = ['doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx'];
    const isOfficeFile = officeTypes.includes(this.fileExtension);
    const isPdf = this.fileExtension === 'pdf';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(this.fileExtension);

    if (isOfficeFile) {
      this.getDocumentToken();
      return;
    }

    if ((isPdf || isImage) && this.fileUrl && !this.fileUrl.startsWith('blob:') && !this.fileUrl.startsWith('http')) {
      const documentId = this.data.id || this.data.documentId;
      this.commonService.downloadDocument(documentId, false).subscribe(
        (event: any) => {
          if (event && event.body && event.type === 4) {
            const blobUrl = URL.createObjectURL(event.body);
            this.fileUrl = blobUrl;
          }
        },
        () => {
          this.toastrService.warning("You don't have access to the document.", '', { timeOut: 1500 });
        }
      );
    }


    this.Documents = this.data.Documents


    // console.log(this.Documents, 'Documents Data');
  }

  getDocumentToken() {
    this.isLoading = true;
    this.progress = 0;

    const documentId = this.data.id || this.data.documentId;
    const isVersion = this.data.isVersion || false;
    const cloudId = this.data.cloudId || null;
    const isLocal = environment.apiBaseUrl.includes('localhost') || environment.apiBaseUrl.includes('127.0.0.1');

    if (!isLocal && cloudId == null) {
      this.commonService.getDocumentToken(documentId).subscribe({
        next: (token: { [key: string]: string }) => {
          this.token = token['result'];
          const host = location.host;
          const protocol = location.protocol;
          const url = environment.apiBaseUrl === '/' ? `${protocol}//${host}/` : environment.apiBaseUrl;
          this.fileUrl = 'https://view.officeapps.live.com/op/embed.aspx?src=' +
            encodeURIComponent(`${url}api/document/${documentId}/download?token=${this.token}&isVersion=${isVersion}`);
          this.isLoading = false;
        },
        error: () => {
          this.toastrService.warning("You don't have access to the document.", '', { timeOut: 1500 });
          this.isLoading = false;
        }
      });
    } else if (!isLocal && cloudId != null) {
      this.commonService.getDocumenturl(documentId).subscribe({
        next: (token: { [key: string]: string }) => {
          this.token = token['result'];
          this.fileUrl = 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(this.token);
          this.isLoading = false;
        },
        error: () => {
          this.toastrService.warning("You don't have access to the document.", '', { timeOut: 1500 });
          this.isLoading = false;
        }
      });
    } else {
      this.commonService.downloadDocument(documentId, false).subscribe({
        next: (event: any) => {
          if (event && event.body && event.type === 4) {
            const blobUrl = URL.createObjectURL(event.body);
            this.fileUrl = blobUrl;
            this.isLoading = false;
          }
        },
        error: () => {
          this.toastrService.warning("You don't have access to the document.", '', { timeOut: 1500 });
          this.isLoading = false;
        }
      });
    }
  }

  showFileFromBlob(blob: Blob, fileName: string, fileExtension: string) {
    
    const blobUrl = URL.createObjectURL(blob);
    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl); 
    // console.log(this.fileUrl, 'Blob URL');
    this.fileExtension = fileExtension;
    // console.log(this.fileExtension, 'File Extension');
  }

 

}
