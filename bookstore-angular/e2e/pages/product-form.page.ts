import { expect, type Locator, type Page } from '@playwright/test';

export class ProductFormPage {
  readonly page: Page;
  readonly dialog: Locator;
  readonly title: Locator;
  readonly productNameInput: Locator;
  readonly priceInput: Locator;
  readonly stockCountInput: Locator;
  readonly availabilitySelect: Locator;
  readonly addProductButton: Locator;
  readonly saveButton: Locator;
  readonly discardButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;
  readonly deleteButton: Locator;
  readonly confirmDialog: Locator;
  readonly confirmDialogConfirmButton: Locator;
  readonly confirmDialogCancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.locator('app-product-form');
    this.title = this.dialog.locator('h2');
    this.productNameInput = this.dialog.locator('#productName');
    this.priceInput = this.dialog.locator('#price');
    this.stockCountInput = this.dialog.locator('#stockCount');
    this.availabilitySelect = this.dialog.locator('mat-select');
    this.addProductButton = this.dialog.getByRole('button', { name: 'Add product' });
    this.saveButton = this.dialog.getByRole('button', { name: 'Save' });
    this.discardButton = this.dialog.getByRole('button', { name: 'Discard' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.closeButton = this.dialog.locator('button', {
      has: page.locator('mat-icon:text("close")'),
    });
    this.deleteButton = this.dialog.getByRole('button', { name: 'Delete' });
    this.confirmDialog = page.locator('app-confirm-dialog');
    this.confirmDialogConfirmButton = this.confirmDialog.getByRole('button', { name: 'Confirm' });
    this.confirmDialogCancelButton = this.confirmDialog.getByRole('button', { name: 'Cancel' });
  }

  async waitForOpen(): Promise<void> {
    await this.dialog.waitFor({ state: 'visible' });
  }

  async waitForClosed(): Promise<void> {
    await this.dialog.waitFor({ state: 'detached' });
  }

  async fillProductName(name: string): Promise<void> {
    await this.productNameInput.clear();
    await this.productNameInput.fill(name);
  }

  async fillPrice(price: string): Promise<void> {
    await this.priceInput.clear();
    await this.priceInput.fill(price);
  }

  async fillStockCount(count: string): Promise<void> {
    await this.stockCountInput.clear();
    await this.stockCountInput.fill(count);
  }

  async selectAvailability(label: string): Promise<void> {
    await this.availabilitySelect.click();
    await this.page.getByRole('option', { name: label }).click();
  }

  async toggleCategory(name: string): Promise<void> {
    await this.dialog.locator(`button[role="option"]`, { hasText: name }).click();
  }

  async isCategorySelected(name: string): Promise<boolean> {
    const chip = this.dialog.locator(`button[role="option"]`, { hasText: name });
    const ariaSelected = await chip.getAttribute('aria-selected');
    return ariaSelected === 'true';
  }

  async clickAddProduct(): Promise<void> {
    await this.addProductButton.click();
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click();
  }

  async clickDiscard(): Promise<void> {
    await this.discardButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async expectTitle(expected: string): Promise<void> {
    await expect(this.title).toHaveText(expected);
  }

  async expectProductName(expected: string): Promise<void> {
    await expect(this.productNameInput).toHaveValue(expected);
  }

  async expectDiscardDisabled(): Promise<void> {
    await expect(this.discardButton).toBeDisabled();
  }

  async expectDiscardEnabled(): Promise<void> {
    await expect(this.discardButton).toBeEnabled();
  }

  async clickDelete(): Promise<void> {
    await this.deleteButton.click();
  }

  async confirmDelete(): Promise<void> {
    await this.confirmDialog.waitFor({ state: 'visible' });
    await this.confirmDialogConfirmButton.click();
  }

  async cancelDelete(): Promise<void> {
    await this.confirmDialog.waitFor({ state: 'visible' });
    await this.confirmDialogCancelButton.click();
  }
}
