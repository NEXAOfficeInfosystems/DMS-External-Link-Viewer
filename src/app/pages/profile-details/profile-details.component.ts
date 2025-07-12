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
isFormDirty = false;
showChangePasswordFields = false;
originalUserDetails: any = null;
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
    
    this.latestUserDetails = JSON.parse(JSON.stringify(userDetails)); // clone for comparison
    this.originalUserDetails = JSON.parse(JSON.stringify(userDetails));
   if (userDetails?.User?.Password) {
      this.oldPassword = userDetails.User.Password; 
    }
      console.log( this.latestUserDetails,"Dsddsdsdsds")
      if (userDetails && userDetails.CompanyNames) {
        this.departments = userDetails.CompanyNames;
      }
    });
  }

profileImageUrl: string | ArrayBuffer | null = null;
selectedImageFile: File | null = null;

onProfileImageSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.selectedImageFile = file;
    this.profileImageUrl = URL.createObjectURL(file);
    this.isFormDirty = true;
  }
}
onInputChange(): void {
  this.isFormDirty = this.checkIfFormChanged();
}
enablePasswordFields: boolean = false;
isFormChanged = false;

checkIfFormChanged(): boolean {
  const current = this.latestUserDetails?.User;
  const original = this.originalUserDetails?.User;

  const isNameChanged = current?.Name !== original?.Name;
  const isPasswordBeingChanged = !!this.oldPassword || !!this.newPassword || !!this.confirmPassword;
  const isImageChanged = !!this.selectedImageFile;

  this.isFormChanged = isNameChanged || isPasswordBeingChanged || isImageChanged;
  return this.isFormChanged;
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

    const email = form.value.email || this.latestUserDetails?.User?.Email;
const name = form.value.name || this.latestUserDetails?.User?.Name;
    // Construct FormData for file + fields
    const formData = new FormData();
    formData.append('userId', this.userId);
    formData.append('email', email);
    formData.append('oldPassword', this.oldPassword);
    formData.append('newPassword', this.newPassword);
    formData.append('confirmPassword', this.confirmPassword);
      formData.append('name', name);

    // Attach file if selected
    if (this.selectedImageFile) {
      formData.append('profilePicture', this.selectedImageFile);
    }

    this.dataRoomApiService.updateUserDetails(formData).subscribe(
      response => {
        this.toasterservice.success('Password updated successfully');
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.has('s')) {
          this.router.navigate(['/auth']);
        }
      },
      error => {
        console.error('Error updating user details:', error);
          const message = error?.message || 'An unexpected error occurred.';
    this.toasterservice.error(message);
      }
    );
  }
}

}
