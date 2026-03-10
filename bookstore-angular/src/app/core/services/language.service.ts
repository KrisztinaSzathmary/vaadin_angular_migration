import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface LanguageOption {
  code: string;
  label: string;
}

const COOKIE_NAME = 'bookstore-lang';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds
const DEFAULT_LANGUAGE = 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);

  readonly availableLanguages: LanguageOption[] = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
  ];

  readonly currentLanguage = signal(this.getStoredLanguage());

  constructor() {
    this.translate.setDefaultLang(DEFAULT_LANGUAGE);
    this.translate.use(this.currentLanguage());
  }

  switchLanguage(lang: string): void {
    this.currentLanguage.set(lang);
    this.setLanguageCookie(lang);
    this.translate.use(lang);
  }

  private getStoredLanguage(): string {
    const cookie = document.cookie.split('; ').find((row) => row.startsWith(`${COOKIE_NAME}=`));
    if (cookie) {
      const value = cookie.split('=')[1];
      if (this.availableLanguages.some((l) => l.code === value)) {
        return value;
      }
    }
    return DEFAULT_LANGUAGE;
  }

  private setLanguageCookie(lang: string): void {
    document.cookie = `${COOKIE_NAME}=${lang}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
  }
}
