import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { EncryptionService } from '../../../core/services/encryption.service';
import { SecurityService } from '../../../core/services/security.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  activeMenu: string = 'dashboard';

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private securityService: SecurityService,
    private encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    // Listen to route changes to keep highlighting in sync
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.setActiveMenuFromUrl(event.urlAfterRedirects || event.url);
      });

    // Set active menu on initial load
    this.setActiveMenuFromUrl(this.router.url);
  }

  setActiveMenu(menu: string) {
    this.activeMenu = menu;
  }

  // setActiveMenuFromUrl(url: string) {
  //   if (url.includes('/dashboard')) this.activeMenu = 'dashboard';
  //   else if (url.includes('/profile')) this.activeMenu = 'profile';
  //   else if (url.includes('/layout')) this.activeMenu = 'dataRooms';
  //   else this.activeMenu = '';
  // }


  setActiveMenuFromUrl(url: string) {
  if (url.includes('/dashboard')) {
    this.activeMenu = 'dashboard';
  } else if (url.includes('/layout/profile')) {
    this.activeMenu = 'profile';
  } else if (url.includes('/layout/notilist')) {
    this.activeMenu = 'notificationlist';
  } else if (url.includes('/layout')) {
    this.activeMenu = 'dataRooms';
  } else {
    this.activeMenu = '';
  }
}


  // navigateTo(menu: string, route: string) {
  //   this.setActiveMenu(menu);

  //   if (menu === 'dataRooms') {
  //     const token = EncryptionService.encryptToToken(route);
  //     this.router.navigate(['/p', token]);
  //   } else if (menu === 'profile') {
  //        const token = EncryptionService.encryptToToken(route);
  //     this.router.navigate(['/p', token]);
  //   } else {
  //     this.router.navigate([route]);
  //   }
  // }


  navigateTo(menu: string, route: string) {
  this.setActiveMenu(menu);

  const token = EncryptionService.encryptToToken(route);

  if (menu === 'dataRooms' || menu === 'profile' || menu === 'notificationlist') {
    this.router.navigate(['/p', token]);
  } else {
    this.router.navigate([route]);
  }
}


  logoutUser(): void {
    this.securityService.logout();
    this.encryptionService.clearAllEncryptedData();
  }

  redirectToAuth(): void {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('s')) {
      // Do not redirect if 's' query param exists
      return;
    }
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
