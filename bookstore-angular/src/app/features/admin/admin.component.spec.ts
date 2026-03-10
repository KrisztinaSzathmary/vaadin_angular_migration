import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AdminComponent } from './admin.component';
import { Category } from '../../models/category.model';
import { TranslateTestModule } from '../../testing/translate-testing';

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "Children's books" },
  { id: 2, name: 'Best sellers' },
  { id: 3, name: 'Romance' },
];

describe('AdminComponent', () => {
  let fixture: ComponentFixture<AdminComponent>;
  let component: AdminComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComponent, NoopAnimationsModule, TranslateTestModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
  });

  function flushCategories(categories: Category[] = MOCK_CATEGORIES): void {
    fixture.detectChanges();
    const req = httpMock.expectOne('/api/v1/categories');
    req.flush(categories);
    fixture.detectChanges();
  }

  afterEach(() => {
    httpMock.verify();
  });

  // --- Rendering (7) ---

  it('should create', () => {
    flushCategories();
    expect(component).toBeTruthy();
  });

  it('should show loading state initially', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Loading categories...');
    httpMock.expectOne('/api/v1/categories').flush(MOCK_CATEGORIES);
  });

  it('should display page title "Admin"', () => {
    flushCategories();
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent).toContain('Admin');
  });

  it('should display subtitle', () => {
    flushCategories();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Manage your store categories and settings.');
  });

  it('should display "Edit categories" heading', () => {
    flushCategories();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Edit categories');
  });

  it('should display category count', () => {
    flushCategories();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('3 categories');
  });

  it('should display category names', () => {
    flushCategories();
    const names = fixture.nativeElement.querySelectorAll('[data-testid="category-name"]');
    expect(names.length).toBe(3);
    expect(names[0].textContent.trim()).toBe("Children's books");
    expect(names[1].textContent.trim()).toBe('Best sellers');
    expect(names[2].textContent.trim()).toBe('Romance');
  });

  // --- Inline-Editing (5) ---

  it('should enter edit mode when clicking on category name', () => {
    flushCategories();
    const nameEl = fixture.nativeElement.querySelector('[data-testid="category-name"]');
    nameEl.click();
    fixture.detectChanges();

    expect(component.editingCategoryId()).toBe(1);
    const input = fixture.nativeElement.querySelector('[data-testid="category-name-input"]');
    expect(input).toBeTruthy();
  });

  it('should populate input with current category name in edit mode', () => {
    flushCategories();
    component.onEditCategory(MOCK_CATEGORIES[1]);
    fixture.detectChanges();

    expect(component.nameControl.value).toBe('Best sellers');
  });

  it('should show Save, Delete, and Cancel buttons in edit mode', () => {
    flushCategories();
    component.onEditCategory(MOCK_CATEGORIES[0]);
    fixture.detectChanges();

    const saveBtn = fixture.nativeElement.querySelector('[data-testid="save-category-btn"]');
    const deleteBtn = fixture.nativeElement.querySelector('[data-testid="delete-category-btn"]');
    const cancelBtn = fixture.nativeElement.querySelector('[data-testid="cancel-edit-btn"]');
    expect(saveBtn).toBeTruthy();
    expect(deleteBtn).toBeTruthy();
    expect(cancelBtn).toBeTruthy();
  });

  it('should hide Delete button for new category (id < 0)', () => {
    flushCategories();
    component.onAddCategory();
    fixture.detectChanges();

    const deleteBtn = fixture.nativeElement.querySelector('[data-testid="delete-category-btn"]');
    expect(deleteBtn).toBeNull();
  });

  it('should only allow one row to be edited at a time', () => {
    flushCategories();
    component.onEditCategory(MOCK_CATEGORIES[0]);
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('[data-testid="category-name-input"]');
    expect(inputs.length).toBe(1);
  });

  // --- Validation (3) ---

  it('should prevent saving when name is less than 2 characters', () => {
    flushCategories();
    component.onEditCategory(MOCK_CATEGORIES[0]);
    component.nameControl.setValue('A');
    component.onSaveCategory();
    fixture.detectChanges();

    expect(component.nameControl.invalid).toBe(true);
    // No HTTP request should be made
    httpMock.expectNone('/api/v1/categories/1');
  });

  it('should show validation error message', () => {
    flushCategories();
    component.onEditCategory(MOCK_CATEGORIES[0]);
    component.nameControl.setValue('A');
    component.nameControl.markAsTouched();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.text-red-600');
    expect(errorEl.textContent).toContain('Name must be at least 2 characters.');
  });

  it('should allow saving with valid name', () => {
    flushCategories();
    component.onEditCategory(MOCK_CATEGORIES[0]);
    component.nameControl.setValue('Updated Name');
    component.onSaveCategory();

    const req = httpMock.expectOne('/api/v1/categories/1');
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  // --- CRUD (8) ---

  it('should call create API for new category', () => {
    flushCategories();
    component.onAddCategory();
    component.nameControl.setValue('New Category');
    component.onSaveCategory();

    const req = httpMock.expectOne('/api/v1/categories');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ id: -1, name: 'New Category' });
    req.flush({ id: 9, name: 'New Category' });
  });

  it('should replace sentinel entry with server response after create', () => {
    flushCategories();
    component.onAddCategory();
    component.nameControl.setValue('New Category');
    component.onSaveCategory();

    const req = httpMock.expectOne('/api/v1/categories');
    req.flush({ id: 9, name: 'New Category' });

    const cats = component.categories();
    expect(cats.find((c) => c.id === -1)).toBeUndefined();
    expect(cats.find((c) => c.id === 9)?.name).toBe('New Category');
  });

  it('should call update API for existing category', () => {
    flushCategories();
    component.onEditCategory(MOCK_CATEGORIES[0]);
    component.nameControl.setValue('Updated Name');
    component.onSaveCategory();

    const req = httpMock.expectOne('/api/v1/categories/1');
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  it('should update category name locally after update', () => {
    flushCategories();
    component.onEditCategory(MOCK_CATEGORIES[0]);
    component.nameControl.setValue('Updated Name');
    component.onSaveCategory();

    httpMock.expectOne('/api/v1/categories/1').flush(null);

    expect(component.categories()[0].name).toBe('Updated Name');
  });

  it('should open confirm dialog when deleting category', () => {
    flushCategories();
    const dialogSpy = jest.spyOn(component['dialog'], 'open').mockReturnValue({
      afterClosed: () => of(false),
    } as MatDialogRef<unknown>);

    component.onDeleteCategory(MOCK_CATEGORIES[0]);

    expect(dialogSpy).toHaveBeenCalled();
    const dialogData = dialogSpy.mock.calls[0][1]?.data as { message: string };
    expect(dialogData.message).toContain("Children's books");
  });

  it('should call delete API when confirm dialog is confirmed', () => {
    flushCategories();
    jest.spyOn(component['dialog'], 'open').mockReturnValue({
      afterClosed: () => of(true),
    } as MatDialogRef<unknown>);

    component.onDeleteCategory(MOCK_CATEGORIES[0]);

    const req = httpMock.expectOne('/api/v1/categories/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should remove category from list after delete', () => {
    flushCategories();
    jest.spyOn(component['dialog'], 'open').mockReturnValue({
      afterClosed: () => of(true),
    } as MatDialogRef<unknown>);

    component.onDeleteCategory(MOCK_CATEGORIES[0]);
    httpMock.expectOne('/api/v1/categories/1').flush(null);

    expect(component.categories().find((c) => c.id === 1)).toBeUndefined();
    expect(component.categories().length).toBe(2);
  });

  it('should not call delete API when confirm dialog is cancelled', () => {
    flushCategories();
    jest.spyOn(component['dialog'], 'open').mockReturnValue({
      afterClosed: () => of(undefined),
    } as MatDialogRef<unknown>);

    component.onDeleteCategory(MOCK_CATEGORIES[0]);

    httpMock.expectNone('/api/v1/categories/1');
    expect(component.categories().length).toBe(3);
  });

  // --- Notifications (4) ---

  it('should show "Category saved" notification after create', () => {
    flushCategories();
    const notifSpy = jest.spyOn(component['notificationService'], 'showSuccess');

    component.onAddCategory();
    component.nameControl.setValue('New Category');
    component.onSaveCategory();

    httpMock.expectOne('/api/v1/categories').flush({ id: 9, name: 'New Category' });

    expect(notifSpy).toHaveBeenCalledWith('Category saved');
  });

  it('should show "Category saved" notification after update', () => {
    flushCategories();
    const notifSpy = jest.spyOn(component['notificationService'], 'showSuccess');

    component.onEditCategory(MOCK_CATEGORIES[0]);
    component.nameControl.setValue('Updated');
    component.onSaveCategory();

    httpMock.expectOne('/api/v1/categories/1').flush(null);

    expect(notifSpy).toHaveBeenCalledWith('Category saved');
  });

  it('should show "Category deleted" notification after delete', () => {
    flushCategories();
    const notifSpy = jest.spyOn(component['notificationService'], 'showSuccess');

    jest.spyOn(component['dialog'], 'open').mockReturnValue({
      afterClosed: () => of(true),
    } as MatDialogRef<unknown>);

    component.onDeleteCategory(MOCK_CATEGORIES[0]);
    httpMock.expectOne('/api/v1/categories/1').flush(null);

    expect(notifSpy).toHaveBeenCalledWith('Category deleted');
  });

  it('should show error notification on API error', () => {
    flushCategories();
    const notifSpy = jest.spyOn(component['notificationService'], 'showError');

    component.onEditCategory(MOCK_CATEGORIES[0]);
    component.nameControl.setValue('Updated');
    component.onSaveCategory();

    httpMock
      .expectOne('/api/v1/categories/1')
      .flush({ error: 'Server error' }, { status: 500, statusText: 'Server Error' });

    expect(notifSpy).toHaveBeenCalledWith('Server error');
  });

  // --- Add / Cancel (3) ---

  it('should add empty row when clicking "Add new category"', () => {
    flushCategories();
    component.onAddCategory();

    expect(component.categories().length).toBe(4);
    expect(component.categories()[3]).toEqual({ id: -1, name: '' });
    expect(component.editingCategoryId()).toBe(-1);
  });

  it('should disable "Add new category" button during editing', () => {
    flushCategories();
    component.onEditCategory(MOCK_CATEGORIES[0]);
    fixture.detectChanges();

    const addBtn = fixture.nativeElement.querySelector('button[disabled]');
    expect(addBtn).toBeTruthy();
    expect(addBtn.textContent).toContain('Add new category');
  });

  it('should remove new category on cancel and restore existing on cancel', () => {
    flushCategories();

    // Cancel new category removes it
    component.onAddCategory();
    expect(component.categories().length).toBe(4);
    component.onCancelEdit();
    expect(component.categories().length).toBe(3);
    expect(component.editingCategoryId()).toBeNull();

    // Cancel existing category just exits edit mode
    component.onEditCategory(MOCK_CATEGORIES[0]);
    expect(component.editingCategoryId()).toBe(1);
    component.onCancelEdit();
    expect(component.editingCategoryId()).toBeNull();
    expect(component.categories().length).toBe(3);
  });

  // --- Error State ---

  it('should display error message when API fails to load categories', () => {
    fixture.detectChanges();
    httpMock
      .expectOne('/api/v1/categories')
      .flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Failed to load categories');
  });
});
