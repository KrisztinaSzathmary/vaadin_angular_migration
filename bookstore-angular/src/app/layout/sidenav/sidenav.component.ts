import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Sidenav component.
 * Displays navigation menu with links to different views.
 */
@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    TranslateModule
  ],
  template: `
    <div class="sidenav-header">
      <img src="assets/logo.png" alt="Bookstore" class="logo" (error)="onLogoError($event)">
      <h2>{{ 'bookstore' | translate }}</h2>
    </div>

    <mat-nav-list>
      <a mat-list-item routerLink="/inventory" routerLinkActive="active">
        <mat-icon matListItemIcon>inventory_2</mat-icon>
        <span matListItemTitle>{{ 'inventory' | translate }}</span>
      </a>

      @if (isAdmin()) {
        <a mat-list-item routerLink="/admin" routerLinkActive="active">
          <mat-icon matListItemIcon>admin_panel_settings</mat-icon>
          <span matListItemTitle>{{ 'admin' | translate }}</span>
        </a>
      }

      <a mat-list-item routerLink="/about" routerLinkActive="active">
        <mat-icon matListItemIcon>info</mat-icon>
        <span matListItemTitle>{{ 'about' | translate }}</span>
      </a>
    </mat-nav-list>

    <mat-divider></mat-divider>

    <div class="sidenav-footer">
      <span class="username">{{ username() }}</span>
      <button mat-stroked-button (click)="logout()">
        <mat-icon>logout</mat-icon>
        {{ 'logout' | translate }}
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;

      .logo {
        width: 40px;
        height: 40px;
        object-fit: contain;
      }

      h2 {
        margin: 0;
        font-size: 20px;
      }
    }

    mat-nav-list {
      flex: 1;
      padding-top: 8px;
    }

    .active {
      background-color: rgba(103, 126, 234, 0.1);
      color: #667eea;
    }

    .sidenav-footer {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .username {
        font-size: 14px;
        color: #666;
      }

      button {
        width: 100%;
      }
    }
  `]
})
export class SidenavComponent {
  isAdmin = computed(() => this.authService.isAdmin());
  username = computed(() => this.authService.user()?.username || '');

  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }

  onLogoError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
