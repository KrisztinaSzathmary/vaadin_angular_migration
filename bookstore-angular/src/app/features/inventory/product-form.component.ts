import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NgClass } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Availability } from '../../models/availability.enum';

export interface ProductDeletedResult {
  deleted: true;
  productName: string;
}

export interface ProductFormData {
  product: Product | null;
  categories: Category[];
}

export function availabilityStockValidator(control: AbstractControl): ValidationErrors | null {
  const availability = control.get('availability')?.value as Availability;
  const stockCount = control.get('stockCount')?.value as number;

  if (availability === Availability.AVAILABLE && stockCount <= 0) {
    return { availabilityMismatch: 'Available products must have stock count greater than 0' };
  }
  if (availability === Availability.DISCONTINUED && stockCount !== 0) {
    return { availabilityMismatch: 'Discontinued products must have stock count of 0' };
  }
  if (availability === Availability.COMING && stockCount !== 0) {
    return { availabilityMismatch: 'Coming products must have stock count of 0' };
  }
  return null;
}

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    NgClass,
  ],
})
export class ProductFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<ProductFormComponent>);
  private readonly data: ProductFormData = inject(MAT_DIALOG_DATA);

  readonly isEditMode = computed(() => this.data.product !== null);
  readonly isSaving = signal(false);
  readonly isDeleting = signal(false);
  readonly categories = this.data.categories;
  readonly availabilities = [
    Availability.AVAILABLE,
    Availability.COMING,
    Availability.DISCONTINUED,
  ];

  readonly productForm = this.fb.nonNullable.group(
    {
      productName: [
        this.data.product?.productName ?? '',
        [Validators.required, Validators.minLength(2)],
      ],
      price: [this.data.product?.price ?? 0, [Validators.required, Validators.min(0)]],
      stockCount: [this.data.product?.stockCount ?? 0, [Validators.required, Validators.min(0)]],
      availability: [
        (this.data.product?.availability ?? Availability.AVAILABLE) as Availability,
        Validators.required,
      ],
      categoryIds: [this.data.product?.category.map((c) => c.id) ?? ([] as number[])],
    },
    { validators: availabilityStockValidator },
  );

  private readonly initialValues = this.productForm.getRawValue();

  onSave(): void {
    this.productForm.markAllAsTouched();
    if (this.productForm.invalid) {
      return;
    }

    this.isSaving.set(true);
    const formValue = this.productForm.getRawValue();
    const selectedCategories = this.categories.filter((c) => formValue.categoryIds.includes(c.id));

    const product: Product = {
      id: this.data.product?.id ?? 0,
      productName: formValue.productName,
      price: formValue.price,
      stockCount: formValue.stockCount,
      availability: formValue.availability,
      category: selectedCategories,
    };

    const operation = this.isEditMode()
      ? this.productService.update(product)
      : this.productService.create(product);

    operation.subscribe({
      next: (saved) => {
        this.isSaving.set(false);
        this.dialogRef.close(saved);
      },
      error: (err: { error?: { error?: string } }) => {
        this.isSaving.set(false);
        const message = err.error?.error ?? 'Failed to save product';
        this.notificationService.showError(message);
      },
    });
  }

  onDelete(): void {
    const productName = this.data.product?.productName ?? '';
    const dialogData: ConfirmDialogData = {
      message: `'${productName}' will be deleted.`,
    };

    this.dialog
      .open(ConfirmDialogComponent, { data: dialogData })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (confirmed) {
          this.executeDelete();
        }
      });
  }

  private executeDelete(): void {
    const productId = this.data.product?.id;
    if (productId === undefined) {
      return;
    }

    this.isDeleting.set(true);
    this.productService.delete(productId).subscribe({
      next: () => {
        this.isDeleting.set(false);
        const result: ProductDeletedResult = {
          deleted: true,
          productName: this.data.product?.productName ?? '',
        };
        this.dialogRef.close(result);
      },
      error: (err: { error?: { error?: string } }) => {
        this.isDeleting.set(false);
        const message = err.error?.error ?? 'Failed to delete product';
        this.notificationService.showError(message);
      },
    });
  }

  onDiscard(): void {
    this.productForm.reset(this.initialValues);
    this.productForm.markAsPristine();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  toggleCategory(id: number): void {
    const current = this.productForm.controls.categoryIds.value;
    const index = current.indexOf(id);
    const updated = index >= 0 ? current.filter((cId) => cId !== id) : [...current, id];
    this.productForm.controls.categoryIds.setValue(updated);
    this.productForm.controls.categoryIds.markAsDirty();
  }

  isCategorySelected(id: number): boolean {
    return this.productForm.controls.categoryIds.value.includes(id);
  }

  formatAvailability(availability: Availability): string {
    switch (availability) {
      case Availability.AVAILABLE:
        return 'Available';
      case Availability.COMING:
        return 'Coming';
      case Availability.DISCONTINUED:
        return 'Discontinued';
    }
  }
}
