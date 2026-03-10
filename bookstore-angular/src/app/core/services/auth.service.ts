import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginResponse, UserInfo } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = '/api/v1/auth';
  private readonly http = inject(HttpClient);

  private readonly currentUser = signal<UserInfo | null>(null);
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');
  readonly user = this.currentUser.asReadonly();

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(tap((response) => this.currentUser.set(response)));
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/logout`, {})
      .pipe(tap(() => this.currentUser.set(null)));
  }

  getCurrentUser(): Observable<UserInfo> {
    return this.http
      .get<UserInfo>(`${this.apiUrl}/me`)
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  clearAuth(): void {
    this.currentUser.set(null);
  }
}
