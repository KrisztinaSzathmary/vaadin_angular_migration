# State – Vaadin-zu-Angular-Migration

---

## Iteration 13 – Produkt löschen

**Status:** Abgeschlossen
**Datum:** 2026-03-05

### Umgesetzte Änderungen

- `src/app/shared/components/confirm-dialog/confirm-dialog.component.ts` – Wiederverwendbarer Bestätigungsdialog: `ConfirmDialogData`-Interface mit `message`, `onConfirm()` schließt mit `true`, `onCancel()` schließt ohne Result. Inline-Template mit `mat-dialog-title`, `mat-dialog-content`, `mat-dialog-actions`
- `src/app/shared/components/confirm-dialog/confirm-dialog.component.spec.ts` – 6 Unit-Tests (Creation, Nachricht anzeigen, Titel, Confirm-Result, Cancel-Result, Button-Rendering)
- `src/app/features/inventory/product-form.component.ts` – Erweitert um `ProductDeletedResult`-Interface (`{ deleted: true, productName: string }`), `isDeleting` Signal, `onDelete()` Methode (öffnet ConfirmDialog mit `"'{Name}' will be deleted."`), `executeDelete()` private Methode (ruft `ProductService.delete()`, schließt Dialog mit `ProductDeletedResult`)
- `src/app/features/inventory/product-form.component.html` – Footer umstrukturiert: Delete-Button links (nur `isEditMode()`), restliche Buttons rechts via `ml-auto`. Delete-Button mit `color="warn"`, disabled bei `isDeleting()`
- `src/app/features/inventory/product-form.component.spec.ts` – 8 neue Tests: Delete-Button nicht in Create-Modus, Delete-Button in Edit-Modus, Confirm-Dialog öffnet, kein Delete bei Cancel, ProductService.delete() bei Confirm, Dialog schließt mit DeletedResult, isDeleting-State, Fehler-Notification bei Delete-Fehler
- `src/app/features/inventory/product-list.component.ts` – `openProductDialog` erweitert: Ergebnis-Typ `Product | ProductDeletedResult`, `'deleted' in result` Prüfung, `"'{Name}' removed"` Benachrichtigung bei Löschung
- `src/app/features/inventory/product-list.component.spec.ts` – 3 neue Tests: Refresh nach Delete-Result, Delete-Notification-Text, Update-Notification bei Edit
- `e2e/pages/product-form.page.ts` – Erweitert um `deleteButton`, `confirmDialog`, `confirmDialogConfirmButton`, `confirmDialogCancelButton` Locators; neue Methoden `clickDelete()`, `confirmDelete()`, `cancelDelete()`
- `e2e/product-form.spec.ts` – 4 neue E2E-Tests: Delete-Button nur in Edit-Modus sichtbar, Cancel im Bestätigungsdialog behält Produkt, Confirm-Delete entfernt Produkt + zeigt Notification, Non-Admin sieht keinen Delete-Button

### Entscheidungen

- **`ProductDeletedResult`-Interface statt String-Sentinel** – Typsicherer Ansatz mit `{ deleted: true, productName: string }`, Unterscheidung von `Product`-Ergebnis via `'deleted' in result`
- **`ConfirmDialogComponent` in `shared/components/`** – Wiederverwendbar für zukünftige Lösch-Bestätigungen (z.B. Kategorien in Iteration 14)
- **`component['dialog']` in Tests statt `TestBed.inject(MatDialog)`** – Bracket-Notation für private Property sichert korrekte Spy-Bindung an die Component-Instanz
- **Footer-Layout mit `ml-auto`** – Delete-Button linksbündig, Discard/Cancel/Save rechtsbündig; klare visuelle Trennung destruktiver und konstruktiver Aktionen

### Verifikation

- `ng test` → 163 Unit-Tests grün (146 bestehende + 6 ConfirmDialog + 8 ProductForm-Delete + 3 ProductList-Delete, 16 Test-Suites)
- `ng lint` → Alle Dateien bestanden
- `ng build` → BUILD SUCCESS (550.52 kB initial, 4 Lazy Chunks inkl. product-list 180.18 kB)
- `npx playwright test` → 34 E2E-Tests grün (30 bestehende + 4 neue Delete-Tests)

### Offene Punkte

- Keine

### Nächste Iteration

- Iteration 14 – siehe `backlog.md`

---

## Unteraufgabe 12a – Playwright E2E-Tests für alle User-Interaktionen

**Status:** Abgeschlossen
**Datum:** 2026-03-04

### Umgesetzte Änderungen

- `e2e/pages/sidebar.page.ts` – Neues Page Object für Sidebar-Navigation: Locators für `logo`, `inventoryLink`, `aboutLink`, `adminLink`, `logoutButton`; Methoden `clickInventory()`, `clickAbout()`, `clickAdmin()`, `clickLogout()`
- `e2e/pages/about.page.ts` – Neues Page Object für About-Seite: `heading` Locator, `goto()` Methode
- `e2e/pages/not-found.page.ts` – Neues Page Object für 404-Seite: `message` Locator
- `e2e/pages/inventory.page.ts` – Erweitert um `availableStatus`, `comingStatus`, `discontinuedStatus` Locators; neue Methoden `clickSortHeader(column)`, `getColumnValues(column)`, `fillSearch(text)`, `clearSearch()`
- `e2e/auth.spec.ts` – 3 Tests: Login mit gültigen/ungültigen Credentials, Logout-Redirect
- `e2e/route-guards.spec.ts` – 3 Tests: Unauthentifizierter Zugriff → Login-Redirect, Non-Admin → Inventory-Redirect (via `pushState`/`popstate`), unbekannte Route → 404-Meldung
- `e2e/navigation.spec.ts` – 5 Tests: Sidebar-Links sichtbar, Admin-Link für Admin/Non-Admin, Link-Navigation, aktive Link-Hervorhebung (`bg-indigo-50`)
- `e2e/inventory.spec.ts` – 7 Tests: Produkte laden, Produktanzahl-Text, Status-Indikatoren, Sortierung nach Preis (asc/desc), Suchfilter filtert/löschen, Non-Admin New-Product disabled

