import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode, JwtPayload } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class SecurityService {

     constructor(private cookieService: CookieService) {}
  isUserAuthenticate(): boolean {
    const token = this.getCookie('UserToken');
    if (!token) {
  
      return false;
    }

    try {
      const decoded: JwtPayload = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);

      if (decoded.exp && decoded.exp > currentTime) {

        return true; 
      } else {
     
        return false; 
      }
    } catch (e) {
      console.error('Invalid token:', e);
      return false;
    }
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
