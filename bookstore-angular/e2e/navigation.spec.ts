import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { InventoryPage } from './pages/inventory.page';
import { SidebarPage } from './pages/sidebar.page';
import { AboutPage } from './pages/about.page';

test.describe('Sidebar & Navigation', () => {
  test.describe('as admin', () => {
    let inventoryPage: InventoryPage;
    let sidebar: SidebarPage;

    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      inventoryPage = new InventoryPage(page);
      sidebar = new SidebarPage(page);

      await loginPage.goto();
      await loginPage.login('admin', 'admin');
      await inventoryPage.waitForTableLoaded();
    });

    test('sidebar shows navigation links, logout and logo', async () => {
      await expect(sidebar.logo).toBeVisible();
      await expect(sidebar.inventoryLink).toBeVisible();
      await expect(sidebar.aboutLink).toBeVisible();
      await expect(sidebar.logoutButton).toBeVisible();
    });

    test('admin link is visible for admin user', async () => {
      await expect(sidebar.adminLink).toBeVisible();
    });

    test('sidebar links navigate correctly', async ({ page }) => {
      const aboutPage = new AboutPage(page);

      await sidebar.clickAbout();
      await expect(aboutPage.heading).toBeVisible();
      await expect(page).toHaveURL(/\/about/);

      await sidebar.clickInventory();
      await expect(inventoryPage.heading).toBeVisible();
      await expect(page).toHaveURL(/\/inventory/);
    });

    test('active link is highlighted', async ({ page }) => {
      // On /inventory, the inventory link should be active
      await expect(sidebar.inventoryLink).toHaveClass(/bg-indigo-50/);
      await expect(sidebar.aboutLink).not.toHaveClass(/bg-indigo-50/);

      // Navigate to about
      await sidebar.clickAbout();
      await expect(sidebar.aboutLink).toHaveClass(/bg-indigo-50/);
      await expect(sidebar.inventoryLink).not.toHaveClass(/bg-indigo-50/);
    });
  });

  test('admin link is NOT visible for non-admin user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const sidebar = new SidebarPage(page);

    await loginPage.goto();
    await loginPage.login('user1', 'user1');
    await inventoryPage.waitForTableLoaded();

    await expect(sidebar.adminLink).not.toBeVisible();
  });
});
