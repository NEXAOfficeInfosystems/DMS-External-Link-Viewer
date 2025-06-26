import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './AuthRoutingModule';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
     FormsModule,
    ReactiveFormsModule,
      AuthRoutingModule,
  ],
    exports: [
    LoginComponent
  ]
})
export class AuthModule { }
