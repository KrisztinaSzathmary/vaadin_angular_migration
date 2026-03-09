import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { ProductListComponent } from './product-list.component';
import { ProductFormComponent, ProductDeletedResult } from './product-form.component';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Availability } from '../../models/availability.enum';

const mockProducts: Product[] = [
  {
    id: 1,
    productName: 'Test Product A',
    price: 29.99,
    stockCount: 50,
    availability: Availability.AVAILABLE,
    category: [
      { id: 1, name: 'Best sellers' },
      { id: 2, name: 'Cookbooks' },
    ],
  },
  {
    id: 2,
    productName: 'Test Product B',
    price: 14.5,
    stockCount: 0,
    availability: Availability.COMING,
    category: [{ id: 3, name: 'Mystery' }],
  },
  {
    id: 3,
    productName: 'Test Product C',
    price: 7.1,
    stockCount: 5,
    availability: Availability.DISCONTINUED,
    category: [],
  },
];

const mockCategories: Category[] = [
  { id: 1, name: 'Best sellers' },
  { id: 2, name: 'Cookbooks' },
  { id: 3, name: 'Mystery' },
];

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let httpTesting: HttpTestingController;
  let dialog: MatDialog;
  let notificationSpy: jest.Mocked<NotificationService>;
  let routerEventsSubject: Subject<NavigationEnd>;
  let mockRouter: { events: Subject<NavigationEnd>; url: string; navigate: jest.Mock };
  const isAdminSignal = signal(false);

  beforeEach(async () => {
    isAdminSignal.set(false);
    routerEventsSubject = new Subject<NavigationEnd>();
    mockRouter = {
      events: routerEventsSubject,
      url: '/inventory',
      navigate: jest.fn().mockResolvedValue(true),
    };
    notificationSpy = {
      showSuccess: jest.fn(),
      showError: jest.fn(),
    } as unknown as jest.Mocked<NotificationService>;

    await TestBed.configureTestingModule({
      imports: [ProductListComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter },
        {
          provide: AuthService,
          useValue: { isAdmin: isAdminSignal },
        },
        { provide: NotificationService, useValue: notificationSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    dialog = TestBed.inject(MatDialog);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInit(): void {
    httpTesting.expectOne('/api/v1/products').flush(mockProducts);
    httpTesting.expectOne('/api/v1/categories').flush(mockCategories);
  }

  function loadProducts(): void {
    fixture.detectChanges();
    flushInit();
    fixture.detectChanges();
  }

  it('should create', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/v1/products').flush([]);
    httpTesting.expectOne('/api/v1/categories').flush([]);
    expect(component).toBeTruthy();
  });

  it('should show loading state initially', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Loading products...');
    httpTesting.expectOne('/api/v1/products').flush([]);
    httpTesting.expectOne('/api/v1/categories').flush([]);
  });

  it('should load products from API on init', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne('/api/v1/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
    httpTesting.expectOne('/api/v1/categories').flush([]);
  });

  it('should display products in table after loading', () => {
    loadProducts();
    const rows = fixture.nativeElement.querySelectorAll('tr[mat-row]');
    expect(rows.length).toBe(3);
  });

  it('should display product names', () => {
    loadProducts();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Test Product A');
    expect(el.textContent).toContain('Test Product B');
    expect(el.textContent).toContain('Test Product C');
  });

  it('should display prices with EUR format', () => {
    loadProducts();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('29.99 €');
    expect(el.textContent).toContain('14.50 €');
    expect(el.textContent).toContain('7.10 €');
  });

  it('should display availability labels', () => {
    loadProducts();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Available');
    expect(el.textContent).toContain('Coming');
    expect(el.textContent).toContain('Discontinued');
  });

  it('should display availability dots with correct color classes', () => {
    loadProducts();
    const table = fixture.nativeElement.querySelector('table');
    expect(table.querySelector('.bg-available')).toBeTruthy();
    expect(table.querySelector('.bg-coming')).toBeTruthy();
    expect(table.querySelector('.bg-discontinued')).toBeTruthy();
  });

  it('should display stock counts', () => {
    loadProducts();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('50');
    expect(el.textContent).toContain('5');
  });

  it('should display categories comma-separated', () => {
    loadProducts();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Best sellers, Cookbooks');
  });

  it('should handle products without categories', () => {
    loadProducts();
    expect(component.formatCategories(mockProducts[2])).toBe('');
  });

  it('should show product count in subtitle', () => {
    loadProducts();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('3 products in your catalog');
  });

  it('should show availability summary badges with counts', () => {
    loadProducts();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('1 Available');
    expect(el.textContent).toContain('1 Coming');
    expect(el.textContent).toContain('1 Discontinued');
  });

  it('should hide loading after products load', () => {
    loadProducts();
    expect(component.loading()).toBe(false);
  });

  it('should show error message on API failure', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/v1/products').error(new ProgressEvent('error'));
    httpTesting.expectOne('/api/v1/categories').flush([]);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Failed to load products');
  });

  it('should hide loading on error', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/v1/products').error(new ProgressEvent('error'));
    httpTesting.expectOne('/api/v1/categories').flush([]);
    expect(component.loading()).toBe(false);
  });

  it('should have default sort on productName ascending', () => {
    loadProducts();
    expect(component.dataSource.sort?.active).toBe('productName');
    expect(component.dataSource.sort?.direction).toBe('asc');
  });

  // --- Filter & Admin Tests ---

  it('should render filter input with placeholder', () => {
    loadProducts();
    const input = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.placeholder).toBe('Search name, availability or category...');
  });

  it('should display search icon', () => {
    loadProducts();
    const icons = fixture.nativeElement.querySelectorAll('mat-icon');
    const searchIcon = Array.from(icons).find(
      (icon) => (icon as HTMLElement).textContent?.trim() === 'search',
    );
    expect(searchIcon).toBeTruthy();
  });

  it('should render New product button', () => {
    loadProducts();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const newProductBtn = Array.from(buttons).find((btn) =>
      (btn as HTMLElement).textContent?.includes('New product'),
    ) as HTMLButtonElement;
    expect(newProductBtn).toBeTruthy();
  });

  it('should disable New product button when not admin', () => {
    isAdminSignal.set(false);
    loadProducts();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const newProductBtn = Array.from(buttons).find((btn) =>
      (btn as HTMLElement).textContent?.includes('New product'),
    ) as HTMLButtonElement;
    expect(newProductBtn.disabled).toBe(true);
  });

  it('should enable New product button when admin', () => {
    isAdminSignal.set(true);
    loadProducts();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const newProductBtn = Array.from(buttons).find((btn) =>
      (btn as HTMLElement).textContent?.includes('New product'),
    ) as HTMLButtonElement;
    expect(newProductBtn.disabled).toBe(false);
  });

  it('should filter by product name', () => {
    loadProducts();
    component.dataSource.filter = 'product a';
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tr[mat-row]');
    expect(rows.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Test Product A');
  });

  it('should filter by availability label', () => {
    loadProducts();
    component.dataSource.filter = 'coming';
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tr[mat-row]');
    expect(rows.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Test Product B');
  });

  it('should filter by category name', () => {
    loadProducts();
    component.dataSource.filter = 'cookbooks';
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tr[mat-row]');
    expect(rows.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Test Product A');
  });

  it('should filter case-insensitively', () => {
    loadProducts();
    component.dataSource.filter = 'MYSTERY';
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tr[mat-row]');
    expect(rows.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Test Product B');
  });

  it('should show zero rows when filter has no matches', () => {
    loadProducts();
    component.dataSource.filter = 'nonexistent';
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tr[mat-row]');
    expect(rows.length).toBe(0);
  });

  it('should debounce filter input', fakeAsync(() => {
    loadProducts();
    component.onFilterInput('Product A');
    // Before debounce completes, filter not yet applied
    expect(component.dataSource.filter).toBe('');

    tick(300);
    // After 300ms, filter applied
    expect(component.dataSource.filter).toBe('product a');
  }));

  it('should show all products when filter is cleared', () => {
    loadProducts();
    component.dataSource.filter = 'product a';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tr[mat-row]').length).toBe(1);

    component.dataSource.filter = '';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tr[mat-row]').length).toBe(3);
  });

  // --- Dialog Integration Tests ---

  it('should load categories on init', () => {
    loadProducts();
    expect(component.categories()).toEqual(mockCategories);
  });

  // --- URL-based Navigation Tests ---

  it('should navigate to /inventory/new on onNewProduct', () => {
    loadProducts();

    component.onNewProduct();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/inventory', 'new']);
  });

  it('should navigate to /inventory/:id on onRowClick as admin', () => {
    isAdminSignal.set(true);
    loadProducts();

    component.onRowClick(mockProducts[0]);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/inventory', 1]);
  });

  it('should not navigate on onRowClick when not admin', () => {
    isAdminSignal.set(false);
    loadProducts();

    component.onRowClick(mockProducts[0]);

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should open dialog when route param is a numeric ID', () => {
    isAdminSignal.set(true);
    loadProducts();

    const dialogRefMock = {
      afterClosed: () => of(undefined),
    } as unknown as MatDialogRef<ProductFormComponent>;
    const openSpy = jest.spyOn(dialog, 'open').mockReturnValue(dialogRefMock);

    routerEventsSubject.next(new NavigationEnd(1, '/inventory/1', '/inventory/1'));

    // Flush the product-by-id request
    httpTesting.expectOne('/api/v1/products/1').flush(mockProducts[0]);

    expect(openSpy).toHaveBeenCalledWith(ProductFormComponent, {
      data: { product: mockProducts[0], categories: mockCategories },
      width: '520px',
    });
  });

  it('should open create dialog when route param is "new" as admin', () => {
    isAdminSignal.set(true);
    loadProducts();

    const dialogRefMock = {
      afterClosed: () => of(undefined),
    } as unknown as MatDialogRef<ProductFormComponent>;
    const openSpy = jest.spyOn(dialog, 'open').mockReturnValue(dialogRefMock);

    routerEventsSubject.next(new NavigationEnd(1, '/inventory/new', '/inventory/new'));

    expect(openSpy).toHaveBeenCalledWith(ProductFormComponent, {
      data: { product: null, categories: mockCategories },
      width: '520px',
    });
  });

  it('should navigate back to /inventory when dialog closes', () => {
    isAdminSignal.set(true);
    loadProducts();

    const dialogRefMock = {
      afterClosed: () => of(undefined),
    } as unknown as MatDialogRef<ProductFormComponent>;
    jest.spyOn(dialog, 'open').mockReturnValue(dialogRefMock);

    routerEventsSubject.next(new NavigationEnd(1, '/inventory/new', '/inventory/new'));

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/inventory']);
  });

  it('should show error notification for invalid ID param', () => {
    loadProducts();

    routerEventsSubject.next(new NavigationEnd(1, '/inventory/abc', '/inventory/abc'));

    expect(notificationSpy.showError).toHaveBeenCalledWith("Invalid product ID: 'abc'");
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/inventory']);
  });

  it('should show error notification when product not found (404)', () => {
    isAdminSignal.set(true);
    loadProducts();

    const dialogOpenSpy = jest.spyOn(dialog, 'open');

    routerEventsSubject.next(new NavigationEnd(1, '/inventory/999', '/inventory/999'));

    httpTesting
      .expectOne('/api/v1/products/999')
      .error(new ProgressEvent('error'), { status: 404 });

    expect(notificationSpy.showError).toHaveBeenCalledWith('Product with ID 999 not found');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/inventory']);
    expect(dialogOpenSpy).not.toHaveBeenCalled();
  });

  it('should redirect non-admin from /inventory/new to /inventory', () => {
    isAdminSignal.set(false);
    loadProducts();

    const dialogOpenSpy = jest.spyOn(dialog, 'open');

    routerEventsSubject.next(new NavigationEnd(1, '/inventory/new', '/inventory/new'));

    expect(dialogOpenSpy).not.toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/inventory']);
  });

  it('should use cached categories when available for openProductById', () => {
    isAdminSignal.set(true);
    loadProducts();
    // Categories already loaded via flushInit

    const dialogRefMock = {
      afterClosed: () => of(undefined),
    } as unknown as MatDialogRef<ProductFormComponent>;
    jest.spyOn(dialog, 'open').mockReturnValue(dialogRefMock);

    routerEventsSubject.next(new NavigationEnd(1, '/inventory/1', '/inventory/1'));

    // Should only request the product, not categories again
    httpTesting.expectOne('/api/v1/products/1').flush(mockProducts[0]);
    httpTesting.expectNone('/api/v1/categories');
  });

  it('should fetch categories from API when cache is empty for openProductById', () => {
    isAdminSignal.set(true);
    // Initialize with empty categories
    fixture.detectChanges();
    httpTesting.expectOne('/api/v1/products').flush(mockProducts);
    httpTesting.expectOne('/api/v1/categories').flush([]);
    fixture.detectChanges();

    const dialogRefMock = {
      afterClosed: () => of(undefined),
    } as unknown as MatDialogRef<ProductFormComponent>;
    jest.spyOn(dialog, 'open').mockReturnValue(dialogRefMock);

    routerEventsSubject.next(new NavigationEnd(1, '/inventory/1', '/inventory/1'));

    // Should request both product and categories
    httpTesting.expectOne('/api/v1/products/1').flush(mockProducts[0]);
    httpTesting.expectOne('/api/v1/categories').flush(mockCategories);
  });

  it('should refresh products and show notification after dialog close with save result', () => {
    isAdminSignal.set(true);
    loadProducts();

    const savedProduct = { ...mockProducts[0], productName: 'Updated' };
    const dialogRefMock = {
      afterClosed: () => of(savedProduct),
    } as unknown as MatDialogRef<ProductFormComponent>;
    jest.spyOn(dialog, 'open').mockReturnValue(dialogRefMock);

    routerEventsSubject.next(new NavigationEnd(1, '/inventory/new', '/inventory/new'));

    // Flush the refresh request
    const req = httpTesting.expectOne('/api/v1/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);

    expect(notificationSpy.showSuccess).toHaveBeenCalledWith('Product created');
  });

  it('should show update notification for edit result via route', () => {
    isAdminSignal.set(true);
    loadProducts();

    const updatedProduct = { ...mockProducts[0], productName: 'Updated Name' };
    const dialogRefMock = {
      afterClosed: () => of(updatedProduct),
    } as unknown as MatDialogRef<ProductFormComponent>;
    jest.spyOn(dialog, 'open').mockReturnValue(dialogRefMock);

    routerEventsSubject.next(new NavigationEnd(1, '/inventory/1', '/inventory/1'));

    httpTesting.expectOne('/api/v1/products/1').flush(mockProducts[0]);

    // Flush the refresh request
    httpTesting.expectOne('/api/v1/products').flush(mockProducts);

    expect(notificationSpy.showSuccess).toHaveBeenCalledWith('Product updated');
  });

  it('should show delete notification via route', () => {
    isAdminSignal.set(true);
    loadProducts();

    const deleteResult: ProductDeletedResult = { deleted: true, productName: 'Test Product A' };
    const dialogRefMock = {
      afterClosed: () => of(deleteResult),
    } as unknown as MatDialogRef<ProductFormComponent>;
    jest.spyOn(dialog, 'open').mockReturnValue(dialogRefMock);

    routerEventsSubject.next(new NavigationEnd(1, '/inventory/1', '/inventory/1'));

    httpTesting.expectOne('/api/v1/products/1').flush(mockProducts[0]);

    // Flush the refresh request
    httpTesting.expectOne('/api/v1/products').flush(mockProducts.slice(1));

    expect(notificationSpy.showSuccess).toHaveBeenCalledWith("'Test Product A' removed");
  });

  // --- extractIdFromUrl Tests ---

  it('should extract ID from URL', () => {
    expect(component.extractIdFromUrl('/inventory/42')).toBe('42');
    expect(component.extractIdFromUrl('/inventory/new')).toBe('new');
    expect(component.extractIdFromUrl('/inventory')).toBeNull();
    expect(component.extractIdFromUrl('/about')).toBeNull();
  });
});
