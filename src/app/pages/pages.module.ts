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
import { SharedModule } from 'src/app/shared/shared.module'; // Import SharedModule
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { UploadDocDataRoomComponent } from './upload-doc-data-room/upload-doc-data-room.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip'; // Import MatTooltipModule
import { FileViewerDialogComponent } from './file-viewer-dialog-component/file-viewer-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SafeUrlPipe } from './safe-url.pipe';
import { ProfileDetailsComponent } from './profile-details/profile-details.component';
import { ProfileDetailsModule } from './profile-details/profile-details.module';


@NgModule({
  declarations: [
    DataroomdetailsComponent,
    UploadDocDataRoomComponent,
    FileViewerDialogComponent,
    SafeUrlPipe,
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatTabsModule,
    MatTableModule,
    MatButtonToggleModule,
    PagesRoutingModule,
    ProfileDetailsModule,
    ActiveModule,
    ExpiredModule,
    AuditLogModule,
    MatPaginatorModule,
    MatSortModule,
    SharedModule,
    MatIconModule,
    FormsModule,
    TranslateModule,
    MatTooltipModule,
  ],
  exports : [
    DataroomdetailsComponent
  ]
})
export class PagesModule { }
