import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../../models/product.model';
import { Availability } from '../../models/availability.enum';

describe('ProductService', () => {
  let service: ProductService;
  let httpTesting: HttpTestingController;

  const mockProduct: Product = {
    id: 1,
    productName: 'Test Product',
    price: 19.99,
    stockCount: 100,
    availability: Availability.AVAILABLE,
    category: [{ id: 1, name: 'Category 1' }],
  };

  const mockProducts: Product[] = [
    mockProduct,
    {
      id: 2,
      productName: 'Another Product',
      price: 29.99,
      stockCount: 50,
      availability: Availability.COMING,
      category: [],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should send GET request to /api/v1/products', () => {
      service.getAll().subscribe((products) => {
        expect(products).toEqual(mockProducts);
      });

      const req = httpTesting.expectOne('/api/v1/products');
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });

    it('should set withCredentials to true', () => {
      service.getAll().subscribe();

      const req = httpTesting.expectOne('/api/v1/products');
      expect(req.request.withCredentials).toBe(true);
      req.flush([]);
    });
  });

  describe('getById', () => {
    it('should send GET request to /api/v1/products/{id}', () => {
      service.getById(1).subscribe((product) => {
        expect(product).toEqual(mockProduct);
      });

      const req = httpTesting.expectOne('/api/v1/products/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);
    });

    it('should set withCredentials to true', () => {
      service.getById(42).subscribe();

      const req = httpTesting.expectOne('/api/v1/products/42');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockProduct);
    });
  });

  describe('create', () => {
    it('should send POST request to /api/v1/products with product body', () => {
      service.create(mockProduct).subscribe((product) => {
        expect(product).toEqual(mockProduct);
      });

      const req = httpTesting.expectOne('/api/v1/products');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockProduct);
      req.flush(mockProduct);
    });

    it('should set withCredentials to true', () => {
      service.create(mockProduct).subscribe();

      const req = httpTesting.expectOne('/api/v1/products');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockProduct);
    });
  });

  describe('update', () => {
    it('should send PUT request to /api/v1/products/{id} with product body', () => {
      service.update(mockProduct).subscribe((product) => {
        expect(product).toEqual(mockProduct);
      });

      const req = httpTesting.expectOne('/api/v1/products/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockProduct);
      req.flush(mockProduct);
    });

    it('should set withCredentials to true', () => {
      service.update(mockProduct).subscribe();

      const req = httpTesting.expectOne('/api/v1/products/1');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockProduct);
    });
  });

  describe('delete', () => {
    it('should send DELETE request to /api/v1/products/{id}', () => {
      service.delete(1).subscribe();

      const req = httpTesting.expectOne('/api/v1/products/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should set withCredentials to true', () => {
      service.delete(1).subscribe();

      const req = httpTesting.expectOne('/api/v1/products/1');
      expect(req.request.withCredentials).toBe(true);
      req.flush(null);
    });
  });
});
