import { HttpEventType } from '@angular/common/http';
import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/BaseComponent';
import { DocumentView } from 'src/app/core/domain-classes/document-view';
import { CommonService } from 'src/app/core/services/CommonService';

@Component({
  selector: 'app-audio-preview',
  templateUrl: './audio-preview.component.html',
  styleUrls: ['./audio-preview.component.css']
})
export class AudioPreviewComponent extends BaseComponent implements OnChanges {
  @ViewChild('playerEl', { static: true }) playerEl: ElementRef;
  isLoading = false;
  @Input() document: DocumentView = {} as DocumentView  ;
  progress:number=0;
  htmlSource: HTMLSourceElement;
  constructor(
    public commonService: CommonService,
    public toastrService:ToastrService) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['document']) {
      this.getDocument();
    }
  }

  getDocument() {
    this.isLoading = true;
    this.progress = 0; // Initialize progress to 0
  
    this.sub$.sink = this.commonService.downloadDocument(this.document.documentId, this.document.isVersion)
      .subscribe(
        (event) => {
          if (event.type === HttpEventType.DownloadProgress) {
            // Calculate and log the progress percentage
            this.progress = Math.round((100 * event.loaded) / (event.total ?? 1));

            
            console.log(`Download Progress: ${this.progress}%`);
          } else if (event.type === HttpEventType.Response) {
            this.isLoading = false;
            this.progress = 100; // Ensure progress is set to 100% when complete
  
            // Handle the response (document rendering)
            if (this.htmlSource && this.player().hasChildNodes()) {
              this.player().removeChild(this.htmlSource);
            }
            const imageFile = new Blob([event.body], { type: event.body.type });
            this.htmlSource = document.createElement('source');
            this.htmlSource.src = URL.createObjectURL(imageFile);
            this.htmlSource.type = event.body.type;
            this.player().pause();
            this.player().load();
            this.player().appendChild(this.htmlSource);
            this.player().play();
          }
        },
        (err) => {
          this.toastrService.warning("You don't have access to the document.", '', {
            timeOut: 1500
          });
          this.isLoading = false;
          this.progress = 0; // Reset progress on error
          console.error('Error while downloading document:', err);
        }
      );
  }
  

  player() {
    return this.playerEl.nativeElement as HTMLVideoElement | HTMLAudioElement;
  }

  onCancel() {
    // this.overlayRef.close(); 
  }
}
