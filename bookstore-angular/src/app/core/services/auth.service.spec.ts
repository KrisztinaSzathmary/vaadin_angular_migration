import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { LoginResponse, UserInfo } from '../../models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  const mockLoginResponse: LoginResponse = {
    username: 'admin',
    role: 'admin',
  };

  const mockUserInfo: UserInfo = { username: 'user1', role: 'user' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initially have no user logged in', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.isAdmin()).toBe(false);
    expect(service.user()).toBeNull();
  });

  describe('login', () => {
    it('should send POST request to /api/v1/auth/login', () => {
      service.login('admin', 'admin').subscribe((response) => {
        expect(response).toEqual(mockLoginResponse);
      });

      const req = httpTesting.expectOne('/api/v1/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        username: 'admin',
        password: 'admin',
      });
      req.flush(mockLoginResponse);
    });

    it('should set currentUser signal on successful login', () => {
      service.login('admin', 'admin').subscribe();

      const req = httpTesting.expectOne('/api/v1/auth/login');
      req.flush(mockLoginResponse);

      expect(service.user()).toEqual(mockLoginResponse);
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should set isAdmin to true for admin role', () => {
      service.login('admin', 'admin').subscribe();

      const req = httpTesting.expectOne('/api/v1/auth/login');
      req.flush(mockLoginResponse);

      expect(service.isAdmin()).toBe(true);
    });

    it('should set isAdmin to false for non-admin role', () => {
      service.login('user1', 'user1').subscribe();

      const req = httpTesting.expectOne('/api/v1/auth/login');
      req.flush({ username: 'user1', role: 'user' });

      expect(service.isAdmin()).toBe(false);
    });

    it('should not update signal on failed login', () => {
      service.login('wrong', 'wrong').subscribe({
        error: () => {
          /* expected */
        },
      });

      const req = httpTesting.expectOne('/api/v1/auth/login');
      req.flush(
        { error: 'Invalid username or password' },
        { status: 401, statusText: 'Unauthorized' },
      );

      expect(service.isLoggedIn()).toBe(false);
      expect(service.user()).toBeNull();
    });
  });

  describe('logout', () => {
    it('should send POST request to /api/v1/auth/logout', () => {
      service.logout().subscribe();

      const req = httpTesting.expectOne('/api/v1/auth/logout');
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });

    it('should clear currentUser signal on successful logout', () => {
      // First login
      service.login('admin', 'admin').subscribe();
      httpTesting.expectOne('/api/v1/auth/login').flush(mockLoginResponse);
      expect(service.isLoggedIn()).toBe(true);

      // Then logout
      service.logout().subscribe();
      httpTesting.expectOne('/api/v1/auth/logout').flush(null);

      expect(service.isLoggedIn()).toBe(false);
      expect(service.user()).toBeNull();
    });

    it('should not clear signal on failed logout', () => {
      // First login
      service.login('admin', 'admin').subscribe();
      httpTesting.expectOne('/api/v1/auth/login').flush(mockLoginResponse);

      // Failed logout
      service.logout().subscribe({
        error: () => {
          /* expected */
        },
      });
      httpTesting
        .expectOne('/api/v1/auth/logout')
        .flush(null, { status: 500, statusText: 'Server Error' });

      expect(service.isLoggedIn()).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    it('should send GET request to /api/v1/auth/me', () => {
      service.getCurrentUser().subscribe((user) => {
        expect(user).toEqual(mockUserInfo);
      });

      const req = httpTesting.expectOne('/api/v1/auth/me');
      expect(req.request.method).toBe('GET');
      req.flush(mockUserInfo);
    });

    it('should set currentUser signal on success', () => {
      service.getCurrentUser().subscribe();

      httpTesting.expectOne('/api/v1/auth/me').flush(mockUserInfo);

      expect(service.user()).toEqual(mockUserInfo);
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should not update signal on 401 response', () => {
      service.getCurrentUser().subscribe({
        error: () => {
          /* expected */
        },
      });

      httpTesting
        .expectOne('/api/v1/auth/me')
        .flush({ error: 'Not authenticated' }, { status: 401, statusText: 'Unauthorized' });

      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('clearAuth', () => {
    it('should clear the currentUser signal', () => {
      // First login
      service.login('admin', 'admin').subscribe();
      httpTesting.expectOne('/api/v1/auth/login').flush(mockLoginResponse);
      expect(service.isLoggedIn()).toBe(true);

      // Then clear
      service.clearAuth();

      expect(service.isLoggedIn()).toBe(false);
      expect(service.user()).toBeNull();
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('computed signals', () => {
    it('should update isLoggedIn when user changes', () => {
      expect(service.isLoggedIn()).toBe(false);

      service.login('user1', 'user1').subscribe();
      httpTesting.expectOne('/api/v1/auth/login').flush(mockUserInfo);

      expect(service.isLoggedIn()).toBe(true);

      service.clearAuth();
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should update isAdmin when user changes', () => {
      expect(service.isAdmin()).toBe(false);

      service.login('admin', 'admin').subscribe();
      httpTesting.expectOne('/api/v1/auth/login').flush(mockLoginResponse);
      expect(service.isAdmin()).toBe(true);

      service.clearAuth();
      expect(service.isAdmin()).toBe(false);
    });
  });
});
