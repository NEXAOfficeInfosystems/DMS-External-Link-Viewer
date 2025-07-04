import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-error-404',
  templateUrl: './error-404.component.html',
  styleUrls: ['./error-404.component.css']
})
export class Error404Component {

  constructor(private router: Router) {}

  navigateToHome() {
    this.router.navigate(['/']);
      //  window.location.href = environment.gmfurl+'dashboard';
  }
}
