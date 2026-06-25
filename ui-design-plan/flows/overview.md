# Flow-Übersicht: Vaadin Bookstore — Alle Workflows

**Stand:** 2026-06-25
**Quelle:** Screenshots (`ui-design-plan/screenshots/`), Annotationen (`ui-design-plan/annotated/`), Vaadin-Quellcode

---

## Übersicht aller Workflows

| Datei | Workflow | Views abgedeckt | Rollen |
|-------|----------|-----------------|--------|
| `01-login-logout.md` | Login (Erfolg als Admin, Erfolg als User, falsche Credentials, leeres Submit, Passwort-vergessen) + Logout | LoginView | Alle |
| `02-produktliste-und-suche.md` | Produktliste ansehen, Textfilter, leeres Suchergebnis, URL-Direktzugriff, Grid-Sortierung | Inventory | Alle angemeldeten |
| `03-produkt-anlegen.md` | Neues Produkt anlegen (Happy Path, Abbruch, Abbruch mit Dirty, Validierungsfehler) | Inventory + ProductForm | Admin |
| `04-produkt-bearbeiten.md` | Bestehendes Produkt bearbeiten, Verwerfen (Discard), Cancel mit Dirty, Dialog-X mit Dirty, BeforeLeave-Guard, Produkt-Wechsel im Grid | Inventory + ProductForm | Admin |
| `05-produkt-loeschen.md` | Produkt löschen mit Bestätigungsdialog, Abbruch des Löschens | Inventory + ProductForm | Admin |
| `06-kategorie-verwaltung.md` | Admin-View öffnen, Kategorie anlegen (Auto-Save), Namen bearbeiten, Kategorie löschen | AdminView | Admin |
| `07-navigation-und-mobile.md` | Desktop-Navigation, BeforeLeave-Guard, 404-Fehlerfall, Mobile Hamburger-Menü, Mobile Inventory/Login/Admin | Alle Views | Alle |

---

## View-zu-View-Navigationsmap

```
LoginView (/Login)
    |
    +-- Admin-Login -------> Inventory + Admin-Route registriert
    |
    +-- User-Login  -------> Inventory (ohne Admin-Menü)
    |
    +-- Fehlgeschlagen ----> LoginView (Fehlerzustand)

MainLayout (alle folgenden Views haben diese als Router-Layout)
    |
    +-- Inventory (/inventory, /)
    |       |
    |       +-- Grid-Klick (Admin)    --> ProductForm (Sidebar) öffnet sich
    |       +-- "Uusi tuote" (Admin)  --> ProductForm (leer) öffnet sich
    |       +-- Filter-Eingabe        --> Grid wird gefiltert (kein View-Wechsel)
    |       +-- URL /inventory/{id}   --> ProductForm für Produkt-ID öffnet sich
    |       +-- URL /inventory/new    --> Neues ProductForm öffnet sich
    |
    +-- About (/about)
    |       [Keine Interaktion, rein informational]
    |
    +-- Admin (/admin) [nur nach Admin-Login sichtbar]
    |       |
    |       +-- "Lisää kategoria"     --> Neue Eingabezeile in Liste
    |       +-- Textfeld-Änderung     --> Auto-Save bei valider Eingabe
    |       +-- Löschen-Icon          --> Sofortige Löschung (kein Dialog)
    |
    +-- Logout (alle Views) ----------> LoginView

ErrorView (bei unbekannter Route)
    --> Laufzeitverhalten: Toast auf Inventory (kein separater Screen)
```

---

## Berechtigungsmatrix