### Entscheidungen

- **`pushState` + `popstate` statt `page.goto` für Admin-Guard-Test** – AuthService speichert User-State nur in-memory (Signal), kein APP_INITIALIZER für Session-Restore. `page.goto('/admin')` löst Full-Page-Reload aus, Angular verliert Auth-State → authGuard greift statt adminGuard. Client-seitige Navigation via `pushState`/`popstate` bewahrt den Angular-Router-Kontext
- **`page.waitForTimeout(500)` nach Filter-Input** – Debounce (300ms) + DOM-Update brauchen Zeit; kein besserer Locator-basierter Wait möglich bei Filter-Änderungen

### Verifikation

- `npx playwright test` → 30 Tests grün (12 bestehende + 18 neue)

### Nächste Iteration

- Iteration 13 – siehe `backlog.md`

---

## Iteration 12 – Produkt-Formular (Erstellen und Bearbeiten)

**Status:** Abgeschlossen
**Datum:** 2026-03-04

### Umgesetzte Änderungen

- `src/app/core/services/notification.service.ts` – Thin Wrapper um `MatSnackBar` mit `showSuccess(message)` (3s Dauer) und `showError(message)` (5s Dauer), `@Injectable({ providedIn: 'root' })`
- `src/app/core/services/notification.service.spec.ts` – 5 Unit-Tests (Creation, showSuccess/showError rufen snackBar.open auf, korrekte Duration-Werte)
- `src/app/features/inventory/product-form.component.ts` – Standalone Component als `MatDialog`-Content: `ProductFormData`-Interface, exportierte `availabilityStockValidator`-Funktion (Cross-Field), Reactive Form (`fb.nonNullable.group()`) mit Feldern `productName`, `price`, `stockCount`, `availability`, `categoryIds`, Methoden `onSave()`, `onDiscard()`, `onCancel()`, `toggleCategory()`, `isCategorySelected()`, `formatAvailability()`. Computed Signal `isEditMode`, WritableSignal `isSaving`. Form-Initialisierung direkt aus `MAT_DIALOG_DATA` (kein `ngOnInit` nötig). Fehler-Handler extrahiert Backend-Fehlermeldung aus `err.error?.error` mit Fallback auf generischen Text
- `src/app/features/inventory/product-form.component.html` – Dialog-UI gemäß `ui-design-plan/add-item/v0_add_item.png`: Header mit Titel + X-Close-Button, Untertitel, Product name Input, 2-Spalten-Reihe (Price + Availability `mat-select`), In stock Input, Tailwind-gestylte Kategorie-Chip-Buttons, Cross-Field-Fehlermeldung, Dirty-Tracking mit blauem Rand, Footer mit Discard/Cancel/Save-Buttons
- `src/app/features/inventory/product-form.component.spec.ts` – 36 Unit-Tests: Rendering (7), Form-Initialisierung (3), Feld-Validierung (7), Cross-Field-Validierung (6), Kategorie-Interaktion (2), Save (6), Discard (2), Cancel/Close (2)
- `src/app/features/inventory/product-list.component.ts` – Erweitert um `MatDialog`, `CategoryService`, `NotificationService` Injections, `categories` Signal, `onRowClick(product)`, `openProductDialog(product)` (dialog.open mit width 520px), `refreshProducts()`, `ngOnInit()` lädt zusätzlich Kategorien
- `src/app/features/inventory/product-list.component.html` – `(click)="onRowClick(row)"` und `[class.cursor-pointer]="isAdmin()"` auf `<tr mat-row>`
- `src/app/features/inventory/product-list.component.spec.ts` – 8 neue Tests: Kategorien laden, Dialog öffnen bei New Product/Zeilen-Klick (Admin), Produktdaten übergeben, kein Dialog bei Nicht-Admin, Refresh nach Dialog-Close mit Ergebnis, keine Aktualisierung ohne Ergebnis, Notification nach Save
- `src/app/core/interceptors/auth.interceptor.ts` – Erweitert: `MatDialog` Injection + `dialog.closeAll()` vor Router-Navigation bei 401-Redirect (verhindert verwaiste Dialoge)
- `src/app/core/interceptors/auth.interceptor.spec.ts` – 1 neuer Test: `closeAll()` wird bei 401-Redirect aufgerufen
- `proxy.conf.json` – `cookiePathRewrite` hinzugefügt: mappt `/bookstore-starter-flow-ui-1.1-SNAPSHOT` → `/`, damit JSESSIONID-Cookie auch für `/api/v1/...` Requests gesendet wird

### Entscheidungen

- **Tailwind-Chip-Buttons statt `mat-chip-listbox`/`mat-chip-option`** – Angular Material Chips verursachen `ExpressionChangedAfterItHasBeenCheckedError` bei `[selected]`-Binding aus Formular-State; plain Tailwind-gestylte Buttons mit `role="option"` vermeiden den Feedback-Loop und sind konsistenter mit dem Projekt-CSS-Ansatz
- **Form-Initialisierung im Constructor (Felddeklaration) statt `ngOnInit`** – `MAT_DIALOG_DATA` ist bei `inject()` sofort verfügbar; Initialisierung über Feld-Default-Werte vermeidet `ExpressionChangedAfterItHasBeenCheckedError` bei Edit-Modus
- **`MatDialogModule` nicht in ProductListComponent `imports`** – Nur programmatischer `dialog.open()` Aufruf, keine Dialog-Direktiven im Template; `MatDialog` ist `providedIn: 'root'` und braucht kein Modul-Import
- **`jest.spyOn(dialog, 'open')` statt `useValue`-Mock** – `MatDialog` wird von Angular's Root-Injector bereitgestellt; direkter Spy auf die Instanz ist zuverlässiger als Provider-Override bei Standalone-Components
- **`eslint-disable-next-line` für `mat-select` und Categories-Label** – `@angular-eslint/template/label-has-associated-control` erkennt `aria-labelledby` nicht; `mat-select` hat kein natives `id`-for-Attribut
- **`cookiePathRewrite` in Proxy-Config** – WildFly setzt JSESSIONID mit `Path=/bookstore-starter-flow-ui-1.1-SNAPSHOT/`, Angular Dev-Server sendet Requests an `/api/v1/...`. Ohne Cookie-Path-Rewrite sendet der Browser den Cookie nicht mit → 401 bei authentifizierten POST/PUT/DELETE-Requests (erster authentifizierter Schreibzugriff aus Angular)
- **`dialog.closeAll()` im AuthInterceptor** – Bei 401-Redirect zu `/login` bleiben offene `MatDialog`-Overlays im CDK-Container bestehen; explizites Schließen verhindert verwaiste Dialoge

