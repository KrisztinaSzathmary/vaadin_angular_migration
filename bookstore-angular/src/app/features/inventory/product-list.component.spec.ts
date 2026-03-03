import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { ProductListComponent } from './product-list.component';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../models/product.model';
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

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let httpTesting: HttpTestingController;
  const isAdminSignal = signal(false);

  beforeEach(async () => {
    isAdminSignal.set(false);

    await TestBed.configureTestingModule({
      imports: [ProductListComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: { isAdmin: isAdminSignal },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function loadProducts(): void {
    fixture.detectChanges();
    httpTesting.expectOne('/api/v1/products').flush(mockProducts);
    fixture.detectChanges();
  }

  it('should create', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/v1/products').flush([]);
    expect(component).toBeTruthy();
  });

  it('should show loading state initially', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Loading products...');
    httpTesting.expectOne('/api/v1/products').flush([]);
  });

  it('should load products from API on init', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne('/api/v1/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
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
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Failed to load products');
  });

  it('should hide loading on error', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/v1/products').error(new ProgressEvent('error'));
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
});
