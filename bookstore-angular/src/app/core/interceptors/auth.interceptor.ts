import { inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const cloned = req.clone({ withCredentials: true });

    return next.handle(cloned).pipe(
      catchError((error) => {
        if (error.status === 401 && !req.url.includes('/api/v1/auth/')) {
          this.authService.clearAuth();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      }),
    );
  }
}
