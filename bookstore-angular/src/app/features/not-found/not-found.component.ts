import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  template: `
    <div class="flex h-full flex-col items-center justify-center gap-4 p-6">
      <mat-icon class="text-gray-300 text-[64px] h-16 w-16">search_off</mat-icon>
      <p class="text-lg text-gray-600">The view could not be found.</p>
    </div>
  `,
  imports: [MatIconModule],
})
export class NotFoundComponent {}
