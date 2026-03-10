import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly apiUrl = '/api/v1/categories';
  private readonly http = inject(HttpClient);

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  create(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  update(category: Category): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${category.id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
