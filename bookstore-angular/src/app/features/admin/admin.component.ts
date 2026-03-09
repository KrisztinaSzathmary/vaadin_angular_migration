import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CategoryService } from '../../core/services/category.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule],
})
export class AdminComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly editingCategoryId = signal<number | null>(null);
  readonly isSaving = signal(false);
  readonly categoryCount = computed(() => this.categories().length);

  readonly nameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2)],
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load categories');
        this.loading.set(false);
      },
    });
  }

  onAddCategory(): void {
    this.categories.update((cats) => [...cats, { id: -1, name: '' }]);
    this.editingCategoryId.set(-1);
    this.nameControl.reset('');
  }

  onEditCategory(category: Category): void {
    this.editingCategoryId.set(category.id);
    this.nameControl.reset(category.name);
  }

  onSaveCategory(): void {
    this.nameControl.markAsTouched();
    if (this.nameControl.invalid) {
      return;
    }

    const id = this.editingCategoryId();
    if (id === null) {
      return;
    }

    const name = this.nameControl.value;
    this.isSaving.set(true);

    if (id === -1) {
      this.categoryService.create({ id: -1, name }).subscribe({
        next: (created) => {
          this.categories.update((cats) => cats.map((c) => (c.id === -1 ? created : c)));
          this.editingCategoryId.set(null);
          this.isSaving.set(false);
          this.notificationService.showSuccess('Category saved');
        },
        error: (err: { error?: { error?: string } }) => {
          this.isSaving.set(false);
          this.notificationService.showError(err.error?.error ?? 'Failed to save category');
        },
      });
    } else {
      this.categoryService.update({ id, name }).subscribe({
        next: () => {
          this.categories.update((cats) => cats.map((c) => (c.id === id ? { ...c, name } : c)));
          this.editingCategoryId.set(null);
          this.isSaving.set(false);
          this.notificationService.showSuccess('Category saved');
        },
        error: (err: { error?: { error?: string } }) => {
          this.isSaving.set(false);
          this.notificationService.showError(err.error?.error ?? 'Failed to save category');
        },
      });
    }
  }

  onDeleteCategory(category: Category): void {
    const dialogData: ConfirmDialogData = {
      message: `'${category.name}' will be deleted.`,
    };

    this.dialog
      .open(ConfirmDialogComponent, { data: dialogData })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (confirmed) {
          this.executeDelete(category);
        }
      });
  }

  onCancelEdit(): void {
    const id = this.editingCategoryId();
    if (id === -1) {
      this.categories.update((cats) => cats.filter((c) => c.id !== -1));
    }
    this.editingCategoryId.set(null);
  }

  private executeDelete(category: Category): void {
    this.categoryService.delete(category.id).subscribe({
      next: () => {
        this.categories.update((cats) => cats.filter((c) => c.id !== category.id));
        this.editingCategoryId.set(null);
        this.notificationService.showSuccess('Category deleted');
      },
      error: (err: { error?: { error?: string } }) => {
        this.notificationService.showError(err.error?.error ?? 'Failed to delete category');
      },
    });
  }
}
