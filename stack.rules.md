# Stack Rules – Technische Leitplanken

> Dieses Dokument definiert die verbindlichen technischen Entscheidungen für die Migration der Vaadin Flow
> Bookstore-Anwendung zu einer Angular SPA. Alle Iterationen in `Backlog.md` basieren auf diesen Leitplanken.

---

## 1. Angular-Version & CLI-Konfiguration

| Eigenschaft     | Wert                                   |
|-----------------|----------------------------------------|
| Angular-Version | **20** (Latest)                        |
| Angular CLI     | `@angular/cli@20`                      |
| TypeScript      | Gemäß Angular 20 Peer Dependency       |
| Node.js         | Gemäß Angular 20 Kompatibilitätsmatrix |

## 2. Standalone Components

- **Alle** Komponenten, Directives und Pipes werden als `standalone: true` deklariert.
- **Keine NgModules** – stattdessen werden Dependencies direkt im `imports`-Array der Komponente angegeben.
- **Application Bootstrap** via `bootstrapApplication()` in `main.ts` mit `ApplicationConfig`.
- **Routing** via `provideRouter(routes)` in der `ApplicationConfig`.
- **HttpClient** via `provideHttpClient(withInterceptorsFromDi())` in der `ApplicationConfig`.

**Beispiel `app.config.ts`:**

```typescript
import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
    ]
};
```

---

## 3. Component-Library

| Eigenschaft   | Wert                     |
|---------------|--------------------------|
| Library       | **Angular Material** v20 |
| Package       | `@angular/material`      |
| Design-System | Material Design 3 (M3)   |
| CDK           | `@angular/cdk`           |

## 4. CSS-Strategie

| Eigenschaft | Wert                                                                        |
|-------------|-----------------------------------------------------------------------------|
| Framework   | **Tailwind CSS** v4                                                         |
| Scope       | Tailwind Utility-Klassen im Template, CSS Custom Properties für Theme-Werte |

**Richtlinien:**

- **Tailwind CSS** ist die **einzige** CSS-Lösung im Projekt – für Layout, Spacing, Typography, Farben und alle
  visuellen Stile.
- **Kein SCSS, kein LESS** – alle Styles werden über Tailwind Utility-Klassen direkt in den Templates oder über CSS
  Custom Properties definiert.
- **Angular Material Theming** wird über CSS Custom Properties und Tailwind-Konfiguration gesteuert (kein SCSS-basiertes
  `@angular/material` Theme).
- **Component-spezifisches Styling** erfolgt über Tailwind-Klassen im Template. Bei Bedarf können minimale
  `.component.css`-Dateien für Angular Material-Overrides verwendet werden.
- Vaadin **Lumo Design Tokens** werden als **Tailwind Theme Extensions** adaptiert.

**Tailwind-Konfiguration (`tailwind.config.js`):**

```javascript
module.exports = {
    content: ['./src/**/*.{html,ts}'],
    theme: {
        screens: {
            'sm': '570px',
            'md': '800px',
            'lg': '1024px',
        },
        extend: {
            colors: {
                available: '#2dd085',
                coming: '#ffc66e',
                discontinued: '#f54993',
            },
            width: {
                sidebar: '260px',
            },
        },
    },
};
```

**Globale Styles (`styles.css`):**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 5. State-Management

| Eigenschaft | Wert                                          |
|-------------|-----------------------------------------------|
| Ansatz      | **Angular Signals** (built-in)                |
| Pattern     | Services + Signals                            |
| Dependency  | Keine externe Library (kein NgRx, kein Akita) |

**Richtlinien:**

- **`signal()`** für reaktiven lokalen und Service-State.
- **`computed()`** für abgeleitete Werte (z.B. gefilterte Produktliste).
- **`effect()`** nur für Side-Effects (z.B. Logging, LocalStorage-Sync).
- **Services** (`@Injectable({providedIn: 'root'})`) halten den anwendungsweiten State als Signals.
- **Kein** globaler Store – der State wird in fachlichen Services gekapselt (`AuthService`, `ProductService`,
  `CategoryService`).

## 6. Authentifizierung

| Eigenschaft | Wert                                  |
|-------------|---------------------------------------|
| Mechanismus | **Session-basiert** (HttpOnly Cookie) |
| Token-Typ   | Kein JWT – Server-Side Session        |
| CSRF        | CSRF-Token im Header                  |

**Richtlinien:**

- Der Angular `HttpClient` sendet Cookies automatisch mit `withCredentials: true`.
- **Login:** `POST /api/v1/auth/login` → Server erstellt Session, setzt HttpOnly Cookie.
- **Logout:** `POST /api/v1/auth/logout` → Server invalidiert Session.
- **Session-Check:** `GET /api/v1/auth/me` → Gibt aktuelle Benutzerinfo zurück (oder 401).
- **AuthInterceptor:** Fängt 401-Antworten ab und leitet zum Login weiter.
- **AuthGuard / AdminGuard:** Schützen Routen basierend auf `AuthService.isLoggedIn()` / `AuthService.isAdmin()`.

---

## 7. Projektstruktur

Das Angular-Projekt befindet sich im Verzeichnis `bookstore-angular/` im Repository-Root.

