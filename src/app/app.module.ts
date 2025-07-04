import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
  import { BrowserModule } from '@angular/platform-browser';
  import { AppRoutingModule } from './app-routing.module';
  import { AppComponent } from './app.component';
  import { HttpClientModule } from '@angular/common/http';
  import { RouterModule } from '@angular/router';
  import { MatChipsModule } from '@angular/material/chips';
  import { MatIconModule } from '@angular/material/icon';
  import { MatTableModule } from '@angular/material/table';
  import { MatSortModule } from '@angular/material/sort';
  import { MatPaginatorModule } from '@angular/material/paginator';
  import { MatButtonModule } from '@angular/material/button';
  import { MatTabsModule } from '@angular/material/tabs';
  import { MatButtonToggleModule } from '@angular/material/button-toggle';
  import { SharedModule } from './shared/shared.module';
  import { LayoutComponent } from './layout/layout.component';
  import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PagesModule } from './pages/pages.module';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
} from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { createTranslateLoader } from '../app/core/helpers/translater-loader';
 import {  Routes } from '@angular/router';
import { CommonDialogService } from './shared/components/common-dialog/common-dialog.service';
import { CoreModule } from './core/core.module';
// const routes: Routes = [
//   // Other routes
//   { path: 'error-500', component: Error500Component },

//   { path: 'error-404', component: Error404Component }, // Route for error-404
//   { path: '**', redirectTo: '/error-404' },
// ];


@NgModule({
    declarations: [
      AppComponent,
      // LoaderComponent, // Uncommented to fix 'app-loader' error
      LayoutComponent,
   
    ],
    imports: [
      BrowserModule,
      AppRoutingModule,
      HttpClientModule,
      RouterModule,
    MatTabsModule,
BrowserAnimationsModule,
      MatChipsModule,
      MatIconModule,
      MatTableModule,
      MatSortModule,
      MatPaginatorModule,
      MatButtonModule,
     CoreModule,
      MatButtonToggleModule,

      // below is my feature  modules
      SharedModule,
   ToastrModule.forRoot({
      timeOut: 1400,
    }),
   PagesModule,
  // RouterModule.forRoot(routes, {
  //     scrollPositionRestoration: 'enabled',
  //     useHash: false,
  //   }),

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
      
    ],
    providers: [
      CommonDialogService
          // { provide: DOCUMENT, useValue: document }
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
  })
  export class AppModule { }
