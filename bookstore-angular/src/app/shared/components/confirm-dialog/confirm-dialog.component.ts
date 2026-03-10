import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

export interface ConfirmDialogData {
  message: string;
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h2 mat-dialog-title>{{ 'CONFIRM.TITLE' | translate }}</h2>
    <mat-dialog-content>
      <p class="text-sm text-gray-700">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ 'ACTIONS.CANCEL' | translate }}</button>
      <button mat-flat-button color="warn" (click)="onConfirm()">
        {{ 'ACTIONS.CONFIRM' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  imports: [MatDialogModule, MatButtonModule, TranslatePipe],
})
export class ConfirmDialogComponent {
  readonly data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
