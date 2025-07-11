import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { DataRoomApiService } from 'src/app/core/services/DataRoomApiService.service';
import { EncryptionService } from 'src/app/core/services/encryption.service';
import { TranslationService } from 'src/app/core/services/TranslationService';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss']
})
export class ProfileDetailsComponent implements OnInit {
  userDetails$: Observable<any> = new Observable();
  latestUserDetails: any = null;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  departments: string[] = [];
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  userId: any;

  constructor(
    private dataRoomApiService: DataRoomApiService,
    private translationService: TranslationService,
    private cookieservice: CookieService,
    private toasterservice: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.cookieservice.get('MasterUserId');

    this.dataRoomApiService.getUserDetailsObservable().subscribe(userDetails => {
      this.userDetails$ = new Observable(observer => {
        observer.next(userDetails);
        observer.complete();
      });
      this.latestUserDetails = userDetails;

      console.log( this.latestUserDetails,"Dsddsdsdsds")
      if (userDetails && userDetails.CompanyNames) {
        this.departments = userDetails.CompanyNames;
      }
    });
  }


  navigateTo(menu: string, route: string) {

  const token = EncryptionService.encryptToToken(route);

  if (menu === 'dataRooms') {
    this.router.navigate(['/p', token]);
  } else {
    this.router.navigate([route]);
  }
}


  onSave(form: any) {

    if (form.invalid) {
      this.toasterservice.error('Please fill in all required fields');
      return;
    }
    if (form.valid &&
        this.oldPassword !== this.newPassword &&
        this.newPassword === this.confirmPassword) {

      let email = form.value.email || this.latestUserDetails?.User?.Email;
console.log(this.latestUserDetails,"emaidlsdlsd");
      const payload = {
        ...form.value,
        userId: this.userId,
        email: email
      };

      this.dataRoomApiService.updateUserDetails(payload).subscribe(
        response => {
          this.toasterservice.success('Password updated successfully');
          const urlParams = new URLSearchParams(window.location.search);
          if (!urlParams.has('s')) {
            this.router.navigate(['/auth']);
          }
        },
        error => {
          console.error('Error updating user details:', error);
        }
      );
    }
  }
}
