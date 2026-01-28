# Migration von Vaadin zu Angular

## Projektübersicht

Dieses Repository ist eine private Kopie des bookstore-flow-ee Projekts, das für die Migration von Vaadin Flow zu
Angular erstellt wurde.

## Durchgeführte Schritte

### 1. Repository-Setup (27.01.2026)

#### Erstellung des privaten Repositories

- **Ziel**: Private Arbeitskopie des Quellprojekts erstellen
- **Durchführung**:
    - Neues privates GitHub Repository erstellt: `KrisztinaSzathmary/vaadin_angular_migration`
    - Repository-Beschreibung: "Private copy of bookstore-flow-ee for Vaadin to Angular migration"
    - Quellprojekt: `TatuLund/bookstore-flow-ee`

#### Git Remote Konfiguration

- Original-Repository (`origin`): `git@github.com:TatuLund/bookstore-flow-ee.git` (read-only)
- Neues Repository (`new-repo`): `https://github.com/KrisztinaSzathmary/vaadin_angular_migration.git`
- Alle Branches wurden in das neue Repository übertragen (v24)
- Authentifizierung via GitHub CLI Token (HTTPS)

#### Branch-Struktur

- `main` Branch von `v24` Branch erstellt
- `main` als Standard-Branch im GitHub Repository konfiguriert
- Lokaler `main` Branch trackt `new-repo/main`

### 2. Entwicklungsumgebung-Konfiguration (27.01.2026)

#### Java-Version

Das Projekt erfordert **Java 17**. Vor dem Start der Anwendung müssen in jedem neuen Terminal folgende Umgebungsvariablen gesetzt werden:

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
```

#### Anwendung starten

```bash
# Build
mvn clean install

# Anwendung starten (im bookstore-starter-flow-ui Verzeichnis)
mvn wildfly:run -PrunWar
```

### Warum Claude Code für diese Aufgaben?

**Automatisierung und Zeitersparnis**: Die manuelle Durchführung dieser Git- und GitHub-Operationen würde mehrere
Schritte und genaue Kenntnisse der CLI-Befehle erfordern. Claude hat automatisch:

- Die korrekte GitHub CLI Syntax verwendet
- SSH/HTTPS Authentifizierungsprobleme erkannt und gelöst
- Alle Branches und Tags korrekt übertragen
- Die Branch-Konfiguration korrekt eingerichtet

**Fehlerbehandlung**: Als SSH-Authentifizierung fehlschlug, hat Claude automatisch auf HTTPS umgestellt und die GitHub
CLI Token-Authentifizierung genutzt - ohne manuelle Intervention.

**Dokumentation**: Diese strukturierte Dokumentation wurde gleichzeitig erstellt, was bei manueller Arbeit oft vergessen
oder unvollständig gemacht wird.

### 3. Angular Migration (28.01.2026)

#### Analyse der Vaadin-Anwendung

Die bestehende Vaadin Flow Anwendung wurde analysiert:
- **Views**: LoginView, InventoryView (ProductGrid, ProductForm), AdminView, AboutView, ErrorView
- **MVP Pattern**: MainLayout, SideNavView mit CDI-basierter Dependency Injection
- **Authentifizierung**: AccessControlFactory mit AdminOnly Annotation
- **I18N**: Properties-Dateien für en-GB und fi-FI

#### Backend REST API (Jakarta EE / JAX-RS)

Neue REST Controller erstellt unter `bookstore-starter-flow-backend/src/main/java/com/vaadin/samples/backend/rest/`:

| Datei | Beschreibung |
|-------|-------------|
| `RestApplication.java` | JAX-RS Konfiguration mit `/api` Basispfad |
| `ProductController.java` | CRUD Endpunkte für Produkte (GET, POST, PUT, DELETE) |
| `CategoryController.java` | CRUD Endpunkte für Kategorien |
| `AuthController.java` | Login/Logout Endpunkte mit JWT Token |
| `CorsFilter.java` | CORS Konfiguration für Angular Entwicklungsserver |

Security-Implementierung unter `bookstore-starter-flow-backend/src/main/java/com/vaadin/samples/backend/security/`:

| Datei | Beschreibung |
|-------|-------------|
| `JwtTokenProvider.java` | JWT Token Generierung und Validierung (24h Gültigkeit) |

DTO Klassen unter `bookstore-starter-flow-backend/src/main/java/com/vaadin/samples/backend/rest/dto/`:
- `LoginRequest.java`
- `LoginResponse.java`

#### Angular Projekt (bookstore-angular)

Neues Angular 18 Projekt mit folgender Struktur:

```
bookstore-angular/src/app/
├── core/                          # Singleton Services
│   ├── auth/
│   │   ├── auth.service.ts       # Signal-basierter Auth Service
│   │   ├── auth.guard.ts         # authGuard und adminGuard
│   │   └── jwt.interceptor.ts    # HTTP Interceptor für JWT
│   ├── models/
│   │   └── product.model.ts      # TypeScript Interfaces
│   └── services/
│       ├── product.service.ts    # Product CRUD Service
│       └── category.service.ts   # Category CRUD Service
│
├── features/
│   ├── auth/login/               # Login Komponente
│   ├── inventory/                # Hauptansicht
│   │   ├── inventory.store.ts    # Signal-basiertes State Management
│   │   └── components/
│   │       ├── product-grid/     # Material Table mit Sortierung
│   │       └── product-form/     # Material Dialog für CRUD
│   ├── admin/                    # Kategorieverwaltung
│   ├── about/                    # Info-Seite
│   └── error/                    # 404-Seite
│
├── layout/
│   ├── main-layout/              # App Shell mit Sidenav
│   └── sidenav/                  # Navigation
│
└── assets/i18n/                  # Übersetzungsdateien
    ├── en-GB.json
    └── fi-FI.json
```

#### Technologie-Stack

| Vaadin | Angular | Beschreibung |
|--------|---------|-------------|
| Grid | mat-table + mat-sort + mat-paginator | Produkttabelle |
| Dialog | mat-dialog | Modal Formulare |
| TextField | mat-form-field + matInput | Eingabefelder |
| Select | mat-select | Dropdown |
| SideNav | mat-sidenav + mat-nav-list | Navigation |
| Notification | MatSnackBar | Toast Meldungen |

#### Angular Features

- **Standalone Components**: Alle Komponenten als standalone (Angular 17+ Best Practice)
- **Signals**: Signal-basiertes State Management statt RxJS BehaviorSubjects
- **Lazy Loading**: Alle Feature-Module lazy loaded
- **Reactive Forms**: Formularvalidierung mit cross-field Validation
- **I18N**: ngx-translate v17 mit JSON Übersetzungsdateien
- **Keyboard Shortcuts**: Ctrl+F (Filter), Alt+N (Neues Produkt), Ctrl+L (Logout)

#### Angular Starten

```bash
cd bookstore-angular
npm install
npm start
# Öffne http://localhost:4200
```

#### Build

```bash
npm run build
# Output: dist/bookstore-angular
```

## Nächste Schritte

1. Integration Testing mit Backend
2. E2E Tests mit Playwright oder Cypress
3. Produktions-Deployment Konfiguration
4. CI/CD Pipeline einrichten

---

**Letzte Aktualisierung**: 28.01.2026