```
bookstore-angular/
├── src/
│   ├── app/
│   │   ├── core/                    # Singleton-Services, Guards, Interceptors
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── product.service.ts
│   │   │   │   └── category.service.ts
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── admin.guard.ts
│   │   │   └── interceptors/
│   │   │       └── auth.interceptor.ts
│   │   ├── features/                # Feature-Komponenten (lazy-loadable)
│   │   │   ├── login/
│   │   │   │   └── login.component.ts
│   │   │   ├── inventory/
│   │   │   │   ├── product-list.component.ts
│   │   │   │   └── product-form.component.ts
│   │   │   ├── admin/
│   │   │   │   └── admin.component.ts
│   │   │   └── about/
│   │   │       └── about.component.ts
│   │   ├── shared/                  # Wiederverwendbare Komponenten, Pipes, Directives
│   │   │   ├── components/
│   │   │   ├── pipes/
│   │   │   └── directives/
│   │   ├── models/                  # TypeScript Interfaces & Enums
│   │   │   ├── product.model.ts
│   │   │   ├── category.model.ts
│   │   │   └── availability.enum.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   │   └── i18n/                    # Übersetzungsdateien
│   │       ├── en.json
│   │       └── de.json
│   ├── styles.css                   # Globale Styles (Tailwind Imports)
│   └── main.ts
├── proxy.conf.json
├── tailwind.config.js
├── jest.config.ts
├── playwright.config.ts
├── angular.json
├── tsconfig.json
└── package.json
```

**Namenskonventionen:**

- Dateien: `kebab-case` (z.B. `product-list.component.ts`)
- Klassen: `PascalCase` (z.B. `ProductListComponent`)
- Interfaces/Models: `PascalCase` (z.B. `Product`, `Category`)
- Services: `PascalCase` mit `Service`-Suffix (z.B. `ProductService`)

---

## 8. Testframework

### Unit-Tests

| Eigenschaft      | Wert                     |
|------------------|--------------------------|
| Framework        | **Jest**                 |
| Builder          | `@angular-builders/jest` |
| Konfiguration    | `jest.config.ts`         |
| Ausführung       | `ng test`                |
| Mindestabdeckung | 80% Line Coverage        |

**Richtlinien:**

- Jeder Service, Guard und Interceptor hat eine eigene `.spec.ts`-Datei.
- Komponenten-Tests verwenden `TestBed` und Angular Testing Utilities.
- HTTP-Aufrufe werden mit `provideHttpClientTesting()` und `HttpTestingController` gemockt.
- Keine echten API-Aufrufe in Unit-Tests.

### End-to-End-Tests

| Eigenschaft   | Wert                   |
|---------------|------------------------|
| Framework     | **Playwright**         |
| Konfiguration | `playwright.config.ts` |
| Ausführung    | `npx playwright test`  |

**Richtlinien:**

- E2E-Tests testen vollständige Benutzerflüsse (Login → CRUD → Logout).
- Tests laufen gegen den laufenden Angular Dev-Server + Backend.
- Page Object Pattern für wiederverwendbare Selektoren.

---

## 9. API-Präfix & Versionierung

| Eigenschaft   | Wert                          |
|---------------|-------------------------------|
| Basispfad     | **`/api/v1`**                 |
| Format        | **JSON** (`application/json`) |
| Versionierung | URL-basiert (`/v1/`)          |

**Endpunkt-Übersicht (geplant):**

| Methode  | Pfad                      | Beschreibung            | Berechtigung    |
|----------|---------------------------|-------------------------|-----------------|
| `POST`   | `/api/v1/auth/login`      | Benutzer anmelden       | Öffentlich      |
| `POST`   | `/api/v1/auth/logout`     | Benutzer abmelden       | Authentifiziert |
| `GET`    | `/api/v1/auth/me`         | Aktuelle Benutzerinfo   | Authentifiziert |
| `GET`    | `/api/v1/products`        | Alle Produkte abrufen   | Authentifiziert |
| `GET`    | `/api/v1/products/{id}`   | Produkt nach ID         | Authentifiziert |
| `POST`   | `/api/v1/products`        | Produkt erstellen       | Admin           |
| `PUT`    | `/api/v1/products/{id}`   | Produkt aktualisieren   | Admin           |
| `DELETE` | `/api/v1/products/{id}`   | Produkt löschen         | Admin           |
| `GET`    | `/api/v1/categories`      | Alle Kategorien abrufen | Authentifiziert |
| `POST`   | `/api/v1/categories`      | Kategorie erstellen     | Admin           |
| `PUT`    | `/api/v1/categories/{id}` | Kategorie aktualisieren | Admin           |
| `DELETE` | `/api/v1/categories/{id}` | Kategorie löschen       | Admin           |

---

## 10. Proxy-Konfiguration (Entwicklung)

Während der Entwicklung läuft der Angular Dev-Server auf `localhost:4200` und das
Vaadin/WildFly-Backend auf `localhost:8080`. API-Aufrufe werden per Proxy weitergeleitet.

---

## Allgemeine Regeln

1. **Strict Mode** ist aktiviert (`--strict`). TypeScript `strict: true`, `noImplicitAny: true`,
   `strictNullChecks: true`.
2. **ESLint** wird für Code-Qualität verwendet (`@angular-eslint`).
3. **Prettier** wird für einheitliche Formatierung eingesetzt.
4. **Keine `any`-Typen** – alle Variablen und Parameter müssen typisiert sein.
5. **Reactive Forms** werden für alle Formulare verwendet (kein Template-Driven Forms).
6. **Lazy Loading** wird für Feature-Routes verwendet, wo sinnvoll.
7. **Barrierefreiheit (a11y)**: Angular Material Komponenten bringen ARIA-Attribute mit; zusätzliche Labels werden bei
   Bedarf gesetzt.