| Workflow | Nicht angemeldet | Angemeldet (User) | Angemeldet (Admin) |
|----------|-----------------|-------------------|--------------------|
| Login aufrufen | Ja | Redirect → Inventory | Redirect → Inventory |
| Inventory ansehen | Redirect → Login | Ja | Ja |
| Produktliste filtern | Redirect → Login | Ja | Ja |
| Produkt im Grid anklicken (Formular öffnen) | Redirect → Login | Nein (keine Aktion) | Ja |
| Neues Produkt anlegen | Redirect → Login | Nein (Button disabled) | Ja |
| Produkt bearbeiten/speichern | Redirect → Login | Nein | Ja |
| Produkt löschen | Redirect → Login | Nein | Ja |
| About-View | Redirect → Login | Ja | Ja |
| Admin-View öffnen | Redirect → Login | Nein (Route nicht registriert) | Ja |
| Kategorie anlegen/bearbeiten/löschen | Redirect → Login | Nein | Ja |
| Logout | — | Ja | Ja |

---

## Nicht modellierte Pfade

| Pfad | Grund |
|------|-------|
| Keyboard-Shortcuts (Ctrl+F, Alt+N, Ctrl+S, Page-Down, Page-Up, Ctrl+L) | Explizit als Nicht-Ziel in CLAUDE.md ausgeschlossen |
| Sprachumschaltung (Finnisch / Englisch via Dropdown auf Login-View) | Betrifft i18n-Infrastruktur, kein eigener Benutzer-Workflow; in Angular wird Locale-Verwaltung client-seitig anders gelöst |
| Cookie-basierte Locale-Wiederherstellung | Infrastruktur-Detail; kein eigenständiger Workflow aus Nutzersicht |
| Session-Timeout (serverseitige Expiration) | Kein Screenshot/Zustand dokumentiert; Verhalten ist implizit: nächste Interaktion → Redirect auf Login |
| ProductDataProvider-Cache (1-Minute-TTL) | Backend-intern, für den Endnutzer nicht direkt sichtbar |
| Vaadin-Dev-Tools-Overlay | Artefakt des Dev-Builds, nicht produktionsrelevant |
| Error-View als dedizierter 404-Screen | Laut Laufzeitbeobachtung zeigt die App keinen separaten Screen sondern einen Toast; die Java-Implementierung (`ErrorView.java`) ist vorhanden aber das Laufzeitverhalten weicht ab |

---

## Screenshots-Abdeckung

| Screenshot | Referenziert in Workflow |
|------------|--------------------------|
| `login/login--default.png` | 01 (1a, 1f) |
| `login/login--filled.png` | 01 (1a) |
| `login/login--empty-submit.png` | 01 (1d) |
| `login/login--wrong-credentials.png` | 01 (1c) |
| `login/login--mobile.png` | 07 (7f) |
| `inventory/inventory--default.png` | 02 (2a), 03 (3a) |
| `inventory/inventory--filtered-java.png` | 02 (2b) |
| `inventory/inventory--empty-grid.png` | 02 (2c) |
| `inventory/inventory--row-selected.png` | 04 (4a), 05 (5a) |
| `inventory/inventory--mobile.png` | 07 (7e) |
| `product-form/product-form--new-empty.png` | 03 (3a) |
| `product-form/product-form--name-filled.png` | 03 (3a) |
| `product-form/product-form--partially-filled.png` | 03 (3a) |
| `product-form/product-form--existing-product.png` | 04 (4a) |
| `product-form/product-form--edit-mode.png` | 04 (4a) |
| `product-form/product-form--existing-sidebar.png` | 04 (allgemein) |
| `product-form/product-form--existing-fullpage.png` | 04 (allgemein) |
| `product-form/product-form--existing-product-scrolled.png` | 04 (allgemein) |
| `admin/admin--default.png` | 06 (6a, 6d) |
| `admin/admin--add-category.png` | 06 (6b) |
| `admin/admin--mobile.png` | 07 (7g) |
| `main-layout/main-layout--desktop.png` | 07 (7a), 01 (1a) |
| `main-layout/main-layout--mobile-closed.png` | 07 (7d) |
| `main-layout/main-layout--mobile-menu-open.png` | 07 (7d) |
| `about/about--default.png` | 07 (7a) |
| `about/about--mobile.png` | 07 (allgemein) |
| `error/error--404.png` | 07 (7c) |
