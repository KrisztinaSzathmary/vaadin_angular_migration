# Migration-Backlog — Vaadin → Angular (Bookstore)

**Stand:** 2026-06-25
Feinkörnige, sequenzierte Migrationseinheiten. Reihenfolge folgt der Dependency-Map in
`migration-roadmap.md`. Jede Einheit durchläuft den vollen `/migrate`-Zyklus
(Analyze → Translate → Refactor → Verify) mit HITL-Gate.

**Komplexität:** S (klein, < ~0,5 Tag) · M (mittel) · L (groß, orchestrierend/zustandsreich).

---

## M-00 — E2E-Test-Harness (Querschnitt)
- Vaadin-Quelle: — (abgeleitet aus `ui-design-plan/flows/01..07`)
- Angular-Ziel: `bookstore-angular/e2e/` (Playwright-Config, Baseline-Fixtures, Helpers)
- Hängt ab von: —
- Komplexität: M
- Begründung Reihenfolge: Querschnitt zuerst. Ohne Flows-basierte E2E-Baseline ist
  funktionale Äquivalenz späterer Views nicht prüfbar (Sensor-Protokoll, CLAUDE.md).
- Akzeptanzkriterien: Playwright läuft deterministisch (Animationen aus, dynamischer
  Inhalt maskiert); leeres Smoke-Spec grün; `@axe-core/playwright` eingebunden;
  Flow-Dateien als Testvorlagen referenziert.

## M-01 — Domänenmodelle (Product, Category, Availability)
- Vaadin-Quelle: `bookstore-starter-flow-backend/.../data/Product.java`, `Category.java`, `Availability.java` (Contract-Referenz, bleibt Java)
- Angular-Ziel: `bookstore-angular/src/app/core/models/{product,category,availability}.ts`
- Hängt ab von: —
- Komplexität: S
- Begründung Reihenfolge: Wurzel der Topologie. Nahezu jede andere Einheit referenziert
  diese Typen (`ProductGrid:12`, `ProductForm:41-43`, `SampleCrudPresenter:5`, `AdminView:26`).
- Akzeptanzkriterien: TS-Interfaces/Enum bilden alle in der UI genutzten Felder ab
  (productName, price, stockCount, availability, category, id, isNewProduct-Äquivalent);
  `Availability` mit AVAILABLE/COMING/DISCONTINUED; `ng build` strict grün.

## M-02 — DataService (HTTP-Anbindung ans Backend)
- Vaadin-Quelle: `bookstore-starter-flow-backend/.../DataService.java` (Contract)
- Angular-Ziel: `bookstore-angular/src/app/core/services/data.service.ts`
- Hängt ab von: M-01
- Komplexität: M
- Begründung Reihenfolge: Backend bleibt unverändert (REST). Angular braucht einen
  HTTP-Client-Service, der `getAllProducts/getAllCategories/getProductById/updateProduct/
  deleteProduct/updateCategory/deleteCategory` abbildet (genutzt in `ProductDataProvider`,
  `SampleCrudPresenter:55,82`, `AdminView:66,98,112`).
- Akzeptanzkriterien: Alle in der UI aufgerufenen Service-Methoden vorhanden und typisiert;
  `HttpClient`-basiert; Unit-Tests mit `HttpTestingController` grün.

## M-03 — i18n / Übersetzungen
- Vaadin-Quelle: `CustomI18NProvider.java` + `translate*.properties`
- Angular-Ziel: `bookstore-angular/src/app/core/i18n/` (Übersetzungs-Keys, de/en)
- Hängt ab von: —
- Komplexität: S
- Begründung Reihenfolge: Querschnitt; jede View nutzt `getTranslation(...)`. Früh, damit
  Views direkt gegen Keys gebaut werden. Zweitsprache **Deutsch** statt Finnisch (Scope).
