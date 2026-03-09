import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { InventoryPage } from './pages/inventory.page';
import { ProductFormPage } from './pages/product-form.page';

test.describe('Unsaved Changes (Iteration 17)', () => {
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

  test('Cancel without changes closes dialog without confirm', async () => {
    await inventoryPage.clickNewProduct();
    await productForm.waitForOpen();

    await productForm.clickCancel();
    await productForm.waitForClosed();
  });

  test('Cancel with changes - Confirm closes dialog', async () => {
    await inventoryPage.clickNewProduct();
    await productForm.waitForOpen();

    await productForm.fillProductName('Dirty State');
    await productForm.clickCancel();

    await productForm.confirmUnsavedChanges();
    await productForm.waitForClosed();
  });

  test('Cancel with changes - Cancel keeps dialog open', async () => {
    await inventoryPage.clickNewProduct();
    await productForm.waitForOpen();

    await productForm.fillProductName('Dirty State');
    await productForm.clickCancel();

    await productForm.cancelUnsavedChanges();
    await expect(productForm.dialog).toBeVisible();
    await productForm.expectProductName('Dirty State');
  });

  test('Discard with changes - Confirm resets form', async () => {
    const firstProductName = (await inventoryPage.getProductNames())[0].trim();

    await inventoryPage.clickProductRow(firstProductName);
    await productForm.waitForOpen();

    await productForm.fillProductName('Modified');
    await productForm.clickDiscard();

    await productForm.confirmUnsavedChanges();

    await productForm.expectProductName(firstProductName);
    await productForm.expectDiscardDisabled();
  });

  test('Escape with changes shows confirm dialog', async ({ page }) => {
    await inventoryPage.clickNewProduct();
    await productForm.waitForOpen();

    await productForm.fillProductName('Escape Test');
    await page.keyboard.press('Escape');

    await expect(productForm.confirmDialog).toBeVisible();
  });
});
