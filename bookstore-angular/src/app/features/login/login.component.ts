import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { UpperCasePipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    UpperCasePipe,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
  readonly languageService = inject(LanguageService);

  readonly loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  readonly errorMessage = signal('');
  readonly isLoading = signal(false);
  readonly hidePassword = signal(true);

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    const { username, password } = this.loginForm.getRawValue();
    this.authService.login(username, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/inventory']);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set(this.translate.instant('LOGIN.ERROR_INVALID'));
      },
    });
  }

  onLanguageChange(lang: string): void {
    this.languageService.switchLanguage(lang);
  }
}