- Akzeptanzkriterien: Alle in den Views referenzierten Keys (login-*, filter, new-product,
  save, discard, categories, availability, in-stock, price, product-name, admin, edit-categories,
  cant-navigate, view-not-found, info-text …) vorhanden; Parametrisierung (MessageFormat → Angular)
  funktioniert; de + en abgedeckt.

## M-04 — Auth-Domäne (AccessControl / CurrentUser)
- Vaadin-Quelle: `authentication/AccessControl.java`, `BasicAccessControl.java`, `CurrentUser.java`
- Angular-Ziel: `bookstore-angular/src/app/core/auth/auth.service.ts`
- Hängt ab von: M-03 (Logging/Meldungen optional)
- Komplexität: M
- Begründung Reihenfolge: Domänen-Querschnitt. Voraussetzung für Guard (M-06), Menu (M-08),
  Login (M-09), Presenter (M-11). `BasicAccessControl:21` → `CurrentUser`.
- Akzeptanzkriterien: `signIn/signOut/isUserSignedIn/isUserInRole/getPrincipalName` als
  Signal-basierter Service; Admin-Rolle nur für User „admin"; Mock-Login-Regel
  (username==password) äquivalent; Unit-Tests grün.

## M-05 — ProductDataProvider (Filter/Cache/CRUD-Adapter)
- Vaadin-Quelle: `crud/ProductDataProvider.java`
- Angular-Ziel: `bookstore-angular/src/app/inventory/product-data.store.ts` (Signal-Store)
- Hängt ab von: M-01, M-02
- Komplexität: M
- Begründung Reihenfolge: Adapter über `DataService` (`:13,24,36`). Vor der CRUD-View (M-11),
  die ihn injiziert (`SampleCrudViewImpl:74,78,87`).
- Akzeptanzkriterien: Textfilter über Name/Availability/Category äquivalent (`:117-119`);
  `loadData/save/delete` abgebildet; 1-Minute-Cache-TTL als Signal/Store-Logik (oder bewusst
  vereinfacht, dokumentiert); Unit-Tests grün.

## M-06 — Routing & Auth-Guard (BeforeEnter)
- Vaadin-Quelle: `BookstoreBeforeEnterListener.java` (+ `@Route`/`@RouteAlias`-Annotationen aller Views)
- Angular-Ziel: `bookstore-angular/src/app/app.routes.ts` + `core/auth/auth.guard.ts`
- Hängt ab von: M-04
- Komplexität: M
- Begründung Reihenfolge: Querschnitt früh (Roadmap §4). Bildet den Redirect-auf-Login
  (`:28-30`) und die Routenstruktur (inventory `/`+`/inventory`, about, admin, Login) ab.
  **Schnittpunkt für Login↔Admin-Routing-Kopplung** (siehe Roadmap §3).
- Akzeptanzkriterien: Nicht angemeldet → Redirect auf `/Login`; angemeldet auf `/Login` →
  Redirect auf Inventory; Routen-Aliasse `/` und `/inventory`; geschützte Routen via
  `canActivate`-Guard; Admin-Route nur nach Admin-Login aktiv (Hook für M-09/M-14).

## M-07 — MainLayout (App-Shell)
- Vaadin-Quelle: `MainLayout.java`
- Angular-Ziel: `bookstore-angular/src/app/layout/main-layout.component.ts`
- Hängt ab von: M-04, M-08, M-06
- Komplexität: M
- Begründung Reihenfolge: Router-Layout aller Views (`AboutView:14`, `SampleCrudViewImpl:47`,
  `ErrorView:20`, `AdminView:39`). Braucht Menu (M-08) und Auth (M-04). Keyboard-Logout
  (`:62-63`) entfällt (Scope).
- Akzeptanzkriterien: Layout mit `<router-outlet>`; bettet Menu ein; responsive
  (Desktop/Mobile gemäß `annotated/main-layout.md`); Locale-Cookie-Logik bewusst weggelassen
  (dokumentiert).

