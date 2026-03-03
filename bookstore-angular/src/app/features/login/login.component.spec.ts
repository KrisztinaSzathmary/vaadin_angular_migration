import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have username and password form controls', () => {
    expect(component.loginForm.contains('username')).toBe(true);
    expect(component.loginForm.contains('password')).toBe(true);
  });

  it('should mark form as invalid when fields are empty', () => {
    expect(component.loginForm.valid).toBe(false);
  });

  it('should mark form as valid when both fields are filled', () => {
    component.loginForm.controls.username.setValue('admin');
    component.loginForm.controls.password.setValue('admin');
    expect(component.loginForm.valid).toBe(true);
  });

  it('should not submit when form is invalid', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.onSubmit();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should navigate to /inventory on successful login', () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.loginForm.controls.username.setValue('admin');
    component.loginForm.controls.password.setValue('admin');
    component.onSubmit();

    const req = httpTesting.expectOne('/api/v1/auth/login');
    req.flush({ username: 'admin', role: 'admin' });

    expect(navigateSpy).toHaveBeenCalledWith(['/inventory']);
  });

  it('should show error message on failed login', () => {
    component.loginForm.controls.username.setValue('wrong');
    component.loginForm.controls.password.setValue('wrong');
    component.onSubmit();

    const req = httpTesting.expectOne('/api/v1/auth/login');
    req.flush(
      { error: 'Invalid username or password' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(component.errorMessage()).toBe('Invalid username or password');
  });

  it('should clear error message on new login attempt', () => {
    component.loginForm.controls.username.setValue('wrong');
    component.loginForm.controls.password.setValue('wrong');
    component.onSubmit();

    httpTesting
      .expectOne('/api/v1/auth/login')
      .flush(
        { error: 'Invalid username or password' },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(component.errorMessage()).toBe('Invalid username or password');

    component.onSubmit();

    expect(component.errorMessage()).toBe('');

    httpTesting
      .expectOne('/api/v1/auth/login')
      .flush(
        { error: 'Invalid username or password' },
        { status: 401, statusText: 'Unauthorized' },
      );
  });

  it('should set loading state during login request', () => {
    component.loginForm.controls.username.setValue('admin');
    component.loginForm.controls.password.setValue('admin');

    expect(component.isLoading()).toBe(false);

    component.onSubmit();

    expect(component.isLoading()).toBe(true);

    const req = httpTesting.expectOne('/api/v1/auth/login');
    req.flush({ username: 'admin', role: 'admin' });

    expect(component.isLoading()).toBe(false);
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword()).toBe(true);

    component.hidePassword.set(false);
    expect(component.hidePassword()).toBe(false);

    component.hidePassword.set(true);
    expect(component.hidePassword()).toBe(true);
  });
});
