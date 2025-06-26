import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActiveRoutingModule } from './active-routing.module';
import { ActiveComponent } from './active.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [ActiveComponent],
  imports: [
    CommonModule,
    ActiveRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    ToastrModule.forRoot(),
  ],
  exports: [ActiveComponent],
})
export class ActiveModule {}