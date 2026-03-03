import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';

/**
 * Login component.
 * Handles user authentication with username/password.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  template: `
    <div class="login-container">
      <div class="login-info">
        <h1>{{ 'bookstore' | translate }}</h1>
        <p>{{ 'login.info-text' | translate }}</p>
      </div>

      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>{{ 'login.title' | translate }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'login.username' | translate }}</mat-label>
              <input matInput formControlName="username" autocomplete="username">
              <mat-icon matPrefix>person</mat-icon>
              @if (loginForm.get('username')?.hasError('required')) {
                <mat-error>{{ 'login.username' | translate }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'login.password' | translate }}</mat-label>
              <input matInput [type]="hidePassword() ? 'password' : 'text'"
                     formControlName="password" autocomplete="current-password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button"
                      (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.get('password')?.hasError('required')) {
                <mat-error>{{ 'login.password' | translate }}</mat-error>
              }
            </mat-form-field>

            <p class="hint">{{ 'login.hint' | translate }}</p>

            @if (error()) {
              <p class="error-message">{{ error() }}</p>
            }

            <button mat-raised-button color="primary" type="submit"
                    class="full-width login-button"
                    [disabled]="loading() || loginForm.invalid">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                {{ 'login.button' | translate }}
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      height: 100vh;
      align-items: center;
      justify-content: center;
      gap: 48px;
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-info {
      max-width: 400px;
      color: white;

      h1 {
        font-size: 48px;
        margin-bottom: 16px;
      }

      p {
        font-size: 16px;
        line-height: 1.6;
        opacity: 0.9;
      }
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 24px;
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      margin-bottom: 16px;
    }

    .hint {
      font-size: 12px;
      color: #666;
      margin-bottom: 16px;
    }

    .error-message {
      color: #f44336;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .login-button {
      height: 48px;
      font-size: 16px;
    }

    @media (max-width: 800px) {
      .login-container {
        flex-direction: column;
        gap: 24px;
      }

      .login-info {
        text-align: center;

        h1 {
          font-size: 32px;
        }
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = signal(true);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { username, password } = this.loginForm.value;

    this.authService.login({ username, password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/inventory']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Login failed. Please try again.');
      }
    });
  }
}

export default LoginComponent;
