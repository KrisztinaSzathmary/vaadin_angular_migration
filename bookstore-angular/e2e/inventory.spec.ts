import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { InventoryPage } from './pages/inventory.page';

test.describe('Inventory / Product List', () => {
  test.describe('as admin', () => {
    let inventoryPage: InventoryPage;

    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      inventoryPage = new InventoryPage(page);

      await loginPage.goto();
      await loginPage.login('admin', 'admin');
      await inventoryPage.waitForTableLoaded();
    });

    test('products load in table', async () => {
      await expect(inventoryPage.table).toBeVisible();
      const rows = inventoryPage.getTableRows();
      await expect(rows.first()).toBeVisible();
      expect(await rows.count()).toBeGreaterThan(0);
    });

    test('product count text matches row count', async () => {
      const rows = inventoryPage.getTableRows();
      const rowCount = await rows.count();

      await expect(inventoryPage.productCount).toContainText(`${rowCount} products in your catalog`);
    });

    test('status indicators are visible', async () => {
      await expect(inventoryPage.availableStatus).toBeVisible();
      await expect(inventoryPage.comingStatus).toBeVisible();
      await expect(inventoryPage.discontinuedStatus).toBeVisible();
    });

    test('sorting by price works', async () => {
      // Click Price header to sort ascending
      await inventoryPage.clickSortHeader('price');

      const ascValues = await inventoryPage.getColumnValues('price');
      const ascPrices = ascValues.map((v) => parseFloat(v.replace(/[^0-9.]/g, '')));
      for (let i = 1; i < ascPrices.length; i++) {
        expect(ascPrices[i]).toBeGreaterThanOrEqual(ascPrices[i - 1]);
      }

      // Click again to sort descending
      await inventoryPage.clickSortHeader('price');

      const descValues = await inventoryPage.getColumnValues('price');
      const descPrices = descValues.map((v) => parseFloat(v.replace(/[^0-9.]/g, '')));
      for (let i = 1; i < descPrices.length; i++) {
        expect(descPrices[i]).toBeLessThanOrEqual(descPrices[i - 1]);
      }
    });

    test('search filter filters by name', async () => {
      const initialCount = await inventoryPage.getTableRows().count();
      const firstProductNames = await inventoryPage.getProductNames();
      const searchTerm = firstProductNames[0].trim().substring(0, 4);

      await inventoryPage.fillSearch(searchTerm);

      // Wait for debounce and filtering
      await inventoryPage.page.waitForTimeout(500);

      const filteredCount = await inventoryPage.getTableRows().count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
      expect(filteredCount).toBeGreaterThan(0);

      const filteredNames = await inventoryPage.getProductNames();
      const hasMatch = filteredNames.some((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      expect(hasMatch).toBe(true);
    });

    test('clearing search filter shows all products', async () => {
      const initialCount = await inventoryPage.getTableRows().count();

      await inventoryPage.fillSearch('some-filter-text');
      await inventoryPage.page.waitForTimeout(500);

      await inventoryPage.clearSearch();
      await inventoryPage.page.waitForTimeout(500);

      const restoredCount = await inventoryPage.getTableRows().count();
      expect(restoredCount).toBe(initialCount);
    });
  });

  test('non-admin: New Product button is disabled', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login('user1', 'user1');
    await inventoryPage.waitForTableLoaded();

    await expect(inventoryPage.newProductButton).toBeDisabled();
  });
});
