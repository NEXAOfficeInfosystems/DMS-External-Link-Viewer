import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import * as LZString from 'lz-string';
@Injectable({ providedIn: 'root' })
export class EncryptionService {
  private static readonly STATIC_KEY = 'THISISTHEKEYFORDATAROOMSECURITY1234'; // Must be 32 characters for AES-256


  static encryptStatic(data: string): string {
    const encrypted = CryptoJS.AES.encrypt(data, this.STATIC_KEY).toString();
    return btoa(encrypted).replace(/=+$/, '');
  }

  static decryptStatic(encryptedData: string): string {
    const decoded = atob(encryptedData);
    const bytes = CryptoJS.AES.decrypt(decoded, this.STATIC_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }


  encrypt(data: string): { encryptedData: string; key: string } {
    const key = this.generateRandomKey(32);
    const encrypted = CryptoJS.AES.encrypt(data, key).toString();
    return {
      encryptedData: btoa(encrypted),
      key,
    };
  }

  decrypt(encryptedData: string, key: string): string {
    const decoded = atob(encryptedData);
    const bytes = CryptoJS.AES.decrypt(decoded, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }



static encryptToToken(data: string): string {
  const encrypted = CryptoJS.AES.encrypt(data, this.STATIC_KEY).toString();
  const base64 = btoa(encrypted);

  const urlSafe = base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return urlSafe;
}

static decryptFromToken(token: string): string {
  let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
  const pad = 4 - (base64.length % 4);
  if (pad !== 4) {
    base64 += '='.repeat(pad);
  }

  const decrypted = atob(base64);
  const bytes = CryptoJS.AES.decrypt(decrypted, this.STATIC_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}



  clearAllEncryptedData(): void {
    localStorage.removeItem('encryptedData');
  }



  private generateRandomKey(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }


  ///..belwo is for decrypt from response
static decryptResponse(encryptedData: string, encryptedKey: string, encryptedIV: string): any {

  const key = CryptoJS.enc.Base64.parse(encryptedKey);
  const iv = CryptoJS.enc.Base64.parse(encryptedIV);


  const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  const plainText = decrypted.toString(CryptoJS.enc.Utf8);
  return JSON.parse(plainText);
}

}
