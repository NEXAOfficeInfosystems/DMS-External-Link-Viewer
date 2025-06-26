import { HttpEventType } from '@angular/common/http';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AudioPreviewComponent } from '../audio-preview/audio-preview.component';
import { CommonService } from 'src/app/core/services/CommonService';

import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-video-preview',
  templateUrl: './video-preview.component.html',
  styleUrls: ['./video-preview.component.scss']
})
export class VideoPreviewComponent extends AudioPreviewComponent implements OnChanges {
  @Input() document: any;
  @Input() isLoading: boolean;
  constructor(

    // public overlayRef: OverlayPanelRef,
    public commonService: CommonService,
    public toastrService:ToastrService
  ) {
    super(commonService);
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
   
    

}
