import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Error component.
 * Displayed for 404 and other routing errors.
 */
@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="error-container">
      <mat-card class="error-card">
        <mat-card-content>
          <mat-icon class="error-icon">error_outline</mat-icon>
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you're looking for doesn't exist or has been moved.</p>
          <a mat-raised-button color="primary" routerLink="/inventory">
            <mat-icon>home</mat-icon>
            Go to Inventory
          </a>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
    }

    .error-card {
      text-align: center;
      padding: 48px;

      .error-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #f44336;
      }

      h1 {
        font-size: 72px;
        margin: 16px 0 8px;
        color: #333;
      }

      h2 {
        font-size: 24px;
        margin: 0 0 16px;
        color: #666;
      }

      p {
        color: #999;
        margin-bottom: 24px;
      }
    }
  `]
})
export class ErrorComponent {}

export default ErrorComponent;
