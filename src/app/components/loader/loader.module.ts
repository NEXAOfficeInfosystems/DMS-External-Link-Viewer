import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoaderComponent } from './loader.component';
import { CommonDialogService } from '../../shared/components/common-dialog/common-dialog.service';
import { ToastrModule } from 'ngx-toastr';


@NgModule({
  declarations: [
    LoaderComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
    LoaderComponent

  ],
  providers: [
    CommonDialogService
  ]
})
export class LoaderModule { }
