import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { AboutPage } from './pages/about.page';
import { SidebarPage } from './pages/sidebar.page';

test.describe('About Page (Iteration 15)', () => {
  test('should display heading, subtitle and version badge', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const aboutPage = new AboutPage(page);
    const sidebar = new SidebarPage(page);

    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    await sidebar.clickAbout();
    await aboutPage.waitForLoaded();

    await expect(aboutPage.heading).toBeVisible();
    await expect(aboutPage.subtitle).toBeVisible();
    await expect(aboutPage.versionBadge).toBeVisible();
  });
});