## M-08 — Menu (Navigation/Sidenav)
- Vaadin-Quelle: `Menu.java`
- Angular-Ziel: `bookstore-angular/src/app/layout/menu.component.ts`
- Hängt ab von: M-04, M-03
- Komplexität: M
- Begründung Reihenfolge: Wird von MainLayout instanziiert (`MainLayout:38,44,55`); selbst
  nur abhängig von Auth (`Menu:39,78` Logout). Vor/zusammen mit M-07.
- Akzeptanzkriterien: Sidenav mit Inventory + About; dynamischer Admin-Eintrag bei Admin-Login;
  Logout-Button ruft `signOut`; Hamburger-Toggle auf Mobile (`:43-49`, `annotated/main-layout.md`);
  Material-Sidenav statt Vaadin-SideNav.

## M-09 — LoginView
- Vaadin-Quelle: `authentication/LoginView.java`
- Angular-Ziel: `bookstore-angular/src/app/auth/login.component.ts`
- Hängt ab von: M-04, M-07, M-06
- Komplexität: M
- Begründung Reihenfolge: Erste echte View. Hängt an Auth + Layout + Routing. Registriert
  Admin-Route nach Admin-Login (`:151-160`) → über M-06-Guard/Route-Config gelöst (Schnittpunkt).
- Akzeptanzkriterien: Username/Password-Form (Reactive Forms); falsche Credentials →
  Fehlerzustand; leeres Submit blockiert; „Passwort vergessen" → Hinweis-Toast; erfolgreicher
  Login → Navigation auf Inventory; Admin-Login aktiviert Admin-Route. Sprach-Dropdown
  vereinfacht (Finnisch entfällt, Scope). Flows: `flows/01-login-logout.md`.

## M-10 — ProductGrid
- Vaadin-Quelle: `crud/ProductGrid.java`
- Angular-Ziel: `bookstore-angular/src/app/inventory/product-grid.component.ts`
- Hängt ab von: M-01
- Komplexität: M
- Begründung Reihenfolge: Eigenständige Präsentationskomponente, nur Modell-abhängig
  (`:12,25,104`). Vor der orchestrierenden CRUD-View (M-11), die sie einbettet (`SampleCrudViewImpl:86`).
- Akzeptanzkriterien: Spalten Name/Preis(€, 2 Nachkommastellen)/Availability(Ampel-Icon)/
  Bestand/Kategorien; sortierbar; Selektion emittiert Event; Kategorien kommasepariert sortiert
  (`:99-106`); Material-Table (M3). Flows: `flows/02-produktliste-und-suche.md`.

## M-11 — Inventory-View (SampleCrudView + Presenter + ProductForm)
- Vaadin-Quelle: `crud/SampleCrudViewImpl.java`, `crud/SampleCrudView.java`, `crud/SampleCrudPresenter.java`, `crud/ProductForm.java`
- Angular-Ziel: `bookstore-angular/src/app/inventory/inventory.component.ts` + `product-form.component.ts` (+ Logik im Component/Store)
- Hängt ab von: M-01, M-04, M-05, M-07, M-10
- Komplexität: L
- Begründung Reihenfolge: Höchster Fan-in (Grid M-10, Form, DataProvider M-05, Presenter,
  Layout M-07). Orchestrierende Kern-View, daher zuletzt unter den Kern-Views. MVP-Interface
  `SampleCrudView` geht in Component-State auf (kein eigenes Angular-Artefakt).
- Akzeptanzkriterien: Filter-Textfeld filtert Grid; „Neues Produkt" (nur Admin, `Presenter:44`,
  `:179`) öffnet leeres Form; Grid-Klick (Admin, `Presenter:111`) öffnet Form; Speichern/
  Validierung (inkl. Availability-vs-Stock-Cross-Check `ProductForm:283-290`); Löschen mit
  ConfirmDialog (`:202-219`); Discard mit Unsaved-Changes-Confirm (`:336-350`); URL-Parameter
  `/inventory/{id}` + `/inventory/new` (`:255,222-232`); BeforeLeave-Guard bei Dirty
  (`:261-267`); ungültige Produkt-ID → Fehler-Toast. Keyboard-Shortcuts entfallen (Scope).
  Flows: `flows/03/04/05`.

