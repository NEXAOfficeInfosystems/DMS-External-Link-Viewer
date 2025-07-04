import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, Inject, Input, OnChanges, OnInit, Sanitizer, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/BaseComponent';
import { CommonService } from 'src/app/core/services/CommonService';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss']
})
export class PdfViewerComponent extends BaseComponent implements OnChanges {
  @Input() document: any;
  loadingTime: number = 2000;
  progress: number = 0;
  constructor(
    private commonService: CommonService,
    private sanitizer: DomSanitizer,
    public toastrService: ToastrService) {
    super();
  }
  documentUrl: any = null;
  isLoading: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['document']) {
      this.getDocument();
    }
  }
  getDocument() {
    this.isLoading = true;
    this.progress = 0; // Initialize progress to 0
console.log(this.document, 'Document Data');
    this.sub$.sink = this.commonService.downloadDocument(this.document.id,false)
      .subscribe(
        (event) => {



          console.log(event, 'Download Event');
          if (event.type === HttpEventType.DownloadProgress) {
            // Calculate the download progress
            this.progress = Math.round((event.loaded / (event.total || 1)) * 100);
          } else if (event.type === HttpEventType.Response) {
            // Download completed
            this.isLoading = false;
            this.progress = 100; // Ensure progress is set to 100
            this.downloadFile(event);
          }
        },
        (err) => {
          // Handle errors

          console.log(err, 'Download Error');
          this.toastrService.warning("You don't have access to the document.", '', {
            timeOut: 1500
          });

          this.isLoading = false;
          this.progress = 0; // Reset progress on error
        }
      );
  }


  downloadFile(data: HttpResponse<Blob>) {
    if (data.body) {
      const pdfBlob = new Blob([data.body], { type: 'application/pdf' });
      this.documentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(pdfBlob));

      console.log(this.documentUrl)
    } else {
      this.documentUrl = null;
      this.toastrService.warning("Failed to load PDF: file is empty.", '', { timeOut: 1500 });
    }
  }

}
