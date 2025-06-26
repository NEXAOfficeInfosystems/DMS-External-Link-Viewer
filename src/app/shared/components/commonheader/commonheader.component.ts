import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { EncryptionService } from '../../../core/services/encryption.service';

@Component({
  selector: 'app-commonheader',
  templateUrl: './commonheader.component.html',
  styleUrls: ['./commonheader.component.scss']
})
export class CommonheaderComponent {
  @Input() dataRoom?: any;

  constructor(private router: Router, private encryptionService: EncryptionService) {
    console.log('CommonHeaderComponent initialized');
  }

  ngOnChanges(): void {
    console.log('Data Room Input:', this.dataRoom);
    if (!this.dataRoom?.name) {
      console.warn('Data Room name is missing or undefined');
    }
  }

  goToMyDataRooms() {
    const path = '/layout';
    const token = EncryptionService.encryptToToken(path);
    this.router.navigate(['/p', token]);
  }

}
