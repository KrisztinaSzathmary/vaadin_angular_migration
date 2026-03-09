import { type Locator, type Page } from '@playwright/test';

export class AdminPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly editCategoriesHeading: Locator;
  readonly categoryCount: Locator;
  readonly addButton: Locator;
  readonly categoryRows: Locator;
  readonly categoryNameInput: Locator;
  readonly saveButton: Locator;
  readonly deleteButton: Locator;
  readonly cancelButton: Locator;
  readonly snackbar: Locator;
  readonly validationError: Locator;
  readonly confirmDialog: Locator;
  readonly confirmDialogConfirmButton: Locator;
  readonly confirmDialogCancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Admin', exact: true });
    this.subtitle = page.getByText('Manage your store categories and settings.');
    this.editCategoriesHeading = page.getByText('Edit categories');
    this.categoryCount = page.locator('text=/\\d+ categories/');
    this.addButton = page.getByRole('button', { name: /Add new category/i });
    this.categoryRows = page.locator('[data-testid="category-name"]');
    this.categoryNameInput = page.locator('[data-testid="category-name-input"]');
    this.saveButton = page.locator('[data-testid="save-category-btn"]');
    this.deleteButton = page.locator('[data-testid="delete-category-btn"]');
    this.cancelButton = page.locator('[data-testid="cancel-edit-btn"]');
    this.snackbar = page.locator('mat-snack-bar-container');
    this.validationError = page.locator('.text-red-600');
    this.confirmDialog = page.locator('mat-dialog-container');
    this.confirmDialogConfirmButton = this.confirmDialog.getByRole('button', { name: 'Confirm' });
    this.confirmDialogCancelButton = this.confirmDialog.getByRole('button', { name: 'Cancel' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin');
  }

  async waitForLoaded(): Promise<void> {
    await this.heading.waitFor({ state: 'visible' });
    await this.categoryRows.first().waitFor({ state: 'visible' });
  }

  getCategoryByName(name: string): Locator {
    return this.page.locator('[data-testid="category-name"]', { hasText: name });
  }

  async clickCategory(name: string): Promise<void> {
    await this.getCategoryByName(name).click();
  }

  async fillCategoryName(name: string): Promise<void> {
    await this.categoryNameInput.fill(name);
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click();
  }

  async clickDelete(): Promise<void> {
    await this.deleteButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async clickAdd(): Promise<void> {
    await this.addButton.click();
  }

  async getCategoryNames(): Promise<string[]> {
    return this.categoryRows.allTextContents();
  }

  async confirmDelete(): Promise<void> {
    await this.confirmDialogConfirmButton.click();
  }

  async cancelConfirmDialog(): Promise<void> {
    await this.confirmDialogCancelButton.click();
  }
}