### Verifikation

- `ng test` → 146 Tests grün (96 bestehende + 5 NotificationService + 36 ProductFormComponent + 8 neue ProductListComponent + 1 neuer AuthInterceptor, 15 Test-Suites)
- `ng lint` → Alle Dateien bestanden
- `ng build` → BUILD SUCCESS (544.65 kB initial, 4 Lazy Chunks inkl. product-list 178.34 kB)

### Offene Punkte

- Keine

### Nächste Iteration

- Iteration 13 – siehe `backlog.md`

---

## Iteration 11 – Produkt-Filter

**Status:** Abgeschlossen
**Datum:** 2026-03-03

### Umgesetzte Änderungen

- `src/app/features/inventory/product-list.component.ts` – Erweitert um Filter- und Admin-Logik: `filterText` Signal, `isAdmin` Signal-Referenz (AuthService), `filterSubject` mit `debounceTime(300)` + `takeUntilDestroyed()`, Custom `filterPredicate` auf `MatTableDataSource` (sucht in Produktname, Availability-Label und Kategorienamen), `onFilterInput()` Methode, `onNewProduct()` Placeholder. Neue Imports: `MatIconModule`, `MatButtonModule`, `AuthService`, `DestroyRef`, `Subject`, `debounceTime`, `takeUntilDestroyed`
- `src/app/features/inventory/product-list.component.html` – Filter-Bar zwischen Header und Loading/Error/Table eingefügt: Plain `<input>` mit `mat-icon` Search-Prefix (Tailwind-gestylt), `mat-flat-button` "New product" mit `add_circle` Icon (disabled für Nicht-Admins)
- `src/app/features/inventory/product-list.component.spec.ts` – 12 neue Tests: Filter-Input-Rendering + Placeholder, Search-Icon, New-Product-Button (Rendering, disabled/enabled nach Admin-Status), Filter nach Produktname, Availability-Label, Kategoriename, Case-Insensitive-Filter, Keine-Treffer-Filter, Debounce-Verhalten (300ms), Leerer Filter zeigt alle Produkte. AuthService als Mock mit Signal injiziert

### Entscheidungen

- **`Subject` + `debounceTime(300)` + `takeUntilDestroyed()`** – Standard-RxJS-Debounce-Pattern mit sauberem Lifecycle-Management über `DestroyRef`
- **`MatTableDataSource.filterPredicate`** – Built-in Mechanismus, kein Custom DataSource nötig
- **Availability-Matching über `formatAvailability().toLowerCase()`** – Benutzer tippen Labels wie "available", nicht Enum-Werte
- **Kategorie-Matching über `category.some(c => c.name.includes(...))`** – Durchsucht alle Kategorien eines Produkts
- **`isAdmin` als Signal-Referenz** – Gleisches Pattern wie `MainLayoutComponent` (`this.authService.isAdmin`)
- **Filter-Tests direkt über `dataSource.filter`** – Trennung von FilterPredicate-Logik und Debounce-Timing; `fakeAsync`/`tick` nur für Debounce-Test
- **`onNewProduct()` als leerer Placeholder** – Funktionalität kommt in Iteration 12

### Verifikation

- `ng test` → 96 Tests grün (84 bestehende + 12 neue, 13 Test-Suites)
- `ng lint` → Alle Dateien bestanden
- `ng build` → BUILD SUCCESS (427.60 kB initial, 4 Lazy Chunks inkl. product-list 58.25 kB)

### Offene Punkte

- Keine

### Nächste Iteration

- Iteration 12 – siehe `backlog.md`

---

## Unteraufgabe 11a – Playwright E2E-Konfiguration

**Status:** Abgeschlossen
**Datum:** 2026-03-04

### Umgesetzte Änderungen

- `@playwright/test` als devDependency installiert, Chromium-Browser heruntergeladen
- `playwright.config.ts` – Konfiguration mit `webServer` (startet `ng serve` automatisch), `baseURL: http://localhost:4200`, Chromium-Projekt, HTML-Reporter
- `e2e/pages/login.page.ts` – Page Object für Login-Seite (Locators für Heading, Username, Password, Login-Button, Error-Message; `goto()` und `login()` Methoden)
- `e2e/smoke.spec.ts` – Minimaler Smoke-Test: Login-Seite lädt und zeigt Formular
- `jest.config.js` – `testPathIgnorePatterns: ['/e2e/']` hinzugefügt, damit Jest die Playwright-Tests nicht mitläuft
- `package.json` – `"e2e": "playwright test"` Script hinzugefügt

### Entscheidungen

- **`webServer.reuseExistingServer: !process.env['CI']`** – Lokal wird ein bereits laufender Dev-Server wiederverwendet, in CI wird immer ein neuer gestartet
- **Nur Chromium** – Für Smoke-Test ausreichend, weitere Browser können später ergänzt werden
- **`exact: true` im Heading-Locator** – Vermeidet Mehrdeutigkeit zwischen "Login" und "Login information" Headings

### Verifikation

- `npx playwright test` → 1 Test grün (Login-Seite lädt)
- `ng test` → 146 Unit-Tests grün (E2E-Dateien korrekt ausgeschlossen)
- `ng lint` → Alle Dateien bestanden

