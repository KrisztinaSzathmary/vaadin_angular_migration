import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  showSuccess(message: string): void {
    this.snackBar.open(message, this.translate.instant('ACTIONS.CLOSE'), { duration: 3000 });
  }

  showError(message: string): void {
    this.snackBar.open(message, this.translate.instant('ACTIONS.CLOSE'), { duration: 5000 });
  }
}
