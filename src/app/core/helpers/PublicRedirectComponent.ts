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

ngOnInit(): void {
  const token = this.route.snapshot.paramMap.get('token');

  if (token) {
    try {
      const path = EncryptionService.decryptFromToken(token);
      this.router.navigateByUrl(path, { skipLocationChange: true });
    } catch (err) {
      this.router.navigate(['/auth']);
    }
  } else {
    this.router.navigate(['/auth']);
  }
}

  navigateToHome() {
    this.router.navigate(['/']);
  }

}