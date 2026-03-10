import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';

test.describe('Internationalization (i18n)', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page, context }) => {
    // Clear language cookie before each test
    await context.clearCookies();
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should show language selector dropdown on login page', async ({ page }) => {
    const languageSelect = page.locator('[data-testid="language-select"]');
    await expect(languageSelect).toBeVisible();

    // Should have English and Deutsch options
    const options = languageSelect.locator('option');
    await expect(options).toHaveCount(2);
    await expect(options.nth(0)).toHaveText('English');
    await expect(options.nth(1)).toHaveText('Deutsch');
  });

  test('should default to English', async ({ page }) => {
    const languageSelect = page.locator('[data-testid="language-select"]');
    await expect(languageSelect).toHaveValue('en');

    // Check English UI labels
    await expect(page.getByRole('heading', { name: 'Login', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Log in/i })).toBeVisible();
    await expect(page.getByText('Login information')).toBeVisible();
  });

  test('should switch to German and show German UI text', async ({ page }) => {
    const languageSelect = page.locator('[data-testid="language-select"]');

    // Switch to German
    await languageSelect.selectOption('de');

    // Verify German labels
    await expect(page.getByRole('heading', { name: 'Anmelden', exact: true })).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Anmelden');
    await expect(page.getByText('Anmeldeinformationen')).toBeVisible();
    await expect(page.getByText('Sprache').first()).toBeVisible();
  });

  test('should persist language after login', async ({ page }) => {
    const languageSelect = page.locator('[data-testid="language-select"]');

    // Switch to German before login
    await languageSelect.selectOption('de');

    // Login using input fields and submit button (not LoginPage helper, since button text is German)
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('admin');
    await page.locator('button[type="submit"]').click();

    // Wait for inventory page
    await page.waitForURL('**/inventory');

    // Verify German labels on inventory page
    await expect(page.getByRole('heading', { name: 'Inventar' })).toBeVisible();

    // Sidebar should be in German
    await expect(page.locator('nav').getByText('Buchhandlung')).toBeVisible();
    await expect(page.locator('nav a[routerLink="/inventory"]')).toContainText('Inventar');
    await expect(page.locator('nav a[routerLink="/about"]')).toContainText('Info');
  });

  test('should persist language across page reload via cookie', async ({ page, context }) => {
    const languageSelect = page.locator('[data-testid="language-select"]');

    // Switch to German
    await languageSelect.selectOption('de');

    // Verify German text is showing
    await expect(page.getByRole('heading', { name: 'Anmelden', exact: true })).toBeVisible();

    // Verify cookie is set
    const cookies = await context.cookies();
    const langCookie = cookies.find((c) => c.name === 'bookstore-lang');
    expect(langCookie).toBeTruthy();
    expect(langCookie?.value).toBe('de');

    // Reload the page
    await page.reload();

    // Wait for the page to fully render with German text
    await expect(page.getByRole('heading', { name: 'Anmelden', exact: true })).toBeVisible();

    // Verify German is still selected
    await expect(page.locator('[data-testid="language-select"]')).toHaveValue('de');
  });

  test('should switch back to English', async ({ page }) => {
    const languageSelect = page.locator('[data-testid="language-select"]');

    // Switch to German first
    await languageSelect.selectOption('de');
    await expect(page.getByRole('heading', { name: 'Anmelden', exact: true })).toBeVisible();

    // Switch back to English
    await languageSelect.selectOption('en');
    await expect(page.getByRole('heading', { name: 'Login', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Log in/i })).toBeVisible();
  });
});
