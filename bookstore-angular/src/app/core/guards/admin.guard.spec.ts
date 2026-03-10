import { TestBed } from '@angular/core/testing';
import { UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('adminGuard', () => {
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    authService = TestBed.inject(AuthService);
  });

  it('should allow access when user is admin', () => {
    jest.spyOn(authService, 'isLoggedIn').mockReturnValue(true);
    jest.spyOn(authService, 'isAdmin').mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));

    expect(result).toBe(true);
  });

  it('should redirect to /login when user is not logged in', () => {
    jest.spyOn(authService, 'isLoggedIn').mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/login');
  });

  it('should redirect to / when user is logged in but not admin', () => {
    jest.spyOn(authService, 'isLoggedIn').mockReturnValue(true);
    jest.spyOn(authService, 'isAdmin').mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/');
  });
});
