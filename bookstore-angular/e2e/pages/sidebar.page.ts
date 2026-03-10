import { type Locator, type Page } from '@playwright/test';

export class SidebarPage {
  readonly page: Page;
  readonly logo: Locator;
  readonly inventoryLink: Locator;
  readonly aboutLink: Locator;
  readonly adminLink: Locator;
  readonly logoutButton: Locator;
  readonly hamburgerButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.locator('nav').getByText('Bookstore');
    this.inventoryLink = page.locator('nav a[routerLink="/inventory"]');
    this.aboutLink = page.locator('nav a[routerLink="/about"]');
    this.adminLink = page.locator('nav a[routerLink="/admin"]');
    this.logoutButton = page.locator('nav button', { hasText: 'Logout' });
    this.hamburgerButton = page.locator('button[aria-label="Toggle menu"]');
  }

  async clickInventory(): Promise<void> {
    await this.inventoryLink.click();
  }

  async clickAbout(): Promise<void> {
    await this.aboutLink.click();
  }

  async clickAdmin(): Promise<void> {
    await this.adminLink.click();
  }

  async clickLogout(): Promise<void> {
    await this.logoutButton.click();
  }

  async clickHamburger(): Promise<void> {
    await this.hamburgerButton.click();
  }
}
