import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

export interface Locale {
  lang: string;
  data: any;
}

const LOCALIZATION_LOCAL_STORAGE_KEY = 'language';
const RTL_LANGUAGES = ['ar']; // Arabic is RTL

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private langIds: string[] = [];

  constructor(private translate: TranslateService) {
    // Set default language to English on service init
    const savedLang = this.getSelectedLanguage();
    this.translate.setDefaultLang('en');
    this.setLanguage(savedLang || 'en');
  }

  loadTranslations(...args: Locale[]): void {
    args.forEach((locale) => {
      this.translate.setTranslation(locale.lang, locale.data, true);
      this.langIds.push(locale.lang);
    });

    this.translate.addLangs(this.langIds);
  }

setLanguage(lang: string): any {
  try {
    if (!lang) return of(null);


    localStorage.setItem(LOCALIZATION_LOCAL_STORAGE_KEY, lang);

    
    const isRtl = ['ar', 'he', 'fa', 'ur'].includes(lang); 
    const direction = isRtl ? 'rtl' : 'ltr';

    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', lang);

  
    document.body.classList.remove('rtl', 'ltr');
    document.body.classList.add(direction);

  
    return this.translate.use(lang);
  } catch (error) {
    console.error('Error setting language:', error);
    return of(null);
  }
}



  removeLanguage() {
    try {
      localStorage.removeItem(LOCALIZATION_LOCAL_STORAGE_KEY);
    } catch {}
  }

  getSelectedLanguage(): string {
    try {
      return (
        localStorage.getItem(LOCALIZATION_LOCAL_STORAGE_KEY) ||
        this.translate.getDefaultLang()
      );
    } catch {
      return 'en';
    }
  }

  getValue(key: string): string {
    return this.translate.instant(key);
  }
}
