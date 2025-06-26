import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExpiredRoutingModule } from './expired-routing.module';
import { ExpiredComponent } from './expired.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { ToastrModule } from 'ngx-toastr';


@NgModule({
  declarations: [
    ExpiredComponent
  ],
  imports: [
    CommonModule,
    ExpiredRoutingModule,

        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatDialogModule,
        ToastrModule.forRoot(),
  ],
  exports: [
    ExpiredComponent
  ]
})
export class ExpiredModule { }
