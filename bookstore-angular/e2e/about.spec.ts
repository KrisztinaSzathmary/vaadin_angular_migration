import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { AboutPage } from './pages/about.page';
import { SidebarPage } from './pages/sidebar.page';

test.describe('About Page (Iteration 15)', () => {
  let loginPage: LoginPage;
  let aboutPage: AboutPage;
  let sidebar: SidebarPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    aboutPage = new AboutPage(page);
    sidebar = new SidebarPage(page);

    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    await sidebar.clickAbout();
    await aboutPage.waitForLoaded();
  });

  test('should display heading, subtitle and version badge', async () => {
    await expect(aboutPage.heading).toBeVisible();
    await expect(aboutPage.subtitle).toBeVisible();
    await expect(aboutPage.versionBadge).toBeVisible();
  });

  test('should display stats cards with non-zero values', async () => {
    await expect(aboutPage.totalProducts).toBeVisible();
    const totalText = await aboutPage.totalProducts.textContent();
    expect(Number(totalText?.trim())).toBeGreaterThan(0);

    await expect(aboutPage.availableProducts).toBeVisible();
    await expect(aboutPage.totalStock).toBeVisible();
    await expect(aboutPage.categoryCount).toBeVisible();
  });

  test('should display system and technology sections', async () => {
    await expect(aboutPage.systemSection).toBeVisible();
    await expect(aboutPage.technologySection).toBeVisible();
  });

  test('should display technology links', async ({ page }) => {
    const techLinks = page.locator('a[target="_blank"]');
    await expect(techLinks).toHaveCount(4);
    await expect(techLinks.first()).toContainText('Angular');
  });

  test('should display footer', async () => {
    await expect(aboutPage.footerText).toBeVisible();
  });
});
