import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

/**
 * About component.
 * Displays information about the application.
 */
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, TranslateModule],
  template: `
    <div class="about-container">
      <mat-card>
        <mat-card-header>
          <mat-icon mat-card-avatar>info</mat-icon>
          <mat-card-title>{{ 'about' | translate }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <p>{{ 'about-page.info-text' | translate }}</p>

          <h3>Features</h3>
          <ul>
            <li>Product inventory management (CRUD operations)</li>
            <li>Category management (admin only)</li>
            <li>Search and filter products</li>
            <li>Role-based access control</li>
            <li>Responsive design</li>
          </ul>

          <h3>Technology Stack</h3>
          <ul>
            <li><strong>Frontend:</strong> Angular 18, Angular Material</li>
            <li><strong>Backend:</strong> Jakarta EE, JAX-RS REST API</li>
            <li><strong>Authentication:</strong> JWT tokens</li>
          </ul>

          <h3>Keyboard Shortcuts</h3>
          <ul>
            <li><kbd>Ctrl</kbd> + <kbd>F</kbd> - Focus search filter</li>
            <li><kbd>Alt</kbd> + <kbd>N</kbd> - New product (admin only)</li>
            <li><kbd>Ctrl</kbd> + <kbd>L</kbd> - Logout</li>
          </ul>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .about-container {
      max-width: 800px;
    }

    mat-card-content {
      padding-top: 16px;

      h3 {
        margin-top: 24px;
        margin-bottom: 8px;
        color: #667eea;
      }

      ul {
        padding-left: 20px;

        li {
          margin-bottom: 8px;
        }
      }

      kbd {
        background-color: #f5f5f5;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 2px 6px;
        font-family: monospace;
        font-size: 12px;
      }
    }
  `]
})
export class AboutComponent {}

export default AboutComponent;
