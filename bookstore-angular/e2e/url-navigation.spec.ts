import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { InventoryPage } from './pages/inventory.page';
import { ProductFormPage } from './pages/product-form.page';

test.describe('URL-based Product Navigation', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let productForm: ProductFormPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    productForm = new ProductFormPage(page);

    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    await inventoryPage.waitForTableLoaded();
  });

  test('/inventory/:id opens edit dialog with correct product', async ({ page }) => {
    // Get first product name from the table
    const firstProductName = (await inventoryPage.getProductNames())[0].trim();

    // Click to navigate via URL
    await inventoryPage.clickProductRow(firstProductName);
    await productForm.waitForOpen();

    // Verify URL changed
    expect(page.url()).toMatch(/\/inventory\/\d+/);

    // Verify correct product is loaded
    await productForm.expectTitle('Edit product');
    await productForm.expectProductName(firstProductName);

    await productForm.clickCancel();
  });

  test('/inventory/new opens create dialog', async ({ page }) => {
    await inventoryPage.gotoNewProduct();
    await productForm.waitForOpen();

    await productForm.expectTitle('Add new product');
    await productForm.expectProductName('');
    expect(page.url()).toContain('/inventory/new');

    await productForm.clickCancel();
  });

  test('invalid non-numeric product ID shows error notification', async ({ page }) => {
    await inventoryPage.gotoProduct('abc');

    const snackbar = page.locator('mat-snack-bar-container');
    await expect(snackbar).toContainText("Invalid product ID: 'abc'");
  });

  test('non-existent numeric product ID shows error notification', async ({ page }) => {
    await inventoryPage.gotoProduct(999999);

    const snackbar = page.locator('mat-snack-bar-container');
    await expect(snackbar).toContainText('Product with ID 999999 not found');
  });
});