---

## Iteration 10 – Produkt-Grid (nur Lesen)

**Status:** Abgeschlossen
**Datum:** 2026-03-03

### Umgesetzte Änderungen

- `src/app/features/inventory/product-list.component.ts` – Vollständige Neuimplementierung: Signal-State (`products`, `loading`, `error`), Computed Signals (`availableCount`, `comingCount`, `discontinuedCount`), `MatTableDataSource` + `MatSort` Integration, Helper-Methoden (`formatAvailability`, `availabilityColor`, `formatCategories`)
- `src/app/features/inventory/product-list.component.html` – Externes Template mit Header (Titel + Produktanzahl-Untertitel), Availability-Status-Badges (farbige Punkte + Zähler), Loading/Error-Zustände, `mat-table` mit 5 Spalten (Product name, Price, Availability, In stock, Categories), deklarativer Default-Sort auf productName ASC, Row-Striping
- `src/app/features/inventory/product-list.component.spec.ts` – Neugeschrieben mit 17 Unit-Tests: Creation, Loading-State, API-Call, Tabellenrendering, Produktnamen, EUR-Preisformat, Availability-Labels + Farbklassen, Lagerbestand, Kategorien (kommasepariert + leere Kategorien), Produktanzahl-Untertitel, Summary-Badges, Loading-Verbergen, Fehlermeldung, Default-Sort

### Entscheidungen

- **`@ViewChild(MatSort)` als Setter statt `ngAfterViewInit()`** – Tabelle ist hinter `@if (!loading() && !error())` verborgen, daher ist `MatSort` erst nach Datenladen verfügbar. Setter-Pattern reagiert automatisch auf View-Query-Auflösung
- **`MatTableDataSource` als Instanz-Property** – Kein Signal nötig, da `dataSource.data` direkt gesetzt wird und `MatSort` darauf referenziert
- **`NgClass` für dynamische Availability-Farben** – `[ngClass]="availabilityColor(product.availability)"` setzt `bg-available`/`bg-coming`/`bg-discontinued` Klassen
- **Kein `standalone: true`** – Angular 20 Default, konsistent mit allen bestehenden Komponenten
- **`ProgressEvent` in Fehler-Tests** – `HttpTestingController.error()` erfordert `ProgressEvent`, nicht `ErrorEvent`

### Verifikation

- `ng test` → 84 Tests grün (68 bestehende − 1 alter Placeholder + 17 neue, 13 Test-Suites)
- `ng lint` → Alle Dateien bestanden
- `ng build` → BUILD SUCCESS (426 kB initial, 4 Lazy Chunks inkl. product-list 56.6 kB)

### Offene Punkte

- Keine

### Nächste Iteration

- Iteration 11 – siehe `backlog.md`

---

## Iteration 9 – Hauptlayout mit Navigation

**Status:** Abgeschlossen
**Datum:** 2026-03-03

### Umgesetzte Änderungen

- `src/app/shared/components/main-layout/main-layout.component.ts` – MainLayoutComponent mit Sidebar-Navigation, AuthService-Integration für Admin-Sichtbarkeit, Logout mit Navigation
- `src/app/shared/components/main-layout/main-layout.component.html` – Sidebar (260px) mit Logo, Inventory/About/Admin-Links, routerLinkActive-Hervorhebung, Collapse-Button (disabled), Logout-Button
- `src/app/shared/components/main-layout/main-layout.component.spec.ts` – 10 Unit-Tests (Erstellung, Router-Outlet, Bookstore-Titel, Inventory/About-Links, Admin-Link versteckt/sichtbar, Logout-Button, Logout-Navigation bei Erfolg und Fehler)
- `src/app/features/inventory/product-list.component.ts` – Placeholder-Komponente mit Inline-Template "Inventory"
- `src/app/features/about/about.component.ts` – Placeholder-Komponente mit Inline-Template "About"
- `src/app/features/admin/admin.component.ts` – Placeholder-Komponente mit Inline-Template "Admin"
- `src/app/features/not-found/not-found.component.ts` – Standalone-Komponente mit Text "The view could not be found."
- `src/app/features/inventory/product-list.component.spec.ts` – 1 Creation-Test
- `src/app/features/about/about.component.spec.ts` – 1 Creation-Test
- `src/app/features/admin/admin.component.spec.ts` – 1 Creation-Test
- `src/app/features/not-found/not-found.component.spec.ts` – 2 Tests (Creation + Content-Prüfung)
- `src/app/app.routes.ts` – Komplettes Rewrite: `/login` top-level, `/` → MainLayout + authGuard mit Children (`/inventory`, `/about`, `/admin` + adminGuard), `**` → NotFound
- `.gitkeep`-Dateien gelöscht: `features/inventory/`, `features/about/`, `features/admin/`, `shared/components/`

### Entscheidungen

- **MainLayout in `shared/components/`** – Strukturelle Layout-Komponente, kein Feature; `core/` ist für Services/Guards
- **`authGuard` nur auf Parent-Route** – Children erben den Guard (DRY-Prinzip)
- **`**` Wildcard top-level ohne Sidebar** – Nicht-authentifizierte User sollen keine Sidebar sehen
- **Collapse-Button disabled/visuell** – Nicht im Backlog-Scope, aber UI-Design zeigt ihn; als disabled-Button dargestellt
- **Logout navigiert bei Error auch zu `/login`** – Defensiv: Session könnte ohnehin ungültig sein
- **Inline-Templates für Placeholder-Komponenten** – Triviale Komponenten, vollständige Templates kommen in späteren Iterationen
- **Feature-Komponenten lazy loaded** – `loadComponent` für Inventory, About, Admin, NotFound; MainLayout eagerly loaded als Shell
- **Signal-Referenz für `isAdmin`** – Komponente bindet `authService.isAdmin` direkt als Signal-Referenz (kein Wrapper)

### Verifikation

