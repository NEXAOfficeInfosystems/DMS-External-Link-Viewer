import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode, JwtPayload } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class SecurityService {
  private inactivityTimer: any;

  constructor(private cookieService: CookieService) {
    this.initInactivityListener();
  }

  private initInactivityListener() {
    const resetTimer = () => {
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer);
      }
      this.inactivityTimer = setTimeout(() => {
        this.resetSecurityObject();
        if ((window as any).location) {
          (window as any).location.href = '/public/auth';
        }
      }, 3600000); // 1 hour = 3600000 ms
    };
    // Listen for user activity
    ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'].forEach((event) => {
      window.addEventListener(event, resetTimer, true);
    });
    resetTimer(); // Start timer on load
  }

  isUserAuthenticate(): boolean {
   
    return true;
  }

  logout(): void {
    this.resetSecurityObject();
  }

  private resetSecurityObject(): void {
    const allCookies = this.cookieService.getAll();

    Object.keys(allCookies).forEach((key) => {
      this.cookieService.delete(key);
      this.cookieService.delete(key, '/');
      this.cookieService.delete(key, '/', location.hostname);
    });

    // Clear local and session storage
    localStorage.clear();
    sessionStorage.clear();
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) {
    //   console.log(`Cookie ${name} found:`, match[2]);
    } else {
    //   console.warn(`Cookie ${name} not found`);
    }
    return match ? match[2] : null;
  }
}
