/**
 * UI Recorder — Vaadin Bookstore Screenshot Capture
 * Captures all views and states for the ui-design-plan.
 *
 * Key findings from app inspection:
 * - Language: Finnish (Kirjaudu, Uusi tuote, Tallenna, Hylkää, Peruuta)
 * - ProductForm renders as vaadin-dialog (modal overlay)
 * - Filter input is separate from dialog
 * - vaadin-dev-tools panel intercepts pointer events → hide it and use force:true
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:8080/bookstore-starter-flow-ui-1.1-SNAPSHOT';
const SCREENSHOT_DIR = '/home/cflocke/Projects/vaadin_angular_migration/ui-design-plan/screenshots';

const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 390, height: 844 };

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function waitForVaadin(page) {
  try {
    await page.waitForFunction(() => document.readyState === 'complete', { timeout: 10000 });
  } catch (e) {}
  await page.waitForTimeout(2000);
}

// Hide the dev-tools panel that intercepts clicks
async function hideDevTools(page) {
  await page.evaluate(() => {
    const devTools = document.querySelector('vaadin-dev-tools');
    if (devTools) {
      devTools.style.display = 'none';
      devTools.style.pointerEvents = 'none';
    }
  });
}

async function shot(page, dir, filename, description) {
  await hideDevTools(page);
  ensureDir(dir);
  const filepath = path.join(dir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  [OK] ${filename} — ${description}`);
  return { filename, description };
}

async function doLogin(page) {
  await page.goto(`${BASE_URL}/Login`, { waitUntil: 'networkidle' });
  await waitForVaadin(page);
  await page.locator('input[name="username"]').fill('admin');
  await page.locator('input[name="password"]').fill('admin');
  await page.locator('input[name="password"]').press('Enter');
  await page.waitForTimeout(3500);
  await waitForVaadin(page);
  console.log(`  After login: ${page.url()}`);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const manifest = {};

  // ─── LOGIN VIEW ──────────────────────────────────────────────────────────
  {
    const page = await browser.newPage();
    await page.setViewportSize(DESKTOP);
    const dir = path.join(SCREENSHOT_DIR, 'login');
    manifest['login'] = { url: `${BASE_URL}/Login`, screenshots: [] };

    await page.goto(`${BASE_URL}/Login`, { waitUntil: 'networkidle' });
    await waitForVaadin(page);
    manifest['login'].screenshots.push(
      await shot(page, dir, 'login--default.png', 'Login-Formular im Grundzustand (leer)')
    );

    // Submit empty
    await page.locator('input[name="username"]').press('Enter');
    await page.waitForTimeout(1200);
    manifest['login'].screenshots.push(
      await shot(page, dir, 'login--empty-submit.png', 'Login-Formular nach Abschicken ohne Eingabe')
    );

    // Wrong credentials
    await page.locator('input[name="username"]').fill('wronguser');
    await page.locator('input[name="password"]').fill('wrongpassword');
    await page.locator('input[name="password"]').press('Enter');
    await page.waitForTimeout(2500);
    manifest['login'].screenshots.push(
      await shot(page, dir, 'login--wrong-credentials.png', 'Login-Formular mit Fehlermeldung bei falschen Zugangsdaten')
    );

    // Mobile
    await page.setViewportSize(MOBILE);
    await page.goto(`${BASE_URL}/Login`, { waitUntil: 'networkidle' });
    await waitForVaadin(page);
    manifest['login'].screenshots.push(
      await shot(page, dir, 'login--mobile.png', 'Login-Ansicht im mobilen Viewport (390px)')
    );

    await page.close();
  }

  // ─── MAIN AUTHENTICATED SESSION ───────────────────────────────────────────
  const page = await browser.newPage();
  await page.setViewportSize(DESKTOP);
  await doLogin(page);

  // ─── INVENTORY / PRODUCT GRID ─────────────────────────────────────────────
  {
    const dir = path.join(SCREENSHOT_DIR, 'inventory');
    manifest['inventory'] = { url: `${BASE_URL}/inventory`, screenshots: [] };

    await page.goto(`${BASE_URL}/inventory`, { waitUntil: 'networkidle' });
    await waitForVaadin(page);
    manifest['inventory'].screenshots.push(
      await shot(page, dir, 'inventory--default.png', 'Inventar-View mit Produktgrid im Grundzustand')
    );

    // Filter input
    const filterInput = page.locator('input[placeholder*="Hae"], input[placeholder*="hae"]').first();
    const filterCount = await filterInput.count();

    if (filterCount > 0) {
      await filterInput.fill('Java');
      await page.waitForTimeout(1500);
      manifest['inventory'].screenshots.push(
        await shot(page, dir, 'inventory--filtered-java.png', 'Produktgrid gefiltert nach "Java"')
      );

      await filterInput.fill('zzz-no-results-xyz-9999');
      await page.waitForTimeout(1500);
      manifest['inventory'].screenshots.push(
        await shot(page, dir, 'inventory--empty-grid.png', 'Produktgrid leer — kein Suchergebnis')
      );

      await filterInput.fill('');
      await page.waitForTimeout(800);
    }

    // Mobile
    await page.setViewportSize(MOBILE);
    await page.goto(`${BASE_URL}/inventory`, { waitUntil: 'networkidle' });
    await waitForVaadin(page);
    manifest['inventory'].screenshots.push(
      await shot(page, dir, 'inventory--mobile.png', 'Inventar-View im mobilen Viewport (390px)')
    );
    await page.setViewportSize(DESKTOP);
  }

  // ─── PRODUCT FORM — new product dialog ────────────────────────────────────
  {
    const dir = path.join(SCREENSHOT_DIR, 'product-form');
    manifest['product-form'] = { url: `${BASE_URL}/inventory (vaadin-dialog)`, screenshots: [] };

    await page.goto(`${BASE_URL}/inventory`, { waitUntil: 'networkidle' });
    await waitForVaadin(page);
    await hideDevTools(page);

    // Open "Uusi tuote" dialog
    await page.locator('vaadin-button').filter({ hasText: 'Uusi tuote' }).first().click({ force: true });
    await page.waitForTimeout(1500);
    manifest['product-form'].screenshots.push(
      await shot(page, dir, 'product-form--new-empty.png', 'Leeres Produktformular-Dialog (neues Produkt)')
    );

    // Fill fields via JS to trigger Vaadin reactivity
    // Fields in document: [0] = filter bar, [1] = product name, [2] = price, [3] = stock count
    await page.evaluate(() => {
      const fields = document.querySelectorAll('vaadin-text-field');
      const setValue = (field, val) => {
        field.value = val;
        field.dispatchEvent(new CustomEvent('value-changed', { bubbles: true, composed: true, detail: { value: val } }));
        const inner = field.querySelector('input');
        if (inner) {
          inner.value = val;
          inner.dispatchEvent(new Event('input', { bubbles: true }));
          inner.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };
      if (fields[1]) setValue(fields[1], 'Test Buch XYZ');
      if (fields[2]) setValue(fields[2], '24,99');
    });
    await page.waitForTimeout(800);
    manifest['product-form'].screenshots.push(
      await shot(page, dir, 'product-form--partially-filled.png', 'Produktformular-Dialog mit Name und Preis ausgefüllt')
    );

    // Close with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(800);
  }

  // ─── PRODUCT FORM — existing product dialog ────────────────────────────────
  {
    const dir = path.join(SCREENSHOT_DIR, 'product-form');

    await page.goto(`${BASE_URL}/inventory`, { waitUntil: 'networkidle' });
    await waitForVaadin(page);
    await hideDevTools(page);

    // Click first grid row to open edit dialog
    const firstCell = page.locator('vaadin-grid-cell-content').first();
    if (await firstCell.count() > 0) {
      await firstCell.click({ force: true });
      await page.waitForTimeout(1500);
      manifest['product-form'].screenshots.push(
        await shot(page, dir, 'product-form--existing-product.png', 'Produktformular-Dialog mit Daten eines bestehenden Produkts')
      );

      // Close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(800);
    }
  }

  // ─── MAIN LAYOUT / NAVIGATION ─────────────────────────────────────────────
  {
    const dir = path.join(SCREENSHOT_DIR, 'main-layout');
    manifest['main-layout'] = { url: `${BASE_URL}/inventory`, screenshots: [] };

    await page.goto(`${BASE_URL}/inventory`, { waitUntil: 'networkidle' });
    await waitForVaadin(page);
    manifest['main-layout'].screenshots.push(
      await shot(page, dir, 'main-layout--desktop.png', 'Hauptlayout Desktop mit Navigationsmenü und Produktgrid')
    );

    const tabTexts = await page.locator('vaadin-tab').allTextContents();
    console.log('  Navigation tabs:', JSON.stringify(tabTexts));

    // Mobile
    await page.setViewportSize(MOBILE);
    await page.reload({ waitUntil: 'networkidle' });
    await waitForVaadin(page);
    manifest['main-layout'].screenshots.push(
      await shot(page, dir, 'main-layout--mobile-closed.png', 'Hauptlayout mobiler Viewport — Drawer geschlossen')
    );

    const toggle = page.locator('vaadin-drawer-toggle').first();
    if (await toggle.count() > 0) {
      await toggle.click({ force: true });
      await page.waitForTimeout(1000);
      manifest['main-layout'].screenshots.push(
        await shot(page, dir, 'main-layout--mobile-menu-open.png', 'Hauptlayout mobiler Viewport — Navigationsdrawer geöffnet')
      );
    }

    await page.setViewportSize(DESKTOP);
  }

  // ─── ABOUT VIEW ───────────────────────────────────────────────────────────
  {
    const dir = path.join(SCREENSHOT_DIR, 'about');
    manifest['about'] = { url: `${BASE_URL}/about`, screenshots: [] };

    await page.goto(`${BASE_URL}/about`, { waitUntil: 'networkidle' });
    await waitForVaadin(page);
    manifest['about'].screenshots.push(
      await shot(page, dir, 'about--default.png', 'About-View im Grundzustand')
    );

    await page.setViewportSize(MOBILE);
    await page.reload({ waitUntil: 'networkidle' });
    await waitForVaadin(page);
    manifest['about'].screenshots.push(
      await shot(page, dir, 'about--mobile.png', 'About-View im mobilen Viewport (390px)')
    );
    await page.setViewportSize(DESKTOP);
  }

  // ─── ERROR / 404 VIEW ─────────────────────────────────────────────────────
  {
    const dir = path.join(SCREENSHOT_DIR, 'error');
    manifest['error'] = { url: `${BASE_URL}/nonexistent-route-xyz`, screenshots: [] };

    await page.goto(`${BASE_URL}/nonexistent-route-xyz`, { waitUntil: 'networkidle' });
    await waitForVaadin(page);
    manifest['error'].screenshots.push(
      await shot(page, dir, 'error--404.png', 'Fehler-View bei nicht vorhandener Route (404/RouteNotFound)')
    );
  }

  // ─── ADMIN VIEW ───────────────────────────────────────────────────────────
  {
    const dir = path.join(SCREENSHOT_DIR, 'admin');
    manifest['admin'] = { url: null, screenshots: [] };

    await page.goto(`${BASE_URL}/inventory`, { waitUntil: 'networkidle' });
    await waitForVaadin(page);

    const allTabTexts = await page.locator('vaadin-tab').allTextContents();
    const adminTab = page.locator('vaadin-tab').filter({ hasText: /admin/i }).first();
    if (await adminTab.count() > 0) {
      await adminTab.click({ force: true });
      await page.waitForTimeout(1500);
      await waitForVaadin(page);
      manifest['admin'].url = page.url();
      manifest['admin'].screenshots.push(
        await shot(page, dir, 'admin--default.png', 'Admin-View im Grundzustand')
      );
    } else {
      manifest['admin'].url = 'N/A';
      manifest['admin'].note = `AdminView.java (@RouteScoped/@RouteScopeOwner) hat keinen eigenen Tab im Navigationsmenü. Vorhandene Tabs: ${JSON.stringify(allTabTexts)}`;
      console.log('  [INFO] Admin view not in tabs. All tabs:', JSON.stringify(allTabTexts));
    }
  }

  await page.close();
  await browser.close();

  // ─── MANIFEST SCHREIBEN ───────────────────────────────────────────────────
  let md = `# UI Screenshot Manifest\n\n`;
  md += `**Aufgenommen:** ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC\n\n`;
  md += `**Basis-URL:** \`${BASE_URL}\`\n\n`;
  md += `---\n\n`;

  for (const [viewName, viewData] of Object.entries(manifest)) {
    md += `## ${viewName}\n\n`;
    if (viewData.url) md += `**URL/Route:** \`${viewData.url}\`\n\n`;
    if (viewData.note) md += `> **Hinweis:** ${viewData.note}\n\n`;
    if (viewData.screenshots && viewData.screenshots.length > 0) {
      md += `| Screenshot | Beschreibung |\n`;
      md += `|---|---|\n`;
      for (const s of viewData.screenshots) {
        md += `| \`${viewName}/${s.filename}\` | ${s.description} |\n`;
      }
      md += `\n`;
    }
  }

  const manifestPath = `${SCREENSHOT_DIR}/manifest.md`;
  fs.writeFileSync(manifestPath, md);
  console.log(`\nManifest written: ${manifestPath}`);

  let total = 0;
  for (const v of Object.values(manifest)) total += (v.screenshots || []).length;
  console.log(`Done — Views: ${Object.keys(manifest).length}, Screenshots: ${total}`);
}

run().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