- `ng test` → 68 Tests grün (53 bestehende + 15 neue, 13 Test-Suites)
- `ng lint` → Alle Dateien bestanden
- `ng build` → BUILD SUCCESS (405 kB initial, 4 Lazy Chunks)

### Offene Punkte

- Keine

### Nächste Iteration

- Iteration 10 – siehe `backlog.md`

---

## Iteration 8 – Login-Seite

**Status:** Abgeschlossen
**Datum:** 2026-03-03

### Umgesetzte Änderungen

- `src/app/features/login/login.component.ts` – Standalone LoginComponent mit Reactive Form (`username`, `password`), Signal-State (`errorMessage`, `isLoading`, `hidePassword`), AuthService-Integration
- `src/app/features/login/login.component.html` – Zwei-Spalten-Layout (blaue Sidebar mit Login-Info + zentriertes Login-Formular), Angular Material Form Fields mit Visibility-Toggle, Tailwind CSS
- `src/app/features/login/login.component.spec.ts` – 10 Unit-Tests (Erstellung, Form-Controls, Validierung, Submit-Verhalten, Navigation, Fehlermeldung, Loading-State, Password-Toggle)
- `src/app/app.routes.ts` – Routen konfiguriert: `/login` → LoginComponent, `/` → Redirect zu `/login`, `**` → Redirect zu `/login`
- `src/app/features/login/.gitkeep` – gelöscht
- `src/styles.css` – `@source` Direktive hinzugefügt für Tailwind v4 Content Detection
- `postcss.config.js` → `.postcssrc.json` – PostCSS-Konfiguration auf JSON-Format umgestellt (Angular Builder erkennt nur `.postcssrc.json`)

### Entscheidungen

- **`FormBuilder.nonNullable.group()`** – Typsicheres Formular ohne `null`-Werte
- **Sidebar auf `sm`-Breakpoint ausblenden** – `hidden sm:flex` für responsive Darstellung auf kleinen Bildschirmen
- **"Forgot password"-Link** – Als nicht-funktionales Element dargestellt (kein `href`, kein Click-Handler), da kein Backlog-Item dafür existiert
- **Sprachauswahl-Dropdown** – Nicht implementiert, gehört zu Iteration 18 (i18n)
- **Einfache Routen-Konfiguration** – Nur Login-Route + Redirects; Erweiterung mit Guards und MainLayout erfolgt in späteren Iterationen
- **`.postcssrc.json` statt `postcss.config.js`** – Angular's `@angular/build:application` Builder erkennt PostCSS-Konfiguration nur im `.postcssrc.json`-Format (nicht `postcss.config.js`). Ohne dies werden Tailwind v4 Utility-Klassen nicht generiert.
- **`@source` Direktive** – Tailwind v4 Content Detection findet Angular-Templates nicht automatisch innerhalb des Angular-Build-Prozesses; expliziter `@source "./app/**/*.{html,ts}"` nötig

### Verifikation

- `ng test` → 53 Tests grün (43 bestehende + 10 neue LoginComponent-Tests, 8 Test-Suites)
- `ng lint` → Alle Dateien bestanden
- `ng build` → BUILD SUCCESS (474 kB initial)

### Offene Punkte

- Keine

### Nächste Iteration

- Iteration 9 – siehe `backlog.md`

---

## Iteration 7 – Authentifizierungs-Service und Auth-Guard

**Status:** Abgeschlossen
**Datum:** 2026-03-03

### Umgesetzte Änderungen

- `src/app/models/auth.model.ts` – Interfaces `LoginRequest`, `LoginResponse`, `UserInfo`
- `src/app/core/services/auth.service.ts` – Auth-Service mit Signal-basiertem State (`currentUser`, `isLoggedIn`, `isAdmin`), Methoden `login()`, `logout()`, `getCurrentUser()`, `clearAuth()`
- `src/app/core/services/auth.service.spec.ts` – 16 Unit-Tests
- `src/app/core/interceptors/auth.interceptor.ts` – Class-based `HttpInterceptor`, setzt `withCredentials: true` global, 401-Redirect zu `/login` (Auth-Endpoints ausgenommen)
- `src/app/core/interceptors/auth.interceptor.spec.ts` – 9 Unit-Tests
- `src/app/core/guards/auth.guard.ts` – Functional Guard (`CanActivateFn`) für authentifizierte Routen
- `src/app/core/guards/auth.guard.spec.ts` – 2 Unit-Tests
- `src/app/core/guards/admin.guard.ts` – Functional Guard für Admin-Routen (prüft Login + Admin-Rolle)
- `src/app/core/guards/admin.guard.spec.ts` – 3 Unit-Tests
- `src/app/app.config.ts` – `AuthInterceptor` als `HTTP_INTERCEPTORS` Provider registriert
- `src/app/core/services/product.service.ts` – `withCredentials: true` aus allen 5 HTTP-Calls entfernt
- `src/app/core/services/product.service.spec.ts` – 5 `withCredentials`-Tests entfernt (13 → 8 Tests)
- `src/app/core/services/category.service.ts` – `withCredentials: true` aus allen 4 HTTP-Calls entfernt
- `src/app/core/services/category.service.spec.ts` – 4 `withCredentials`-Tests entfernt (9 → 5 Tests)
- `.gitkeep`-Dateien in `core/guards/` und `core/interceptors/` gelöscht

### Entscheidungen

- **Class-based `HttpInterceptor`** – `app.config.ts` nutzt bereits `withInterceptorsFromDi()`, daher passt `HTTP_INTERCEPTORS` Multi-Token
- **Functional Guards (`CanActivateFn`)** – Modernes Angular-20-Pattern, einfacher und besser testbar
- **401-Redirect nur für Nicht-Auth-Endpoints** – URLs mit `/api/v1/auth/` werden vom Redirect ausgenommen, um Login-Loops zu vermeiden
- **`user` als readonly Signal** – `currentUser.asReadonly()` exponiert den Signal-State nach außen, ohne Schreibzugriff zu erlauben
- **Separate Interfaces `LoginResponse` / `UserInfo`** – identische Felder, aber semantisch getrennt (Konsistenz mit Backend-DTOs)

