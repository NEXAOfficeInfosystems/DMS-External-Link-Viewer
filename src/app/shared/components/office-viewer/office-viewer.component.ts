import { AfterViewInit, Component, ElementRef, Inject, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';


import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/BaseComponent';
import { DocumentView } from 'src/app/core/domain-classes/document-view';
import { CommonService } from 'src/app/core/services/CommonService';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-office-viewer',
  templateUrl: './office-viewer.component.html',
  styleUrls: ['./office-viewer.component.scss']
})
export class OfficeViewerComponent extends BaseComponent implements OnInit, AfterViewInit {
  @ViewChild('iframe') iframe: ElementRef<HTMLIFrameElement> | undefined;
  isLive = true;
  isLoading: boolean = false;
  progress:number=0;
  token = '';
  @Input() document: DocumentView = {} as DocumentView;

  constructor(
    private commonService: CommonService,
    public toastrService:ToastrService
    // private overlayRef: OverlayPanelRef 
  ) {
    super();
  }

  ngOnInit(): void {
    if (environment.apiBaseUrl.indexOf('localhost') >= 0) {
      this.isLive = true;
    }
  }

  ngAfterViewInit() {
  
  }


  
  // onCancel() {
  //   this.overlayRef.close();
  // }

 
}