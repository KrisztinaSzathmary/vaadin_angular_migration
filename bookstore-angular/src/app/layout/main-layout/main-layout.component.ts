import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Main layout component.
 * Provides the app shell with sidenav and content area.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule,
    SidenavComponent
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav
                   [mode]="isMobile() ? 'over' : 'side'"
                   [opened]="!isMobile()"
                   class="sidenav">
        <app-sidenav></app-sidenav>
      </mat-sidenav>

      <mat-sidenav-content class="content">
        @if (isMobile()) {
          <mat-toolbar color="primary" class="mobile-toolbar">
            <button mat-icon-button (click)="sidenav.toggle()">
              <mat-icon>menu</mat-icon>
            </button>
            <span>{{ 'bookstore' | translate }}</span>
          </mat-toolbar>
        }

        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 280px;
    }

    .content {
      display: flex;
      flex-direction: column;
    }

    .mobile-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .main-content {
      flex: 1;
      padding: 24px;
      overflow: auto;
      background-color: #fafafa;
    }

    @media (max-width: 800px) {
      .sidenav {
        width: 260px;
      }

      .main-content {
        padding: 16px;
      }
    }
  `]
})
export class MainLayoutComponent {
  isMobile = signal(false);

  constructor(
    private authService: AuthService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('en-GB');
    this.translate.use('en-GB');
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  /**
   * Keyboard shortcut: Ctrl+L for logout.
   */
  @HostListener('document:keydown.control.l', ['$event'])
  onLogoutShortcut(event: KeyboardEvent): void {
    event.preventDefault();
    this.authService.logout();
    window.location.href = '/login';
  }

  private checkScreenSize(): void {
    if (typeof window !== 'undefined') {
      this.isMobile.set(window.innerWidth < 800);
    }
  }
}

export default MainLayoutComponent;
