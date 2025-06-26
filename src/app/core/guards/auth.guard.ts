import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  Route,
} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { SecurityService } from '../services/security.service';
import { EncryptionService } from '../services/encryption.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(
    private securityService: SecurityService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.securityService.isUserAuthenticate()) {
      return true;
    } else {
      this.toastr.error('You are not authorized to access this page.');
      const encryptedAuthPath = EncryptionService.encryptStatic('auth');
      const encryptedReturn = EncryptionService.encryptStatic(state.url);
      this.router.navigate([`/${encryptedAuthPath}`], {
        queryParams: { returnUrl: encryptedReturn },
      });
      return false;
    }
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(next, state);
  }

  canLoad(route: Route): boolean {
    if (this.securityService.isUserAuthenticate()) {
      return true;
    } else {
      const encryptedAuthPath = EncryptionService.encryptStatic('auth');
      this.router.navigate([`/${encryptedAuthPath}`]);
      return false;
    }
  }
}
