import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';

test.describe('Smoke tests', () => {
  test('login page loads and shows login form', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });
});
