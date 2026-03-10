import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { InventoryPage } from './pages/inventory.page';
import { NotFoundPage } from './pages/not-found.page';

test.describe('Route Guards', () => {
  test('unauthenticated access to /inventory redirects to /login', async ({ page }) => {
    await page.goto('/inventory');

    const loginPage = new LoginPage(page);
    await expect(loginPage.heading).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('non-admin access to /admin redirects to /inventory', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login('user1', 'user1');
    await inventoryPage.waitForTableLoaded();

    // Navigate via Angular router (not full page reload) to preserve auth state
    await page.evaluate(() => {
      window.history.pushState({}, '', '/admin');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    await expect(inventoryPage.heading).toBeVisible();
    await expect(page).toHaveURL(/\/inventory/);
  });

  test('unknown route shows not-found message', async ({ page }) => {
    await page.goto('/xyz');

    const notFoundPage = new NotFoundPage(page);
    await expect(notFoundPage.message).toBeVisible();
  });
});
