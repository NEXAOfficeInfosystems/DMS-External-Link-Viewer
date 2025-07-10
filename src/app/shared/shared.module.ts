import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MainContentComponent } from './components/main-content/main-content.component';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs'; // Needed for tabs
import { ActiveModule } from '../pages/active/active.module';
import { ExpiredModule } from '../pages/expired/expired.module';
import { AuditLogModule } from '../pages/audit-log/audit-log.module';
import { CommonheaderComponent } from './components/commonheader/commonheader.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { CommonDialogComponent } from './components/common-dialog/common-dialog.component';
import { ImagePreviewComponent } from './components/image-preview/image-preview.component';
import { OfficeViewerComponent } from './components/office-viewer/office-viewer.component';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Error404Component } from './components/error-404/error-404.component';
import { PdfViewerComponent } from './components/pdf-viewer/pdf-viewer.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { SafeUrlPipe } from './pipes/safe-url.pipe';

@NgModule({
  declarations: [
    HeaderComponent,
    SidebarComponent,
    MainContentComponent,
    CommonheaderComponent,
    ConfirmationDialogComponent,
    CommonDialogComponent,
    ImagePreviewComponent,
    OfficeViewerComponent,
    PdfViewerComponent,
    Error404Component,
    SafeUrlPipe
  ],
  imports: [
    NgxExtendedPdfViewerModule,
    CommonModule,
    RouterModule,
    MatTabsModule,
    ActiveModule,
    ExpiredModule,
    AuditLogModule,
    FormsModule,
    MatTooltipModule,
    TranslateModule
  ],
  exports: [
    HeaderComponent,
    SidebarComponent,
    MainContentComponent,
    CommonheaderComponent,
    ConfirmationDialogComponent,
    CommonDialogComponent,
    ImagePreviewComponent,
    OfficeViewerComponent,
    Error404Component,
    PdfViewerComponent,
    SafeUrlPipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
