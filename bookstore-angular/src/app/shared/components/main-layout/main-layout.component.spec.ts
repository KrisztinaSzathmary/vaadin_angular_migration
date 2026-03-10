import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Router } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { of, throwError } from 'rxjs';
import { MainLayoutComponent } from './main-layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateTestModule } from '../../../testing/translate-testing';

function createBreakpointObserver(matches: boolean): Partial<BreakpointObserver> {
  return {
    observe: () =>
      of({ matches, breakpoints: { '(max-width: 799px)': matches } } as BreakpointState),
  };
}

function createComponent(fixture: ComponentFixture<MainLayoutComponent>): {
  fixture: ComponentFixture<MainLayoutComponent>;
  component: MainLayoutComponent;
  authService: AuthService;
  router: Router;
} {
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
  function setup(isMobile = false): void {
    TestBed.configureTestingModule({
      imports: [MainLayoutComponent, TranslateTestModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
        { provide: BreakpointObserver, useValue: createBreakpointObserver(isMobile) },
      ],
    });
  }

  describe('Desktop (≥800px)', () => {
    beforeEach(async () => {
      setup(false);
      await TestBed.compileComponents();
    });

    it('should create', () => {
      const { component } = createComponent(TestBed.createComponent(MainLayoutComponent));
      expect(component).toBeTruthy();
    });

    it('should contain a router-outlet', () => {
      const { fixture } = createComponent(TestBed.createComponent(MainLayoutComponent));
      const outlet = fixture.nativeElement.querySelector('router-outlet');
      expect(outlet).toBeTruthy();
    });

    it('should display "Bookstore" title', () => {
      const { fixture } = createComponent(TestBed.createComponent(MainLayoutComponent));
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Bookstore');
    });

    it('should render Inventory link', () => {
      const { fixture } = createComponent(TestBed.createComponent(MainLayoutComponent));
      const links: HTMLAnchorElement[] = fixture.nativeElement.querySelectorAll('a[routerLink]');
      const inventoryLink = Array.from(links).find((a) => a.textContent?.includes('Inventory'));
      expect(inventoryLink).toBeTruthy();
      expect(inventoryLink?.getAttribute('routerLink')).toBe('/inventory');
    });

    it('should render About link', () => {
      const { fixture } = createComponent(TestBed.createComponent(MainLayoutComponent));
      const links: HTMLAnchorElement[] = fixture.nativeElement.querySelectorAll('a[routerLink]');
      const aboutLink = Array.from(links).find((a) => a.textContent?.includes('About'));
      expect(aboutLink).toBeTruthy();
      expect(aboutLink?.getAttribute('routerLink')).toBe('/about');
    });

    it('should hide Admin link when user is not admin', () => {
      const authService = TestBed.inject(AuthService);
      jest.spyOn(authService, 'isAdmin').mockReturnValue(false);

      const { fixture } = createComponent(TestBed.createComponent(MainLayoutComponent));
      const links: HTMLAnchorElement[] = fixture.nativeElement.querySelectorAll('a[routerLink]');
      const adminLink = Array.from(links).find((a) => a.textContent?.includes('Admin'));
      expect(adminLink).toBeUndefined();
    });

    it('should show Admin link when user is admin', () => {
      const authService = TestBed.inject(AuthService);
      jest.spyOn(authService, 'isAdmin').mockReturnValue(true);

      const { fixture } = createComponent(TestBed.createComponent(MainLayoutComponent));
      const links: HTMLAnchorElement[] = fixture.nativeElement.querySelectorAll('a[routerLink]');
      const adminLink = Array.from(links).find((a) => a.textContent?.includes('Admin'));
      expect(adminLink).toBeTruthy();
      expect(adminLink?.getAttribute('routerLink')).toBe('/admin');
    });

    it('should render Logout button', () => {
      const { fixture } = createComponent(TestBed.createComponent(MainLayoutComponent));
      const buttons: HTMLButtonElement[] = fixture.nativeElement.querySelectorAll('button');
      const logoutButton = Array.from(buttons).find((b) => b.textContent?.includes('Logout'));
      expect(logoutButton).toBeTruthy();
    });

    it('should call authService.logout() and navigate to /login on logout', () => {
      const { component, authService, router } = createComponent(
        TestBed.createComponent(MainLayoutComponent),
      );
      jest.spyOn(authService, 'logout').mockReturnValue(of(undefined));
      jest.spyOn(router, 'navigate').mockResolvedValue(true);

      component.logout();

      expect(authService.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should navigate to /login even when logout API fails', () => {
      const { component, authService, router } = createComponent(
        TestBed.createComponent(MainLayoutComponent),
      );
      jest
        .spyOn(authService, 'logout')
        .mockReturnValue(throwError(() => new Error('Server error')));
      jest.spyOn(router, 'navigate').mockResolvedValue(true);

      component.logout();

      expect(authService.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should use side mode on desktop', () => {
      const { component } = createComponent(TestBed.createComponent(MainLayoutComponent));
      expect(component.isMobile()).toBe(false);
    });

    it('should not show hamburger button on desktop', () => {
      const { fixture } = createComponent(TestBed.createComponent(MainLayoutComponent));
      const hamburger = fixture.nativeElement.querySelector('button[aria-label="Toggle menu"]');
      expect(hamburger).toBeNull();
    });
  });

  describe('Mobile (<800px)', () => {
    beforeEach(async () => {
      setup(true);
      await TestBed.compileComponents();
    });

    it('should use over mode on mobile', () => {
      const { component } = createComponent(TestBed.createComponent(MainLayoutComponent));
      expect(component.isMobile()).toBe(true);
    });

    it('should show hamburger button on mobile', () => {
      const { fixture } = createComponent(TestBed.createComponent(MainLayoutComponent));
      const hamburger = fixture.nativeElement.querySelector('button[aria-label="Toggle menu"]');
      expect(hamburger).toBeTruthy();
    });

    it('should toggle drawer on hamburger click', () => {
      const { component } = createComponent(TestBed.createComponent(MainLayoutComponent));
      expect(component.drawerOpen()).toBe(false);
      component.toggleDrawer();
      expect(component.drawerOpen()).toBe(true);
      component.toggleDrawer();
      expect(component.drawerOpen()).toBe(false);
    });

    it('should close drawer on closeDrawer call', () => {
      const { component } = createComponent(TestBed.createComponent(MainLayoutComponent));
      component.drawerOpen.set(true);
      component.closeDrawer();
      expect(component.drawerOpen()).toBe(false);
    });
  });
});
