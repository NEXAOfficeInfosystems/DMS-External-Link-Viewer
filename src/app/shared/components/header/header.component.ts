import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DataRoomApiService } from 'src/app/core/services/DataRoomApiService.service';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { TranslationService } from 'src/app/core/services/TranslationService';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  userDetails$: Observable<any> = new Observable();

  constructor(private dataRoomApiService: DataRoomApiService,


    private translationService:TranslationService,
    private cookieservice: CookieService
  ) {}

ngOnInit(): void {
  const userId = this.cookieservice.get('MasterUserId');
  this.dataRoomApiService.getUserDetailsById(userId);
  this.userDetails$ = this.dataRoomApiService.getUserDetailsObservable();
}


@Output() toggleSidebar = new EventEmitter<void>();
 
  onToggle() {
    this.toggleSidebar.emit();
  }

  changeLang(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const lang = selectElement.value;
    this.translationService.setLanguage(lang).subscribe(() => {
      // Flip layout direction without reloading the page
      const direction = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', direction);
      document.documentElement.setAttribute('lang', lang);

      // Optionally update other visual states or CSS classes here if needed
    });
  }

}