### Verifikation

- `ng test` → 43 Tests grün (2 App + 8 Product + 5 Category + 16 Auth + 9 Interceptor + 2 AuthGuard + 3 AdminGuard – über 7 Test-Suites)
- `ng lint` → Alle Dateien bestanden
- `ng build` → BUILD SUCCESS (269 kB initial)

### Offene Punkte

- Keine

### Nächste Iteration

- Iteration 8 – siehe `backlog.md`

---

## Iteration 6 – TypeScript-Modelle und API-Services

**Status:** Abgeschlossen
**Datum:** 2026-03-02

### Umgesetzte Änderungen

- `src/app/models/availability.enum.ts` – String-Enum mit `COMING`, `AVAILABLE`, `DISCONTINUED`
- `src/app/models/category.model.ts` – Interface mit `id: number`, `name: string`
- `src/app/models/product.model.ts` – Interface mit `id`, `productName`, `price`, `stockCount`, `availability`, `category`
- `src/app/core/services/product.service.ts` – 5 CRUD-Methoden (`getAll`, `getById`, `create`, `update`, `delete`)
- `src/app/core/services/product.service.spec.ts` – 13 Unit-Tests
- `src/app/core/services/category.service.ts` – 4 CRUD-Methoden (`getAll`, `create`, `update`, `delete`)
- `src/app/core/services/category.service.spec.ts` – 9 Unit-Tests
- `.gitkeep`-Dateien in `models/` und `core/services/` entfernt

### Entscheidungen

- **`price: number`** – Jackson serialisiert `BigDecimal` als JSON-Number, TypeScript `number` ist ausreichend
- **`category: Category[]`** – Feldname singular (wie im Backend `List<CategoryDTO> category`)
- **`CategoryService.update()` gibt `Observable<void>` zurück** – Response-Body wird ignoriert, obwohl Backend `200 + CategoryDTO` liefert
- **`inject()` statt Constructor Injection** – ESLint-Regel `@angular-eslint/prefer-inject` erzwingt `inject()`-Funktion
- **`withCredentials: true` auf jedem HTTP-Call** – AuthInterceptor kommt erst in Iteration 7, bis dahin explizit gesetzt

### Verifikation

- `ng test` → 22 Tests grün (2 bestehende + 13 ProductService + 9 CategoryService - davon je 1 Creation-Test)
- `ng lint` → Alle Dateien bestanden
- `ng build` → BUILD SUCCESS (267 kB initial)

### Offene Punkte

- Keine

### Nächste Iteration

- Iteration 7 – Authentifizierungs-Service und Auth-Guard (siehe `backlog.md`)

---

## Iteration 5 – Angular-Projekt initialisieren

**Status:** Abgeschlossen
**Datum:** 2026-03-02

### Umgesetzte Änderungen

- `bookstore-angular/` – Angular 20.3 Projekt erstellt via `@angular/cli@20`
  - Standalone Components (Angular 20 Default, keine NgModules)
  - Angular 20 Dateinamenskonvention: `app.ts`, `app.html`, `app.spec.ts` (statt `app.component.ts` etc.)
- **Verzeichnisstruktur** gemäß `stack.rules.md` Sektion 7:
  - `src/app/core/{services,guards,interceptors}/`
  - `src/app/features/{login,inventory,admin,about}/`
  - `src/app/shared/{components,pipes,directives}/`
  - `src/app/models/`
  - Alle mit `.gitkeep`-Dateien
- **Tailwind CSS v4.2** – `@import "tailwindcss"` + `@theme` Block mit Custom-Farben/Breakpoints aus `stack.rules.md`
  - `postcss.config.js` mit `@tailwindcss/postcss`
- **Angular Material v20** – M3 Design System, `custom-theme.scss` (SCSS nur für Material-Theming, eigener Code nutzt Tailwind)
- **Jest** statt Karma – `@angular-builders/jest@20` als Builder in `angular.json`
  - Karma + Jasmine vollständig entfernt
  - `tsconfig.spec.json` → `types: ["jest"]`
  - `jest.config.js` – leere Konfiguration (Builder liefert eigene Defaults)
- **Proxy** – `proxy.conf.json` für `/api/v1` → `http://localhost:8080/bookstore-starter-flow-ui-1.1-SNAPSHOT`
- **app.config.ts** – `provideRouter(routes)` + `provideHttpClient(withInterceptorsFromDi())`
- **App-Component** – minimal mit `<router-outlet />`
- **ESLint** – `@angular-eslint/schematics@21` + `eslint-config-prettier` + `eslint-plugin-prettier`

### Entscheidungen

- **Tailwind v4 CSS-basierte Config** – `stack.rules.md` zeigt v3-Syntax (`tailwind.config.js`), aber da v4 gefordert ist, wird v4-native `@theme`-Block verwendet. Farben/Breakpoints 1:1 übernommen.
- **Angular Material SCSS behalten** – Material-Theming benötigt intern SCSS; kein Widerspruch zu "kein SCSS/LESS" Regel, da nur für Material-eigene Theme-Konfiguration
- **`@angular-builders/jest@20`** statt direktem `jest-preset-angular@16` – Builder integriert `jest-preset-angular@14` intern und setzt Zone-Testumgebung automatisch auf; kein separates `setup-jest.ts` nötig
- **Angular 20 Dateinamen** – CLI generiert `app.ts` statt `app.component.ts`, wir folgen der Angular-20-Konvention

### Verifikation

- `ng build` → BUILD SUCCESS (267 kB initial)
- `ng test` → 2 Tests grün (App-Erstellung + router-outlet vorhanden)
- `ng lint` → Alle Dateien bestanden

### Offene Punkte

- Keine

### Nächste Iteration

- Iteration 6 – siehe `backlog.md`

---

## Iteration 4 – REST-API: Kategorien

