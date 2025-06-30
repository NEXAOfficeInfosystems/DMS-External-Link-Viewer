import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DataRoomApiService } from 'src/app/core/services/DataRoomApiService.service';
import { EncryptionService } from 'src/app/core/services/encryption.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm!: FormGroup;
  forgotPasswordForm!: FormGroup;
  submitted = false;
  forgotPasswordSubmitted = false;
  showRegister = false; 
  showForgotPassword = false; 
  captchaText: string = '';
  loading: any;
  users: any[] = []; 
  constructor(private fb: FormBuilder, private router: Router,
private toastr: ToastrService,
    private dataRoomApiService: DataRoomApiService,
    private encryptionService: EncryptionService // Assuming you have this service for encryption
  ) {
   
  }

  ngOnInit(): void {
  
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      captchaInput: ['', Validators.required],
    
    });


 
    
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });


  }


  openRegisterSection(event?: Event): void {
    if (event) event.preventDefault();
    this.showRegister = true;
    this.showForgotPassword = false;
  }


  openLoginSection(): void {
    this.showRegister = false;
    this.showForgotPassword = false;
    setTimeout(() => {
      this.generateCaptcha();
    }, 10);

  }

  openForgotPasswordSection(event?: Event): void {
    if (event) event.preventDefault();
    this.showForgotPassword = true;
    this.showRegister = false;

  }
  ngAfterViewInit(): void {
    this.generateCaptcha();
  }

  generateCaptcha(): void {
    const canvas = document.getElementById('captchaCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;


    ctx.clearRect(0, 0, canvas.width, canvas.height);

  
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    this.captchaText = Array(6)
      .fill(0)
      .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
      .join('');

  
    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = this.getRandomColor();
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

   
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = this.getRandomColor(); 
      ctx.lineWidth = Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }


    ctx.font = 'bold 40px Arial';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < this.captchaText.length; i++) {
      const char = this.captchaText[i];
      ctx.fillStyle = this.getRandomColor();
      const x = 30 + i * 35;
      const y = 40 + Math.random() * 10 - 5; 
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.4); 
      ctx.scale(1 + Math.random() * 0.2, 1 + Math.random() * 0.2); 
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }

  getRandomColor(): string {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 60 + Math.floor(Math.random() * 30); 
    const lightness = 40 + Math.floor(Math.random() * 20);
    return `hsl(${hue},${saturation}%,${lightness}%)`;
  }

  onLoginSubmit(): void {
    this.submitted = true;
const encryptedToken = EncryptionService.encryptToToken('/layout');
this.router.navigate(['/p', encryptedToken]);
//     if (this.loginForm.invalid) {
//       return;
//     }

//     if (this.loginForm.value.captchaInput !== this.captchaText) {
//       this.toastr.error('Invalid CAPTCHA', 'Error');
//       this.loginForm.patchValue({ captchaInput: '' });
//       this.loginForm.controls['captchaInput'].setErrors({ invalid: true });
//       this.generateCaptcha();
//       return;
//     }

//     this.dataRoomApiService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe({
//       next: (response) => {
//         if (response?.success) {
//          this.toastr.success('Login successful');
//       document.cookie = `UserToken=${response.token}; path=/; max-age=3600; SameSite=Strict`;

// const encryptedToken = EncryptionService.encryptToToken('/layout');
// this.router.navigate(['/p', encryptedToken]);

//         } else {
//           this.toastr.error(response?.message || 'Login failed');
//         }
//       },
//       error: (err) => {
//         const errorMessage = err?.error?.message || 'An error occurred during login';
//         this.toastr.error(errorMessage);
//       }
//     });
  }



  onForgotPasswordSubmit(): void {
    this.forgotPasswordSubmitted = true;

    if (this.forgotPasswordForm.invalid) {
      return;
    }

    // console.log('Forgot Password Form Submitted:', this.forgotPasswordForm.value);
    this.openLoginSection(); 
  }
 
  get f() {
    return this.loginForm.controls;
  }
}