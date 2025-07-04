import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from '../services/encryption.service';

@Component({
  selector: 'app-public-redirect',
  templateUrl: './public-redirect.component.html',
})
export class PublicRedirectComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}
shortCode:any;
ngOnInit(): void {
  const token = this.route.snapshot.paramMap.get('token');
 const urlParams = new URLSearchParams(window.location.search);
    // console.log('URL Params:', urlParams);

    this.shortCode = urlParams.get('s') ?? '';
  if (token && !this.shortCode)  {
    try {
      const path = EncryptionService.decryptFromToken(token);
      this.router.navigateByUrl(path, { skipLocationChange: true });
    } catch (err) {
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.has('s')) {
        this.router.navigate(['/auth']);
      }
    }
  } 
}

  navigateToHome() {
    this.router.navigate(['/']);
  }

}