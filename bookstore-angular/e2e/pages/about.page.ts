import { type Locator, type Page } from '@playwright/test';

export class AboutPage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'About' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/about');
  }
}
