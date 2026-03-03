import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CategoryService } from './category.service';
import { Category } from '../../models/category.model';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpTesting: HttpTestingController;

  const mockCategory: Category = { id: 1, name: 'Electronics' };

  const mockCategories: Category[] = [
    mockCategory,
    { id: 2, name: 'Books' },
    { id: 3, name: 'Clothing' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CategoryService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should send GET request to /api/v1/categories', () => {
      service.getAll().subscribe((categories) => {
        expect(categories).toEqual(mockCategories);
      });

      const req = httpTesting.expectOne('/api/v1/categories');
      expect(req.request.method).toBe('GET');
      req.flush(mockCategories);
    });
  });

  describe('create', () => {
    it('should send POST request to /api/v1/categories with category body', () => {
      service.create(mockCategory).subscribe((category) => {
        expect(category).toEqual(mockCategory);
      });

      const req = httpTesting.expectOne('/api/v1/categories');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCategory);
      req.flush(mockCategory);
    });
  });

  describe('update', () => {
    it('should send PUT request to /api/v1/categories/{id} with category body', () => {
      service.update(mockCategory).subscribe();

      const req = httpTesting.expectOne('/api/v1/categories/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockCategory);
      req.flush(null);
    });
  });

  describe('delete', () => {
    it('should send DELETE request to /api/v1/categories/{id}', () => {
      service.delete(1).subscribe();

      const req = httpTesting.expectOne('/api/v1/categories/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
