import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { SidebarPage } from './pages/sidebar.page';
import { InventoryPage } from './pages/inventory.page';

test.describe('Responsive Design', () => {
  test.describe('Mobile Login (<570px)', () => {
    test.use({ viewport: { width: 500, height: 800 } });

    test('language selector visible on mobile login page', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      const languageSelect = page.locator('[data-testid="language-select-mobile"]');
      await expect(languageSelect).toBeVisible();
    });
  });

  test.describe('Mobile (<570px)', () => {
    test.use({ viewport: { width: 500, height: 800 } });

    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('admin', 'admin');
      await page.waitForURL('**/inventory');
    });

    test('hamburger menu visible, sidebar hidden', async ({ page }) => {
      const sidebar = new SidebarPage(page);
      await expect(sidebar.hamburgerButton).toBeVisible();
      await expect(sidebar.inventoryLink).not.toBeVisible();
    });

    test('drawer opens on hamburger click and shows nav links', async ({ page }) => {
      const sidebar = new SidebarPage(page);
      await sidebar.clickHamburger();
      await expect(sidebar.inventoryLink).toBeVisible();
      await expect(sidebar.aboutLink).toBeVisible();
    });

    test('drawer closes on navigation', async ({ page }) => {
      const sidebar = new SidebarPage(page);
      await sidebar.clickHamburger();
      await expect(sidebar.aboutLink).toBeVisible();
      await sidebar.clickAbout();
      await page.waitForURL('**/about');
      await expect(sidebar.inventoryLink).not.toBeVisible();
    });

    test('table shows only 3 columns', async ({ page }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.waitForTableLoaded();
      const headers = page.locator('th[mat-header-cell]');
      await expect(headers).toHaveCount(3);
    });

    test('product form opens as fullscreen', async ({ page }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.waitForTableLoaded();
      await inventoryPage.clickNewProduct();
      const dialog = page.locator('.fullscreen-dialog');
      await expect(dialog).toBeVisible();
    });
  });

  test.describe('Tablet (570px–799px)', () => {
    test.use({ viewport: { width: 700, height: 900 } });

    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('admin', 'admin');
      await page.waitForURL('**/inventory');
    });

    test('hamburger visible, table shows all 5 columns', async ({ page }) => {
      const sidebar = new SidebarPage(page);
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.waitForTableLoaded();
      await expect(sidebar.hamburgerButton).toBeVisible();
      const headers = page.locator('th[mat-header-cell]');
      await expect(headers).toHaveCount(5);
    });
  });

  test.describe('Desktop (≥800px)', () => {
    test.use({ viewport: { width: 1024, height: 768 } });

    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('admin', 'admin');
      await page.waitForURL('**/inventory');
    });

    test('sidebar permanently visible, no hamburger', async ({ page }) => {
      const sidebar = new SidebarPage(page);
      await expect(sidebar.inventoryLink).toBeVisible();
      await expect(sidebar.hamburgerButton).not.toBeVisible();
    });

    test('table shows all 5 columns', async ({ page }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.waitForTableLoaded();
      const headers = page.locator('th[mat-header-cell]');
      await expect(headers).toHaveCount(5);
    });
  });
});
