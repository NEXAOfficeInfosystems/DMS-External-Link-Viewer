import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { ActiveModule } from './active/active.module';
import { ExpiredModule } from './expired/expired.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { DataroomdetailsComponent } from './dataroomdetails/dataroomdetails.component';
import { SharedModule } from '../shared/shared.module'; // Import SharedModule
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { UploadDocDataRoomComponent } from './upload-doc-data-room/upload-doc-data-room.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    DataroomdetailsComponent,
    UploadDocDataRoomComponent
  ],
  imports: [
    CommonModule,
     MatTabsModule,
    MatTableModule,
      MatButtonToggleModule,
    PagesRoutingModule,
    ActiveModule,
    ExpiredModule,
    AuditLogModule,
        MatPaginatorModule,
    MatSortModule,
    SharedModule, // Add SharedModule here
    MatIconModule // Add MatIconModule here
    ,
    FormsModule,
    TranslateModule
  ]
})
export class PagesModule { }
