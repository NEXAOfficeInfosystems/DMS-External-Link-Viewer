import { HttpClient, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef, HostListener, ViewChildren, QueryList, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { CommonService } from 'src/app/core/services/CommonService';
import {SignatureService} from '../../../core/helpers/signature.service';
import { ToastrService } from 'ngx-toastr';
// import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { PDFDocumentProxy } from 'pdfjs-dist';
import * as PDFLib from 'pdf-lib';
import { DocumentView } from 'src/app/core/domain-classes/document-view';
import { DocumentLibraryService } from '../../../core/services/DocumentLibraryService';




import { CommonDialogService } from '../../components/common-dialog/common-dialog.service';
import { FileInfo } from '../../../core/domain-classes/file-info';
import * as pdfjsLib from 'pdfjs-dist';
import { Router } from '@angular/router';
import { TranslationService } from '../../../core/services/TranslationService';

import { CommonDialogComponent } from '../../../shared/components/common-dialog/common-dialog.component';
import { CookieService } from 'ngx-cookie-service';

import { firstValueFrom } from 'rxjs';
import { BaseComponent } from '../../../BaseComponent';
import { VerifySig } from './SigCaptx/verify';
import { SigCapture } from './SigCaptx/capture';
import * as fabric from 'fabric';


import { environment } from 'src/environments/environment';
const { PDFDocument, degrees } = PDFLib;
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
// Ensure this import is at the top of your file
@Component({
  selector: 'app-signature-page',
  templateUrl: './signature-page.component.html',
  styleUrls: ['./signature-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SignaturePageComponent extends BaseComponent implements OnInit {
  // private sub$ = new SubSink();
  fileInfo: FileInfo;
  @ViewChildren('pdfCanvas') pdfCanvas!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('fabricCanvas', { read: ElementRef }) fabricCanvas: QueryList<ElementRef<HTMLCanvasElement>>;


  @ViewChildren('previewCanvas') previewCanvas!: QueryList<ElementRef>;
  // For preview pages
  isDownloading: boolean = false;
  downloadProgress = 0;
  previewPages: number[] = [];
  private canvas!: HTMLCanvasElement;
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  currentPage: number = 1;
  previewCurrentPage: number = 1;
  totalPages: number = 0;
  pdfData: any;
  history: string[] = []; // Stores canvas states
  redoStack: string[] = []; // Stores redo states
  undoStack: string[] = [];
  sign: any;
  renderedPages: number[] = [];
  renderedPageSet: Set<number> = new Set();
  renderedPreviewSet: Set<number> = new Set();
  renderedPageGroups = new Set<number>(); // Stores starting page numbers like 1, 5, 9
  settingPosition = { x: 0, y: 0 };
  // signatureImage: string | null = null;
  isDrawing = false;
  isSign = true;
  activeItem: string | null = null;
  pdfUrl: any;
  docxUrl: any;
  version: any;
  isWordDoc = false;
  canvasContext!: CanvasRenderingContext2D;
  pdfDoc!: PDFDocumentProxy;
  static signatureImage: string = '';
  isTextMode = false; // Track whether text insertion mode is active
  textInput: string = ''; // Text input field for entering text
  textPosition: { x: number; y: number; page: number } | null = null;
  fabricCanvasMap: Map<number, fabric.Canvas> = new Map();
  isPageLoading: { [key: number]: boolean } = {};
  showToolSettings: boolean = true;
  // dragPosition = { x: 0, y: 0 };
  // signaturePosition = { x: 0, y: 0 };
  StepStatus: any;
  typingTimeout: any;
  isHovered: boolean[] = [];
  signatureImage: string[] = [];
  rotationAngles: number[] = [];
  downloadedFile: File | null = null;
  officeViewerUrl: any;
  isLoading: boolean = true;
  isShowPreview: boolean = true;
  type: string;
  static deviceDetected: boolean;
  isdeviceDetected: boolean = false;
  //  signatureImage: string | null = null;
  // private signaturePosition = { x: 0, y: 0 }; // Default position for signature
  signaturePosition: { x: number; y: number; page: number }[] = [];
  watermark: boolean = true
  private dragPosition = { x: 0, y: 0 }; // For dragging signature
  dragStart = { x: 0, y: 0 };
  private isDragging = false;  // Track drag state
  // private history: string[] = [];
  private redoHistory: string[] = [];
  isShowDetails: boolean = true;
  isResizing = false;
  signatureSize: { width: number; height: number }[] = [];
  currentResizeIndex: number | null = null;
  initialMouseX = 0;
  initialMouseY = 0;
  initialWidth = 0;
  initialHeight = 0;
  progress: any;
  scale: number = 0.75;
  previewRectangle: { x: number; y: number; width: number; height: number; visible: boolean } = {
    x: 0, y: 0, width: 100, height: 60, visible: false
  };
  toolSettings = {
    penColor: '#000000',
    penThickness: 2,
    eraserThickness: 10,
    highlighterColor: 'rgba(255, 255, 0, 0.3)',
    highlighterThickness: 10,
    rectangleColor: '#0000FF',
    rectangleThickness: 2,
    textColor: '#000000',
    textFontSize: 16,
  };
  tool: 'pen' | 'eraser' | 'text' | 'highlighter' | 'rectangle' | 'signature' | 'watermark' | 'companyseal' | 'esignature' | 'none' | 'select';
  private lastX = 0;
  private lastY = 0;
  showMenu: boolean = false;
  menuPosition: { x: number; y: number } = { x: 0, y: 0 };
  presentationMode: boolean = false;
  // userJson: any;
  private currentStateIndex: number = -1; // Track current state in history
  private ctx: Map<number, CanvasRenderingContext2D> = new Map();
  previewCtx: CanvasRenderingContext2D | null = null;
  signatureCtx: CanvasRenderingContext2D | null = null;
  private drawings = new Map<number, string>();
  SignatureString: string = "";
  isSignaturePopup: boolean = false;
  isWatermarkPopup: boolean = false;
  constructor(
    private signatureService: SignatureService,
    private commonService: CommonService,
    private toastrService: ToastrService, private httpClient: HttpClient,
    private translationService: TranslationService,
    public dialog: MatDialog, private router: Router,
    private location: Location,
    private cookieservice: CookieService, 
    private cdr: ChangeDetectorRef,
    private commonDialogService: CommonDialogService, private documentLibraryService: DocumentLibraryService
  ) {
    super()
  }
  decryptedText: string;
  ssouserid: any;
  roleIds: any;
  clientId: any;
  localcompanyId: any;
  transcationDetails: any;
  linkdetails: any;
  linkdetailsdata: any;
  currentdociid: any;
  ngOnInit(): void {




    this.toggleActive('projects')
    const navigation = history.state;
    if (navigation && navigation.pdfData) {
      this.pdfData = navigation.pdfData;
      this.StepStatus = navigation.status
      this.transcationDetails = navigation.transcationDetails;
      this.currentdociid = this.pdfData.documentId;
      this.linkdetails = navigation.linkdetails;

      if (this.linkdetails != "" && this.linkdetails != undefined) {
        this.linkdetailsdata = this.linkdetails.filter(doc => doc.documentId !== this.currentdociid)
      } else {
        this.linkdetailsdata = []
      }

    }



    const allowExtesions = environment.allowExtesions;
    const allowTypeExtenstion = allowExtesions.find(c => c.extentions.find(ext => ext === this.pdfData.url.split('.').pop()));
    this.type = allowTypeExtenstion ? allowTypeExtenstion.type : '';
    // this.pdfData.isVersion = false;
    // this.type=this.getFileExtensions(this.pdfData.url)
    if (this.type == 'pdf') {
      this.downloadDocument(this.pdfData);
    }
    this.signatureImage.forEach(() => this.rotationAngles.push(0));
    this.getVersionAndInitForm()
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        this.presentationMode = false;
        this.renderPdfPage(this.currentPage); // To reset layout
      }
    });
    this.CheckDevice()
    // this.selectTool('pen'); // Set default tool to 'pen'


  }
  ngOnDestroy(): void {
    this.pdfData = null; // Clear pdfData when leaving the page

    this.router.navigateByUrl(this.router.url, { state: {} });
  }

  ngAfterViewInit() {
    this.fabricCanvas.changes.subscribe(() => {
      if (this.pdfDoc && this.fabricCanvas.length) {
        // Now canvases exist, render pages
        this.renderAllPages();
      }
    });

  }
  downloadDocuments() {
    this.sub$.sink = this.commonService.downloadDocument(this.pdfData.documentId, this.pdfData.isVersion).subscribe(
      (event) => {
        if (event.type === HttpEventType.Response) {
         
          this.downloadFile(event, this.pdfData);
        }
      },
      (error) => {
        this.toastrService.error(this.translationService.getValue('ERROR_WHILE_DOWNLOADING_DOCUMENT'));
      }
    );
  }

  private downloadFile(data: HttpResponse<Blob>, documentInfo: DocumentInfo) {
    const downloadedFile = new Blob([data.body], { type: data.body.type });
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    a.download = documentInfo.name;
    a.href = URL.createObjectURL(downloadedFile);
    a.target = '_blank';
    a.click();
    document.body.removeChild(a);
  }


  clearAll() {
    this.pdfData = null; // Clear pdfData when leaving the page
    this.fabricCanvasMap.clear();
    this.drawings.clear();
    this.undoStack = [];
    this.redoStack = [];
    this.signatureImage = [];
    this.signaturePosition = [];
    this.signatureSize = [];
    this.renderedPages = [];
    this.renderedPageSet.clear();
    this.renderedPreviewSet.clear();
    this.renderedPageGroups.clear();
    this.previewPages = [];
    this.history = [];
    this.redoHistory = [];
    this.ctx.clear();
    this.pdfDoc = null;
    this.pdfUrl = null;
    this.docxUrl = null;
    this.downloadedFile = null;
    this.signatureCtx = null;
    this.previewCtx = null;
    this.signatureCanvas = null;
    this.pdfCanvas = null;
    this.fabricCanvas = null;
    this.previewCanvas = null;
    this.previewSignature = null;
    this.SignatureString = "";
    this.isSignaturePopup = false;
    this.isWatermarkPopup = false;

  }





  linkdocview(docdata: any) {
  

  }

  
  closeDetails() {
    this.isShowDetails = false;
  }
  closePreview() {
    this.isShowPreview = !this.isShowPreview;
    if (this.isShowPreview) {

      // this.renderPreviewPages()
    }
  }
  getDocumentSize(sizeInKB: number): string {
    if (sizeInKB < 1024) {
      return `${sizeInKB.toFixed(2)} KB`;
    } else if (sizeInKB < 1048576) {
      return `${(sizeInKB / 1024).toFixed(2)} MB`;
    } else {
      return `${(sizeInKB / 1048576).toFixed(2)} GB`;
    }
  }

  getFileExtensions(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'image';
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'word';
      case 'xls':
      case 'xlsx':
        return 'excel';
      case 'ppt':
      case 'pptx':
        return 'powerpoint';
      case 'txt':
        return 'text';
      case 'zip':
      case 'rar':
        return 'archive';
      default:
        return 'unknown';
    }
  }

  downloadDocument(documentData: any): void {




    this.commonService.downloadDocument(documentData.id, this.pdfData.isVersion).subscribe(
      (event) => {
        if (event.type === HttpEventType.Response) {
          const fileBlob = new Blob([event.body], { type: event.body.type });
          const fileUrl = URL.createObjectURL(fileBlob);
          const fileExtension = this.getFileExtension(documentData.url);

          if (fileExtension === 'pdf') {
            this.pdfUrl = fileUrl;

            this.loadPdf();

          }
          else if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(fileExtension)) {
            const dialogRef = this.commonDialogService.deleteConformationDialog("Do you want to convert this document to PDF?");

            dialogRef.subscribe((result: boolean) => {
              if (result) {
                // this.convertAndLoadPdf(fileBlob, fileExtension);
                this.toastrService.error('Annotation Only for pdf');
                // this.isLoading = false
                // this.router.navigate(['/approvalView'])
              } else {
                this.toastrService.error('Conversion canceled.');
                // this.router.navigate(['/approvalView'])
                // this.view(this.pdfData.Id,)
              }
            });
          }


          else {
            this.toastrService.error('Unsupported file format.');
          }
        }
      },
      (error) => {
        // //console.error('Error downloading document:', error);
        this.toastrService.error('Error downloading the document.');
      }
    );
  }
  openConfirmationDialog(message: string) {

    return this.dialog.open(CommonDialogComponent, {
      width: '350px',
      data: { message }
    });
  }
  documentInfo: any;
  

  // ✅ Extract file extension from file name
  getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || '';
  }
 

 
  onPreviewScroll(): void {
    const container = this.pdfCanvas.toArray()[this.currentPage - 1].nativeElement;
    const canvases = this.previewCanvas.toArray();

    const buffer = 300;
    const visibleTop = container.scrollTop;
    const visibleBottom = visibleTop + container.clientHeight;

    this.previewPages.forEach((pageNum, index) => {
      const canvasEl = canvases[index]?.nativeElement;
      if (!canvasEl || this.renderedPreviewSet.has(pageNum)) return;

      const canvasTop = canvasEl.offsetTop;
      const canvasBottom = canvasTop + canvasEl.offsetHeight;

      if (canvasBottom >= visibleTop - buffer && canvasTop <= visibleBottom + buffer) {
        this.pdfDoc.getPage(pageNum).then((page) => {
          const context = canvasEl.getContext('2d');
          const viewport = page.getViewport({ scale: 0.5 });

          canvasEl.width = viewport.width;
          canvasEl.height = viewport.height;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          page.render(renderContext).promise.then(() => {
            this.renderedPreviewSet.add(pageNum); // mark as rendered
          });
        });
      }
    });
  }
  onScroll(): void {
    const container = this.pdfCanvas.toArray()[this.currentPage - 1].nativeElement;
    const canvases = this.fabricCanvas.toArray();
    const buffer = 500; // preload buffer
    const visibleTop = container.scrollTop;
    const visibleBottom = visibleTop + container.clientHeight;

    this.renderedPages.forEach((pageNum, index) => {
      const canvasEl = canvases[index]?.nativeElement;
      if (!canvasEl) return;

      const canvasTop = canvasEl.offsetTop;
      const canvasBottom = canvasTop + canvasEl.offsetHeight;

      if (
        canvasBottom >= visibleTop - buffer &&
        canvasTop <= visibleBottom + buffer &&
        !this.renderedPageSet.has(pageNum)
      ) {
        const dpr = window.devicePixelRatio || 1;
        const hdScale = (this.scale || 1.5) * dpr;
        this.renderPageToCanvas(pageNum, canvasEl, hdScale);
        this.renderedPageSet.add(pageNum); // mark as rendered
      }
    });
  }


  loadPdf(): void {
    this.isLoading = true
    if (!this.pdfUrl) {
      this.toastrService.error('PDF URL is not provided.');
      return;
    }

    this.isWordDoc = false;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', this.pdfUrl, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = () => {
      const arrayBuffer = xhr.response;
      if (arrayBuffer) {
        const loadingTask = pdfjsLib.getDocument(arrayBuffer);
        loadingTask.promise
          .then((pdf: PDFDocumentProxy) => {
            this.pdfDoc = pdf;
            this.totalPages = pdf.numPages;
            this.previewPages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
            this.renderAllPages();
            setTimeout(() => {
              this.renderPreviewPages();
            }, 0);
          })

          .catch((error) => {
            this.toastrService.error('Error loading the PDF.');
          });
      }
    };

    xhr.onerror = () => {
      this.toastrService.error('Error fetching the PDF.');
    };

    xhr.send();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {

      this.onPreviewPageClick(this.currentPage);
    }
  }

  togglePresentationMode(): void {
    this.presentationMode = !this.presentationMode;
    this.isShowDetails = false
    this.isShowPreview = false
    const container = document.documentElement;

    if (this.presentationMode) {
      if (container.requestFullscreen) {
        container.requestFullscreen();

      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        this.renderPdfPage(this.currentPage);
      }
    }



  }

  renderAllPages(): void {
    // Clear any existing canvases and fabric references
    // this.fabricCanvasMap.forEach((fabricCanvas) => fabricCanvas.dispose());
    this.fabricCanvasMap.clear();

    const containers = document.querySelectorAll('.canvas-container');
    // containers.forEach(container => container.remove());

    // Generate placeholders
    this.renderedPages = Array.from({ length: this.pdfDoc.numPages }, (_, i) => i + 1);

    // Create placeholder canvas elements
    setTimeout(() => {
      const container = document.querySelector('.documentview');

      this.renderedPages.forEach((pageNumber) => {
        const canvas = document.createElement('canvas');
        canvas.classList.add('fabric-canvas');
        canvas.setAttribute('data-page', pageNumber.toString());
        canvas.style.width = '100%';
        canvas.style.display = 'block';

        const wrapper = document.createElement('div');
        wrapper.classList.add('canvas-container');
        wrapper.appendChild(canvas);

        container?.appendChild(wrapper);
      });

      // Call lazy render on visible pages
      this.lazyRenderVisiblePages();
    }, 0);
  }
  lazyRenderVisiblePages(): void {
    const canvasElements = Array.from(document.querySelectorAll('.fabric-canvas'));
    const dpr = window.devicePixelRatio || 1;
    const hdScale = this.scale * dpr; // Use this.scale for rendering

    const renderPromises: Promise<void>[] = [];

    // Determine which page is mostly in view
    let visiblePage: number | null = null;
    for (const canvasElement of canvasElements) {
      const rect = canvasElement.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        visiblePage = parseInt(canvasElement.getAttribute('data-page') || '0', 10);
        break;
      }
    }

    if (visiblePage !== null) {
      const groupStartPage = Math.floor((this.currentPage - 1) / 4) * 4 + 1;

      if (!this.renderedPageGroups.has(groupStartPage)) {
        this.renderedPageGroups.add(groupStartPage);

        for (let offset = 0; offset < 4; offset++) {
          const currentPage = groupStartPage + offset;
          if (currentPage > this.pdfDoc.numPages) break;

          const targetCanvas = canvasElements.find(c =>
            parseInt(c.getAttribute('data-page') || '0', 10) === currentPage
          );

          if (targetCanvas && !this.fabricCanvasMap.has(currentPage)) {
            renderPromises.push(this.renderPageToCanvas(currentPage, targetCanvas as HTMLCanvasElement, hdScale).then(() => {
              this.applyToolToCanvas(this.tool, this.fabricCanvasMap.get(currentPage)); // Apply the selected tool
            }));
          }
        }
      }

      // If user is on page 3 of this group, preload next group
      const isOnThirdPage = this.currentPage === groupStartPage + 2;
      const nextGroupStart = groupStartPage + 4;

      if (isOnThirdPage && !this.renderedPageGroups.has(nextGroupStart) && nextGroupStart <= this.pdfDoc.numPages) {
        this.renderedPageGroups.add(nextGroupStart);

        for (let offset = 0; offset < 4; offset++) {
          const currentPage = nextGroupStart + offset;
          if (currentPage > this.pdfDoc.numPages) break;

          const targetCanvas = canvasElements.find(c =>
            parseInt(c.getAttribute('data-page') || '0', 10) === currentPage
          );

          if (targetCanvas && !this.fabricCanvasMap.has(currentPage)) {
            renderPromises.push(this.renderPageToCanvas(currentPage, targetCanvas as HTMLCanvasElement, hdScale).then(() => {
              this.applyToolToCanvas(this.tool, this.fabricCanvasMap.get(currentPage)); // Apply the selected tool
            }));
          }
        }
      }
    }

    // Remove blinking class
    Promise.all(renderPromises).then(() => {
      canvasElements.forEach(canvas => canvas.classList.remove('blinking-canvas'));
    });
  }

  private applyToolToCanvas(tool: string, fabricCanvas: fabric.Canvas | undefined): void {
    if (!fabricCanvas) return;

    switch (tool) {
      case 'pen':
        fabricCanvas.isDrawingMode = true;
        const penBrush = fabricCanvas.freeDrawingBrush as fabric.PencilBrush;
        penBrush.color = this.toolSettings.penColor || '#000000'; // Default to black if not set
        penBrush.width = this.toolSettings.penThickness || 2; // Default thickness
        break;

      case 'eraser':
        fabricCanvas.isDrawingMode = true;
        const eraserBrush = fabricCanvas.freeDrawingBrush as fabric.BaseBrush;
        eraserBrush.width = this.toolSettings.eraserThickness || 10; // Default eraser thickness
        break;

      case 'highlighter':
        fabricCanvas.isDrawingMode = true;
        const highlighterBrush = fabricCanvas.freeDrawingBrush as fabric.PencilBrush;
        highlighterBrush.color = this.toolSettings.highlighterColor || 'rgba(255, 255, 0, 0.3)'; // Default yellow with transparency
        highlighterBrush.width = this.toolSettings.highlighterThickness || 10; // Default highlighter thickness
        break;

      default:
        fabricCanvas.isDrawingMode = false;
        break;
    }
  }




  //   renderAllPages(): void {
  //   // Dispose of old canvases
  //   this.fabricCanvasMap.forEach((fabricCanvas) => {
  //     fabricCanvas.dispose();
  //   });
  //   this.fabricCanvasMap.clear();

  //   this.renderedPages = []; // Start with no rendered pages

  //   // Render each page
  //   for (let pageNumber = 1; pageNumber <= this.previewPages.length; pageNumber++) {
  //     const canvasId = 'fabric-canvas-' + pageNumber;
  //     const canvasElement = document.getElementById(canvasId) as HTMLCanvasElement;

  //     if (canvasElement) {
  //       const dpr = window.devicePixelRatio || 1;
  //       const hdScale = (this.scale || 1.5) * dpr;

  //       this.renderPageToCanvas(pageNumber, canvasElement, hdScale);
  //       this.renderedPages.push(pageNumber);
  //     }
  //   }
  // }


  private renderPagesInRange(startPage: number, endPage: number): void {


    const dpr = window.devicePixelRatio || 1;
    const hdScale = (this.scale || 1.5) * dpr;
    setTimeout(() => {
      const fabricCanvasList = this.fabricCanvas.toArray(); // ViewChildren

      for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {

        const canvasElement = fabricCanvasList[pageNumber - 1]?.nativeElement;
        this.renderPageToCanvas(pageNumber, canvasElement, hdScale);
        this.renderedPages.push(pageNumber);
      }
    }, 0);

  }



  private renderPageToCanvas(pageNumber: number, canvasElement: HTMLCanvasElement, hdScale: number): Promise<void> {
    canvasElement.classList.add('blinking-canvas');

    return this.pdfDoc.getPage(pageNumber).then((page) => {
      const viewport = page.getViewport({ scale: hdScale });

      canvasElement.width = viewport.width;
      canvasElement.height = viewport.height;

      const tempCanvas = document.createElement('canvas');
      const context = tempCanvas.getContext('2d')!;
      tempCanvas.width = viewport.width;
      tempCanvas.height = viewport.height;

      return page.render({ canvasContext: context, viewport }).promise.then(() => {
        const fabricCanvas = new fabric.Canvas(canvasElement, { selection: false });
        fabricCanvas.setWidth(viewport.width * hdScale);
        fabricCanvas.setHeight(viewport.height * hdScale);
        fabricCanvas.setZoom(hdScale);

        fabric.Image.fromURL(tempCanvas.toDataURL(), (img) => {
          img.scaleToWidth(viewport.width);
          img.scaleToHeight(viewport.height);
          img.set({ selectable: false, evented: false, hasControls: false, hasBorders: false });
          fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));
        });

        this.fabricCanvasMap.set(pageNumber, fabricCanvas);
        this.isLoading = false;
      });
    });
  }



  renderPdfPage(pageNumber: number): void {
    // const canvasList = this.pdfCanvas.toArray();
    const dpr = window.devicePixelRatio || 1;
    const baseScale = this.scale || 1.5; // You can change this to 2 for even higher quality
    const hdScale = baseScale * dpr;

    this.pdfDoc.getPage(pageNumber).then((page: any) => {
      const viewport = page.getViewport({ scale: hdScale });

      const canvasEl = this.fabricCanvas.toArray()[this.currentPage - 1]?.nativeElement;
      const fabricCanvas = this.fabricCanvasMap.get(pageNumber) || new fabric.Canvas(canvasEl, { selection: false });

      // // Set canvas dimensions based on the viewport
      canvasEl.height = viewport.height;
      canvasEl.width = viewport.width;

      const renderContext = {
        canvasContext: fabricCanvas.getContext(),
        viewport: viewport,
      };

      // Cancel any ongoing render task before starting a new one
      if (fabricCanvas['renderTask']) {
        fabricCanvas['renderTask'].cancel();
      }

      // Render the page on the canvas
      const renderTask = page.render(renderContext);
      canvasEl['renderTask'] = renderTask;

      renderTask.promise.then(() => {
        // Store the Fabric.js canvas in the Map with the page number as the key
        this.fabricCanvasMap.set(pageNumber, fabricCanvas);

        // 🟢 Restore drawing if available after rendering the page
        const savedDrawing = this.drawings.get(pageNumber);
        this.saveState(pageNumber);

        if (savedDrawing) {
          fabric.Image.fromURL(savedDrawing, (img) => {
            img.scaleToWidth(canvasEl.width);
            img.scaleToHeight(canvasEl.height);
            fabricCanvas.add(img);
          });
        }
      }).catch((error) => {
        if (error.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', error);
        }
      });
    }).catch((error) => {
      console.error('Error fetching page:', error);
    });
  }
  scrollToPage(index: number): void {
    this.currentPage = index + 1
    const element = document.getElementById(`preview-page-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.warn(`Element for page-${index} not found.`);
    }
  }

  zoomIn(): void {
    this.scale += 0.05; // Increase the scale (zoom in)
    this.fabricCanvasMap.forEach((fabricCanvas, pageNumber) => {
      const canvasElement = fabricCanvas.getElement() as HTMLCanvasElement;
      const dpr = window.devicePixelRatio || 1;
      const hdScale = this.scale * dpr;

      this.pdfDoc.getPage(pageNumber).then((page) => {
        const viewport = page.getViewport({ scale: hdScale });

        canvasElement.width = viewport.width;
        canvasElement.height = viewport.height;

        const tempCanvas = document.createElement('canvas');
        const context = tempCanvas.getContext('2d')!;
        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;

        page.render({ canvasContext: context, viewport }).promise.then(() => {
          fabric.Image.fromURL(tempCanvas.toDataURL(), (img) => {
            img.scaleToWidth(viewport.width);
            img.scaleToHeight(viewport.height);
            img.set({ selectable: false, evented: false, hasControls: false, hasBorders: false });
            fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));
          });

          fabricCanvas.setWidth(viewport.width * hdScale);
          fabricCanvas.setHeight(viewport.height * hdScale);
          fabricCanvas.setZoom(hdScale);
          fabricCanvas.renderAll();
        });
      });
    });
  }

  zoomOut(): void {
    if (this.scale > 0.2) {
      this.scale -= 0.05; // Decrease the scale (zoom out)
      this.fabricCanvasMap.forEach((fabricCanvas, pageNumber) => {
        const canvasElement = fabricCanvas.getElement() as HTMLCanvasElement;
        const dpr = window.devicePixelRatio || 1;
        const hdScale = this.scale * dpr;

        this.pdfDoc.getPage(pageNumber).then((page) => {
          const viewport = page.getViewport({ scale: hdScale });

          canvasElement.width = viewport.width;
          canvasElement.height = viewport.height;

          const tempCanvas = document.createElement('canvas');
          const context = tempCanvas.getContext('2d')!;
          tempCanvas.width = viewport.width;
          tempCanvas.height = viewport.height;

          page.render({ canvasContext: context, viewport }).promise.then(() => {
            fabric.Image.fromURL(tempCanvas.toDataURL(), (img) => {
              img.scaleToWidth(viewport.width);
              img.scaleToHeight(viewport.height);
              img.set({ selectable: false, evented: false, hasControls: false, hasBorders: false });
              fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));
            });

            fabricCanvas.setWidth(viewport.width * hdScale);
            fabricCanvas.setHeight(viewport.height * hdScale);
            fabricCanvas.setZoom(hdScale);
            fabricCanvas.renderAll();
          });
        });
      });
    }
  }

  renderPdfPageZoom(pageNumber: number): void {
    const canvasList = this.pdfCanvas.toArray();
    const dpr = window.devicePixelRatio || 1;
    const baseScale = this.scale || 1.5; // You can change this to 2 for even higher quality
    const hdScale = baseScale * dpr;

    this.pdfDoc.getPage(pageNumber).then((page: any) => {
      const viewport = page.getViewport({ scale: hdScale });

      const canvasEl = this.pdfCanvas.toArray()[this.currentPage - 1]?.nativeElement;
      const fabricCanvas = this.fabricCanvasMap.get(pageNumber)

      // Set canvas dimensions based on the viewport
      canvasEl.height = viewport.height;
      canvasEl.width = viewport.width;

      const renderContext = {
        canvasContext: canvasEl.getContext('2d'),
        viewport: viewport,
      };

      // Render the page on the canvas
      page.render(renderContext).promise.then(() => {
        this.fabricCanvasMap.set(pageNumber, fabricCanvas);

        // 🟢 Restore drawing if available after rendering the page
        const savedDrawing = this.drawings.get(pageNumber);
        this.saveState(pageNumber);

        if (savedDrawing) {
          fabric.Image.fromURL(savedDrawing, (img) => {
            img.scaleToWidth(canvasEl.width);
            img.scaleToHeight(canvasEl.height);
            fabricCanvas.add(img);
          });
        }
      }).catch((error) => {
        console.error('Error rendering page:', error);
      });
    }).catch((error) => {
      console.error('Error fetching page:', error);
    });
  }

  renderCurrentPage(pageNumber: number): void {
    const canvasList = this.pdfCanvas.toArray();
    const dpr = window.devicePixelRatio || 1;
    const baseScale = this.scale || 1.5; // You can change this to 2 for even higher quality
    const hdScale = baseScale * dpr;

    this.pdfDoc.getPage(pageNumber).then((page: any) => {
      const viewport = page.getViewport({ scale: hdScale }); // Use the current scale for zooming
      const canvasEl = this.pdfCanvas.toArray()[this.currentPage - 1]?.nativeElement;
      const fabricCanvas = this.fabricCanvasMap.get(pageNumber)

      // Set canvas dimensions based on the viewport
      canvasEl.height = viewport.height;
      canvasEl.width = viewport.width;

      const renderContext = {
        canvasContext: canvasEl.getContext('2d'),
        viewport: viewport,
      };

      page.render(renderContext).promise.then(() => {
        this.fabricCanvasMap.set(pageNumber, fabricCanvas);
      }).catch((error) => {
      });
    });
  }

  renderAllPage(): void {
    const canvasList = this.pdfCanvas.toArray();
    const totalPages = this.pdfDoc.numPages;

    for (let i = 1; i <= totalPages; i++) {
      this.pdfDoc.getPage(i).then((page) => {
        const canvasEl = canvasList[i - 1]?.nativeElement;
        if (!canvasEl) return;

        const fabricCanvas = this.fabricCanvasMap.get(i)
        const viewport = page.getViewport({ scale: this.scale }); // Use the current scale for zooming

        // Set canvas dimensions based on the viewport
        canvasEl.height = viewport.height;
        canvasEl.width = viewport.width;

        const renderContext = {
          canvasContext: canvasEl.getContext('2d'),
          viewport: viewport,
        };

        page.render(renderContext).promise.then(() => {
          this.fabricCanvasMap.set(i, fabricCanvas);
        }).catch((error) => {
        });
      }).catch((error) => {
      });
    }
  }
  async onPreviewPageClick(page: number): Promise<void> {
    this.currentPage = page;
    await this.lazyRenderVisiblePages();
    setTimeout(() => {

      const targetCanvas = document.getElementById(`fabric-canvas-${page + 1}`);

      if (targetCanvas) {
        if (this.currentPage == this.totalPages) {
          targetCanvas.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
        else {
          targetCanvas.scrollIntoView({ behavior: 'smooth', block: 'center' });

        }

      } else {
        console.warn(`Canvas for page ${page} not found`);
      }
    }, 1000);
  }



  renderPreviewPages(): void {
    const previewCanvasList = this.previewCanvas.toArray();

    if (this.previewCurrentPage === 0 || this.totalPages === 0) return;

    // Render a window of 8 previews: 4 before and 4 after the current page
    const start = Math.max(this.previewCurrentPage - 4, 1);
    const end = Math.min(this.previewCurrentPage + 3, this.totalPages);

    for (let pageNum = start; pageNum <= end; pageNum++) {
      const index = pageNum - 1;
      const canvasEl = previewCanvasList[index]?.nativeElement;
      if (!canvasEl) continue;

      // Skip if already rendered
      if (canvasEl.getAttribute('data-rendered') === 'true') continue;

      const context = canvasEl.getContext('2d');
      if (!context) continue;

      this.pdfDoc.getPage(pageNum).then((page) => {
        const viewport = page.getViewport({ scale: 0.5 });

        canvasEl.width = viewport.width;
        canvasEl.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        page.render(renderContext).promise
          .then(() => {
            canvasEl.setAttribute('data-rendered', 'true');
          })
          .catch((err) => {
            console.error(`Error rendering preview of page ${pageNum}`, err);
          });
      });
    }
  }


  renderPdfPageWithFabric(pageNumber: number): void {
    const dpr = window.devicePixelRatio || 1;
    const baseScale = this.scale || 1.5; // You can change this to 2 for even higher quality
    const hdScale = baseScale * dpr;

    this.pdfDoc.getPage(pageNumber).then((page: any) => {
      const viewport = page.getViewport({ scale: hdScale });

      const canvasEl = this.pdfCanvas.toArray()[this.currentPage - 1]?.nativeElement;
      const fabricCanvas = this.fabricCanvasMap.get(pageNumber)

      // Set canvas dimensions based on the viewport
      canvasEl.height = viewport.height;
      canvasEl.width = viewport.width;

      const renderContext = {
        canvasContext: canvasEl.getContext('2d'),
        viewport: viewport,
      };

      // Cancel any ongoing render task before starting a new one
      if (canvasEl['renderTask']) {
        canvasEl['renderTask'].cancel();
      }

      // Render the page on the canvas
      const renderTask = page.render(renderContext);
      canvasEl['renderTask'] = renderTask;

      renderTask.promise.then(() => {
        // Store the Fabric.js canvas in the Map with the page number as the key
        if (fabricCanvas) {
          this.fabricCanvasMap.set(pageNumber, fabricCanvas);
        }

        // 🟢 Restore drawing if available after rendering the page
        const savedDrawing = this.drawings.get(pageNumber);
        this.saveState(pageNumber);

        if (savedDrawing) {
          fabric.Image.fromURL(savedDrawing, (img) => {
            img.scaleToWidth(canvasEl.width);
            img.scaleToHeight(canvasEl.height);
            fabricCanvas.add(img);
          });
        }
      }).catch((error) => {
        if (error.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', error);
        }
      });
    }).catch((error) => {
      console.error('Error fetching page:', error);
    });
  }



  prevPage(): void {

    this.onPreviewPageClick(this.currentPage - 2); // Call the function to render the previous page

  }
  initSignatureCanvas(): void {
    this.canvasContext = this.signatureCanvas.nativeElement.getContext('2d');
    if (!this.canvasContext) {
      //console.error('Failed to initialize signature canvas.');
    }
  }

  startDrawing(event: MouseEvent): void {
    const fabricCanvas = this.fabricCanvasMap.get(this.currentPage);
    if (fabricCanvas) {
      const pointer = fabricCanvas.getPointer(event);
      const path = new fabric.Path(`M ${pointer.x} ${pointer.y}`);
      path.set({
        stroke: this.toolSettings.penColor,
        strokeWidth: this.toolSettings.penThickness,
        fill: null,
        selectable: false,
        evented: false,
      });
      fabricCanvas.add(path);
      fabricCanvas.isDrawingMode = true;
      fabricCanvas.freeDrawingBrush.color = this.toolSettings.penColor;
      fabricCanvas.freeDrawingBrush.width = this.toolSettings.penThickness;
    }
  }

  clearCanvas(): void {
    const controlPanels = document.querySelectorAll('.fabric-control-actions');
    controlPanels.forEach(panel => {
      if (panel.parentElement) {
        panel.parentElement.removeChild(panel);
      }
    });
    // Clear all pages' Fabric.js canvases and stored drawings
    this.fabricCanvasMap.forEach((fabricCanvas, pageNumber) => {
      fabricCanvas.clear();
      this.drawings.set(pageNumber, '');

      // Re-embed the PDF as a background image
      this.pdfDoc.getPage(pageNumber).then((page) => {
        const dpr = window.devicePixelRatio || 1;
        const hdScale = this.scale * dpr;
        const viewport = page.getViewport({ scale: hdScale });

        const tempCanvas = document.createElement('canvas');
        const context = tempCanvas.getContext('2d')!;
        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;

        page.render({ canvasContext: context, viewport }).promise.then(() => {
          fabric.Image.fromURL(tempCanvas.toDataURL(), (img) => {
            img.scaleToWidth(viewport.width);
            img.scaleToHeight(viewport.height);
            img.set({ selectable: false, evented: false, hasControls: false, hasBorders: false });

            fabricCanvas.setWidth(viewport.width * hdScale);
            fabricCanvas.setHeight(viewport.height * hdScale);
            fabricCanvas.setZoom(hdScale);
            fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));
          });
        });
      });
    });
  }


  redos(): void {
    if (this.redoStack.length === 0) return;

    const fabricCanvas = this.fabricCanvasMap.get(this.currentPage);
    if (!fabricCanvas) return;

    const nextState = this.redoStack.pop();
    if (!nextState) return;

    this.undoStack.push(fabricCanvas.toDataURL({ format: 'png' }));

    fabric.Image.fromURL(nextState, (img) => {
      fabricCanvas.clear();
      fabricCanvas.add(img);
    });
  }

  undos(): void {
    if (this.undoStack.length === 0) return;

    const fabricCanvas = this.fabricCanvasMap.get(this.currentPage);
    if (!fabricCanvas) return;

    const currentState = fabricCanvas.toDataURL({ format: 'png' });
    this.redoStack.push(currentState);

    const prevState = this.undoStack.pop();
    if (!prevState) return;

    fabric.Image.fromURL(prevState, (img) => {
      fabricCanvas.clear();
      fabricCanvas.add(img);
    });
  }

  stopDrawing(pageNumber: number): void {
    this.isDrawing = false;
    this.saveCurrentCanvas(pageNumber); // Save after drawing stops
    this.saveState(pageNumber);
  }

  saveCurrentCanvas(pageNumber: number): void {
    const fabricCanvas = this.fabricCanvasMap.get(pageNumber);
    if (fabricCanvas) {
      const dataUrl = fabricCanvas.toDataURL({ format: 'png' });
      this.drawings.set(pageNumber, dataUrl);
    }
  }

  setDrawingProperties(fabricCanvas: fabric.Canvas): void {
    if (fabricCanvas) {
      if (this.tool === 'pen') {
        fabricCanvas.isDrawingMode = true;
        const brush = fabricCanvas.freeDrawingBrush as fabric.PencilBrush;
        brush.color = this.toolSettings.penColor;
        brush.width = this.toolSettings.penThickness;
      } else if (this.tool === 'eraser') {
        fabricCanvas.isDrawingMode = true;
        const brush = fabricCanvas.freeDrawingBrush as fabric.BaseBrush;
        brush.width = this.toolSettings.eraserThickness;
      } else if (this.tool === 'highlighter') {
        fabricCanvas.isDrawingMode = true;
        const brush = fabricCanvas.freeDrawingBrush as fabric.PencilBrush;
        brush.color = this.toolSettings.highlighterColor;
        brush.width = this.toolSettings.highlighterThickness;
        brush.color = 'rgba(2, 2, 1, 0.3)'; // Set yellow color with 30% opacity
      } else {
        fabricCanvas.isDrawingMode = false;
      }
    }
  }

  onPageRendered(event: any): void {
    const fabricCanvas = this.fabricCanvasMap.get(this.currentPage);
    if (fabricCanvas) {
      fabricCanvas.clear();

      // Load saved drawing if exists
      const saved = this.drawings.get(this.currentPage);
      if (saved) {
        fabric.Image.fromURL(saved, (img) => {
          img.scaleToWidth(fabricCanvas.getWidth());
          img.scaleToHeight(fabricCanvas.getHeight());
          fabricCanvas.add(img);
        });
      }
    }
  }
  /**
   * Render icon in the rotate control of fabric object
   */
  renderIconControl(iconSrc) {
    const img = new Image();
    img.src = iconSrc;

    return function render(ctx, left, top, styleOverride, fabricObject) {
      if (img.complete) {
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
        ctx.drawImage(img, -12, -12, 24, 24); // Adjust size and position
        ctx.restore();
      } else {
        img.onload = function () {
          fabricObject.canvas && fabricObject.canvas.requestRenderAll();
        };
      }
    };
  }

  /** Method to unset all the active objects of fabric */
  unsetActiveObjects(): void {
    this.fabricCanvasMap.forEach((fabricCanvas) => {
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
    });
  }
  previewSignature: any;
  async createPreviewSignature(tool: 'signature' | 'watermark' | 'companyseal' | 'esignature'): Promise<void> {
    let base64: string | undefined = '';
    try {
      if (tool === 'signature') {
        const response = await firstValueFrom(this.commonService.getUserSign());
        base64 = response?.userSign;
      } else if (tool === 'esignature') {
        // const response = await firstValueFrom(this.commonService.getUserSign());
        // base64 = response?.userSign;
        base64 = SignaturePageComponent.signatureImage;
      } else if (tool === 'watermark') {
        const response = await firstValueFrom(this.commonService.getUserWaterMark());
        base64 = response?.userWatermark;
      } else if (tool === 'companyseal') {
        const response = await firstValueFrom(this.commonService.getCompanySeal());
        base64 = response?.companySeal;
      }

      this.SignatureString = base64 || '';
      if (!base64) {
        this.toastrService.warning(`User ${tool} is not configured.`);
        // console.error("User signature is missing.");
        return;
      }
      this.previewSignature?.remove(); // Remove existing preview if any
      this.previewSignature = null; // Reset the preview signature variable
      this.previewSignature = document.createElement('img');
      this.previewSignature.style.display = 'flex';
      this.previewSignature.src = base64; // Set the source to the base64 string
      this.previewSignature.classList.add('preview-signature');
      document.body.appendChild(this.previewSignature);
    } catch (error) {
      this.toastrService.error("Failed to load preview signature.");
      // console.error("Error in createPreviewSignature:", error);
    }
  }

  selectTool(tool: 'pen' | 'eraser' | 'text' | 'highlighter' | 'rectangle' | 'none' | 'signature' | 'watermark' | 'companyseal' | 'esignature' | 'select', event: MouseEvent): void {
    this.tool = tool;
    this.isSign = false;
    this.settingPosition.x = event.clientX;
    this.settingPosition.y = 40;
    this.unsetActiveObjects();
    this.isWatermarkPopup = false;
    this.isSignaturePopup = false;
    if (this.tool === 'signature' || this.tool === 'esignature' || this.tool === 'watermark' || this.tool === 'companyseal') {
      this.createPreviewSignature(this.tool);
    }

    this.fabricCanvasMap.forEach((fabricCanvas, pageNumber) => {
      const rotationHandler = (fabric as any).controlsUtils.rotationWithSnapping;
      const rotateIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjNjY2NjY2IiBkPSJNMTMgMjJxLS45MjUgMC0xLjgxMi0uMTg3dC0xLjczOC0uNTM4cS0uMzc1LS4xNS0uNS0uNTM3dC4wMjUtLjc2M3QuNTI1LS41Mzd0Ljc1LjAxMnEuNjUuMjc1IDEuMzM4LjQxM1QxMyAyMHEyLjkyNSAwIDQuOTYzLTIuMDM3VDIwIDEzdC0yLjA1LTQuOTYyVDEyLjk3NSA2SDEyLjhsLjkuOXEuMjc1LjI3NS4yNzUuN3QtLjI3NS43dC0uNy4yNzV0LS43LS4yNzVMOS43IDUuN3EtLjEyNS0uMTI1LS4yLS4zMTJUOS40MjUgNXQuMDc1LS4zODd0LjItLjMxM2wyLjYtMi42cS4yNzUtLjI3NS43LS4yNzV0LjcuMjc1dC4yNzUuN3QtLjI3NS43bC0uOS45aC4xNzVxMy43NSAwIDYuMzg4IDIuNjI1VDIyIDEzdC0yLjYyNSA2LjM3NVQxMyAyMm0tNi0zLjQyNXEtLjIgMC0uMzc1LS4wNjJUNi4zIDE4LjNsLTQuNi00LjZxLS4xNS0uMTUtLjIxMi0uMzI1VDEuNDI1IDEzdC4wNjMtLjM3NXQuMjEyLS4zMjVsNC42LTQuNnEuMTUtLjE1LjMyNS0uMjEzVDcgNy40MjZ0LjM3NS4wNjN0LjMyNS4yMTJsNC42IDQuNnEuMTUuMTUuMjEzLjMyNXQuMDYyLjM3NXQtLjA2Mi4zNzV0LS4yMTMuMzI1bC00LjYgNC42cS0uMTUuMTUtLjMyNS4yMTNUNyAxOC41NzUiLz48L3N2Zz4='; // Path to your rotate icon

      fabric.Object.prototype.controls.mtr = new fabric.Control({
        x: 0,
        y: -0.5,
        offsetY: -40,
        cursorStyle: 'pointer',
        actionHandler: rotationHandler,
        render: (ctx, left, top, fabricObject) => {
          const img = new Image();
          img.src = rotateIcon;
          img.width = 16;
          img.height = 16;
          if (img.complete) {
            ctx.save();
            ctx.translate(left, top);
            ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
            ctx.drawImage(img, -12, -12, 24, 24); // Adjust size and position
            ctx.restore();
          } else {
            img.onload = () => {
              ctx.save();
              ctx.translate(left, top);
              ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
              ctx.drawImage(img, -12, -12, 24, 24); // Adjust size and position
              ctx.restore();
            };
          }
        },
        sizeX: 24, // Adjust the width of the control
        sizeY: 24  // Adjust the height of the control
      });
      fabricCanvas.isDrawingMode = false; // Disable drawing mode initially
      let isDragging = false;

      if (tool === 'eraser') {
        fabricCanvas.isDrawingMode = true;

        const eraserBrush = new fabric.PencilBrush(fabricCanvas);
        eraserBrush.width = this.toolSettings.eraserThickness || 10; // Set eraser thickness
        eraserBrush.color = '#ffffff'; // white brush (acts like eraser)

        fabricCanvas.freeDrawingBrush = eraserBrush;

        fabricCanvas.selection = false;
        fabricCanvas.defaultCursor = 'url("assets/eraser-icon.png"), auto';
      } else {
        fabricCanvas.off('mouse:down');
        fabricCanvas.off('mouse:move');
        fabricCanvas.off('mouse:up');
      }
      fabricCanvas.on('mouse:move', (event) => {
        if (isDragging) {
          const pointer = fabricCanvas.getPointer(event.e);
          const activeObject = fabricCanvas.getActiveObject();
          if (activeObject && activeObject.type === 'textbox') {
            activeObject.set({
              left: pointer.x,
              top: pointer.y,
            });
            fabricCanvas.renderAll();
          }
        }
        if (this.tool === 'signature' || this.tool === 'esignature' || this.tool === 'watermark' || this.tool === 'companyseal') {
          this.previewSignature.style.left = `${event.e.clientX}px`;
          this.previewSignature.style.top = `${event.e.clientY}px`;
          this.previewSignature.style.display = 'block';
        }
      });
      fabricCanvas.on('mouse:up', (event) => {
        isDragging = false;
        fabricCanvas.defaultCursor = 'default';
      });
      fabricCanvas.on('mouse:down', (event) => {
        const pointer = fabricCanvas.getPointer(event.e);
        const existingObject = fabricCanvas.getObjects().find((obj) => {
          if (obj instanceof fabric.Rect || obj.type === 'path' || obj.type === 'textbox' || obj.type === 'image' || obj.type === 'i-text') {
            return obj.containsPoint(new fabric.Point(pointer.x, pointer.y));
          }
          return false;
        });

        const handleExistingObject = () => {
          isDragging = true;
          fabricCanvas.setActiveObject(existingObject);
          fabricCanvas.renderAll();
        };

        const addText = () => {
          const text = new fabric.Textbox('Enter text', {
            name: 'text' + Math.floor(Math.random() * 1000),
            left: pointer.x,
            top: pointer.y,
            fontSize: this.toolSettings.textFontSize,
            fill: this.toolSettings.textColor,
            width: 200,
            lockMovementX: false,
            lockMovementY: false,
            hasControls: true,
          });
          fabricCanvas.add(text);
          fabricCanvas.setActiveObject(text);
          this.addControlPanel(fabricCanvas, text);
          fabricCanvas.renderAll();
          this.tool = 'none';
        };

        const addRectangle = () => {
          const rect = new fabric.Rect({
            name: 'rect' + Math.floor(Math.random() * 1000),
            left: pointer.x,
            top: pointer.y,
            width: this.toolSettings.rectangleThickness,
            height: 60,
            fill: this.toolSettings.rectangleColor,
            stroke: this.toolSettings.rectangleColor,
            strokeWidth: 2,
          });
          fabricCanvas.add(rect);
          this.addControlPanel(fabricCanvas, rect);
          fabricCanvas.renderAll();
          this.tool = 'none';
        };
        const configureBrush = (color: string, width: number) => {
          fabricCanvas.isDrawingMode = true;
          const brush = fabricCanvas.freeDrawingBrush as fabric.PencilBrush;
          brush.color = color;
          brush.width = width;

          // Attach only once to prevent multiple listeners
          if (!(fabricCanvas as any)._hasBrushListener) {
            fabricCanvas.on('path:created', (event: any) => {
              const pathObject = event.path;
              pathObject.name = 'pen' + Math.floor(Math.random() * 1000); // Assign a name for control panel logic
              this.addControlPanel(fabricCanvas, pathObject);
            });

            (fabricCanvas as any)._hasBrushListener = true;
          }
        };

        const handleSignature = () => {
          if (existingObject) {
            handleExistingObject();
          } else {
            this.addSignature(pointer);
            this.tool = 'none';
          }
        };
        const handleESignature = () => {
          if (existingObject) {
            handleExistingObject();
          } else {
            this.addSignatures(pointer);
            this.tool = 'none';
          }
        };
        const handleWatermark = () => {
          if (existingObject) {
            handleExistingObject();
          } else {
            this.addWatermarks(pointer);
            this.tool = 'none';
          }
        };
        const handleCompanySeal = () => {
          if (existingObject) {
            handleExistingObject();
          } else {
            this.addCompanySeal(pointer);
            this.tool = 'none';
          }
        };

        switch (this.tool) {
          case 'select':
            fabricCanvas.isDrawingMode = false;
            fabricCanvas.selection = true;
            fabricCanvas.defaultCursor = 'pointer'; // Set cursor to pointer
            break;
          case 'text':
            fabricCanvas.isDrawingMode = false;
            existingObject ? handleExistingObject() : addText();
            break;

          case 'rectangle':
            fabricCanvas.isDrawingMode = false;
            existingObject ? handleExistingObject() : addRectangle();
            this.tool = 'none';
            break;

          case 'pen':
            existingObject ? handleExistingObject() : configureBrush(this.toolSettings.penColor, this.toolSettings.penThickness);
            break;

          case 'eraser':
            // Handled above, so skip here
            break;

          case 'highlighter':
            existingObject ? handleExistingObject() : configureBrush(this.toolSettings.highlighterColor, this.toolSettings.highlighterThickness);
            break;

          case 'signature':
            fabricCanvas.isDrawingMode = false;
            handleSignature();
            break;
          case 'esignature':
            fabricCanvas.isDrawingMode = false;
            handleESignature();
            break;
          case 'watermark':
            fabricCanvas.isDrawingMode = false;
            handleWatermark();
            break;
          case 'companyseal':
            fabricCanvas.isDrawingMode = false;
            handleCompanySeal();
            break;
          default:
            fabricCanvas.isDrawingMode = false;
            break;
        }
      });
    });

    // Ensure lazy-loaded pages also apply the selected tool
    this.lazyRenderVisiblePages();
  }

  deleteObject() {
    const fabricCanvas = this.fabricCanvasMap.get(this.currentPage);
    if (fabricCanvas) {
      const activeObject = fabricCanvas.getActiveObject();
      if (activeObject) {
        fabricCanvas.remove(activeObject);
        this.saveCurrentCanvas(this.currentPage); // Save the canvas state after deletion
      }
    }
  }
  private removeExistingControlPanels(): void {
    const panels = document.querySelectorAll('.fabric-control-actions');
    panels.forEach(panel => panel.remove());
  }

  private addControlPanel(fabricCanvas: fabric.Canvas, targetObject: fabric.Object): void {
    const viewPortElement = document.getElementsByClassName('document-display')[0];
    if (viewPortElement) {

      const controlPanel = document.createElement('div');
      controlPanel.classList.add('fabric-control-actions')
      controlPanel.id = 'control-panel' + targetObject.name;

      // Add "Apply to Current Page" and "Apply to All Pages" icons for signature/watermark/companyseal/esignature
      if (
        targetObject.name?.startsWith('signature') ||
        targetObject.name?.startsWith('watermark') ||
        targetObject.name?.startsWith('companyseal') ||
        targetObject.name?.startsWith('esignature')

      ) {
        // Apply to Current Page icon
        const currentPageIcon = document.createElement('i');
        currentPageIcon.classList.add('fas', 'fa-file-alt');
        currentPageIcon.title = 'Apply to Current Page';
        currentPageIcon.style.marginRight = '8px';
        currentPageIcon.style.cursor = 'pointer';
        currentPageIcon.addEventListener('click', async () => {
          // Only keep the object on the current page
          // (No-op, since it's already on current page, but you can show a message)
          // Remove trailing numbers from the name for display
          const displayName = targetObject.name.replace(/\d+$/, '');
          this.toastrService.success(`${displayName.charAt(0).toUpperCase() + displayName.slice(1)} placed on current page.`);
        });
        controlPanel.appendChild(currentPageIcon);

        // Apply to All Pages icon
        const allPagesIcon = document.createElement('i');
        allPagesIcon.classList.add('fas', 'fa-copy');
        allPagesIcon.title = 'Apply to All Pages';
        allPagesIcon.style.marginRight = '8px';
        allPagesIcon.style.cursor = 'pointer';
        allPagesIcon.addEventListener('click', async () => {
          // Clone the object to all pages' fabric canvases
          for (let [pageNum, fc] of this.fabricCanvasMap.entries()) {
            if (fc === fabricCanvas) continue; // Skip current page
            const clone = fabric.util.object.clone(targetObject);
            clone.set({
              left: targetObject.left,
              top: targetObject.top,
              scaleX: targetObject.scaleX,
              scaleY: targetObject.scaleY,
              angle: targetObject.angle,
              selectable: true,
              hasControls: true,
              hasBorders: true,
            });
            fc.add(clone);
            fc.renderAll();

            // Add control panel for the cloned object on each page
            // Remove any existing control panel for this object name on this page
            const existingPanel = document.getElementById('control-panel' + clone.name);
            if (existingPanel) {
              existingPanel.remove();
            }
            // Attach control panel for the clone
            this.addControlPanel(fc, clone);
          }
          // Remove trailing numbers from the name for display
          const displayName = targetObject.name.replace(/\d+$/, '');
          this.toastrService.success(`${displayName.charAt(0).toUpperCase() + displayName.slice(1)} Placed on all pages.`);
        });
        controlPanel.appendChild(allPagesIcon);
      }

      const deleteButton = document.createElement('i');
      deleteButton.classList.add('fas', 'fa-trash-alt');
      deleteButton.addEventListener('click', () => {
        for (const [pageNum, fc] of this.fabricCanvasMap.entries()) {
          const activeObject = fc.getActiveObject();
          if (activeObject) {
            fc.remove(activeObject);
            fc.discardActiveObject();
            fc.renderAll();
            const controlPanel = document.getElementById('control-panel' + activeObject.name);
            if (controlPanel && controlPanel.parentElement) {
              controlPanel.parentElement.removeChild(controlPanel);
            }
            break; // only remove one active object
          }
        }
      });

      if (targetObject.type === 'textbox' || targetObject.type === 'i-text') {
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.addEventListener('input', (event) => {
          if ('fill' in targetObject) {
            targetObject.set('fill', (event.target as HTMLInputElement).value);
            fabricCanvas.renderAll();
          }
        });

        const sizeInput = document.createElement('input');
        sizeInput.type = 'number';
        sizeInput.min = '1';
        sizeInput.max = '100';
        sizeInput.value = '16';
        sizeInput.style.width = '50px';
        sizeInput.addEventListener('input', (event) => {
          if ('fontSize' in targetObject) {
            targetObject.set('fontSize', parseInt((event.target as HTMLInputElement).value, 10));
            fabricCanvas.renderAll();
          }
        });

        controlPanel.appendChild(colorPicker);
        controlPanel.appendChild(sizeInput);
      }
      const opacityInput = document.createElement('input');
      opacityInput.type = 'range';
      opacityInput.min = '0';
      opacityInput.max = '1';
      opacityInput.step = '0.1';
      opacityInput.value = '1';
      opacityInput.addEventListener('input', (event) => {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
          activeObject.set('opacity', parseFloat((event.target as HTMLInputElement).value));
          fabricCanvas.renderAll();
        }
      });
      controlPanel.appendChild(opacityInput);
      controlPanel.appendChild(deleteButton);

      viewPortElement.appendChild(controlPanel);
    }
  }

  showSignatureMenu(event: MouseEvent) {
    event.preventDefault(); // Prevent the default right-click menu
    const rect = this.fabricCanvas?.toArray()[0]?.nativeElement.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    this.menuPosition = { x: x, y: y };
    this.showMenu = true;
  }

  // Close the signature menu
  closeMenu() {
    this.showMenu = false;
  }
  addSignature(pointer: any) {
    this.showMenu = false;

    // Switch to the signature tool for the user to draw or add a predefined signature
    this.tool = 'signature';
    // Get the canvas position relative to the window
    // const rect = this.pdfCanvas.toArray()[this.currentPage - 1]?.nativeElement.getBoundingClientRect();
    const x = pointer.x;
    const y = pointer.y;
    // If you have a predefined signature, you can draw it here
    this.addPredefinedSignature(x, y);
  }

  // Example of adding a predefined signature using Fabric.js
  async addPredefinedSignature(x_axis: number, y_axis: number) {
    const fabricCanvas = this.fabricCanvasMap.get(this.currentPage);

    if (!fabricCanvas) {
      console.error("Fabric.js canvas not found for the current page.");
      return;
    }

    try {
      const base64 = this.SignatureString; // Use the base64 string of the image
      if (!base64) {
        this.toastrService.warning("User signature is not configured.");
        console.error("User signature is missing.");
        return;
      }

      // Create an image object for the signature
      fabric.Image.fromURL(base64, (img) => {
        img.set({
          name: 'signature' + Math.floor(Math.random() * 1000),
          left: x_axis,
          top: y_axis,
          scaleX: 0.5,
          scaleY: 0.5,
          selectable: true,
          hasControls: true,
          hasBorders: true,
        });

        // Add the image to the Fabric.js canvas
        fabricCanvas.add(img).renderAll();

        // Add event listener for double-click to finalize the signature
        img.on('mousedblclick', () => {
          img.set({
            selectable: false,
            hasControls: false,
            hasBorders: false,
          });
          fabricCanvas.renderAll();
        });
        fabricCanvas.setActiveObject(img);

        this.addControlPanel(fabricCanvas, img);
        this.previewSignature.style.display = 'none';
        this.previewSignature = null;


      });
    } catch (error) {
      console.error("Error loading signature:", error);
    }
  }


  addCompanySeal(pointer: any) {
    this.showMenu = false;

    // Switch to the signature tool for the user to draw or add a predefined signature
    this.tool = 'signature';
    // Get the canvas position relative to the window
    const rect = this.pdfCanvas.toArray()[this.currentPage - 1]?.nativeElement.getBoundingClientRect();
    const x = pointer.x;
    const y = pointer.y;
    // If you have a predefined signature, you can draw it here
    this.addPredefinedCompanySeal(x, y);
  }

  async addPredefinedCompanySeal(x_axis: number, y_axis: number) {
    const fabricCanvas = this.fabricCanvasMap.get(this.currentPage);

    if (!fabricCanvas) {
      console.error("Fabric.js canvas not found for the current page.");
      return;
    }

    try {

      const base64 = this.SignatureString; // Use the base64 string of the image
      if (!base64) {
        this.toastrService.warning("Company Seal is not configured.");
        console.error("User signature is missing.");
        return;
      }

      // Create an image object for the signature
      fabric.Image.fromURL(base64, (img) => {
        img.set({
          name: 'companyseal' + Math.floor(Math.random() * 1000),
          left: x_axis,
          top: y_axis,
          scaleX: 0.5,
          scaleY: 0.5,
          selectable: true,
          hasControls: true,
          hasBorders: true,
        });

        // Add the image to the Fabric.js canvas
        fabricCanvas.add(img).renderAll();

        // Add event listener for double-click to finalize the signature
        img.on('mousedblclick', () => {
          img.set({
            selectable: false,
            hasControls: false,
            hasBorders: false,
          });
          fabricCanvas.renderAll();
        });
        fabricCanvas.setActiveObject(img);

        this.addControlPanel(fabricCanvas, img);
        this.previewSignature.style.display = 'none';
        this.previewSignature = null;



      });
    } catch (error) {
      console.error("Error loading company seal:", error);
    }
  }



  async renderPdfPages(pageNumber: number): Promise<void> {
    if (!this.pdfDoc) {
      console.error('PDF document not loaded');
      return;
    }

    const canvasList = this.pdfCanvas.toArray();
    const dpr = window.devicePixelRatio || 1;
    const baseScale = this.scale || 1.5; // You can change this to 2 for even higher quality
    const hdScale = baseScale * dpr;

    const page = await this.pdfDoc.getPage(pageNumber);
    const canvas = this.pdfCanvas.toArray()[pageNumber - 1]?.nativeElement;
    const fabricCanvas = this.fabricCanvasMap.get(pageNumber)

    const viewport = page.getViewport({ scale: hdScale });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: canvas.getContext('2d')!,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    // Restore saved drawing if it exists for the current page
    const savedDrawing = this.drawings.get(pageNumber);
    if (savedDrawing) {
      fabric.Image.fromURL(savedDrawing, (img) => {
        img.scaleToWidth(canvas.width);
        img.scaleToHeight(canvas.height);
        fabricCanvas.add(img);
      });
    }

    // Store the Fabric.js canvas in the map
    this.fabricCanvasMap.set(pageNumber, fabricCanvas);

    this.currentPage = pageNumber;
  }

  addWatermarks(pointer: any) {
    this.showMenu = false;
    this.tool = 'watermark';
    const rect = this.pdfCanvas.first?.nativeElement.getBoundingClientRect();
    const x = pointer.x;
    const y = pointer.y;
    this.addPredefinedWatermark(x, y);
  }

  async addPredefinedWatermark(x_axis: number, y_axis: number) {
    const fabricCanvas = this.fabricCanvasMap.get(this.currentPage);

    if (!fabricCanvas) {
      console.error("Fabric.js canvas not found for the current page.");
      return;
    }

    try {

      const base64 = this.SignatureString; // Use the base64 string of the image
      if (!base64) {
        this.toastrService.warning("User watermark is not configured.");
        console.error("User signature is missing.");
        return;
      }

      // Create an image object for the signature
      fabric.Image.fromURL(base64, (img) => {
        img.set({
          name: 'watermark' + Math.floor(Math.random() * 1000),
          left: x_axis,
          top: y_axis,
          scaleX: 0.5,
          scaleY: 0.5,
          selectable: true,
          hasControls: true,
          hasBorders: true,
        });

        // Add the image to the Fabric.js canvas
        fabricCanvas.add(img).renderAll();

        // Add event listener for double-click to finalize the signature
        img.on('mousedblclick', () => {
          img.set({
            selectable: false,
            hasControls: false,
            hasBorders: false,
          });
          fabricCanvas.renderAll();
        });
        fabricCanvas.setActiveObject(img);

        this.addControlPanel(fabricCanvas, img);
        this.previewSignature.style.display = 'none';
        this.previewSignature = null;



      });
    } catch (error) {
      console.error("Error loading watermark:", error);
    }
  }



  // Apply the color and thickness settings to the selected tool
  applyToolSettings(): void {
    this.showToolSettings = false
    const fabricCanvas = this.fabricCanvasMap.get(this.currentPage); // Retrieve the Fabric.js canvas for the current page
    if (!fabricCanvas) {
      console.error('No Fabric.js canvas available for the current page.');
      return;
    }
    switch (this.tool) {
      case 'pen':
        fabricCanvas.isDrawingMode = true;
        const penBrush = fabricCanvas.freeDrawingBrush as fabric.PencilBrush;
        penBrush.color = this.toolSettings.penColor;
        penBrush.width = this.toolSettings.penThickness;

        break;

      case 'eraser':
        fabricCanvas.isDrawingMode = true;
        const eraserBrush = fabricCanvas.freeDrawingBrush as fabric.BaseBrush;
        eraserBrush.width = this.toolSettings.eraserThickness;
        break;

      case 'highlighter':
        fabricCanvas.isDrawingMode = true;
        const highlighterBrush = fabricCanvas.freeDrawingBrush as fabric.PencilBrush;
        highlighterBrush.color = this.toolSettings.highlighterColor; // Highlighter color (yellow with transparency)
        highlighterBrush.width = this.toolSettings.highlighterThickness;

        break;

      default:
        fabricCanvas.isDrawingMode = false;
        break;
    }
  }

  startStopDrawing(event: MouseEvent): void {
    if (!this.isSign) {
      this.isDrawing = true;
    }

    const fabricCanvas = this.fabricCanvasMap.get(this.currentPage);
    if (fabricCanvas) {
      const pointer = fabricCanvas.getPointer(event);
      this.lastX = pointer.x;
      this.lastY = pointer.y;
    }
  }

  draw(event: MouseEvent, page: number): void {
    if (this.presentationMode || !this.isDrawing) return;
    const fabricCanvas = this.fabricCanvasMap.get(page);
    if (!fabricCanvas) return;

    const pointer = fabricCanvas.getPointer(event);

    if (this.tool === 'pen') {
      fabricCanvas.isDrawingMode = true;
      const brush = fabricCanvas.freeDrawingBrush as fabric.PencilBrush;
      brush.color = this.toolSettings.penColor;
      brush.width = this.toolSettings.penThickness;
    } else if (this.tool === 'eraser') {
      fabricCanvas.isDrawingMode = true;

      const brush = fabricCanvas.freeDrawingBrush as fabric.PencilBrush;
      brush.color = 'rgba(0,0,0,1)'; // Color doesn't matter in 'destination-out' mode
      brush.width = this.toolSettings.eraserThickness;

      const ctx = fabricCanvas.getContext(); // Get the canvas context
      if (ctx) {
        ctx.globalCompositeOperation = 'destination-out'; // Erases pixels
      }
    } else if (this.tool === 'text') {
      // Create an input field
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Type text...';
      input.style.position = 'absolute';
      input.style.left = `${event.clientX}px`;
      input.style.top = `${event.clientY}px`;
      input.style.zIndex = '1000';
      input.style.fontSize = '16px';
      input.style.border = '1px solid #ccc';
      input.style.padding = '2px 4px';
      input.style.color = this.toolSettings.textColor;
      input.style.background = '#fff';

      document.body.appendChild(input);
      input.focus();

      const removeInputAndAddText = () => {
        const userText = input.value;
        if (userText.trim() !== '') {
          const text = new fabric.Textbox(userText, {
            left: pointer.x,
            top: pointer.y,
            fontSize: this.toolSettings.textFontSize,
            fill: this.toolSettings.textColor,
            width: 200,
            selectable: true,
            editable: true
          });
          fabricCanvas.add(text);
          fabricCanvas.setActiveObject(text);
          this.saveCurrentCanvas(this.currentPage);
        }

        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      };

      // Add text on enter or blur
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          removeInputAndAddText();
        }
      });

      input.addEventListener('blur', () => {
        removeInputAndAddText();
      });
    } else if (this.tool === 'rectangle') {
      const rect = new fabric.Rect({
        left: this.lastX,
        top: this.lastY,
        width: pointer.x - this.lastX,
        height: pointer.y - this.lastY,
        fill: 'transparent',
        stroke: this.toolSettings.rectangleColor,
        strokeWidth: this.toolSettings.rectangleThickness,
      });
      fabricCanvas.add(rect);
    }

    this.lastX = pointer.x;
    this.lastY = pointer.y;

    // Save the current state for the page
    const dataUrl = fabricCanvas.toDataURL({ format: 'png' });
    this.drawings.set(page, dataUrl);
  }
  onCanvasClick(event: MouseEvent): void {
    this.showMenu = false;

    const fabricCanvas = this.fabricCanvasMap.get(this.currentPage);
    if (!fabricCanvas) return;

    const pointer = fabricCanvas.getPointer(event);

    if (this.tool === 'text') {
      // Create an input field
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Type text...';
      input.style.position = 'absolute';
      input.style.left = `${event.clientX}px`;
      input.style.top = `${event.clientY}px`;
      input.style.zIndex = '1000';
      input.style.fontSize = '16px';
      input.style.border = '1px solid #ccc';
      input.style.padding = '2px 4px';
      input.style.color = this.toolSettings.textColor;
      input.style.background = '#fff';

      document.body.appendChild(input);
      input.focus();

      const removeInputAndAddText = () => {
        const userText = input.value;
        if (userText.trim() !== '') {
          const text = new fabric.Textbox(userText, {
            left: pointer.x,
            top: pointer.y,
            fontSize: this.toolSettings.textFontSize,
            fill: this.toolSettings.textColor,
            width: 200,
            selectable: true,
            editable: true
          });
          fabricCanvas.add(text);
          fabricCanvas.setActiveObject(text);
          this.saveCurrentCanvas(this.currentPage);
        }

        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      };

      // Add text on enter or blur
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          removeInputAndAddText();
        }
      });

      input.addEventListener('blur', () => {
        removeInputAndAddText();
      });
    }
  }

  onCanvasScroll(): void {
    const canvasWrapper = document.querySelector('.documentview');
    const canvasElements = document.querySelectorAll('.fabric-canvas');
    if (!canvasWrapper || canvasElements.length === 0 || this.renderedPages.length === 0) return;

    const scrollTop = canvasWrapper.scrollTop;
    const pageCanvas = canvasElements[0] as HTMLElement;
    const pageHeight = pageCanvas.offsetHeight;

    if (pageHeight === 0) return;

    const currentPageIndex = Math.floor(scrollTop / pageHeight);

    const newCurrentPage = Math.min(
      Math.max(currentPageIndex + 1, 1),
      this.renderedPages.length
    );

    if (newCurrentPage !== this.currentPage) {
      this.currentPage = newCurrentPage;
    }

    // Scroll thumbnail into view
    const previewCanvas = document.getElementById(`preview-page-${currentPageIndex}`);
    if (previewCanvas && this.currentPage != this.totalPages) {
      previewCanvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    else if (previewCanvas && this.currentPage == this.totalPages) {

      previewCanvas.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }


    // ✅ Trigger lazy rendering of visible pages

    this.lazyRenderVisiblePages();
    this.renderPreviewPages();
  }
  onPreviewsScroll(): void {
    const canvasWrapper = document.querySelector('.thumbnail-sidebar');
    const canvasElements = document.querySelectorAll('.canvas-width');

    if (!canvasWrapper || canvasElements.length === 0 || this.renderedPages.length === 0) return;

    const scrollTop = canvasWrapper.scrollTop;
    const pageCanvas = canvasElements[0] as HTMLElement;
    const pageHeight = pageCanvas.offsetHeight;

    if (pageHeight === 0) return;

    // ✅ Determine current visible preview page index
    const currentPageIndex = Math.floor(scrollTop / pageHeight);
    this.previewCurrentPage = currentPageIndex + 1;

    this.renderPreviewPages();



  }






  scrollPreviewToCurrentPage(pageNumber: number) {
    const previewElement = document.querySelector(`#preview-page-${pageNumber}`);
    if (previewElement) {
      previewElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }
  // Method to create a rectangle annotation
  createRectangle(x: number, y: number): void {
    const canvasEl = this.pdfCanvas.first?.nativeElement;
    const wrapper = this.fabricCanvas.first?.nativeElement;

    // Create the wrapper for the rectangle
    const rectWrapper = document.createElement('div');
    rectWrapper.style.position = 'absolute';
    rectWrapper.style.left = `${x}px`;
    rectWrapper.style.top = `${y}px`;
    rectWrapper.style.width = '100px';
    rectWrapper.style.height = '60px';
    rectWrapper.style.border = '2px solid#333';
    rectWrapper.style.zIndex = '10';
    rectWrapper.style.cursor = 'move'; // Allow dragging the rectangle

    // Set the fill color
    rectWrapper.style.backgroundColor = '#f3f3f3'; // Light gray fill (change as needed)

    // Create resize handle for the rectangle
    const resizeHandle = document.createElement('div');
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.right = '0';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.width = '10px';
    resizeHandle.style.height = '10px';
    resizeHandle.style.resize = 'both';
    resizeHandle.style.overflow = 'hidden';
    resizeHandle.style.zIndex = '10';
    resizeHandle.style.cursor = 'se-resize'; // Cursor when resizing

    // Append resize handle to the wrapper
    rectWrapper.appendChild(resizeHandle);

    wrapper.appendChild(rectWrapper);

    // Draggable logic
    let offsetX = 0;
    let offsetY = 0;

    rectWrapper.addEventListener('mousedown', (e) => {
      if (e.target === resizeHandle) return; // Avoid triggering drag on the resize handle

      offsetX = e.clientX - rectWrapper.getBoundingClientRect().left;
      offsetY = e.clientY - rectWrapper.getBoundingClientRect().top;

      const onMouseMove = (moveEvent: MouseEvent) => {
        rectWrapper.style.left = `${moveEvent.clientX - offsetX}px`;
        rectWrapper.style.top = `${moveEvent.clientY - offsetY}px`;
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    // Resizable logic
    resizeHandle.addEventListener('mousedown', (e) => {
      e.preventDefault(); // Prevent the default drag behavior

      const initialWidth = parseInt(rectWrapper.style.width);
      const initialHeight = parseInt(rectWrapper.style.height);
      const initialX = e.clientX;
      const initialY = e.clientY;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const newWidth = initialWidth + (moveEvent.clientX - initialX);
        const newHeight = initialHeight + (moveEvent.clientY - initialY);

        if (newWidth > 20) rectWrapper.style.width = `${newWidth}px`; // Minimum width of 20px
        if (newHeight > 20) rectWrapper.style.height = `${newHeight}px`; // Minimum height of 20px
      };

      const onMouseUp = () => {
        this.isResizing = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    // Double click to commit rectangle to canvas
    rectWrapper.addEventListener('dblclick', () => {
      const rect = rectWrapper.getBoundingClientRect();
      const canvasRect = canvasEl.getBoundingClientRect();
      const drawX = rect.left - canvasRect.left;
      const drawY = rect.top - canvasRect.top;
      const drawWidth = rect.width;
      const drawHeight = rect.height;

      // Draw the filled rectangle onto the canvas
      if (this.ctx) {
        const context = this.ctx.get(this.currentPage);
        if (context) {
          context.fillStyle = this.toolSettings.rectangleColor; // Fill color (light gray)
          context.strokeStyle = this.toolSettings.rectangleColor; // Border color (dark gray)
          context.lineWidth = 2;

          // Fill and stroke the rectangle
          context.fillRect(drawX, drawY, drawWidth, drawHeight);
          context.strokeRect(drawX, drawY, drawWidth, drawHeight);
        }
      }

      // Update saved drawing for the current page
      const canvas = this.pdfCanvas.toArray()[this.currentPage - 1]?.nativeElement;
      this.drawings.set(this.currentPage, canvas.toDataURL());

      // Clean up by removing the rectangle wrapper
      wrapper.removeChild(rectWrapper);
    });
  }

  // Save state (for undo/redo functionality)
  saveState(i): void {
    const canvas = this.fabricCanvas.toArray()[i - 1]?.nativeElement;;
    const dataUrl = canvas.toDataURL();
    this.undoStack.push(dataUrl);
    this.redoStack = []; // Clear redo stack after new action
  }

  async savePDFWithDrawings(): Promise<void> {
    this.isLoading = true;
    document.body.style.pointerEvents = 'none'; // Disable interactions
    document.body.style.opacity = '0.5'; // Dim the page to indicate loading

    const existingPdfBytes = await fetch(this.pdfUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    for (const [pageNum, fabricCanvas] of this.fabricCanvasMap.entries()) {
      const page = pdfDoc.getPage(pageNum - 1);

      // Convert Fabric.js canvas to PNG data URL
      const dataUrl = fabricCanvas.toDataURL({ format: 'png' });

      const pngImageBytes = await fetch(dataUrl).then(res => res.arrayBuffer());
      const pngImage = await pdfDoc.embedPng(pngImageBytes);

      const { width: pdfWidth, height: pdfHeight } = page.getSize();

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
      });

      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      const scaleX = pdfWidth / imgWidth;
      const scaleY = pdfHeight / imgHeight;

      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: imgWidth * scaleX,
        height: imgHeight * scaleY,
      });
    }

    // Generate final PDF
    const pdfBytes = await pdfDoc.save();

    // Trigger download before uploading
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    // const downloadLink = document.createElement('a');
    // downloadLink.href = URL.createObjectURL(blob);
    // downloadLink.download = 'annotated.pdf';
    // downloadLink.click();

    // Create a File from the PDF bytes
    const file = new File([blob], 'annotated.pdf', { type: 'application/pdf' });

    // Create FormData to upload
    const formData = new FormData();
    formData.append('file', file);

    // Call upload method
    this.upload(formData);
  }

  async downloadPDFWithDrawings(): Promise<void> {
    this.isDownloading = true;
    this.downloadProgress = 0;

    try {
      const response = await fetch(this.pdfUrl);
      const contentLength = +response.headers.get('Content-Length')!;

      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          receivedLength += value.length;
          this.downloadProgress = Math.round((receivedLength / contentLength) * 100);
        }
      }

      const blob = new Blob(chunks);
      const arrayBuffer = await blob.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Add your Fabric.js drawing embedding logic here...

      const pdfBytes = await pdfDoc.save();
      const finalBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(finalBlob);
      downloadLink.download = 'annotated.pdf';
      downloadLink.click();

    } catch (error) {
      console.error('Download error:', error);
    } finally {
      this.isDownloading = false;
      this.downloadProgress = 0;
    }
  }



  stopDrawings(): void {
    this.isDrawing = false;
    const context = this.ctx.get(this.currentPage);
    if (context) {
      context.closePath(); // Close the drawing path when mouse is released
    }
  }

  saveToHistory(): void {
    if (this.ctx && this.signatureCanvas) {
      const dataUrl = this.signatureCanvas.nativeElement.toDataURL();
      this.history.push(dataUrl); // Save the current state
    }
  }

  undo(): void {
    if (this.history.length >= 0) { // Ensure there's more than one state to undo
      const lastState = this.history.pop(); // Remove the current state
      this.redoStack.push(lastState as string); // Add to redo stack
      let previousState = this.history[this.history.length - 1]; // Get the previous state

      this.loadCanvasState(previousState); // Load the previous state
    }
  }
  rotateImage(index: number, angle: number): void {

    this.rotationAngles[index] += angle; // Add or subtract the rotation angle
  }
  redo(): void {
    if (this.redoStack.length >= 0) {
      const redoState = this.redoStack.pop();
      this.history.push(redoState as string); // Add back to history
      this.loadCanvasState(redoState as string); // Load the redo state
    } else {
    }
  }

  loadCanvasState(dataUrl: string | undefined): void {
    if (dataUrl && this.ctx) {
      const img = new Image();
      img.onload = () => {
        // Clear the canvas and draw the image
        const context = this.ctx.get(this.currentPage);
        if (context) {
          context.clearRect(0, 0, this.signatureCanvas.nativeElement.width, this.signatureCanvas.nativeElement.height);
          context.drawImage(img, 0, 0);
        }
        // Draw the image onto the canvas
      };
      img.src = dataUrl; // Set the image source to the data URL
    }
  }

  cleanSignaturepad() {
    const canvas = this.signatureCanvas.nativeElement;
    const context = this.ctx.get(this.currentPage);
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  createSignature() {
    this.saveSignatures()
    this.history = []; // Clear history
    this.redoStack = []; // Clear redo stack
  }
  async getUserEsign(): Promise<void> {
    try {
      const response = await this.commonService.getUserSign().toPromise();
      if (!response || !response.userSign) {
        this.toastrService.error("No User Signature Found In The Configuration");
        return;
      }


      // Fetch the PDF
      const pdfBytes = await this.fetchPdf();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Convert Base64 signature to image bytes
      const signatureImageBytes = await this.convertDataUrlToBytes(response.userSign);
      const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
      const { width: imgWidth, height: imgHeight } = signatureImage.scale(1); // You can adjust scaling if needed

      // Get all pages
      const pages = pdfDoc.getPages();
      // Get all pages in the PDF

      // Clear existing data
      this.signatureImage = [];
      this.signaturePosition = [];
      this.signatureSize = [];

      // Push signature base64 once
      this.signatureImage.push(response.userSign);
      const dialogRef = this.commonDialogService.deleteConformationDialog(
        "Click 'Yes' to apply signature in all pages, or 'Cancel' to apply on the current page."
      );


      dialogRef.subscribe((result: boolean) => {
        if (result) {
          const pages = pdfDoc.getPages();
          pages.forEach((page, i) => {
            const { width, height } = page.getSize();
            const canvasWidth = window.innerWidth; // Screen width
            const canvasHeight = window.innerHeight; // Screen height
            // Calculate center position
            const x = (canvasWidth) / 1.3;
            const y = (canvasHeight) * 3.2;

            this.signatureImage.push(response.userSign)
            // Save the watermark position for this page
            this.signaturePosition.push({
              x: x,
              y: y,
              page: i + 1,

            });
            this.signatureSize.push({
              width: imgWidth, // Adjust width dynamically
              height: imgHeight // Adjust height dynamically
            });
          })



        } else {
          const currentPageIndex = this.currentPage - 1;
          const page = pages[currentPageIndex];
          const { width, height } = page.getSize();
          const canvasWidth = window.innerWidth; // Screen width
          const canvasHeight = window.innerHeight;
          const x = (canvasWidth) / 1.3;
          const y = (canvasHeight) * 3.2;
          this.signaturePosition.push({
            x,
            y,
            page: this.currentPage
          });

          this.signatureSize.push({
            width: imgWidth,
            height: imgHeight
          });
        }
        this.toastrService.success("Signature added successfully");

      })
    } catch (error) {
      console.error("Error fetching or applying user signature:", error);
      this.toastrService.error("Error applying signature");
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    // Check if there are unsaved changes (e.g., signatureImage or drawings not empty)
    if (
      (this.signatureImage && this.signatureImage.length > 0) ||
      (this.undoStack.length > 0)
    ) {
      const message = 'You have unsaved changes. If you reload or leave this page, your changes will be lost. Please save the document.';
      event.returnValue = message; // For most browsers
      return message; // For some older browsers
    }
  }
  saveSignatures() {
    if (this.ctx) {

      const dataUrl = this.signatureCanvas.nativeElement.toDataURL();
      this.signatureImage.push(dataUrl);  // This should work if signatureImages is an array

      this.signaturePosition.push({
        x: 820,  // You can initialize the position as needed
        y: 30,
        page: this.currentPage  // Add the current page to the position
      });
      this.signatureSize.push({
        width: 250,
        height: 90
      })
    }
  }
  saveSignature(): void {
    if (this.ctx) {
      const payload = {
        userSign: this.signatureImage[0]
      };

      // this.commonService.updateUserSign(payload).subscribe(
      //   (response) => {

      //   },
      //   (error) => {
      //     //console.error('Error updating user signature:', error);
      //   }
      // );
    }
  }
  toggleTextMode() {
    this.isTextMode = !this.isTextMode;
    if (this.isTextMode) {
      this.textInput = ''; // Clear the input when switching to text mode
    }
  }
  onTextInput(event: any) {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout); // Clear the previous timeout
    }

    this.typingTimeout = setTimeout(() => {
      this.insertTextOnCanvas(); // Insert text after delay
    }, 1000); // Wait for 1 second after the user stops typing
  }
 
  insertTextOnCanvas() {
    if (this.textInput.trim() === '') return; // Don't insert empty text

    const canvas = this.signatureCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = '20px poppins'; // Set text font size and family
      ctx.fillStyle = 'black'; // Set text color

      // If textPosition is not set, set it based on mouse click
      if (!this.textPosition) {
        this.textPosition = { x: 150, y: 50, page: this.currentPage }; // Default position for the text
      }

      // Draw text at the specified position
      ctx.fillText(this.textInput, this.textPosition.x, this.textPosition.y);
    }

    // Clear the input field after inserting text
    this.textInput = '';
    this.textPosition = null;
    this.isTextMode = false; // Exit text mode after inserting
  }


  toggleActive(item: string): void {
    // If the clicked item is already active, toggle it off, otherwise set it as active
    if (this.activeItem === item) {
      this.activeItem = null; // Deactivate if it's already active
    } else {
      this.activeItem = item; // Activate the clicked item
    }
  }
  removeSignature(index: any): void {



    // Remove the signature image and position using the global index
    this.signatureImage.splice(index, 1);
    this.signaturePosition.splice(index, 1);
    this.signatureSize.splice(index, 1)


  }

  onHoverEnd(index: number): void {
    this.isHovered[index] = false;
  }
  onHoverStart(index: number): void {
    this.isHovered[index] = true;
  }

  // Handle dragover event to allow dropping
  onDragOver(event: DragEvent): void {
    event.preventDefault();  // Necessary to allow drop
  }

  // Handle drop event to remove image if dropped in the drop area
  onDrop(event: DragEvent, index: number): void {
    const dropX = event.clientX;  // Get X position where the image is dropped
    const pageWidth = window.innerWidth;  // Get the page width
    const middle = pageWidth / 2;  // Calculate the middle of the page
    // Check if the drop position is on the left side of the page (middle)
    if (dropX < middle) {
      // If it's on the left side, remove the image
      this.removeSignature(index);
    }
  }


  // Clear the signature canvas
  clearSignature(): void {
    // const canvas = this.signatureCanvas.nativeElement;
    // this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.signatureImage = []; // Clear the saved signature image

  }
  onImageUpload(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          // Create a canvas and draw the image on it
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngDataUrl = canvas.toDataURL('image/png');
            this.signatureImage.push(pngDataUrl);

            this.signaturePosition.push({
              x: 820,  // You can initialize the position as needed
              y: 30,  // Same for the y-coordinate
              page: this.currentPage  // Add the current page to the position
            });
            this.signatureSize.push({
              width: 200,
              height: 200
            })
          }
        };
        img.src = e.target.result;  // Load the image from the file
      };
      reader.readAsDataURL(file);
    } else {
    }
  }
  private async loadImageAsBase64(imagePath: string): Promise<string> {
    const response = await fetch(imagePath); // Fetch the image from the assets folder
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string); // Convert Blob to Base64
      reader.onerror = reject;
      reader.readAsDataURL(blob); // Read as DataURL (Base64)
    });
  }

  onResizeStart(event: MouseEvent, index: number) {
    this.isResizing = true;
    this.currentResizeIndex = index;
    this.initialMouseX = event.clientX;
    this.initialMouseY = event.clientY;

    this.initialWidth = this.signatureSize[index]?.width || 200; // Default width
    this.initialHeight = this.signatureSize[index]?.height || 50; // Default height

    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onResizeMove(event: MouseEvent) {
    if (!this.isResizing || this.currentResizeIndex === null) return;

    const index = this.currentResizeIndex;
    const deltaX = event.clientX - this.initialMouseX;
    const deltaY = event.clientY - this.initialMouseY;

    // Update width & height dynamically while keeping min limits
    this.signatureSize[index] = {
      width: Math.max(50, this.initialWidth - deltaX),  // Expand or shrink width
      height: Math.max(25, this.initialHeight - deltaY) // Expand or shrink height
    };
  }

  @HostListener('document:mouseup', ['$event'])
  onResizeEnd() {
    this.isResizing = false;
    this.currentResizeIndex = null;
  }
  async addWaterMark(): Promise<void> {
    try {
      const response = await this.commonService.getUserWaterMark().toPromise(); // Convert Observable to Promise
      if (!response || !response.userWaterMark) {
        //console.warn('No user watermark found in the response.');
        this.toastrService.error("No Watermark Found In The Configuration")

        return;
      }

      // Fetch the PDF
      const pdfBytes = await this.fetchPdf();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Convert Base64 to image bytes
      const watermarkImageBytes = await this.convertDataUrlToBytes(response.userWaterMark);
      const watermarkImage = await pdfDoc.embedPng(watermarkImageBytes);
      const { width: imgWidth, height: imgHeight } = watermarkImage.scale(0.5); // Adjust scale as needed

      // Get all pages in the PDF
      const pages = pdfDoc.getPages();
      pages.forEach((page, i) => {
        const { width, height } = page.getSize();
        const canvasWidth = window.innerWidth; // Screen width
        const canvasHeight = window.innerHeight; // Screen height
        // Calculate center position
        const x = (canvasWidth) / 2.7;
        const y = (canvasHeight) * 1.7;

        this.signatureImage.push(response.userWaterMark)
        // Save the watermark position for this page
        this.signaturePosition.push({
          x: x,
          y: y,
          page: i + 1,

        });
        this.signatureSize.push({
          width: 200, // Adjust width dynamically
          height: 200 // Adjust height dynamically
        });
      });

      this.toastrService.success("Watermark added successfully")
    } catch (error) {
    }
  }
  getVersionAndInitForm() {
    // this.documentService.getVersion(this.pdfData.documentId).subscribe((version: any) => {
    //   if (version && version.length > 0) {
    //     let currentVersion = Number(version[0].version);
    //     if (currentVersion % 1 === 0.9) {
    //       this.version = Math.ceil(currentVersion);
    //     } else {
    //       this.version = parseFloat((currentVersion + 0.1).toFixed(1)); // Ensure only one decimal place
    //     }
    //   } else {
    //     this.version = 1.1;
    //   }

    // });
  }
  // async applyWaterMark(Status: any): Promise<void> {
  //   try {
  //     // Load the watermark image as Base64
  //     let watermarkBase64 = '';
  //     if (Status == 'Approve') {
  //       watermarkBase64 = await this.loadImageAsBase64('assets/images/Approved.png');
  //     } else if (Status == 'Review') {
  //       watermarkBase64 = await this.loadImageAsBase64('assets/images/Review.png');

  //     } else if (Status == 'Reject') {
  //       watermarkBase64 = await this.loadImageAsBase64('assets/images/Rejected.png');

  //     } else {
  //       const response = await this.commonService.getUserWaterMark().toPromise(); // Convert Observable to Promise
  //       if (!response || !response.userWaterMark) {
  //         //console.warn('No user watermark found in the response.');
  //         this.toastrService.error("No Watermark Found In The Configuration")

  //         return;
  //       }
  //       watermarkBase64 = await this.loadImageAsBase64(response.userWaterMark)
  //     }
  //     this.watermark = false
  //     // Load the existing PDF
  //     const pdfBytes = await this.fetchPdf(); // Fetch the PDF (implement your fetch logic)
  //     const pdfDoc = await PDFDocument.load(pdfBytes);

  //     // Embed the watermark image
  //     const watermarkImageBytes = await this.convertDataUrlToBytes(watermarkBase64); // Convert Base64 to bytes
  //     const watermarkImage = await pdfDoc.embedPng(watermarkImageBytes);
  //     const watermarkDims = watermarkImage.scale(0.5); // Scale image if needed (adjust the scale factor)

  //     // Get all pages in the PDF
  //     const pages = pdfDoc.getPages();

  //     // Add watermark to the center of all pages
  //     pages.forEach((page, i) => {
  //       const { width, height } = page.getSize();
  //       const canvasWidth = window.innerWidth; // Screen width
  //       const canvasHeight = window.innerHeight; // Screen height
  //       // Calculate center position
  //       const x = (canvasWidth) / 2.5;
  //       const y = (canvasHeight) * 1.5;

  //       this.signatureImage.push(watermarkBase64)
  //       this.signatureSize.push({
  //         width: 300, // Adjust width dynamically
  //         height: 300 // Adjust height dynamically
  //       });
  //       this.signaturePosition.push({
  //         x: x,
  //         y: y,
  //         page: i + 1,

  //       });
  //     });


  //   } catch (error) {
  //   }
  // }
  // Helper function to convert data URL to bytes
  private async convertDataUrlToBytes(dataUrl: string): Promise<Uint8Array> {
    const response = await fetch(dataUrl);
    return new Uint8Array(await response.arrayBuffer());
  }

 
  onDragStart(event: MouseEvent, index: number): void {
    if (!this.signatureImage || this.signatureImage.length <= index) return;

    const signatureRect = (event.target as HTMLElement).getBoundingClientRect();

    // Calculate the offset between mouse position and signature's position
    this.dragStart.x = event.clientX - signatureRect.left;
    this.dragStart.y = event.clientY - 177 - signatureRect.top;

    this.isDragging = true;
    event.preventDefault(); // Prevent the browser's default drag behavior
  }
  navigateToFolderList(): void {
    window.history.back();
    setTimeout(() => {
      window.location.reload();
    }, 50);
  }

  // Listen for browser back button and reload the page
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any): void {
    window.location.reload();
  }

  onDragMove(event: MouseEvent, index: number): void {
    if (!this.isDragging || !this.signatureImage || this.signatureImage.length <= index) return;

    // Ensure the signature position is initialized
    if (!this.signaturePosition[index]) {
      this.signaturePosition[index] = { x: 0, y: 0, page: this.currentPage }; // Include page number
    }

    const pdfCanvasRect = this.pdfCanvas.toArray()[this.currentPage - 1]?.nativeElement.getBoundingClientRect();
    this.signaturePosition[index].x = event.clientX - pdfCanvasRect.left - this.dragStart.x;
    this.signaturePosition[index].y = event.clientY - pdfCanvasRect.top - this.dragStart.y;

    // Update the position of the dragged signature image
    const signatureElement = document.getElementById(`signatureElement${index}`) as HTMLElement;

    if (signatureElement) {
      signatureElement.style.left = `${this.signaturePosition[index].x}px`;
      signatureElement.style.top = `${this.signaturePosition[index].y}px`;
    }
  }

  onDragEnd(event: MouseEvent, index: number): void {
    if (!this.isDragging || !this.signatureImage || this.signatureImage.length <= index) return;

    this.isDragging = false;

    // Save the signature position with the current page number
    if (this.signaturePosition[index]) {
      this.signaturePosition[index].page = this.currentPage;
    }

  }


  private getImageDimensions(base64Image: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = reject;
      img.src = base64Image; // Load the image from Base64
    });
  }
  async downloadPdfWithSignature(): Promise<void> {


    try {
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(await this.fetchPdf());
      const canvasWidth = window.innerWidth; // Screen width
      const canvasHeight = window.innerHeight; // Screen height
      // Loop through each page and apply signatures
      for (let pageIndex = 0; pageIndex < pdfDoc.getPages().length; pageIndex++) {
        const page = pdfDoc.getPages()[pageIndex];

        // For each signature, embed it and draw it at the specified position
        for (let i = 0; i < this.signatureImage.length; i++) {
          // Ensure signaturePosition[i] has a page number property
          if (this.signaturePosition[i]?.page === pageIndex + 1) {  // Adjust page index if necessary
            const signatureImageEmbed = await pdfDoc.embedPng(this.signatureImage[i]);
            const { width: signatureWidths, height: signatureHeights } = await this.getImageDimensions(this.signatureImage[i]);
            const signatureWidth = this.signatureSize[i].width / 2;
            const signatureHeight = this.signatureSize[i].height / 2;

            const pageWidth = page.getWidth();
            const pageHeight = page.getHeight();

            const uiWidth = canvasWidth;  // UI width of the canvas
            const uiHeight = canvasHeight + 1320  // UI height of the canvas

            // Map the signature position from the canvas UI to PDF coordinates
            const mappedX = (this.signaturePosition[i]?.x / uiWidth) * pageWidth;
            const mappedY = (this.signaturePosition[i]?.y / uiHeight) * pageHeight;

            // Adjust Y to match PDF coordinates (PDF origin is at the bottom-left)
            const adjustedY = pageHeight - mappedY - signatureHeight;

            // Ensure the coordinates are within the page bounds
            const clampedX = this.clamp(mappedX, 0, pageWidth - signatureWidth);
            const clampedY = this.clamp(adjustedY, 0, pageHeight - signatureHeight);
            const angleInDegrees = this.rotationAngles[i] || 0; // Assuming you store the angle in `rotationAngles`

            // Draw the signature on the current PDF page
            page.drawImage(signatureImageEmbed, {
              x: clampedX + 5,
              y: clampedY + 75,  // No need to add the extra 50 offset unless needed
              width: signatureWidth,
              height: signatureHeight,
              // rotate: degrees(angleInDegrees),
            });
          }
        }
      }

      // Save the modified PDF
      const pdfBytes = await pdfDoc.save();
      this.triggerDownload(pdfBytes);

    } catch (error) {
    }
  }
  async savePdfWith(): Promise<void> {
    if (!this.signatureImage.length) {
      this.toastrService.warning('Please add a signature first.');
      return;
    }

    try {
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(await this.fetchPdf());
      const canvasWidth = window.innerWidth; // Screen width
      const canvasHeight = window.innerHeight; // Screen height
      // Loop through each page and apply signatures
      for (let pageIndex = 0; pageIndex < pdfDoc.getPages().length; pageIndex++) {
        const page = pdfDoc.getPages()[pageIndex];


        // For each signature, embed it and draw it at the specified position
        for (let i = 0; i < this.signatureImage.length; i++) {
          // Ensure signaturePosition[i] has a page number property
          if (this.signaturePosition[i]?.page == (pageIndex + 1)) {  // Adjust page index if necessary
            const signatureImageEmbed = await pdfDoc.embedPng(this.signatureImage[i]);

            // const { width: signatureWidths, height: signatureHeights } = await this.getImageDimensions(this.signatureImage[i]);
            const signatureWidth = this.signatureSize[i].width / 2;
            const signatureHeight = this.signatureSize[i].height / 2;

            const pageWidth = page.getWidth();
            const pageHeight = page.getHeight();

            const uiWidth = canvasWidth;  // UI width of the canvas
            const uiHeight = canvasHeight + 1320  // UI height of the canvas

            // Map the signature position from the canvas UI to PDF coordinates
            const mappedX = (this.signaturePosition[i]?.x / uiWidth) * pageWidth;
            const mappedY = (this.signaturePosition[i]?.y / uiHeight) * pageHeight;

            // Adjust Y to match PDF coordinates (PDF origin is at the bottom-left)
            const adjustedY = pageHeight - mappedY - signatureHeight;

            // Ensure the coordinates are within the page bounds
            const clampedX = this.clamp(mappedX, 0, pageWidth - signatureWidth);
            const clampedY = this.clamp(adjustedY, 0, pageHeight - signatureHeight);
            const angleInDegrees = this.rotationAngles[i] || 0; // Assuming you store the angle in `rotationAngles`

            // Draw the signature on the current PDF page
            page.drawImage(signatureImageEmbed, {
              x: clampedX + 5,
              y: clampedY + 75,  // No need to add the extra 50 offset unless needed
              width: signatureWidth,
              height: signatureHeight,
              // rotate: degrees(angleInDegrees),
            });
          }
        }
      }


      // Save the modified PDF
      const pdfBytes = await pdfDoc.save();

      const uint8Array = new Uint8Array(pdfBytes); // Convert to binary
      const blob = new Blob([uint8Array], { type: 'application/pdf' }); // Create a Blob from binary


      const formData = new FormData();

      formData.append('document.pdf', blob, 'document.pdf'); // Ensure file has a name
      formData.append('CloudSlug', this.pdfData.cloudSlug);
      formData.append('CategoryId', this.pdfData.categoryId); // Ensure it's a string
      formData.append('isPersonal', this.pdfData.Ispersonal); // Ensure it's a string
      formData.append('companyId', this.localcompanyId);
      formData.append('clientId', this.clientId);
      this.upload(formData);

      this.signatureImage = []
      this.signatureSize = []
      this.signaturePosition = []
    } catch (error) {
    }
  }
  SaveDocument(url: any) {

    

  }
  upload(formData: FormData) {
    // this.isLoading = true;

    // formData.append('CloudSlug', this.pdfData.cloudSlug);
    // formData.append('ClientId', this.clientId);
    // formData.append('CompanyId', this.localcompanyId);
    // formData.append('CategoryId', this.pdfData.categoryId);
    // formData.append('isPersonal', this.pdfData.Ispersonal); // Ensure it's a string
    // const uploadReq = new HttpRequest('POST', `api/document/upload`, formData, {
    //   reportProgress: true,
    //   responseType: 'json', // Ensure the response is parsed as JSON
    // });

    // this.httpClient.request(uploadReq).subscribe(
    //   (event: any) => {
    //     if (event.type === HttpEventType.UploadProgress) {
    //       // Show upload progress
    //       if (event.total) {
    //         this.progress = Math.round((100 * event.loaded) / event.total);
    //       }
    //     } else if (event.type === HttpEventType.Response) {
    //       if (event.body) {
    //         const fileInfo = event.body as FileInfo;
    //         if (fileInfo && fileInfo.id) {
    //           const url = fileInfo.id;
    //           this.SaveDocument(url);
    //         } else {
    //           // //console.warn('Invalid file information received:', event.body);
    //         }
    //       }
    //     }
    //   },
    //   (error) => {
    //     this.toastrService.warning('Upload failed. Please try again.');
    //     // //console.error('Upload error:', error);
    //   }
    // );
  }

  clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
  }





  // Fetch the original PDF (example using XMLHttpRequest)
  async fetchPdf(): Promise<Uint8Array> {
    if (this.pdfUrl.startsWith('data:application/pdf;base64,')) {
      const base64Data = this.pdfUrl.split(',')[1];
      const binaryData = atob(base64Data);
      const uint8Array = new Uint8Array(binaryData.length);

      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }

      return uint8Array;
    } else {
      // Handle normal URL fetch
      return await (await fetch(this.pdfUrl)).arrayBuffer().then((data) => new Uint8Array(data));
    }
  }


  // Trigger the download of the modified PDF
  triggerDownload(pdfBytes: Uint8Array): void {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'signed_document.pdf'; // Name of the downloaded PDF
    link.click();
  }

  //////////////////////////////// device ////////////////////////

  async CheckDevice() {
    // this.isSign = true;
    await VerifySig.verifySignedData();
    setTimeout(() => {
      this.isdeviceDetected = SignaturePageComponent.deviceDetected;

    }, 1000); // Set a delay (e.g., 1000ms), adjust as needed
  }


  async capturesig() {
    try {
      this.isSign = true;
      this.isSignaturePopup = false;
      await SigCapture.Capture();

    } catch (error) {
      console.error("Error capturing signature:", error);
      this.toastrService.error("Failed to capture signature. Please try again.");
    }
  }
  onImageUploads(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.SignatureString = reader.result as string;
      // this.addImageToCanvas(base64, 100, 100); // You can replace 100,100 with desired coordinates
    };

    reader.readAsDataURL(file);
  }

  addImageToCanvas(base64: any, x_axis: number, y_axis: number): void {
    const fabricCanvas = this.fabricCanvasMap.get(this.currentPage);

    if (!fabricCanvas) {
      console.error("Fabric.js canvas not found for the current page.");
      return;
    }

    const imgObj = new Image();
    imgObj.crossOrigin = 'anonymous'; // If image is from an external domain
    imgObj.src = base64;

    imgObj.onload = () => {
      const image = new fabric.Image(imgObj, {
        left: x_axis,
        top: y_axis,
        scaleX: 0.5,
        scaleY: 0.5,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        lockMovementX: false,
        lockMovementY: false,
        evented: true, // Enable interaction
        objectCaching: false,
      });

      // Ensure the canvas itself allows interaction
      fabricCanvas.selection = true;
      fabricCanvas.skipTargetFind = false;
      fabricCanvas.allowTouchScrolling = false;

      // Add image and make it active
      fabricCanvas.add(image);
      fabricCanvas.setActiveObject(image);
      fabricCanvas.renderAll();
    };

  }

  addSignatures(pointer: any) {
    this.showMenu = false;
    // Switch to the signature tool for the user to draw or add a predefined signature
    this.tool = 'signature';
    // Get the canvas position relative to the window
    const rect = this.pdfCanvas.first?.nativeElement.getBoundingClientRect();
    const x = pointer.x
    const y = pointer.y
    // If you have a predefined signature, you can draw it here
    this.addPredefinedSignatures(x, y);
  }

  // Example of adding a predefined signature (you can modify this)
  async addPredefinedSignatures(x_axis: number, y_axis: number) {
    const fabricCanvas = this.fabricCanvasMap.get(this.currentPage);

    if (!fabricCanvas) {
      console.error("Fabric.js canvas not found for the current page.");
      return;
    }

    try {

      const base64 = this.SignatureString; // Use the base64 string of the image
      if (!base64) {
        this.toastrService.warning("User signature is not configured.");
        console.error("User signature is missing.");
        return;
      }

      // Create an image object for the signature
      fabric.Image.fromURL(base64, (img) => {
        img.set({
          name: 'esignature' + Math.floor(Math.random() * 1000),
          left: x_axis,
          top: y_axis,
          scaleX: 0.5,
          scaleY: 0.5,
          selectable: true,
          hasControls: true,
          hasBorders: true,
        });

        // Add the image to the Fabric.js canvas
        fabricCanvas.add(img).renderAll();

        // Add event listener for double-click to finalize the signature
        img.on('mousedblclick', () => {
          img.set({
            selectable: false,
            hasControls: false,
            hasBorders: false,
          });
          fabricCanvas.renderAll();
        });
        fabricCanvas.setActiveObject(img);

        this.addControlPanel(fabricCanvas, img);
        this.previewSignature.style.display = 'none';
        this.previewSignature = null;



      });
    } catch (error) {
      console.error("Error loading signature:", error);
    }
  }
  showSuccessMessage(message: string): void {

    this.toastrService.success(message);

  }
  showErrorMessage(message: string, title: string): void {
    // Alternatively, use a notification service like ToastrService if available
    this.toastrService.error(message, title);
  }
  deleteDocument() {
    // // this.getDocumentPrmission(document.id);
    // this.sub$.sink = this.commonDialogService
    //   //.deleteConformationDialog(`${this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} ${document.name}`)
    //   .deleteConformationDialog(`${this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE')}`)
    //   .subscribe((isTrue: boolean) => {
    //     if (isTrue) {

    //       this.sub$.sink = this.documentService.deleteDocument(this.documentInfo.id)
    //         .subscribe({
    //           next: () => {
    //             this.addDocumentTrail(this.documentInfo.id, DocumentOperation.Deleted.toString());
    //             this.toastrService.success(this.translationService.getValue('DOCUMENT_DELETED_SUCCESSFULLY'));
    //             this.location.back();
    //           },
    //           error: (err) => {
    //             // console.error('Error deleting document:', err); 
    //             this.toastrService.warning(err.messages);
    //           }
    //         });
    //     }
    //   });
  }
  addDocumentTrail(id: string, operation: string) {
    // const objDocumentAuditTrail: DocumentAuditTrail = {
    //   documentId: id,
    //   operationName: operation
    // };
    // this.sub$.sink = this.commonService.addDocumentAuditTrail(objDocumentAuditTrail)
    //   .subscribe(c => {
    //   });
  }

  manageDocumentPermission() {

    // const dialogRef = this.dialog.open(DocumentPermissionListComponent,
    //   {
    //     data: this.documentInfo,
    //     width: '80vw',
    //     height: '80vh',
    //     disableClose: true
    //   }
    // )
  }
  // isDragging = false;
  offsetX = 0;
  offsetY = 0;
  startDrag(event: MouseEvent, element: HTMLElement) {
    this.isDragging = true;
    this.offsetX = event.clientX - element.offsetLeft;
    this.offsetY = event.clientY - element.offsetTop;
    const base64 = this.sign;

    const mouseMoveHandler = (moveEvent: MouseEvent) => {
      if (!this.isDragging) return;
      const x = moveEvent.clientX - this.offsetX;
      const y = moveEvent.clientY - this.offsetY;
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
    };

    const mouseUpHandler = () => {
      this.isDragging = false;
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);

    // Add resizer div to bottom-right
    const resizer = document.createElement('div');
    Object.assign(resizer.style, {
      position: 'absolute',
      // left: `${x_axis + 300}px`,
      // top: `${y_axis + 150}px`,
      width: '200px',
      height: '100px',
      border: '2px dashed #333',
      resize: 'both',
      overflow: 'hidden',
      zIndex: '10',
      cursor: 'move'
    });
    element.appendChild(resizer);
    const tickBtn = document.createElement('button');
    tickBtn.innerText = '✔';
    Object.assign(tickBtn.style, {
      position: 'absolute',
      // right: '172px',
      top: '-10px',
      width: '24px',
      height: '24px',
      backgroundColor: '#ddd',
      color: 'black',
      display: 'block',
      right: '0',
      border: 'none',
      cursor: 'pointer',
      zIndex: '1001'
    });
    element.appendChild(tickBtn);
    let isResizing = false;
    let startX = 0, startY = 0, startWidth = 0, startHeight = 0;

    resizer.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = element.offsetWidth;
      startHeight = element.offsetHeight;

      const resizeMove = (ev: MouseEvent) => {
        if (!isResizing) return;
        const width = startWidth + (ev.clientX - startX);
        const height = startHeight + (ev.clientY - startY);
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
      };

      const resizeUp = () => {
        isResizing = false;
        document.removeEventListener('mousemove', resizeMove);
        document.removeEventListener('mouseup', resizeUp);
      };

      document.addEventListener('mousemove', resizeMove);
      document.addEventListener('mouseup', resizeUp);
    });

    // Right-click to draw on canvas
    element.addEventListener('contextmenu', async (e) => {
      e.preventDefault();

      const rect = element.getBoundingClientRect();
      const canvasList = this.pdfCanvas.toArray();
      const canvasEl = canvasList.find((canvas) => {
        const cr = canvas.nativeElement.getBoundingClientRect();
        return e.clientY >= cr.top && e.clientY <= cr.bottom;
      });

      if (!canvasEl) return;

      const targetCanvas = canvasEl.nativeElement;
      const pageCanvasRect = targetCanvas.getBoundingClientRect();
      const context = targetCanvas.getContext('2d');
      const currentPageNumber = this.pdfCanvas.toArray().indexOf(canvasEl) + 1;
      this.currentPage = currentPageNumber;

      const width = element.offsetWidth;
      const height = element.offsetHeight;

      const canvasScaleX = targetCanvas.width / pageCanvasRect.width;
      const canvasScaleY = targetCanvas.height / pageCanvasRect.height;

      const x = (rect.left - pageCanvasRect.left) * canvasScaleX;
      const y = (rect.top - pageCanvasRect.top) * canvasScaleY;

      const popup = document.createElement('div');
      Object.assign(popup.style, {
        position: 'absolute',
        left: `${x + 200}px`,
        top: `${y - 50}px`,
        padding: '15px',
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
        zIndex: '1002',
        fontFamily: 'poppins, sans-serif',
        fontSize: '14px',
        color: '#333',
        textAlign: 'center',
      });
      popup.innerHTML = `
        <p style="margin-bottom: 15px; font-weight: bold;">Would you like to apply the signature to all pages or just the current page?</p>
        <button id="applyAllPagesYes" class="btn-primary" style="margin-right: 10px; padding: 8px 12px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">All Pages</button>
        <button id="applyAllPagesNo" class="btn-primary" style="padding: 8px 12px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Current Page</button>
      `;
      document.body.appendChild(popup);

      const image = new Image();
      image.src = base64;
      const closePopup = () => {
        document.body.removeChild(popup);
      };
      document.getElementById('applyAllPagesYes')?.addEventListener('click', async () => {
        const totalPages = this.totalPages;
        closePopup();
        await new Promise((resolveImage) => {
          image.onload = async () => {
            for (let i = 0; i < canvasList.length; i++) {
              await this.renderPdfPages(i + 1);
              await new Promise((r) => setTimeout(r, 200));

              const pageCanvas = canvasList[i].nativeElement;
              const pageCtx = pageCanvas.getContext('2d');
              const pageRect = pageCanvas.getBoundingClientRect();

              const scaleX = pageCanvas.width / pageRect.width;
              const scaleY = pageCanvas.height / pageRect.height;

              const drawX = (rect.left - pageRect.left) * scaleX;
              const drawY = (rect.top - pageRect.top) * scaleY;

              if (pageCtx) {
                pageCtx.drawImage(image, drawX, drawY, width, height);
                this.drawings.set(i + 1, pageCanvas.toDataURL());
              }
            }
            element.remove(); // Remove draggable preview
            resolveImage(null);
          };
        });
      })
      document.getElementById('applyAllPagesNo')?.addEventListener('click', async () => {
        const totalPages = this.totalPages;
        closePopup();
        image.onload = () => {
          if (context) {
            context.drawImage(image, x, y, width, height);
            this.drawings.set(this.currentPage, targetCanvas.toDataURL());
          }
          element.remove(); // Remove draggable preview
        };
      })
    });
  }


  openSignaturePopup() {
    this.isSignaturePopup = true;
  }

  openWaterMarkPopup() {
    this.isWatermarkPopup = true;
  }
  closeSignaturePopup() {
    this.isSignaturePopup = false;
  }
  closeWatermarkPopup() {
    this.isWatermarkPopup = false;
  }
}