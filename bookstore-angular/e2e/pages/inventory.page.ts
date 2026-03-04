import { type Locator, type Page } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly productCount: Locator;
  readonly searchInput: Locator;
  readonly newProductButton: Locator;
  readonly loadingText: Locator;
  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Inventory' });
    this.productCount = page.locator('p.text-gray-500').filter({ hasText: 'products in your catalog' });
    this.searchInput = page.getByPlaceholder('Search name, availability or category...');
    this.newProductButton = page.getByRole('button', { name: 'New product' });
    this.loadingText = page.getByText('Loading products...');
    this.table = page.locator('table');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory');
  }

  async waitForTableLoaded(): Promise<void> {
    await this.table.waitFor({ state: 'visible' });
  }

  getTableRows(): Locator {
    return this.page.locator('tr[mat-row]');
  }

  getRowByProductName(name: string): Locator {
    return this.page.locator('tr[mat-row]').filter({ hasText: name });
  }

  async getProductNames(): Promise<string[]> {
    const cells = this.page.locator('td.mat-column-productName');
    return cells.allTextContents();
  }

  async clickNewProduct(): Promise<void> {
    await this.newProductButton.click();
  }

  async clickProductRow(name: string): Promise<void> {
    await this.getRowByProductName(name).click();
  }
}
