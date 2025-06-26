import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-common-dialog',
  templateUrl: './common-dialog.component.html',
  styleUrls: ['./common-dialog.component.css']
})
export class CommonDialogComponent {
  primaryMessage: string = '';
  constructor(public dialogRef: MatDialogRef<CommonDialogComponent>,
    // private translationService:TranslationService,
    private toastrService: ToastrService
  ) { }

  clickHandler(data: boolean): void {
    if (data === true) {
      // this.toastrService.success(this.translationService.getValue(`FOLDER_DELETED_SUCCESSFULLY`));
    }
    this.dialogRef.close(data);
  }
  

}
