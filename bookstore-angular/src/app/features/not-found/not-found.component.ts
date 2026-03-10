import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  template: `
    <div class="flex h-full flex-col items-center justify-center gap-4 p-6">
      <mat-icon class="text-gray-300 text-[64px] h-16 w-16">search_off</mat-icon>
      <p class="text-lg text-gray-600">{{ 'NOT_FOUND.MESSAGE' | translate }}</p>
    </div>
  `,
  imports: [MatIconModule, TranslatePipe],
})
export class NotFoundComponent {}
