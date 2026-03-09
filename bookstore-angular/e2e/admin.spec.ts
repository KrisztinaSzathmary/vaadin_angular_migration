import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { AdminPage } from './pages/admin.page';
import { SidebarPage } from './pages/sidebar.page';

test.describe('Admin – Category Management (Iteration 14)', () => {
  let loginPage: LoginPage;
  let adminPage: AdminPage;
  let sidebar: SidebarPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    adminPage = new AdminPage(page);
    sidebar = new SidebarPage(page);

    // Login as admin and navigate to admin page
    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    await sidebar.clickAdmin();
    await adminPage.waitForLoaded();
  });

  test('should display heading and category list', async () => {
    await expect(adminPage.heading).toBeVisible();
    await expect(adminPage.subtitle).toBeVisible();
    await expect(adminPage.editCategoriesHeading).toBeVisible();
    await expect(adminPage.categoryRows.first()).toBeVisible();
  });

  test('should display correct category count', async () => {
    const names = await adminPage.getCategoryNames();
    const count = names.length;
    await expect(adminPage.categoryCount).toContainText(`${count} categories`);
  });

  test('should enter edit mode on category click', async () => {
    const names = await adminPage.getCategoryNames();
    const firstName = names[0].trim();

    await adminPage.clickCategory(firstName);

    await expect(adminPage.categoryNameInput).toBeVisible();
    await expect(adminPage.categoryNameInput).toHaveValue(firstName);
    await expect(adminPage.saveButton).toBeVisible();
    await expect(adminPage.deleteButton).toBeVisible();
    await expect(adminPage.cancelButton).toBeVisible();
  });

  test('should edit category name and save', async () => {
    const names = await adminPage.getCategoryNames();
    const originalName = names[0].trim();
    const updatedName = `${originalName} Updated`;

    await adminPage.clickCategory(originalName);
    await adminPage.fillCategoryName(updatedName);
    await adminPage.clickSave();

    // Notification should appear
    await expect(adminPage.snackbar).toContainText('Category saved');

    // Name should be updated in list
    await expect(adminPage.getCategoryByName(updatedName)).toBeVisible();

    // Restore original name
    await adminPage.clickCategory(updatedName);
    await adminPage.fillCategoryName(originalName);
    await adminPage.clickSave();
  });

  test('should show validation error for short name', async () => {
    const names = await adminPage.getCategoryNames();
    const firstName = names[0].trim();

    await adminPage.clickCategory(firstName);
    await adminPage.fillCategoryName('A');
    await adminPage.clickSave();

    await expect(adminPage.validationError).toContainText('Name must be at least 2 characters.');
  });

  test('should create new category', async () => {
    const newName = `E2E Category ${Date.now()}`;

    await adminPage.clickAdd();
    await expect(adminPage.categoryNameInput).toBeVisible();

    await adminPage.fillCategoryName(newName);
    await adminPage.clickSave();

    // Notification
    await expect(adminPage.snackbar).toContainText('Category saved');

    // New category should appear in list
    await expect(adminPage.getCategoryByName(newName)).toBeVisible();

    // Clean up: delete the created category
    await adminPage.clickCategory(newName);
    await adminPage.clickDelete();
    await adminPage.confirmDelete();
  });

  test('should delete category with confirmation', async () => {
    // First create a category to delete
    const deleteName = `Delete Me ${Date.now()}`;
    await adminPage.clickAdd();
    await adminPage.fillCategoryName(deleteName);
    await adminPage.clickSave();
    await expect(adminPage.snackbar).toContainText('Category saved');

    // Wait for snackbar to disappear
    await adminPage.snackbar.waitFor({ state: 'hidden', timeout: 5000 });

    // Now delete it
    await adminPage.clickCategory(deleteName);
    await adminPage.clickDelete();

    // Confirm dialog should appear
    await expect(adminPage.confirmDialog).toContainText(`'${deleteName}' will be deleted.`);
    await adminPage.confirmDelete();

    // Notification
    await expect(adminPage.snackbar).toContainText('Category deleted');

    // Category should be gone
    await expect(adminPage.getCategoryByName(deleteName)).not.toBeVisible();
  });

  test('should cancel edit and restore original name', async () => {
    const names = await adminPage.getCategoryNames();
    const originalName = names[0].trim();

    await adminPage.clickCategory(originalName);
    await adminPage.fillCategoryName('Something Else');
    await adminPage.clickCancel();

    // Original name should still be visible
    await expect(adminPage.getCategoryByName(originalName)).toBeVisible();
    // Input should be gone
    await expect(adminPage.categoryNameInput).not.toBeVisible();
  });
});