**Status:** Abgeschlossen
**Datum:** 2026-02-27

### Umgesetzte Änderungen

- `rest/dto/CategoryDTO.java` – Bean Validation Annotationen (`@NotBlank`, `@Size`) auf `name` + `toEntity()` Methode für Rückkonvertierung zu `Category`
- `rest/CategoryResource.java` – Neuer REST-Resource mit vier Endpunkten:
  - `GET /api/v1/categories` → `List<CategoryDTO>` (200 OK, kein Auth erforderlich)
  - `POST /api/v1/categories` → 201 Created + `CategoryDTO` (nur Admin)
  - `PUT /api/v1/categories/{id}` → 200 OK + `CategoryDTO` (nur Admin)
  - `DELETE /api/v1/categories/{id}` → 204 No Content (nur Admin)
- `rest/CategoryResourceTest.java` – 19 Unit-Tests (JUnit 5 + Mockito) für alle CRUD-Endpunkte inkl. Auth + Validierung

### Entscheidungen

- **`findCategoryById()` via Stream** – `DataService` hat kein `getCategoryById()`, daher Iteration über `getAllCategories()` mit Stream-Filter
- **PUT: Direktes Mutieren der Referenz** – `MockDataService.updateCategory()` ignoriert Objekte mit `id >= 0`. Da `getAllCategories()` die Original-Listenreferenz zurückgibt, wird das gefundene Objekt direkt mutiert (`existing.setName(dto.getName())`)
- **POST: `setId(-1)` vor `updateCategory()`** – `MockDataService` vergibt neue ID nur bei `id < 0`
- **Keine `GET /{id}` Einzelabruf** – nicht im Backlog spezifiziert, Kategorien werden als vollständige Liste abgerufen
- **Pattern-Konsistenz** – `requireAdmin()`, `validate()`, Field Injection analog zu `ProductResource`

### Verifikation

- `mvn clean install` – BUILD SUCCESS, 58 Tests (19 CategoryResource + 21 ProductResource + 13 Auth + 2 ProductDTO + 3 CORS), 0 Fehler
- **curl-Tests** (alle bestanden, Kontext-Pfad: `/bookstore-starter-flow-ui-1.1-SNAPSHOT/`):
  - `GET /api/v1/categories` → 200 OK, 8 Kategorien als JSON-Array (ohne Auth)
  - `POST /api/v1/categories` mit `{"name":"Test Category"}` als Admin → 201 Created, `{"id":9,"name":"Test Category"}`
  - `POST /api/v1/categories` mit `{"name":"X"}` (< 2 Zeichen) → 400, `{"error":"Category name must be at least 2 characters"}`
  - `PUT /api/v1/categories/9` mit `{"name":"Updated Category"}` → 200 OK, `{"id":9,"name":"Updated Category"}`
  - `DELETE /api/v1/categories/9` → 204 No Content (Kategorie entfernt, GET bestätigt 8 Kategorien)
  - `POST /api/v1/categories` ohne Auth → 401, `{"error":"Not authenticated"}`
  - `POST /api/v1/categories` als `user1` (non-admin) → 403, `{"error":"Admin role required"}`
  - Vaadin-UI → 200 OK (keine Regression)

### Offene Punkte

- Keine

### Nächste Iteration

- Iteration 5 – Angular-Projekt initialisieren (siehe `backlog.md`)

---

## Iteration 3 – REST-API: Produkte schreiben

**Status:** Abgeschlossen
**Datum:** 2026-02-27

### Umgesetzte Änderungen

- `rest/dto/ProductDTO.java` – Bean Validation Annotationen (`@NotBlank`, `@Size`, `@NotNull`, `@Min`) + `toEntity(Collection<Category>)` Methode für Rückkonvertierung
- `rest/dto/AvailabilityDTO.java` – `toEntity()` Methode für Rückkonvertierung zu `Availability`
- `rest/ProductResource.java` – Erweitert um drei schreibende Endpunkte:
  - `POST /api/v1/products` → 201 Created + `ProductDTO` (nur Admin)
  - `PUT /api/v1/products/{id}` → 200 OK + `ProductDTO` (nur Admin)
  - `DELETE /api/v1/products/{id}` → 204 No Content (nur Admin)
- `rest/ProductResourceTest.java` – Erweitert auf 21 Tests (17 neue Tests für CRUD + Auth + Validierung)

### Entscheidungen

- **Programmatische Bean Validation** mit `@Inject Validator` statt `@Valid` auf Methodenparameter – ermöglicht konsistente JSON-Fehlerantworten
- **`requireAdmin()` Helper-Methode** – prüft `isUserSignedIn()` (401) und `isUserInRole("admin")` (403), wiederverwendbar für alle schreibenden Endpunkte
- **Kategorie-Auflösung per ID** – `toEntity()` mappt `CategoryDTO`-IDs gegen `dataService.getAllCategories()`, unbekannte IDs werden ignoriert
- **`ParameterMessageInterpolator`** in Tests statt EL-Dependency – Hibernate Validator benötigt Expression Language, die im Test-Classpath fehlt
- **Keine neuen Dateien** – nur bestehende DTOs und `ProductResource` erweitert

### Verifikation

- `mvn clean install` – BUILD SUCCESS, 39 Tests (21 ProductResource + 13 Auth + 2 ProductDTO + 3 CORS), 0 Fehler
- curl-Tests implizit durch Iteration 4 WildFly-Deployment verifiziert (alle Endpunkte funktionsfähig)

### Offene Punkte

- Keine

### Nächste Iteration

- Iteration 4 – REST-API: Kategorien (siehe `backlog.md`)

---

## Iteration 2 – REST-API: Authentifizierung

**Status:** Abgeschlossen
**Datum:** 2026-02-27

### Umgesetzte Änderungen

