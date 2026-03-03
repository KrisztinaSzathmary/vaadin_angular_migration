import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MainLayoutComponent } from './main-layout.component';
import { AuthService } from '../../../core/services/auth.service';

function createComponent(): {
  fixture: ComponentFixture<MainLayoutComponent>;
  component: MainLayoutComponent;
  authService: AuthService;
  router: Router;
} {
  const fixture = TestBed.createComponent(MainLayoutComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  return {
    fixture,
    component,
    authService: TestBed.inject(AuthService),
    router: TestBed.inject(Router),
  };
}

describe('MainLayoutComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('should contain a router-outlet', () => {
    const { fixture } = createComponent();
    const outlet = fixture.nativeElement.querySelector('router-outlet');
    expect(outlet).toBeTruthy();
  });

  it('should display "Bookstore" title', () => {
    const { fixture } = createComponent();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Bookstore');
  });

  it('should render Inventory link', () => {
    const { fixture } = createComponent();
    const links: HTMLAnchorElement[] = fixture.nativeElement.querySelectorAll('a[routerLink]');
    const inventoryLink = Array.from(links).find((a) => a.textContent?.includes('Inventory'));
    expect(inventoryLink).toBeTruthy();
    expect(inventoryLink?.getAttribute('routerLink')).toBe('/inventory');
  });

  it('should render About link', () => {
    const { fixture } = createComponent();
    const links: HTMLAnchorElement[] = fixture.nativeElement.querySelectorAll('a[routerLink]');
    const aboutLink = Array.from(links).find((a) => a.textContent?.includes('About'));
    expect(aboutLink).toBeTruthy();
    expect(aboutLink?.getAttribute('routerLink')).toBe('/about');
  });

  it('should hide Admin link when user is not admin', () => {
    const authService = TestBed.inject(AuthService);
    jest.spyOn(authService, 'isAdmin').mockReturnValue(false);

    const { fixture } = createComponent();
    const links: HTMLAnchorElement[] = fixture.nativeElement.querySelectorAll('a[routerLink]');
    const adminLink = Array.from(links).find((a) => a.textContent?.includes('Admin'));
    expect(adminLink).toBeUndefined();
  });

  it('should show Admin link when user is admin', () => {
    const authService = TestBed.inject(AuthService);
    jest.spyOn(authService, 'isAdmin').mockReturnValue(true);

    const { fixture } = createComponent();
    const links: HTMLAnchorElement[] = fixture.nativeElement.querySelectorAll('a[routerLink]');
    const adminLink = Array.from(links).find((a) => a.textContent?.includes('Admin'));
    expect(adminLink).toBeTruthy();
    expect(adminLink?.getAttribute('routerLink')).toBe('/admin');
  });

  it('should render Logout button', () => {
    const { fixture } = createComponent();
    const buttons: HTMLButtonElement[] = fixture.nativeElement.querySelectorAll('button');
    const logoutButton = Array.from(buttons).find((b) => b.textContent?.includes('Logout'));
    expect(logoutButton).toBeTruthy();
  });

  it('should call authService.logout() and navigate to /login on logout', () => {
    const { component, authService, router } = createComponent();
    jest.spyOn(authService, 'logout').mockReturnValue(of(undefined));
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to /login even when logout API fails', () => {
    const { component, authService, router } = createComponent();
    jest.spyOn(authService, 'logout').mockReturnValue(throwError(() => new Error('Server error')));
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
