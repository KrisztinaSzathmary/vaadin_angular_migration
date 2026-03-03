import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/product.model';

/**
 * Admin component.
 * Category management for admin users.
 */
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  template: `
    <div class="admin-container">
      <h1>{{ 'admin' | translate }}</h1>
      <h2>{{ 'admin-page.edit-categories' | translate }}</h2>

      <button mat-raised-button color="primary" (click)="addNewCategory()">
        <mat-icon>add</mat-icon>
        {{ 'admin-page.add-new-category' | translate }}
      </button>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else {
        <mat-card class="category-card">
          <mat-list>
            @for (category of categories(); track category.id) {
              @if (editingId() === category.id) {
                <mat-list-item>
                  <mat-form-field appearance="outline" class="edit-field">
                    <input matInput [(ngModel)]="editingName" (keyup.enter)="saveCategory(category)">
                  </mat-form-field>
                  <button mat-icon-button color="primary" (click)="saveCategory(category)">
                    <mat-icon>check</mat-icon>
                  </button>
                  <button mat-icon-button (click)="cancelEdit()">
                    <mat-icon>close</mat-icon>
                  </button>
                </mat-list-item>
              } @else {
                <mat-list-item>
                  <span matListItemTitle>{{ category.name }}</span>
                  <button mat-icon-button (click)="startEdit(category)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteCategory(category)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </mat-list-item>
              }
            }
          </mat-list>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 600px;

      h1 {
        margin-bottom: 8px;
      }

      h2 {
        color: #666;
        font-weight: normal;
        margin-bottom: 24px;
      }

      button {
        margin-bottom: 16px;
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .category-card {
      mat-list-item {
        display: flex;
        align-items: center;
      }

      .edit-field {
        flex: 1;
        margin-right: 8px;
      }
    }
  `]
})
export class AdminComponent implements OnInit {
  categories = signal<Category[]>([]);
  loading = signal(true);
  editingId = signal<number | null>(null);
  editingName = '';

  constructor(
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.loading.set(false);
        this.snackBar.open('Failed to load categories', 'OK', { duration: 3000 });
      }
    });
  }

  addNewCategory(): void {
    const newCategory: Category = { id: -1, name: 'New Category' };
    this.categories.update(cats => [...cats, newCategory]);
    this.startEdit(newCategory);
  }

  startEdit(category: Category): void {
    this.editingId.set(category.id);
    this.editingName = category.name;
  }

  cancelEdit(): void {
    // Remove unsaved new categories
    if (this.editingId() === -1) {
      this.categories.update(cats => cats.filter(c => c.id !== -1));
    }
    this.editingId.set(null);
    this.editingName = '';
  }

  saveCategory(category: Category): void {
    if (!this.editingName.trim()) {
      return;
    }

    const updatedCategory: Category = { ...category, name: this.editingName.trim() };

    if (category.id < 0) {
      // Create new
      this.categoryService.create(updatedCategory).subscribe({
        next: (saved) => {
          this.categories.update(cats =>
            cats.map(c => c.id === category.id ? saved : c)
          );
          this.editingId.set(null);
          this.snackBar.open(this.translate.instant('messages.category-saved'), 'OK', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error creating category:', err);
          this.snackBar.open('Failed to save category', 'OK', { duration: 3000 });
        }
      });
    } else {
      // Update existing
      this.categoryService.update(updatedCategory).subscribe({
        next: (saved) => {
          this.categories.update(cats =>
            cats.map(c => c.id === category.id ? saved : c)
          );
          this.editingId.set(null);
          this.snackBar.open(this.translate.instant('messages.category-saved'), 'OK', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error updating category:', err);
          this.snackBar.open('Failed to save category', 'OK', { duration: 3000 });
        }
      });
    }
  }

  deleteCategory(category: Category): void {
    if (category.id < 0) {
      this.categories.update(cats => cats.filter(c => c.id !== category.id));
      return;
    }

    this.categoryService.delete(category.id).subscribe({
      next: () => {
        this.categories.update(cats => cats.filter(c => c.id !== category.id));
        this.snackBar.open(this.translate.instant('messages.category-deleted'), 'OK', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error deleting category:', err);
        this.snackBar.open('Failed to delete category', 'OK', { duration: 3000 });
      }
    });
  }
}

export default AdminComponent;
