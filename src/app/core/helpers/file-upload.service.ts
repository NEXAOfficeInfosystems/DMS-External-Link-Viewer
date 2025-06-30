import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FileUploadStatus {
  fileName?: string;
  fileSize?: number;
  progress: number;
  status: 'uploading' | 'completed' | 'failed' | 'Moving' | 'Moved' | 'Deleting' | 'Deleted';
  message?: string;
  isFromServer?: string;
  ErrorMessage?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private uploadStatusSubject = new BehaviorSubject<FileUploadStatus[]>([]);
  uploadStatus$ = this.uploadStatusSubject.asObservable();

  private allUploadStatuses: FileUploadStatus[] = []; // Persistent list of all uploads

  updateFileStatus(status: FileUploadStatus) {
    const index = this.allUploadStatuses.findIndex((s) => s.fileName === status.fileName);
    if (index !== -1) {
      // Update the existing file status
      this.allUploadStatuses[index] = { ...this.allUploadStatuses[index], ...status };
    } else {
      // Add a new file status
      this.allUploadStatuses.push(status);
    }
    // Emit the updated array
    this.uploadStatusSubject.next([...this.allUploadStatuses]);
  }

  resetStatuses() {
    this.allUploadStatuses = [];
    this.uploadStatusSubject.next([]);
  }

  getAllUploadStatuses(): FileUploadStatus[] {
    return [...this.allUploadStatuses];
  }
}
