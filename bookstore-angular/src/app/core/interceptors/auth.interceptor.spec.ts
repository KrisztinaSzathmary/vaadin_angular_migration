import { TestBed } from '@angular/core/testing';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let authService: AuthService;
  let router: Router;
  let dialog: MatDialog;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    dialog = TestBed.inject(MatDialog);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should add withCredentials to requests', () => {
    http.get('/api/v1/products').subscribe();

    const req = httpTesting.expectOne('/api/v1/products');
    expect(req.request.withCredentials).toBe(true);
    req.flush([]);
  });

  it('should add withCredentials to POST requests', () => {
    http.post('/api/v1/products', {}).subscribe();

    const req = httpTesting.expectOne('/api/v1/products');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('should redirect to /login on 401 for non-auth endpoints', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    const clearAuthSpy = jest.spyOn(authService, 'clearAuth');

    http.get('/api/v1/products').subscribe({
      error: () => {
        /* expected */
      },
    });

    const req = httpTesting.expectOne('/api/v1/products');
    req.flush({ error: 'Not authenticated' }, { status: 401, statusText: 'Unauthorized' });

    expect(clearAuthSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should close all dialogs on 401 redirect', () => {
    const closeAllSpy = jest.spyOn(dialog, 'closeAll');

    http.get('/api/v1/products').subscribe({
      error: () => {
        /* expected */
      },
    });

    const req = httpTesting.expectOne('/api/v1/products');
    req.flush({ error: 'Not authenticated' }, { status: 401, statusText: 'Unauthorized' });

    expect(closeAllSpy).toHaveBeenCalled();
  });

  it('should not redirect on 401 for auth login endpoint', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    const clearAuthSpy = jest.spyOn(authService, 'clearAuth');

    http.post('/api/v1/auth/login', {}).subscribe({
      error: () => {
        /* expected */
      },
    });

    const req = httpTesting.expectOne('/api/v1/auth/login');
    req.flush({ error: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

    expect(clearAuthSpy).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should not redirect on 401 for auth me endpoint', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    const clearAuthSpy = jest.spyOn(authService, 'clearAuth');

    http.get('/api/v1/auth/me').subscribe({
      error: () => {
        /* expected */
      },
    });

    const req = httpTesting.expectOne('/api/v1/auth/me');
    req.flush({ error: 'Not authenticated' }, { status: 401, statusText: 'Unauthorized' });

    expect(clearAuthSpy).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should not redirect on 403 errors', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    const clearAuthSpy = jest.spyOn(authService, 'clearAuth');

    http.post('/api/v1/products', {}).subscribe({
      error: () => {
        /* expected */
      },
    });

    const req = httpTesting.expectOne('/api/v1/products');
    req.flush({ error: 'Admin role required' }, { status: 403, statusText: 'Forbidden' });

    expect(clearAuthSpy).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should not redirect on 500 errors', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    http.get('/api/v1/products').subscribe({
      error: () => {
        /* expected */
      },
    });

    const req = httpTesting.expectOne('/api/v1/products');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should re-throw errors after handling', () => {
    let caughtError: unknown;

    http.get('/api/v1/products').subscribe({
      error: (err) => {
        caughtError = err;
      },
    });

    const req = httpTesting.expectOne('/api/v1/products');
    req.flush({ error: 'Not authenticated' }, { status: 401, statusText: 'Unauthorized' });

    expect(caughtError).toBeDefined();
  });

  it('should pass through successful responses unchanged', () => {
    const mockData = [{ id: 1, name: 'Test' }];

    http.get('/api/v1/products').subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpTesting.expectOne('/api/v1/products');
    req.flush(mockData);
  });
});
