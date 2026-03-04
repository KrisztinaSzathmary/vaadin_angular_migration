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

  test('Cancel closes dialog without saving', async () => {
    await inventoryPage.clickNewProduct();
    await productForm.waitForOpen();

    await productForm.fillProductName('Should Not Be Saved');
    await productForm.clickCancel();
    await productForm.waitForClosed();

    // Product should NOT appear in table
    const names = await inventoryPage.getProductNames();
    expect(names.join()).not.toContain('Should Not Be Saved');
  });

  test('Discard resets form to initial values', async () => {
    const firstProductName = (await inventoryPage.getProductNames())[0];

    await inventoryPage.clickProductRow(firstProductName);
    await productForm.waitForOpen();

    // Modify and verify discard is enabled
    await productForm.fillProductName('Modified Name');
    await productForm.expectDiscardEnabled();

    // Discard
    await productForm.clickDiscard();
    await productForm.expectProductName(firstProductName.trim());
    await productForm.expectDiscardDisabled();
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

  test('category selection toggles correctly', async () => {
    await inventoryPage.clickNewProduct();
    await productForm.waitForOpen();

    // Wait for categories to render
    const categoryChips = productForm.dialog.locator('button[role="option"]');
    await categoryChips.first().waitFor({ state: 'visible' });

    const categoryName = (await categoryChips.first().textContent())!.trim();

    // Initially not selected
    const chip = productForm.dialog.locator('button[role="option"]', { hasText: categoryName });
    await expect(chip).toHaveAttribute('aria-selected', 'false');

    // Toggle on
    await chip.click();
    await expect(chip).toHaveAttribute('aria-selected', 'true');

    // Toggle off
    await chip.click();
    await expect(chip).toHaveAttribute('aria-selected', 'false');

    await productForm.clickCancel();
  });

  test('form validation prevents saving with empty name', async () => {
    await inventoryPage.clickNewProduct();
    await productForm.waitForOpen();

    // Leave name empty, fill other fields
    await productForm.fillPrice('10');
    await productForm.fillStockCount('5');

    await productForm.clickAddProduct();

    // Dialog should stay open (validation prevents save)
    await expect(productForm.dialog).toBeVisible();
    // Validation error should show
    await expect(productForm.dialog.getByText('Product name is required.')).toBeVisible();

    await productForm.clickCancel();
  });

  test('close button (X) closes dialog', async () => {
    await inventoryPage.clickNewProduct();
    await productForm.waitForOpen();

    await productForm.closeButton.click();
    await productForm.waitForClosed();
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

  test('success notification appears after creating product', async ({ page }) => {
    const uniqueName = `Notification Test ${Date.now()}`;

    await inventoryPage.clickNewProduct();
    await productForm.waitForOpen();

    await productForm.fillProductName(uniqueName);
    await productForm.fillPrice('5');
    await productForm.fillStockCount('1');
    await productForm.selectAvailability('Available');

    await productForm.clickAddProduct();
    await productForm.waitForClosed();

    // Snackbar notification should appear
    const snackbar = page.locator('mat-snack-bar-container');
    await expect(snackbar).toContainText('Product created');
  });
});
