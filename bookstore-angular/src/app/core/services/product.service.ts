import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

/**
 * Product service.
 * Handles all product-related HTTP operations.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = '/api/products';

  constructor(private http: HttpClient) {}

  /**
   * Get all products.
   * @returns Observable with array of products
   */
  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  /**
   * Get a single product by ID.
   * @param id Product ID
   * @returns Observable with product
   */
  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new product.
   * @param product Product to create
   * @returns Observable with created product
   */
  create(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  /**
   * Update an existing product.
   * @param product Product to update
   * @returns Observable with updated product
   */
  update(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${product.id}`, product);
  }

  /**
   * Save a product (create or update based on ID).
   * @param product Product to save
   * @returns Observable with saved product
   */
  save(product: Product): Observable<Product> {
    if (product.id < 0) {
      return this.create(product);
    }
    return this.update(product);
  }

  /**
   * Delete a product.
   * @param id Product ID
   * @returns Observable that completes on success
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
