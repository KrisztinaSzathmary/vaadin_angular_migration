import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { InventoryPage } from './pages/inventory.page';
import { ProductFormPage } from './pages/product-form.page';

const TEST_PRODUCT_NAME = `E2E Test Book ${Date.now()}`;

test.describe('Product Form (Iteration 12)', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let productForm: ProductFormPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    productForm = new ProductFormPage(page);

    // Login as admin before each test
    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    await inventoryPage.waitForTableLoaded();
  });

  test('New Product button opens dialog in create mode', async () => {
    await inventoryPage.clickNewProduct();
    await productForm.waitForOpen();

    await productForm.expectTitle('Add new product');
    await productForm.expectProductName('');
    await productForm.expectDiscardDisabled();
  });

  test('clicking a product row opens dialog in edit mode', async () => {
    const firstProductName = (await inventoryPage.getProductNames())[0];

    await inventoryPage.clickProductRow(firstProductName);
    await productForm.waitForOpen();

    await productForm.expectTitle('Edit product');
    await productForm.expectProductName(firstProductName.trim());
  });

  test('create new product and verify it appears in table', async () => {
    await inventoryPage.clickNewProduct();
    await productForm.waitForOpen();

    await productForm.fillProductName(TEST_PRODUCT_NAME);
    await productForm.fillPrice('29.99');
    await productForm.fillStockCount('15');
    await productForm.selectAvailability('Available');

    await productForm.clickAddProduct();
    await productForm.waitForClosed();

    // Verify product appears in table
    const row = inventoryPage.getRowByProductName(TEST_PRODUCT_NAME);
    await expect(row).toBeVisible();
    await expect(row).toContainText('29.99');
    await expect(row).toContainText('15');
  });

  test('edit existing product and verify changes in table', async () => {
    // First find the product we just created
    await inventoryPage.clickProductRow(TEST_PRODUCT_NAME);
    await productForm.waitForOpen();

    await productForm.expectTitle('Edit product');

    // Change price
    await productForm.fillPrice('39.99');
    await productForm.clickSave();
    await productForm.waitForClosed();

    // Verify change in table
    const row = inventoryPage.getRowByProductName(TEST_PRODUCT_NAME);
    await expect(row).toContainText('39.99');
  });

  test('non-admin user cannot open edit dialog on row click', async ({ page }) => {
    // Re-login as regular user
    await page.goto('/login');
    await loginPage.login('user1', 'user1');
    await inventoryPage.waitForTableLoaded();

    const firstProductName = (await inventoryPage.getProductNames())[0];
    await inventoryPage.clickProductRow(firstProductName);

    // Dialog should NOT open
    await expect(productForm.dialog).not.toBeVisible();
  });

  // --- Delete Tests (Iteration 13) ---

  test('Delete button is visible only in edit mode', async () => {
    // Create mode: no Delete button
    await inventoryPage.clickNewProduct();
    await productForm.waitForOpen();
    await expect(productForm.deleteButton).not.toBeVisible();
    await productForm.clickCancel();
    await productForm.waitForClosed();

    // Edit mode: Delete button visible
    const firstProductName = (await inventoryPage.getProductNames())[0];
    await inventoryPage.clickProductRow(firstProductName);
    await productForm.waitForOpen();
    await expect(productForm.deleteButton).toBeVisible();
    await productForm.clickCancel();
  });

  test('Cancel in confirm dialog keeps product', async () => {
    const firstProductName = (await inventoryPage.getProductNames())[0];

    await inventoryPage.clickProductRow(firstProductName);
    await productForm.waitForOpen();

    await productForm.clickDelete();

    // Confirm dialog should show product name
    await expect(productForm.confirmDialog).toContainText(`'${firstProductName.trim()}' will be deleted.`);

    // Cancel the deletion
    await productForm.cancelDelete();

    // Product form should still be open
    await expect(productForm.dialog).toBeVisible();
    await productForm.clickCancel();
    await productForm.waitForClosed();

    // Product should still be in table
    const row = inventoryPage.getRowByProductName(firstProductName);
    await expect(row).toBeVisible();
  });

  test('Confirm delete removes product and shows notification', async ({ page }) => {
    // Create a product to delete
    const deleteName = `Delete Me ${Date.now()}`;
    await inventoryPage.clickNewProduct();
    await productForm.waitForOpen();

    await productForm.fillProductName(deleteName);
    await productForm.fillPrice('1');
    await productForm.fillStockCount('1');
    await productForm.selectAvailability('Available');

    await productForm.clickAddProduct();
    await productForm.waitForClosed();

    // Verify it exists
    const row = inventoryPage.getRowByProductName(deleteName);
    await expect(row).toBeVisible();

    // Open product and delete
    await inventoryPage.clickProductRow(deleteName);
    await productForm.waitForOpen();

    await productForm.clickDelete();
    await productForm.confirmDelete();
    await productForm.waitForClosed();

    // Product should be gone from table
    await expect(row).not.toBeVisible();

    // Notification should appear
    const snackbar = page.locator('mat-snack-bar-container');
    await expect(snackbar).toContainText(`'${deleteName}' removed`);
  });
});
