import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { VERSION } from '@angular/core';
import { AboutComponent } from './about.component';
import { Product } from '../../models/product.model';
import { Availability } from '../../models/availability.enum';
import { Category } from '../../models/category.model';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    productName: 'Book A',
    price: 10,
    stockCount: 50,
    availability: Availability.AVAILABLE,
    category: [],
  },
  {
    id: 2,
    productName: 'Book B',
    price: 20,
    stockCount: 30,
    availability: Availability.AVAILABLE,
    category: [],
  },
  {
    id: 3,
    productName: 'Book C',
    price: 15,
    stockCount: 0,
    availability: Availability.COMING,
    category: [],
  },
  {
    id: 4,
    productName: 'Book D',
    price: 25,
    stockCount: 0,
    availability: Availability.DISCONTINUED,
    category: [],
  },
];

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Fiction' },
  { id: 2, name: 'Non-fiction' },
  { id: 3, name: 'Sci-fi' },
];

describe('AboutComponent', () => {
  let fixture: ComponentFixture<AboutComponent>;
  let component: AboutComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
  });

  function flushData(
    products: Product[] = MOCK_PRODUCTS,
    categories: Category[] = MOCK_CATEGORIES,
  ): void {
    fixture.detectChanges();
    httpMock.expectOne('/api/v1/products').flush(products);
    httpMock.expectOne('/api/v1/categories').flush(categories);
    fixture.detectChanges();
  }

  afterEach(() => {
    httpMock.verify();
  });

  // --- Rendering ---

  it('should create', () => {
    flushData();
    expect(component).toBeTruthy();
  });

  it('should display "Bookstore" heading', () => {
    flushData();
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent).toContain('Bookstore');
  });

  it('should display subtitle "Inventory management system"', () => {
    flushData();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Inventory management system');
  });

  it('should display version badge', () => {
    flushData();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('v1.1-SNAPSHOT');
  });

  // --- Stats Cards ---

  it('should display total products count', () => {
    flushData();
    const stat = fixture.nativeElement.querySelector('[data-testid="total-products"]');
    expect(stat.textContent.trim()).toBe('4');
  });

  it('should display available products count', () => {
    flushData();
    const stat = fixture.nativeElement.querySelector('[data-testid="available-products"]');
    expect(stat.textContent.trim()).toBe('2');
  });

  it('should display total stock', () => {
    flushData();
    const stat = fixture.nativeElement.querySelector('[data-testid="total-stock"]');
    expect(stat.textContent.trim()).toBe('80');
  });

  it('should display category count', () => {
    flushData();
    const stat = fixture.nativeElement.querySelector('[data-testid="category-count"]');
    expect(stat.textContent.trim()).toBe('3');
  });

  // --- System Info ---

  it('should display system section', () => {
    flushData();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('System');
    expect(el.textContent).toContain('Environment');
    expect(el.textContent).toContain('Production');
  });

  it('should display Angular runtime version', () => {
    flushData();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(`Angular ${VERSION.major}`);
  });

  // --- Technology Info ---

  it('should display technology section', () => {
    flushData();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Technology');
    expect(el.textContent).toContain('Framework');
    expect(el.textContent).toContain('UI Library');
    expect(el.textContent).toContain('Styling');
    expect(el.textContent).toContain('Language');
  });

  it('should display technology values', () => {
    flushData();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(`Angular ${VERSION.major}`);
    expect(el.textContent).toContain('Angular Material 20');
    expect(el.textContent).toContain('Tailwind CSS 4');
    expect(el.textContent).toContain('TypeScript 5.9');
  });

  it('should have technology links with target _blank', () => {
    flushData();
    const links = fixture.nativeElement.querySelectorAll('a[target="_blank"]');
    expect(links.length).toBe(4);
    expect(links[0].href).toContain('angular.dev');
  });

  // --- Footer ---

  it('should display footer text', () => {
    flushData();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Built with modern web technologies');
  });

  // --- Data Fetching ---

  it('should fetch products and categories on init', () => {
    fixture.detectChanges();
    const productReq = httpMock.expectOne('/api/v1/products');
    const categoryReq = httpMock.expectOne('/api/v1/categories');
    expect(productReq.request.method).toBe('GET');
    expect(categoryReq.request.method).toBe('GET');
    productReq.flush(MOCK_PRODUCTS);
    categoryReq.flush(MOCK_CATEGORIES);
  });

  it('should handle product API error gracefully', () => {
    fixture.detectChanges();
    httpMock.expectOne('/api/v1/products').flush(null, { status: 500, statusText: 'Server Error' });
    httpMock.expectOne('/api/v1/categories').flush(MOCK_CATEGORIES);
    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.totalProducts()).toBe(0);
  });

  // --- Computed Signals ---

  it('should compute stats correctly with different data', () => {
    const products: Product[] = [
      {
        id: 1,
        productName: 'X',
        price: 5,
        stockCount: 100,
        availability: Availability.AVAILABLE,
        category: [],
      },
    ];
    flushData(products, []);

    expect(component.totalProducts()).toBe(1);
    expect(component.availableProducts()).toBe(1);
    expect(component.totalStock()).toBe(100);
    expect(component.categoryCount()).toBe(0);
  });
});
