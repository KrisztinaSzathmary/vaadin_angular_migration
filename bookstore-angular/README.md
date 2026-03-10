# Bookstore Angular

Angular 20 Single Page Application, migriert aus einer Vaadin Flow Bookstore-Anwendung. Diese SPA nutzt dieselben Backend-Services über eine REST-API-Schicht und bietet ein modernes Angular-basiertes Frontend.

## Tech Stack

- **Framework:** Angular 20 (Standalone Components, keine NgModules)
- **UI-Bibliothek:** Angular Material v20 (Material Design 3)
- **CSS:** Tailwind CSS v4
- **Sprache:** TypeScript 5.9 (`strict: true`)
- **State:** Angular Signals (`signal()`, `computed()`, `effect()`)
- **i18n:** ngx-translate (EN/DE, dynamischer Sprachwechsel)
- **Unit-Tests:** Jest (via `@angular-builders/jest`)
- **E2E-Tests:** Playwright (Chromium)
- **Linting:** ESLint + Prettier

## Voraussetzungen

- **Node.js** 18+
- **JDK 17** (erforderlich für WildFly 27 Backend)
- **WildFly 27** Backend laufend (stellt die REST-API bereit)

## Erste Schritte

### 1. Abhängigkeiten installieren

```bash
cd bookstore-angular
npm install
```

### 2. Backend starten

```bash
cd bookstore-starter-flow-ui
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.18/libexec/openjdk.jdk/Contents/Home
mvn wildfly:run -PrunWar
```

Das Backend startet unter `http://localhost:8080/bookstore-starter-flow-ui-1.1-SNAPSHOT/`.

### 3. Frontend starten

```bash
cd bookstore-angular
ng serve
```

Im Browser `http://localhost:4200` öffnen.

### API-Proxy

Der Angular Dev-Server leitet API-Requests über `proxy.conf.json` weiter:

- `/api/v1/*` → `http://localhost:8080/bookstore-starter-flow-ui-1.1-SNAPSHOT/api/v1/*`

## Verfügbare Befehle

| Befehl | Beschreibung |
|--------|-------------|
| `ng serve` | Dev-Server starten unter `http://localhost:4200` |
| `ng test` | Unit-Tests ausführen (Jest, 255 Tests) |
| `ng lint` | ESLint + Prettier Prüfungen ausführen |
| `npx playwright test` | E2E-Tests ausführen (Playwright, 50 Tests) |
| `ng build` | Produktions-Build nach `dist/` |

## Projektstruktur

```
bookstore-angular/
├── src/app/
│   ├── core/                  # Singleton-Services, Guards, Interceptors
│   │   ├── guards/            # AuthGuard, AdminGuard, UnsavedChangesGuard
│   │   ├── interceptors/      # AuthInterceptor (withCredentials, 401-Redirect)
│   │   └── services/          # AuthService, ProductService, CategoryService,
│   │                          #   NotificationService, LanguageService
│   ├── features/              # Feature-Komponenten (Lazy Loaded)
│   │   ├── login/             # LoginComponent (Zwei-Spalten-Layout, i18n)
│   │   ├── inventory/         # ProductListComponent, ProductFormComponent
│   │   ├── admin/             # AdminComponent (Kategorie-CRUD, Inline-Editing)
│   │   ├── about/             # AboutComponent (Dashboard mit Statistiken)
│   │   └── not-found/         # NotFoundComponent (404-Seite)
│   ├── shared/                # Gemeinsame Komponenten, Pipes, Directives
│   │   └── components/        # MainLayoutComponent, ConfirmDialogComponent
│   ├── models/                # TypeScript-Interfaces und Enums
│   └── testing/               # Test-Hilfsmittel (TranslateTestModule)
├── e2e/                       # Playwright E2E-Tests
│   ├── pages/                 # Page Objects (7 Dateien)
│   └── *.spec.ts              # Test-Specs (11 Dateien)
└── public/i18n/               # Übersetzungsdateien (en.json, de.json)
```

## Test-Zugangsdaten

| Benutzername | Passwort | Rolle |
|-------------|----------|-------|
| `admin` | `admin` | Admin (vollständiger CRUD-Zugriff) |
| `user1` | `user1` | User (nur Lesezugriff) |

## Feature-Übersicht

- **Login/Logout** – Session-basierte Authentifizierung mit HttpOnly Cookies
- **Produkttabelle** – Sortierbare Tabelle mit Verfügbarkeits-Badges, Preisformatierung, Kategorieanzeige
- **Produktfilter** – Client-seitige Suche über Name, Verfügbarkeit und Kategorien (300ms Debounce)
- **Produktformular** – Produkte erstellen/bearbeiten/löschen via Material Dialog (nur Admin)
- **Kategorien-Verwaltung** – Inline-Editing von Kategorien mit Validierung (nur Admin)
- **Sidebar-Navigation** – Responsives Layout mit MatSidenav, rollenbasierte Menüeinträge
- **URL-basierte Navigation** – Bookmarkable Produkt-URLs (`/inventory/:id`, `/inventory/new`)
- **Ungespeicherte Änderungen** – CanDeactivate Guard mit Bestätigungsdialogen
- **Internationalisierung** – Dynamischer EN/DE-Sprachwechsel, Cookie-persistiert
- **Responsives Design** – Mobile-first mit Breakpoints bei 570px und 800px, Hamburger-Menü
- **About-Seite** – Dashboard mit Produktstatistiken und Systeminformationen
- **404-Seite** – Fehlerseite für unbekannte Routen
- **Rollenbasierte Autorisierung** – Admin Guard schützt `/admin` und Schreiboperationen

## Bekannte Einschränkungen

- **Keyboard Shortcuts** nicht implementiert (Iteration 19 übersprungen) – Ctrl+F, Alt+N, Ctrl+S, Escape, Page Down/Up, Ctrl+L sind nicht verfügbar
- **Zweite Sprache** weicht von Vaadin ab: Angular nutzt Deutsch (de), Vaadin nutzte Finnisch (fi_FI)
