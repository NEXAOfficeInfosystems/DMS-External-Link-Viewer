import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SignatureService {
  private signatureImage: string | null = null;

  setSignature(signatureData: string) {
    this.signatureImage = signatureData;
  }

  getSignature(): string | null {
    return this.signatureImage;
  }
}
