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
  rememberMe: boolean = false;
  encryptionKey: string = 'loginKey';
  showPassword: boolean = false;
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

    // Check for remembered credentials
    const encryptedStr = localStorage.getItem('rememberedLogin');

    // console.log('Encrypted remembered login:', encryptedStr);
    if (encryptedStr) {
      try {
        const encryptedObj = JSON.parse(encryptedStr);
        const decrypted = this.encryptionService.decrypt(encryptedObj.encryptedData, encryptedObj.key);
        const creds = JSON.parse(decrypted);
        this.loginForm.patchValue({
          email: creds.email,
          password: creds.password
        });
        this.rememberMe = true;
      } catch (e) {
        localStorage.removeItem('rememberedLogin');
      }
    }
 
    
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

captchaChars: { char: string, style: any }[] = [];

generateCaptcha(): void {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;

  this.captchaText = '';
  this.captchaChars = [];

  for (let i = 0; i < length; i++) {
    const char = chars.charAt(Math.floor(Math.random() * chars.length));
    this.captchaText += char;

    const style = {
      color: this.getRandomColor(),
      display: 'inline-block',
      transform: `rotate(${(Math.random() - 0.5) * 30}deg) scale(${1 + Math.random() * 0.3})`,
      fontWeight: 'bold',
      fontSize: '30px',
      margin: '0 5px',
    };

    this.captchaChars.push({ char, style });
  }
}

getRandomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.floor(Math.random() * 30);
  const lightness = 40 + Math.floor(Math.random() * 20);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

  onLoginSubmit(): void {
    this.submitted = true;
const encryptedToken = EncryptionService.encryptToToken('/layout');
// this.router.navigate(['/p', encryptedToken]);
    if (this.loginForm.invalid) {
      return;
    }
    if (this.loginForm.value.captchaInput !== this.captchaText) {
      this.toastr.error('Invalid CAPTCHA', 'Error');
      this.loginForm.patchValue({ captchaInput: '' });
      this.loginForm.controls['captchaInput'].setErrors({ invalid: true });
      this.generateCaptcha();
      return;
    }
    this.dataRoomApiService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe({
      next: (response) => {
        if (response?.success) {
          this.toastr.success('Login successful');
          document.cookie = `UserToken=${response.token}; path=/; max-age=3600; SameSite=Strict`;
          // Remember Me logic
          if (this.rememberMe) {
            const creds = JSON.stringify({
              email: this.loginForm.value.email,
              password: this.loginForm.value.password
            });
            const encrypted = this.encryptionService.encrypt(creds);
            localStorage.setItem('rememberedLogin', JSON.stringify(encrypted));
          } else {
            localStorage.removeItem('rememberedLogin');
          }
          const encryptedToken = EncryptionService.encryptToToken('/layout');
          this.router.navigate(['/p', encryptedToken]);
        } else {
          this.toastr.error(response?.message || 'Login failed');
          localStorage.removeItem('rememberedLogin');
        }
      },
      error: (err) => {
        const errorMessage = err?.error?.message || 'An error occurred during login';
        this.toastr.error(errorMessage);
        localStorage.removeItem('rememberedLogin');
      }
    });
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