import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { InventoryPage } from './pages/inventory.page';
import { SidebarPage } from './pages/sidebar.page';

test.describe('Authentication', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
  });

  test('login with valid credentials redirects to inventory', async () => {
    await loginPage.goto();
    await loginPage.login('admin', 'admin');

    await expect(inventoryPage.heading).toBeVisible();
    await expect(loginPage.page).toHaveURL(/\/inventory/);
  });

  test('login with invalid credentials shows error message', async () => {
    await loginPage.goto();
    await loginPage.login('invalid', 'wrong');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.page).toHaveURL(/\/login/);
  });

  test('logout redirects to login page', async ({ page }) => {
    const sidebar = new SidebarPage(page);

    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    await inventoryPage.waitForTableLoaded();

    await sidebar.clickLogout();

    await expect(loginPage.heading).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
