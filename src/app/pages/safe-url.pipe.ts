import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl'
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | SafeUrl | SafeResourceUrl, resourceType: 'resource' | 'url' = 'resource'): SafeResourceUrl | SafeUrl {
    if (!value) {
      return '';
    }
    
    // If it's already a SafeValue, return it as is
    if (typeof value !== 'string') {
      return value;
    }
    
    // For iframe src attributes, use SafeResourceUrl
    if (resourceType === 'resource') {
      return this.sanitizer.bypassSecurityTrustResourceUrl(value);
    }
    
    // For img src attributes, use SafeUrl
    return this.sanitizer.bypassSecurityTrustUrl(value);
  }
}
