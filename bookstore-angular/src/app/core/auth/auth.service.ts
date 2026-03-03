import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, User } from '../models/product.model';

/**
 * Authentication service.
 * Handles login/logout and JWT token management.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = '/api/auth';
  private readonly TOKEN_KEY = 'bookstore_token';
  private readonly USER_KEY = 'bookstore_user';

  private currentUser = signal<User | null>(this.loadUserFromStorage());
  private token = signal<string | null>(this.loadTokenFromStorage());

  /** Check if user is logged in */
  readonly isLoggedIn = computed(() => this.currentUser() !== null && this.token() !== null);

  /** Check if current user is admin */
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  /** Get current user */
  readonly user = computed(() => this.currentUser());

  constructor(private http: HttpClient) {}

  /**
   * Login with username and password.
   * @param credentials Login credentials
   * @returns Observable with login response
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.token.set(response.token);
        const user: User = { username: response.username, role: response.role };
        this.currentUser.set(user);
        this.saveToStorage(response.token, user);
      })
    );
  }

  /**
   * Logout current user.
   */
  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    this.clearStorage();
  }

  /**
   * Get the current JWT token.
   * @returns Token string or null
   */
  getToken(): string | null {
    return this.token();
  }

  private loadTokenFromStorage(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private loadUserFromStorage(): User | null {
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem(this.USER_KEY);
      if (userJson) {
        try {
          return JSON.parse(userJson);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  private saveToStorage(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private clearStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }
}