## M-12 — AboutView
- Vaadin-Quelle: `about/AboutView.java`
- Angular-Ziel: `bookstore-angular/src/app/about/about.component.ts`
- Hängt ab von: M-07, M-03
- Komplexität: S
- Begründung Reihenfolge: Rein informativ, nur Layout-abhängig (`:14`). Jederzeit nach M-07
  migrierbar.
- Akzeptanzkriterien: Zeigt Info-Text + Versionsangabe zentriert; Titel-Element.
  **Offener Punkt:** `BookstoreTitle` (`:10,28`) ist im Quellbaum nicht auffindbar — in Angular
  durch einfache Titel-Komponente/Heading ersetzen; HITL bestätigt Erscheinungsbild gegen
  `screenshots/about/`.

## M-13 — Error-/404-Route
- Vaadin-Quelle: `ErrorView.java`
- Angular-Ziel: `bookstore-angular/src/app/app.routes.ts` (Wildcard) + Notification
- Hängt ab von: M-06, M-07, M-03
- Komplexität: S
- Begründung Reihenfolge: Querschnitt; baut auf Routing (M-06) + Layout (M-07). Laut
  `flows/overview.md` zeigt die App zur Laufzeit einen **Toast**, keinen dedizierten Screen —
  daher als Wildcard-Route + Notification, nicht als 1:1-View migriert.
- Akzeptanzkriterien: Unbekannte Route führt zu „view-not-found"/„cant-navigate"-Meldung
  (`:24-25,42`) mit Pfadangabe; HTTP-404-Semantik dokumentiert. Flow: `flows/07` (7c).

## M-14 — AdminView (Kategorieverwaltung)
- Vaadin-Quelle: `AdminView.java`
- Angular-Ziel: `bookstore-angular/src/app/admin/admin.component.ts`
- Hängt ab von: M-01, M-02, M-07, M-06, M-09
- Komplexität: M
- Begründung Reihenfolge: Hängt an DataService (`:25,56,61`) + Layout (`:39`). Dynamische
  Route-Registrierung erst nach Login (M-09) / via Guard (M-06). Zuletzt, da nur für Admin sichtbar.
- Akzeptanzkriterien: Liste der Kategorien; „Neue Kategorie" fügt Editierzeile hinzu;
  Auto-Save bei valider Eingabe (`:110-117`) mit Toast; Löschen-Icon entfernt sofort
  (kein Dialog) mit Toast (`:96-102`); nur für Admin erreichbar. Flow: `flows/06-kategorie-verwaltung.md`.

---

## Nicht migrierte Vaadin-Klassen (mit Grund)

| Klasse | Grund |
|--------|-------|
| `LoggerProducer` | CDI-Logger-Producer; kein Angular-Pendant nötig (`console`/Logging). |
| `CustomSystemMessagesProvider` | Vaadin-Push/Session-Messages; durch HTTP-Interceptor/Toast ersetzt. |
| `Configuration` (`@Theme/@PWA/AppShell`) | Bootstrapping → `angular.json`/`app.config.ts`/PWA-Setup, kein Backlog-Item. |
| `CookieUtil` | Cookie-Locale-Hilfe; client-seitige Locale-Verwaltung in Angular (Scope). |
| `BookstoreInitListener` | Server-Init/Cookie-Locale-Plumbing (Scope, kein Nutzer-Flow). |
| `SampleCrudView` (Interface) | MVP-Vertrag View↔Presenter; geht in M-11-Component auf. |
| Keyboard-Shortcuts (diverse Views) | Explizites Nicht-Ziel (CLAUDE.md). |
| Finnisch (`LOCALE_FI`) | Zweitsprache ist Deutsch (Scope). |
