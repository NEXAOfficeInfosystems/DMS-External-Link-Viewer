import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { DataRoomApiService } from 'src/app/core/services/DataRoomApiService.service';
import { TranslationService } from 'src/app/core/services/TranslationService';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss']
})
export class ProfileDetailsComponent implements OnInit  {
  userDetails$: Observable<any> = new Observable();
  showPassword = false;
  showOldPassword = false;
  showNewPassword = false;
  departments: string[] = ['NEXA Officeinfosystems', 'Officeinfosystems'];

  oldPassword: string = '';
  newPassword: string = '';

  constructor(
    private dataRoomApiService: DataRoomApiService,
    private translationService:TranslationService,
    private cookieservice: CookieService,
  private toasterservice: ToastrService,
  private router: Router
  ) {}
userId :any;
  ngOnInit(): void {
    this.userDetails$ = this.dataRoomApiService.getUserDetailsObservable();
    this.userId = this.cookieservice.get('MasterUserId');
  }

  onSave(form: any) {
    if (form.valid && this.oldPassword !== this.newPassword) {
    
      let email = '';
      if (this.userDetails$ && (form.controls['email']?.model || form.value.email)) {
        email = form.controls['email']?.model || form.value.email;
      } else if (form.controls['name']?.model?.email) {
        email = form.controls['name']?.model?.email;
      } else if ((form.value && form.value.name && form.value.name.email)) {
        email = form.value.name.email;
      }
      if (!email && typeof document !== 'undefined') {
        const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
        if (emailInput) email = emailInput.value;
      }
      if (!email && this.userDetails$ && (this.userDetails$ as any).user?.email) {
        email = (this.userDetails$ as any).user.email;
      }
   
      const payload = {
        ...form.value,
        userId: this.userId ,
        email: email
      };
      this.dataRoomApiService.updateUserDetails(payload).subscribe(
        response => {
          console.log('User details updated successfully:', response);

          this.toasterservice.success('Password updated successfully');
          const urlParams = new URLSearchParams(window.location.search);
          if (!urlParams.has('s')) {
            this.router.navigate(['/auth']);
          }
          //  this.userDetails$ = this.dataRoomApiService.getUserDetailsObservable();

    
        },
        error => {
          console.error('Error updating user details:', error);
        }
      );
    }
  }
}
