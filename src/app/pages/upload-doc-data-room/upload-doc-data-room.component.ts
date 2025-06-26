import { Component, Inject, Input, OnInit, ViewChild ,Output,EventEmitter} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import axios from 'axios';
import { DataRoomApiService } from 'src/app/core/services/DataRoomApiService.service';
import { DataroomdetailsComponent } from '../dataroomdetails/dataroomdetails.component';
import { CommonService } from 'src/app/core/services/CommonService';
import { environment } from 'src/environments/environment';



interface CustomFile extends File {
  id: string;
  doc_Type: string;
  documentName: string;
  selectedKeys: string[];
  folderId?: string;
  categoryId?: string;
  description?: string;
  extension?: string;
  editing?: boolean;
  isUploadable?: boolean;
  documentMetaTags?: any[];
  DocumentType?: string;
  CloudSlug?: string;
  
}
@Component({
  selector: 'app-upload-doc-data-room',
  templateUrl: './upload-doc-data-room.component.html',
  styleUrls: ['./upload-doc-data-room.component.scss']
})
export class UploadDocDataRoomComponent {


  @Input() data: any = null;
  @Output() dataChanged = new EventEmitter<void>(); 
    @ViewChild('dataroomDetail') dataRoomDetailComponent!: DataroomdetailsComponent;
  files: CustomFile[] = [];
  selectedPermission: string = 'inherit';
  allowedFileExtensions: string = '';
DataRoomValues:any;
  constructor(
    public dialogRef: MatDialogRef<UploadDocDataRoomComponent>,
    private commonService: CommonService,
    private toastrService: ToastrService,
        private manageDataRoomService: DataRoomApiService,
      @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) {


  }

loccompanyId: string = '';
clientId: string = '';
  ngOnInit(): void {

    console.log('Data received:', this.dialogData);
  this.clientId = localStorage.getItem('clientId') || '';
  this.loccompanyId = localStorage.getItem('selectedCompanyId') || '';




  }

handleFileInput(event: any): void {
  let files: File[] = [];

  // If it's a drag-drop event with files directly
  if (Array.isArray(event)) {
    files = event;
  }
  // If it's from an <input type="file"> event
  else if (event?.target?.files) {
    files = Array.from(event.target.files);
  }

  if (files.length) {
    this.onFileDropped(files);
  }
}


  onFileDropped(files: File[]): void {
    const incomingFiles = Array.from(files) as CustomFile[];

    const duplicateFiles = incomingFiles.filter((incomingFile: CustomFile) =>
      this.files.some((existingFile: CustomFile) =>
        (existingFile.documentName || existingFile.name).toLowerCase() === (incomingFile.documentName || incomingFile.name).toLowerCase()
      )
    );

    if (duplicateFiles.length > 0) {
      const duplicateFileNames = duplicateFiles.map((file: CustomFile) => file.documentName || file.name).join(', ');
      this.toastrService.warning(`${duplicateFileNames} file(s) already exist. Please choose different files.`);
    }

    const zeroSizeFiles = incomingFiles.filter((file: CustomFile) => file.size === 0);
    if (zeroSizeFiles.length > 0) {
      const zeroSizeFileNames = zeroSizeFiles.map((file: CustomFile) => file.documentName || file.name).join(', ');
      this.toastrService.warning(`${zeroSizeFileNames} file(s) have zero size. Please choose different files.`);
    }

    const newFiles = incomingFiles.filter((file: CustomFile) =>
      !zeroSizeFiles.some(zeroFile =>
        (zeroFile.documentName || zeroFile.name).toLowerCase() === (file.documentName || file.name).toLowerCase()
      ) &&
      !this.files.some(existingFile =>
        (existingFile.documentName || existingFile.name).toLowerCase() === (file.documentName || file.name).toLowerCase()
      )
    );

    newFiles.forEach((file: CustomFile) => {
      file.id = this.commonService.getuuid();
      file.doc_Type = 'Non-Confidential';
      file.DocumentType = "DataRoom";
      file.documentName = file.name;
      file.selectedKeys = [];
      this.fetchMetaTags(file);
      if (this.data?.categoryId) {
        file.folderId = this.data.categoryId;
        file.categoryId = this.data.categoryId;
        // this.setFileInfo(file, { id: this.data.categoryId }).then(() => {
        //   console.log('File info updated:', file);
        // });
      }
    });

    this.files.push(...newFiles);
    console.log('Files added:', newFiles);
  }

  async fetchMetaTags(file: CustomFile) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${environment.apiUrl1}/upload`, formData);
      const responseData = response.data as { MetaTags: string[] };
      file.documentMetaTags = responseData.MetaTags;
    } catch (error) {
      console.error('Error fetching meta tags:', error);
    }
  }

  // async setFileInfo(file: CustomFile, dataItem: any) {
  //   file.folderId = dataItem.id;
  //   if (this.data?.from !== 'My Personal Space') {
  //     // const res: any = await this.validateSpaceNFile(file);
  //     // file.isUploadable = !res.isFileExists;
  //   } else {
  //     file.isUploadable = true;
  //   }
  // }



  toggleEdit(file: CustomFile): void {
    file.editing = !file.editing;
  }

  saveFileEdit(file: CustomFile): void {
    file.editing = false;
    console.log('File updated:', file);
  }

  removeFile(file: CustomFile, index: number, event: Event): void {
    event.stopPropagation();
    this.files.splice(index, 1);
    console.log('File removed:', file);
  }
  getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }
uploadFiles(): void {
  console.log('Uploading files with permission:', this.selectedPermission);

  const dataRoom = this.dialogData?.DataRoom;
  const companyId = dataRoom?.companyId || 0;
  const clientId = dataRoom?.clientId || '';
const CategoryId = dataRoom?.categoryId || null;
    const MasterUserId = this.getCookie('MasterUserId') || '';
  const finalPermission = this.selectedPermission === 'inherit'
    ? dataRoom?.defaultPermission
    : this.selectedPermission;


  const preparedDocuments = this.files.map((file: CustomFile) => ({
    id: file.id || '',
    Name: file.documentName,
    Url: file.documentName,
    DocumentSize: file.size,
    Description: file.description || '',
    extension: file.extension || file.name.split('.').pop(),
    CloudSlug: 'Server',
    CategoryId: CategoryId || null,
    documentMetaDatas: file.documentMetaTags?.map(tag => ({ Metatag: tag })) || [],
    DocumentType: file.DocumentType || 'DataRoom',
    DocType: file.doc_Type || 'Non-Confidential',
    CompanyId: companyId,
    ClientId: clientId
  }));

  const fileRefs = this.files.map(file => ({
    documentName: file.documentName || file.name,
    fileRef: file
  }));

  const values = {
  MasterUserId :MasterUserId, 
    files: fileRefs,
    DataRoomId: this.dialogData?.dataRoomId || '',
    Documents: preparedDocuments,
    Permission: finalPermission,
    CompanyId: companyId,
    ClientId: clientId
  };

  console.log('Values prepared for upload:', values);

 
  this.manageDataRoomService.AddDocumentFromDataRoom(values).subscribe((event: any) => {
    if (event.status === 'progress') {
      // optional progress logic
    } else if (event.status === 'complete') {
      this.toastrService.success(event.response.message || 'Upload completed successfully');
      this.dataChanged.emit();
      this.dialogRef.close(true);
    }
  }, (error: any) => {
    if (error?.error?.message) {
      this.toastrService.error(error.error.message);
    } else {
      this.toastrService.error('Upload failed. Please try again.');
    }
  });
 
}



}
