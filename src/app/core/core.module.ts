import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicRedirectComponent } from './helpers/PublicRedirectComponent';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [PublicRedirectComponent],
  imports: [
    CommonModule,
    SharedModule // Import SharedModule to make Error404Component available
  ],
  exports: [PublicRedirectComponent]
})
export class CoreModule { }
