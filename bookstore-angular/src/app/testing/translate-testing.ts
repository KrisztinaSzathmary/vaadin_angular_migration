import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

/* eslint-disable @typescript-eslint/no-require-imports */
const enTranslations: Record<string, string> = require('../../../public/i18n/en.json');
/* eslint-enable @typescript-eslint/no-require-imports */

export class FakeTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of(enTranslations);
  }
}

@NgModule({
  imports: [
    TranslateModule.forRoot({
      loader: { provide: TranslateLoader, useClass: FakeTranslateLoader },
    }),
  ],
  exports: [TranslateModule],
})
export class TranslateTestModule {
  constructor(translate: TranslateService) {
    translate.use('en');
  }
}
