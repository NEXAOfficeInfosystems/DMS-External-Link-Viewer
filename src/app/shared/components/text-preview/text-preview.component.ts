import { HttpEventType, HttpProgressEvent, HttpResponse } from '@angular/common/http';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/BaseComponent';
import { DocumentView } from 'src/app/core/domain-classes/document-view';
import { CommonService } from 'src/app/core/services/CommonService';


@Component({
  selector: 'app-text-preview',
  templateUrl: './text-preview.component.html',
  styleUrls: ['./text-preview.component.scss']
})
export class TextPreviewComponent extends BaseComponent implements OnChanges {
  textLines: string[] = [];
  isLoading = false;
  progress:number=0;
  @Input() document: DocumentView = {} as DocumentView;
  constructor(
    private commonService: CommonService,
    public toastrService:ToastrService
    // private overlayRef: OverlayPanelRef
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['document']) {
      this.readDocument();
    }
  }

  readDocument() {
    this.isLoading = true;
    this.progress = 0; // Initialize progress to 0
  
    this.sub$.sink = this.commonService.downloadDocument(this.document.documentId, this.document.isVersion)
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.DownloadProgress) {
            // Calculate the download progress
            this.progress = Math.round((event.loaded / (event.total || 1)) * 100);
          } else if (event.type === HttpEventType.Response) {
            // Handle the response when download completes
            const response = event as HttpResponse<Blob>;
            const blob = response.body as Blob; 
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => {
                const fileContent = reader.result as string; 
                this.textLines = fileContent.split('\n'); 
                this.isLoading = false;
                this.progress = 100; // Set progress to 100 on completion
              };
              reader.onerror = () => {
                this.textLines = ['Error: Failed to read file content'];
                this.isLoading = false;
              };
              reader.readAsText(blob);
            } else {
              this.textLines = ['Error: No document content'];
              this.isLoading = false;
            }
          }
        },
        error: (err) => {
          // Handle errors
          this.textLines = ['Error: Could not fetch document content'];
          this.toastrService.warning("You don't have access to the document.", '', {
            timeOut: 1500
          });
          this.isLoading = false;
          this.progress = 0; // Reset progress on error
        }
      });
  }
  

  // onCancel() {
  //   this.overlayRef.close();
  // }

}
