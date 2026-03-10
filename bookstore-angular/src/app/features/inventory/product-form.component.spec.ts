import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import {
  ProductFormComponent,
  ProductFormData,
  ProductDeletedResult,
  availabilityStockValidator,
} from './product-form.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Availability } from '../../models/availability.enum';
import { NotificationService } from '../../core/services/notification.service';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateTestModule } from '../../testing/translate-testing';

const mockCategories: Category[] = [
  { id: 1, name: 'Best sellers' },
  { id: 2, name: 'Cookbooks' },
  { id: 3, name: 'Mystery' },
];

const mockProduct: Product = {
  id: 42,
  productName: 'Existing Book',
  price: 19.99,
  stockCount: 10,
  availability: Availability.AVAILABLE,
  category: [
    { id: 1, name: 'Best sellers' },
    { id: 3, name: 'Mystery' },
  ],
};

function createData(product: Product | null): ProductFormData {
  return { product, categories: mockCategories };
}

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let httpTesting: HttpTestingController;
  let dialogRefSpy: jest.Mocked<MatDialogRef<ProductFormComponent>>;
  let notificationSpy: jest.Mocked<NotificationService>;

  function setup(data: ProductFormData): void {
    dialogRefSpy = { close: jest.fn() } as unknown as jest.Mocked<
      MatDialogRef<ProductFormComponent>
    >;
    notificationSpy = {
      showSuccess: jest.fn(),
      showError: jest.fn(),
    } as unknown as jest.Mocked<NotificationService>;

    TestBed.configureTestingModule({
      imports: [ProductFormComponent, NoopAnimationsModule, TranslateTestModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: NotificationService, useValue: notificationSpy },
      ],
    });

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  }

  afterEach(() => {
    httpTesting.verify();
  });

  // --- Rendering ---

  it('should create', () => {
    setup(createData(null));
    expect(component).toBeTruthy();
  });

  it('should show title "Add new product" in create mode', () => {
    setup(createData(null));
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Add new product');
  });

  it('should show title "Edit product" in edit mode', () => {
    setup(createData(mockProduct));
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Edit product');
  });

  it('should show subtitle', () => {
    setup(createData(null));
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain(
      'Fill in the details below to add a new book to your inventory.',
    );
  });

  it('should render all form fields', () => {
    setup(createData(null));
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('input[formControlName="productName"]')).toBeTruthy();
    expect(el.querySelector('input[formControlName="price"]')).toBeTruthy();
    expect(el.querySelector('input[formControlName="stockCount"]')).toBeTruthy();
    expect(el.querySelector('mat-select[formControlName="availability"]')).toBeTruthy();
  });

  it('should render category chips for all categories', () => {
    setup(createData(null));
    const chips = fixture.nativeElement.querySelectorAll('button[role="option"]');
    expect(chips.length).toBe(3);
    expect(fixture.nativeElement.textContent).toContain('Best sellers');
    expect(fixture.nativeElement.textContent).toContain('Cookbooks');
    expect(fixture.nativeElement.textContent).toContain('Mystery');
  });

  it('should render Cancel, Discard, and Save/Add buttons', () => {
    setup(createData(null));
    const el: HTMLElement = fixture.nativeElement;
    const buttons = el.querySelectorAll('button');
    const buttonTexts = Array.from(buttons).map((b) => b.textContent?.trim());
    expect(buttonTexts.some((t) => t?.includes('Cancel'))).toBe(true);
    expect(buttonTexts.some((t) => t?.includes('Discard'))).toBe(true);
    expect(buttonTexts.some((t) => t?.includes('Add product'))).toBe(true);
  });

  // --- Form Initialization ---

  it('should have empty values in create mode', () => {
    setup(createData(null));
    expect(component.productForm.controls.productName.value).toBe('');
    expect(component.productForm.controls.price.value).toBe(0);
    expect(component.productForm.controls.stockCount.value).toBe(0);
    expect(component.productForm.controls.availability.value).toBe(Availability.AVAILABLE);
    expect(component.productForm.controls.categoryIds.value).toEqual([]);
  });

  it('should have pre-filled values in edit mode', () => {
    setup(createData(mockProduct));
    expect(component.productForm.controls.productName.value).toBe('Existing Book');
    expect(component.productForm.controls.price.value).toBe(19.99);
    expect(component.productForm.controls.stockCount.value).toBe(10);
    expect(component.productForm.controls.availability.value).toBe(Availability.AVAILABLE);
  });

  it('should have categories pre-selected in edit mode', () => {
    setup(createData(mockProduct));
    expect(component.productForm.controls.categoryIds.value).toEqual([1, 3]);
  });

  // --- Field Validation ---

  it('should require productName', () => {
    setup(createData(null));
    const ctrl = component.productForm.controls.productName;
    ctrl.setValue('');
    ctrl.markAsTouched();
    expect(ctrl.hasError('required')).toBe(true);
  });

  it('should validate productName minLength(2)', () => {
    setup(createData(null));
    const ctrl = component.productForm.controls.productName;
    ctrl.setValue('A');
    ctrl.markAsTouched();
    expect(ctrl.hasError('minlength')).toBe(true);
  });

  it('should accept productName with 2+ characters', () => {
    setup(createData(null));
    const ctrl = component.productForm.controls.productName;
    ctrl.setValue('AB');
    expect(ctrl.valid).toBe(true);
  });

  it('should invalidate negative price', () => {
    setup(createData(null));
    const ctrl = component.productForm.controls.price;
    ctrl.setValue(-1);
    expect(ctrl.hasError('min')).toBe(true);
  });

  it('should accept price of 0', () => {
    setup(createData(null));
    const ctrl = component.productForm.controls.price;
    ctrl.setValue(0);
    expect(ctrl.hasError('min')).toBe(false);
  });

  it('should invalidate negative stockCount', () => {
    setup(createData(null));
    const ctrl = component.productForm.controls.stockCount;
    ctrl.setValue(-1);
    expect(ctrl.hasError('min')).toBe(true);
  });

  it('should accept stockCount of 0', () => {
    setup(createData(null));
    const ctrl = component.productForm.controls.stockCount;
    ctrl.setValue(0);
    expect(ctrl.hasError('min')).toBe(false);
  });

  it('should require availability', () => {
    setup(createData(null));
    const ctrl = component.productForm.controls.availability;
    ctrl.setValue('' as unknown as Availability);
    expect(ctrl.hasError('required')).toBe(true);
  });

  // --- Cross-Field Validation (standalone function) ---

  describe('availabilityStockValidator', () => {
    function makeGroup(availability: Availability, stockCount: number): FormGroup {
      return new FormGroup({
        availability: new FormControl(availability),
        stockCount: new FormControl(stockCount),
      });
    }

    it('should error when AVAILABLE and stockCount is 0', () => {
      const result = availabilityStockValidator(makeGroup(Availability.AVAILABLE, 0));
      expect(result?.['availabilityMismatch']).toBeTruthy();
    });

    it('should error when DISCONTINUED and stockCount > 0', () => {
      const result = availabilityStockValidator(makeGroup(Availability.DISCONTINUED, 5));
      expect(result?.['availabilityMismatch']).toBeTruthy();
    });

    it('should error when COMING and stockCount > 0', () => {
      const result = availabilityStockValidator(makeGroup(Availability.COMING, 3));
      expect(result?.['availabilityMismatch']).toBeTruthy();
    });

    it('should be valid when AVAILABLE and stockCount > 0', () => {
      const result = availabilityStockValidator(makeGroup(Availability.AVAILABLE, 5));
      expect(result).toBeNull();
    });

    it('should be valid when DISCONTINUED and stockCount is 0', () => {
      const result = availabilityStockValidator(makeGroup(Availability.DISCONTINUED, 0));
      expect(result).toBeNull();
    });

    it('should be valid when COMING and stockCount is 0', () => {
      const result = availabilityStockValidator(makeGroup(Availability.COMING, 0));
      expect(result).toBeNull();
    });
  });

  // --- Category Interaction ---

  it('should toggle category selection', () => {
    setup(createData(null));
    expect(component.isCategorySelected(1)).toBe(false);
    component.toggleCategory(1);
    expect(component.isCategorySelected(1)).toBe(true);
    component.toggleCategory(1);
    expect(component.isCategorySelected(1)).toBe(false);
  });

  it('should mark categoryIds as dirty after toggle', () => {
    setup(createData(null));
    expect(component.productForm.controls.categoryIds.dirty).toBe(false);
    component.toggleCategory(1);
    expect(component.productForm.controls.categoryIds.dirty).toBe(true);
  });

  // --- Save ---

  it('should not save when form is invalid', () => {
    setup(createData(null));
    component.productForm.controls.productName.setValue('');
    component.onSave();
    httpTesting.expectNone('/api/v1/products');
  });

  it('should call ProductService.create() in create mode with correct data', () => {
    setup(createData(null));
    component.productForm.patchValue({
      productName: 'New Book',
      price: 12.5,
      stockCount: 5,
      availability: Availability.AVAILABLE,
      categoryIds: [1],
    });

    component.onSave();
    const req = httpTesting.expectOne('/api/v1/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.productName).toBe('New Book');
    expect(req.request.body.price).toBe(12.5);
    expect(req.request.body.stockCount).toBe(5);
    expect(req.request.body.category).toEqual([{ id: 1, name: 'Best sellers' }]);
    req.flush({ ...req.request.body, id: 99 });
  });

  it('should call ProductService.update() in edit mode with correct data', () => {
    setup(createData(mockProduct));
    component.productForm.controls.productName.setValue('Updated Book');

    component.onSave();
    const req = httpTesting.expectOne('/api/v1/products/42');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.productName).toBe('Updated Book');
    expect(req.request.body.id).toBe(42);
    req.flush({ ...req.request.body });
  });

  it('should close dialog with saved product on success', () => {
    setup(createData(null));
    component.productForm.patchValue({
      productName: 'New Book',
      price: 10,
      stockCount: 5,
      availability: Availability.AVAILABLE,
      categoryIds: [],
    });

    component.onSave();
    const savedProduct = {
      id: 99,
      productName: 'New Book',
      price: 10,
      stockCount: 5,
      availability: Availability.AVAILABLE,
      category: [],
    };
    httpTesting.expectOne('/api/v1/products').flush(savedProduct);

    expect(dialogRefSpy.close).toHaveBeenCalledWith(savedProduct);
  });

  it('should set isSaving during API call', () => {
    setup(createData(null));
    component.productForm.patchValue({
      productName: 'New Book',
      price: 10,
      stockCount: 5,
      availability: Availability.AVAILABLE,
    });

    component.onSave();
    expect(component.isSaving()).toBe(true);

    httpTesting.expectOne('/api/v1/products').flush({ id: 1 });
    expect(component.isSaving()).toBe(false);
  });

  it('should reset isSaving and show error notification on error', () => {
    setup(createData(null));
    component.productForm.patchValue({
      productName: 'New Book',
      price: 10,
      stockCount: 5,
      availability: Availability.AVAILABLE,
    });

    component.onSave();
    httpTesting.expectOne('/api/v1/products').error(new ProgressEvent('error'));
    expect(component.isSaving()).toBe(false);
    expect(notificationSpy.showError).toHaveBeenCalledWith('Failed to save product');
  });

  // --- canClose ---

  it('should return true from canClose when form is pristine', (done) => {
    setup(createData(mockProduct));
    component.canClose().subscribe((result) => {
      expect(result).toBe(true);
      done();
    });
  });

  it('should open confirm dialog from canClose when form is dirty', () => {
    setup(createData(mockProduct));
    component.productForm.controls.productName.setValue('Changed');
    component.productForm.controls.productName.markAsDirty();

    const confirmDialogRef = {
      afterClosed: () => of(undefined),
    } as unknown as MatDialogRef<ConfirmDialogComponent>;
    const openSpy = jest.spyOn(component['dialog'], 'open').mockReturnValue(confirmDialogRef);

    component.canClose().subscribe();

    expect(openSpy).toHaveBeenCalledWith(ConfirmDialogComponent, {
      data: { message: 'You have unsaved changes. Discard them?' },
    });
  });

  it('should return true from canClose when user confirms', (done) => {
    setup(createData(mockProduct));
    component.productForm.controls.productName.setValue('Changed');
    component.productForm.controls.productName.markAsDirty();

    const confirmDialogRef = {
      afterClosed: () => of(true),
    } as unknown as MatDialogRef<ConfirmDialogComponent>;
    jest.spyOn(component['dialog'], 'open').mockReturnValue(confirmDialogRef);

    component.canClose().subscribe((result) => {
      expect(result).toBe(true);
      done();
    });
  });

  it('should return false from canClose when user cancels', (done) => {
    setup(createData(mockProduct));
    component.productForm.controls.productName.setValue('Changed');
    component.productForm.controls.productName.markAsDirty();

    const confirmDialogRef = {
      afterClosed: () => of(undefined),
    } as unknown as MatDialogRef<ConfirmDialogComponent>;
    jest.spyOn(component['dialog'], 'open').mockReturnValue(confirmDialogRef);

    component.canClose().subscribe((result) => {
      expect(result).toBe(false);
      done();
    });
  });

  // --- Discard ---

  it('should do nothing on discard when form is pristine', () => {
    setup(createData(mockProduct));
    const openSpy = jest.spyOn(component['dialog'], 'open');

    component.onDiscard();

    expect(openSpy).not.toHaveBeenCalled();
  });

  it('should open confirm dialog on discard when form is dirty', () => {
    setup(createData(mockProduct));
    component.productForm.controls.productName.setValue('Changed');
    component.productForm.controls.productName.markAsDirty();

    const confirmDialogRef = {
      afterClosed: () => of(undefined),
    } as unknown as MatDialogRef<ConfirmDialogComponent>;
    const openSpy = jest.spyOn(component['dialog'], 'open').mockReturnValue(confirmDialogRef);

    component.onDiscard();

    expect(openSpy).toHaveBeenCalledWith(ConfirmDialogComponent, {
      data: { message: 'Discard all changes?' },
    });
  });

  it('should reset form to initial values on discard when confirmed', () => {
    setup(createData(mockProduct));
    component.productForm.controls.productName.setValue('Changed');
    component.productForm.controls.productName.markAsDirty();
    expect(component.productForm.controls.productName.value).toBe('Changed');

    const confirmDialogRef = {
      afterClosed: () => of(true),
    } as unknown as MatDialogRef<ConfirmDialogComponent>;
    jest.spyOn(component['dialog'], 'open').mockReturnValue(confirmDialogRef);

    component.onDiscard();
    expect(component.productForm.controls.productName.value).toBe('Existing Book');
    expect(component.productForm.pristine).toBe(true);
  });

  it('should not reset form on discard when cancelled', () => {
    setup(createData(mockProduct));
    component.productForm.controls.productName.setValue('Changed');
    component.productForm.controls.productName.markAsDirty();

    const confirmDialogRef = {
      afterClosed: () => of(undefined),
    } as unknown as MatDialogRef<ConfirmDialogComponent>;
    jest.spyOn(component['dialog'], 'open').mockReturnValue(confirmDialogRef);

    component.onDiscard();
    expect(component.productForm.controls.productName.value).toBe('Changed');
    expect(component.productForm.dirty).toBe(true);
  });

  // --- Cancel / Close ---

  it('should close dialog directly on cancel when form is pristine', () => {
    setup(createData(null));
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should not close dialog on cancel when dirty and user cancels confirm', () => {
    setup(createData(mockProduct));
    component.productForm.controls.productName.setValue('Changed');
    component.productForm.controls.productName.markAsDirty();

    const confirmDialogRef = {
      afterClosed: () => of(undefined),
    } as unknown as MatDialogRef<ConfirmDialogComponent>;
    jest.spyOn(component['dialog'], 'open').mockReturnValue(confirmDialogRef);

    component.onCancel();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should close dialog on cancel when dirty and user confirms', () => {
    setup(createData(mockProduct));
    component.productForm.controls.productName.setValue('Changed');
    component.productForm.controls.productName.markAsDirty();

    const confirmDialogRef = {
      afterClosed: () => of(true),
    } as unknown as MatDialogRef<ConfirmDialogComponent>;
    jest.spyOn(component['dialog'], 'open').mockReturnValue(confirmDialogRef);

    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  // --- Delete ---

  it('should not show Delete button in create mode', () => {
    setup(createData(null));
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const deleteBtn = Array.from(buttons).find(
      (b) => (b as HTMLElement).textContent?.trim() === 'Delete',
    );
    expect(deleteBtn).toBeFalsy();
  });

  it('should show Delete button in edit mode', () => {
    setup(createData(mockProduct));
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const deleteBtn = Array.from(buttons).find(
      (b) => (b as HTMLElement).textContent?.trim() === 'Delete',
    );
    expect(deleteBtn).toBeTruthy();
  });

  it('should open confirm dialog on delete', () => {
    setup(createData(mockProduct));
    const confirmDialogRef = {
      afterClosed: () => of(undefined),
    } as unknown as MatDialogRef<ConfirmDialogComponent>;
    // Access component's injected MatDialog via bracket notation
    const openSpy = jest.spyOn(component['dialog'], 'open').mockReturnValue(confirmDialogRef);

    component.onDelete();

    expect(openSpy).toHaveBeenCalledWith(ConfirmDialogComponent, {
      data: { message: "'Existing Book' will be deleted." },
    });
  });

  it('should not delete when confirm dialog is cancelled', () => {
    setup(createData(mockProduct));
    const confirmDialogRef = {
      afterClosed: () => of(undefined),
    } as unknown as MatDialogRef<ConfirmDialogComponent>;
    jest.spyOn(component['dialog'], 'open').mockReturnValue(confirmDialogRef);

    component.onDelete();

    httpTesting.expectNone('/api/v1/products/42');
  });

  it('should call ProductService.delete() when confirmed', () => {
    setup(createData(mockProduct));
    const confirmDialogRef = {
      afterClosed: () => of(true),
    } as unknown as MatDialogRef<ConfirmDialogComponent>;
    jest.spyOn(component['dialog'], 'open').mockReturnValue(confirmDialogRef);

    component.onDelete();

    const req = httpTesting.expectOne('/api/v1/products/42');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('should close dialog with deleted result on successful delete', () => {
    setup(createData(mockProduct));
    const confirmDialogRef = {
      afterClosed: () => of(true),
    } as unknown as MatDialogRef<ConfirmDialogComponent>;
    jest.spyOn(component['dialog'], 'open').mockReturnValue(confirmDialogRef);

    component.onDelete();
    httpTesting
      .expectOne('/api/v1/products/42')
      .flush(null, { status: 204, statusText: 'No Content' });

    const expectedResult: ProductDeletedResult = {
      deleted: true,
      productName: 'Existing Book',
    };
    expect(dialogRefSpy.close).toHaveBeenCalledWith(expectedResult);
  });

  it('should set isDeleting during delete API call', () => {
    setup(createData(mockProduct));
    const confirmDialogRef = {
      afterClosed: () => of(true),
    } as unknown as MatDialogRef<ConfirmDialogComponent>;
    jest.spyOn(component['dialog'], 'open').mockReturnValue(confirmDialogRef);

    component.onDelete();
    expect(component.isDeleting()).toBe(true);

    httpTesting
      .expectOne('/api/v1/products/42')
      .flush(null, { status: 204, statusText: 'No Content' });
    expect(component.isDeleting()).toBe(false);
  });

  it('should show error notification on delete failure', () => {
    setup(createData(mockProduct));
    const confirmDialogRef = {
      afterClosed: () => of(true),
    } as unknown as MatDialogRef<ConfirmDialogComponent>;
    jest.spyOn(component['dialog'], 'open').mockReturnValue(confirmDialogRef);

    component.onDelete();
    httpTesting.expectOne('/api/v1/products/42').error(new ProgressEvent('error'));

    expect(component.isDeleting()).toBe(false);
    expect(notificationSpy.showError).toHaveBeenCalledWith('Failed to delete product');
  });
});
