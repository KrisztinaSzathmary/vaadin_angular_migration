import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Product, Category, Availability } from '../../../../core/models/product.model';

export interface ProductFormData {
  product: Product;
  categories: Category[];
  isAdmin: boolean;
}

export interface ProductFormResult {
  action: 'save' | 'delete' | 'cancel';
  product?: Product;
}

/**
 * Product form component.
 * Dialog for creating/editing products.
 */
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{ 'new-product' | translate }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="productForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'product-name' | translate }}</mat-label>
          <input matInput formControlName="productName">
          @if (productForm.get('productName')?.hasError('required')) {
            <mat-error>{{ 'product-name' | translate }}</mat-error>
          }
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'price' | translate }}</mat-label>
            <input matInput type="number" formControlName="price" placeholder="0.00">
            <span matTextSuffix>EUR</span>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'in-stock' | translate }}</mat-label>
            <input matInput type="number" formControlName="stockCount" placeholder="0">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'availability' | translate }}</mat-label>
          <mat-select formControlName="availability">
            <mat-option value="AVAILABLE">{{ 'availability-status.available' | translate }}</mat-option>
            <mat-option value="COMING">{{ 'availability-status.coming' | translate }}</mat-option>
            <mat-option value="DISCONTINUED">{{ 'availability-status.discontinued' | translate }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'categories' | translate }}</mat-label>
          <mat-select formControlName="categoryIds" multiple>
            @for (category of data.categories; track category.id) {
              <mat-option [value]="category.id">{{ category.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        @if (productForm.hasError('availabilityMismatch')) {
          <p class="error-message">
            {{ 'errors.availability-mismatch' | translate }}
          </p>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      @if (!isNew && data.isAdmin) {
        <button mat-button color="warn" (click)="onDelete()">
          <mat-icon>delete</mat-icon>
          {{ 'delete' | translate }}
        </button>
      }
      <span class="spacer"></span>
      <button mat-button (click)="onCancel()">{{ 'cancel' | translate }}</button>
      <button mat-button (click)="onDiscard()" [disabled]="!hasChanges()">{{ 'discard' | translate }}</button>
      <button mat-raised-button color="primary"
              (click)="onSave()"
              [disabled]="productForm.invalid || !hasChanges()">
        {{ 'save' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
    }

    .full-width {
      width: 100%;
    }

    .form-row {
      display: flex;
      gap: 16px;

      mat-form-field {
        flex: 1;
      }
    }

    mat-form-field {
      margin-bottom: 8px;
    }

    .error-message {
      color: #f44336;
      font-size: 12px;
      margin-bottom: 16px;
    }

    .spacer {
      flex: 1;
    }

    mat-dialog-actions {
      padding: 16px 24px;
    }
  `]
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isNew: boolean;
  private initialValue: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductFormData,
    private translate: TranslateService
  ) {
    this.isNew = data.product.id < 0;
  }

  ngOnInit(): void {
    const categoryIds = this.data.product.category.map(c => c.id);

    this.productForm = this.fb.group({
      productName: [this.data.product.productName, [Validators.required, Validators.minLength(2)]],
      price: [this.data.product.price, [Validators.min(0)]],
      stockCount: [this.data.product.stockCount, [Validators.min(0)]],
      availability: [this.data.product.availability, Validators.required],
      categoryIds: [categoryIds]
    }, {
      validators: this.availabilityValidator
    });

    this.initialValue = this.productForm.value;
  }

  hasChanges(): boolean {
    return JSON.stringify(this.productForm.value) !== JSON.stringify(this.initialValue);
  }

  onSave(): void {
    if (this.productForm.invalid) {
      return;
    }

    const formValue = this.productForm.value;
    const selectedCategories = this.data.categories.filter(
      c => formValue.categoryIds.includes(c.id)
    );

    const product: Product = {
      id: this.data.product.id,
      productName: formValue.productName,
      price: formValue.price,
      stockCount: formValue.stockCount,
      availability: formValue.availability,
      category: selectedCategories
    };

    this.dialogRef.close({ action: 'save', product } as ProductFormResult);
  }

  onDelete(): void {
    this.dialogRef.close({ action: 'delete', product: this.data.product } as ProductFormResult);
  }

  onDiscard(): void {
    this.productForm.reset(this.initialValue);
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' } as ProductFormResult);
  }

  private availabilityValidator(control: AbstractControl): ValidationErrors | null {
    const availability = control.get('availability')?.value;
    const stockCount = control.get('stockCount')?.value;

    if (availability === 'AVAILABLE' && stockCount === 0) {
      return { availabilityMismatch: true };
    }

    return null;
  }
}
