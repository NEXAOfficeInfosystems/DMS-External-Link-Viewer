import { HttpEventType } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DocumentView } from '../../../core/domain-classes/document-view';
import { CommonService } from '../../../core/services/CommonService';
import { ToastrService } from 'ngx-toastr';
import { delay } from 'rxjs/operators';
import { BaseComponent } from '../../../BaseComponent';

@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.scss']
})
export class ImagePreviewComponent extends BaseComponent implements OnInit, OnChanges {
  imageUrl: SafeUrl = '';
  isLoading = false;
  progress:number=0;
  @Input() document: DocumentView = {} as DocumentView;
  constructor(
    private sanitizer: DomSanitizer,
    private ref: ChangeDetectorRef,
    private commonService: CommonService,
    public toastrService:ToastrService) {
    super();
  }

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['document']) {
      this.getImage();
    }
  }

  getImage() {
    this.isLoading = true;
    this.progress = 0; // Initialize progress to 0
  
    this.sub$.sink = this.commonService.downloadDocument(this.document.documentId, this.document.isVersion)
      .pipe(
        delay(500)
      )
      .subscribe({
        next: (data) => {
          // Handle download progress
          if (data.type === HttpEventType.DownloadProgress) {
            // Calculate and set the progress percentage
            if (data.total) {
              this.progress = Math.round((100 * data.loaded) / data.total);
            }
          }
  
          // Handle the final response once the document is fully downloaded
          if (data.type === HttpEventType.Response && data.body) {
            const imageFile = new Blob([data.body], { type: data.body.type });
            this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(imageFile));
            this.ref.markForCheck();
  
            // Set progress to 100% when the image is fully downloaded
            this.progress = 100;
            this.isLoading = false;
          }
        },
        error: (err) => {
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
  // }  //  THIS CODE NOT USE BUT FUTURE USECASE

}
