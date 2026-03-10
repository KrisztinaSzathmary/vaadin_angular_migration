import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';
import { TranslateTestModule } from '../../testing/translate-testing';

describe('LanguageService', () => {
  let service: LanguageService;
  let translateService: TranslateService;

  function clearCookies(): void {
    document.cookie = 'bookstore-lang=; max-age=0; path=/';
  }

  beforeEach(() => {
    clearCookies();

    TestBed.configureTestingModule({
      imports: [TranslateTestModule],
    });

    translateService = TestBed.inject(TranslateService);
    service = TestBed.inject(LanguageService);
  });

  afterEach(() => {
    clearCookies();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to English when no cookie is set', () => {
    expect(service.currentLanguage()).toBe('en');
  });

  it('should set default language on TranslateService', () => {
    expect(translateService.getDefaultLang()).toBe('en');
  });

  it('should have two available languages', () => {
    expect(service.availableLanguages).toEqual([
      { code: 'en', label: 'English' },
      { code: 'de', label: 'Deutsch' },
    ]);
  });

  it('should switch language and update signal', () => {
    service.switchLanguage('de');
    expect(service.currentLanguage()).toBe('de');
  });

  it('should persist language in cookie on switchLanguage', () => {
    service.switchLanguage('de');
    expect(document.cookie).toContain('bookstore-lang=de');
  });

  it('should call TranslateService.use on switchLanguage', () => {
    const useSpy = jest.spyOn(translateService, 'use');
    service.switchLanguage('de');
    expect(useSpy).toHaveBeenCalledWith('de');
  });

  it('should read language from cookie on init', () => {
    document.cookie = 'bookstore-lang=de; path=/';

    // Re-create the service to test init behavior
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TranslateTestModule],
    });

    const freshService = TestBed.inject(LanguageService);
    expect(freshService.currentLanguage()).toBe('de');
  });
});