- `rest/dto/LoginRequestDTO.java` – POJO mit `username`, `password`, No-Arg/All-Args-Konstruktor
- `rest/dto/LoginResponseDTO.java` – POJO mit `username`, `role`, No-Arg/All-Args-Konstruktor
- `rest/dto/UserInfoDTO.java` – POJO mit `username`, `role`, No-Arg/All-Args-Konstruktor (semantisch getrennt von `LoginResponseDTO`)
- `rest/AuthResource.java` – `@Path("auth")`, `@RequestScoped`, drei Endpunkte:
  - `POST /api/v1/auth/login` → `LoginResponseDTO` (200) oder JSON-Fehler (400/401)
  - `POST /api/v1/auth/logout` → 204 No Content (idempotent)
  - `GET /api/v1/auth/me` → `UserInfoDTO` (200) oder JSON-Fehler (401)
- `rest/AuthResourceTest.java` – 13 Unit-Tests (JUnit 5 + Mockito)

### Entscheidungen

- **Session-Invalidierung direkt über `HttpServletRequest`** statt `AccessControl.signOut()` – `signOut()` greift auf `VaadinSession` zu, die in JAX-RS-Kontext nicht verfügbar ist
- **`request.changeSessionId()`** nach Login – Session-Fixation-Schutz
- **`request.getSession(false)` bei Logout** – keine neue Session anlegen, wenn keine existiert
- **Field Injection** für `AccessControl`, `@Context` für `HttpServletRequest` – konsistent mit `ProductResource`-Pattern
- **Keine Änderungen an CORS-Filter** – POST, GET, Credentials und Content-Type bereits unterstützt
- **Keine POM-Änderungen** – alle Test-Dependencies (JUnit 5, Mockito 5) bereits vorhanden

### Verifikation

- `mvn clean install` – BUILD SUCCESS, 22 Tests (13 neu + 9 bestehend), 0 Fehler
- **curl-Tests** (alle bestanden, Kontext-Pfad: `/bookstore-starter-flow-ui-1.1-SNAPSHOT/`):
  - `POST /api/v1/auth/login` mit `user1/user1` → 200, `{"username":"user1","role":"user"}`
  - `POST /api/v1/auth/login` mit falschen Credentials → 401, `{"error":"Invalid username or password"}`
  - `GET /api/v1/auth/me` mit Cookie → 200, `{"username":"user1","role":"user"}`
  - `GET /api/v1/auth/me` ohne Cookie → 401, `{"error":"Not authenticated"}`
  - `POST /api/v1/auth/logout` mit Cookie → 204 No Content
  - `GET /api/v1/auth/me` nach Logout → 401 (Session ungültig)
  - `POST /api/v1/auth/login` mit `admin/admin` → 200, `{"username":"admin","role":"admin"}`
  - `GET /api/v1/auth/me` als Admin → 200, `{"username":"admin","role":"admin"}`
  - Vaadin-UI → 200 OK (keine Regression)

### Offene Punkte

- Keine

### Nächste Iteration

- Iteration 3 – siehe `backlog.md`

---

## Iteration 1 – REST-API: Grundgerüst und Produkte lesen

**Status:** Abgeschlossen
**Datum:** 2026-02-26

### Umgesetzte Änderungen

- `rest/dto/AvailabilityDTO.java` – Enum mit `COMING`, `AVAILABLE`, `DISCONTINUED` + `fromEntity()` Factory
- `rest/dto/CategoryDTO.java` – POJO mit `id`, `name`, No-Arg/All-Args-Konstruktor, `fromEntity()` Factory
- `rest/dto/ProductDTO.java` – POJO mit allen Produkt-Feldern, `fromEntity()` Factory (konvertiert `Set<Category>` → `List<CategoryDTO>`, null-safe)
- `rest/BookstoreRestApplication.java` – `@ApplicationPath("/api/v1")` aktiviert JAX-RS
- `rest/CorsFilter.java` – `@Provider`, `ContainerRequestFilter` + `ContainerResponseFilter` für `http://localhost:4200`
- `rest/ProductResource.java` – `@Path("products")`, `@RequestScoped`, zwei Endpunkte:
  - `GET /api/v1/products` → `List<ProductDTO>` (200 OK)
  - `GET /api/v1/products/{id}` → `ProductDTO` (200 OK) oder JSON-Fehler (404)

### Entscheidungen

- **Basispfad `/api/v1`** statt `/api` (backlog.md) – `stack.rules.md` ist gemäß `CLAUDE.md` maßgeblich
- **JAX-RS `@Provider` CORS-Filter** statt Servlet-Filter – gilt nur für REST-Endpunkte, interferiert nicht mit Vaadin Servlet
- **`@RequestScoped`** für `ProductResource` – erforderlich wegen `bean-discovery-mode="annotated"` in `beans.xml`
- **Field Injection** statt Constructor Injection in `ProductResource` – RESTEasy benötigt No-Arg-Konstruktor für POJO-Instanziierung
- **JDK 17** für WildFly 27 – JDK 25 inkompatibel (Security Manager entfernt in JDK 24)

### Verifikation

- `mvn clean install` – BUILD SUCCESS
- **curl-Tests** (alle bestanden, Kontext-Pfad: `/bookstore-starter-flow-ui-1.1-SNAPSHOT/`):
  - `GET /api/v1/products` → 200 OK, 100 Produkte als JSON-Array
  - `GET /api/v1/products/1` → 200 OK, einzelnes Produkt-JSON
  - `GET /api/v1/products/99999` → 404, `{"error": "Product with id 99999 not found"}`
  - CORS-Headers bei `Origin: http://localhost:4200` → alle Header korrekt gesetzt
  - CORS Preflight (OPTIONS) → 200 OK mit allen CORS-Headers
  - Vaadin-UI → 200 OK (keine Regression)

### Offene Punkte

- **Kontext-Pfad:** WAR wird unter `/bookstore-starter-flow-ui-1.1-SNAPSHOT/` deployt. Angular-Proxy muss diesen Pfad berücksichtigen oder WildFly-Deployment auf Root `/` konfiguriert werden.

### Nächste Iteration

- Iteration 2 – REST-API: Authentifizierung (siehe `backlog.md`)
