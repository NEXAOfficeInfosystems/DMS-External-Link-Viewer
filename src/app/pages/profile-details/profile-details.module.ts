import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileDetailsRoutingModule } from './profile-details-routing.module';
import { ProfileDetailsComponent } from './profile-details.component';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  declarations: [ProfileDetailsComponent],
  imports: [
    CommonModule,
    ProfileDetailsRoutingModule,
    FormsModule,
    MatChipsModule
  ]
})
export class ProfileDetailsModule {}
