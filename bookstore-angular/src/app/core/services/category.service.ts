import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/product.model';

/**
 * Category service.
 * Handles all category-related HTTP operations.
 */
@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiUrl = '/api/categories';

  constructor(private http: HttpClient) {}

  /**
   * Get all categories.
   * @returns Observable with array of categories
   */
  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  /**
   * Create a new category.
   * @param category Category to create
   * @returns Observable with created category
   */
  create(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  /**
   * Update an existing category.
   * @param category Category to update
   * @returns Observable with updated category
   */
  update(category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${category.id}`, category);
  }

  /**
   * Delete a category.
   * @param id Category ID
   * @returns Observable that completes on success
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
