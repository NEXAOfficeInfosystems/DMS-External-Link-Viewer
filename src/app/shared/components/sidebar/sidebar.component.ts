import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { EncryptionService } from '../../../core/services/encryption.service';
import { SecurityService } from '../../../core/services/security.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
    @Input() collapsed = false;

  @Output() toggle = new EventEmitter<void>();
  AllEncryptedPaths: any;


    constructor(private router: Router, 
      public dialog: MatDialog, 
      private securityService: SecurityService,
      private encryptionService: EncryptionService) {



  

  }




  logoutUser(): void {
    this.securityService.logout();
    this.encryptionService.clearAllEncryptedData();
  }

  redirectToAuth(): void {
    this.router.navigate(['/auth']);
  }

  onLogout(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      maxHeight: '30vh',
      height: 'auto',
      width: '30vw',
      disableClose: true
    });


    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.logoutUser();
        this.redirectToAuth();
      }
    });
  }


  
}
