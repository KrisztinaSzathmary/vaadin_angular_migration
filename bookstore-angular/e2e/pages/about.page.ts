import { type Locator, type Page } from '@playwright/test';

export class AboutPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly versionBadge: Locator;
  readonly totalProducts: Locator;
  readonly availableProducts: Locator;
  readonly totalStock: Locator;
  readonly categoryCount: Locator;
  readonly systemSection: Locator;
  readonly technologySection: Locator;
  readonly footerText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Bookstore', exact: true });
    this.subtitle = page.getByText('Inventory management system');
    this.versionBadge = page.locator('.bg-indigo-50.text-indigo-700', { hasText: 'v1.1-SNAPSHOT' });
    this.totalProducts = page.locator('[data-testid="total-products"]');
    this.availableProducts = page.locator('[data-testid="available-products"]');
    this.totalStock = page.locator('[data-testid="total-stock"]');
    this.categoryCount = page.locator('[data-testid="category-count"]');
    this.systemSection = page.getByRole('heading', { name: 'System' });
    this.technologySection = page.getByRole('heading', { name: 'Technology' });
    this.footerText = page.getByText('Built with modern web technologies');
  }

  async goto(): Promise<void> {
    await this.page.goto('/about');
  }

  async waitForLoaded(): Promise<void> {
    await this.heading.waitFor({ state: 'visible' });
    await this.totalProducts.waitFor({ state: 'visible' });
  }
}
