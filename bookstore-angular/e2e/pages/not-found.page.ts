import { type Locator, type Page } from '@playwright/test';

export class NotFoundPage {
  readonly page: Page;
  readonly message: Locator;

  constructor(page: Page) {
    this.page = page;
    this.message = page.getByText('The view could not be found.');
  }
}
