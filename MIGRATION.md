# Migration von Vaadin zu Angular

## Projektübersicht

Dieses Repository ist eine private Kopie des bookstore-flow-ee Projekts, das für die Migration von Vaadin Flow zu
Angular erstellt wurde.

### Ursprünglicher Auftrag

> "Elemezd a jelenlegi kod frontend reszet es esszeruen migrald a kodot a legujabb best practice-ek alapjan Angularra. Hasznalj igazolhato forrasokat, keress vaadin-angular migracios patterneket es ezek alapjan migralj. Kovesd a clean kod alapelveit. Tesztelheto kodot irj."

**Übersetzung:** Analysiere den Frontend-Code und migriere ihn vernünftig zu Angular nach aktuellen Best Practices. Verwende verifizierbare Quellen, suche nach Vaadin-Angular Migrationsmustern und migriere entsprechend. Befolge Clean Code Prinzipien. Schreibe testbaren Code.

## Verwendete Quellen und Referenzen

> Alle Quellen wurden am 28.01.2026 abgerufen.

### Angular Dokumentation (angular.dev)

1. **Angular Style Guide** - Offizielle Angular Best Practices und Coding Conventions
   https://angular.dev/style-guide

2. **Standalone Components** - Moderne Komponentenarchitektur ohne NgModules
   https://angular.dev/guide/components/standalone

3. **Angular Signals** - Reaktives State Management mit Signals (Angular 17+)
   https://angular.dev/guide/signals

4. **Route Guards** - Funktionale Guards für Authentifizierung und Autorisierung
   https://angular.dev/guide/routing/route-guards

5. **HTTP Client & Interceptors** - HTTP Kommunikation und JWT Token Handling
   https://angular.dev/guide/http/interceptors

6. **Reactive Forms** - Formularvalidierung und Datenbindung
   https://angular.dev/guide/forms/reactive-forms

### Angular Material (material.angular.io)

7. **Angular Material Components v18** - UI Komponentenbibliothek
   https://material.angular.io/components/categories

8. **Table Component** - Datentabelle mit Sortierung und Paginierung
   https://material.angular.io/components/table/overview

9. **Dialog Component** - Modale Dialoge für Formulare
   https://material.angular.io/components/dialog/overview

10. **Sidenav Component** - Responsive Seitennavigation
    https://material.angular.io/components/sidenav/overview

11. **Form Field & Input** - Material Design Eingabefelder
    https://material.angular.io/components/form-field/overview

### Internationalisierung (ngx-translate)

12. **ngx-translate/core v17** - Internationalisierung für Angular
    https://github.com/ngx-translate/core

13. **Migration Guide v16 → v17** - Breaking Changes und neue API
    https://ngx-translate.org/getting-started/migration-guide/

14. **HTTP Loader Konfiguration** - Laden von Übersetzungsdateien
    https://ngx-translate.org/getting-started/translation-files/

### JWT Authentifizierung

15. **JJWT (Java JWT)** - JWT Token Generierung und Validierung für Java
    https://github.com/jwtk/jjwt

16. **JSON Web Tokens (jwt.io)** - JWT Standard und Debugger
    https://jwt.io/introduction

### Architektur und Patterns

17. **Feature-Based Directory Structure in Angular** - Modulare Projektstruktur
    Alam, S. (2024). Medium.
    https://medium.com/@sehban.alam/feature-based-directory-structure-in-angular

18. **Spring Boot + Angular Integration** - Backend-Frontend Integration
    Baeldung. https://www.baeldung.com/spring-boot-angular-web

19. **Jakarta RESTful Web Services (JAX-RS)** - REST API Spezifikation
    Jakarta EE. https://jakarta.ee/specifications/restful-ws/

### Vaadin Dokumentation

20. **Vaadin Flow Documentation** - Originalframework Dokumentation
    https://vaadin.com/docs/latest/flow

21. **Vaadin Grid Component** - Referenz für Migration zu mat-table
    https://vaadin.com/docs/latest/components/grid

### Komponenten-Mapping (Vaadin → Angular Material)

| Vaadin Komponente | Angular Material Äquivalent | Referenz |
|-------------------|----------------------------|----------|
| `Grid<T>` | `mat-table` + `MatTableDataSource` | [8] |
| `Dialog` | `MatDialog` | [9] |
| `TextField` | `mat-form-field` + `matInput` | [11] |
| `Select` | `mat-select` | [7] |
| `SideNav` | `mat-sidenav` | [10] |
| `Notification` | `MatSnackBar` | [7] |
| `LoginForm` | Reactive Forms + Material | [6], [11] |
| `Binder` | `FormGroup` + `Validators` | [6] |

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

## Anwendung starten - Schritt für Schritt

Um die vollständige Anwendung (Backend + Frontend) zu testen, folgen Sie diesen Schritten:

### Voraussetzungen

- **Java 17** installiert
- **Node.js 18+** und **npm** installiert
- **Maven 3.9+** installiert

### Schritt 1: Repository klonen

```bash
# Im gewünschten Verzeichnis
git clone https://github.com/KrisztinaSzathmary/vaadin_angular_migration.git
cd vaadin_angular_migration
```

### Schritt 2: Backend starten (Terminal 1)

```bash
# Im Projektverzeichnis: vaadin_angular_migration/

# 2.1 Java 17 Umgebung setzen (macOS mit Homebrew)
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.18/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

# Alternative für Linux:
# export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
# export PATH=$JAVA_HOME/bin:$PATH

# 2.2 Backend bauen (nur beim ersten Mal oder nach Änderungen)
mvn clean install -DskipTests

# 2.3 In das UI-Modul wechseln (wichtig!)
cd bookstore-starter-flow-ui

# 2.4 WildFly Server mit Backend starten
mvn wildfly:run -PrunWar

# Warten bis: "WFLYSRV0025: WildFly ... started"
# Backend läuft auf: http://localhost:8080
# REST API verfügbar unter: http://localhost:8080/bookstore-starter-flow-ui-1.1-SNAPSHOT/api/
```

**Wichtig:** Der Befehl `mvn wildfly:run` muss im `bookstore-starter-flow-ui` Verzeichnis ausgeführt werden, nicht im Hauptverzeichnis!

### Schritt 3: Angular Frontend starten (Terminal 2)

```bash
# Im Projektverzeichnis: vaadin_angular_migration/

# 3.1 In das Angular Projekt wechseln
cd bookstore-angular

# 3.2 Abhängigkeiten installieren (nur beim ersten Mal)
npm install

# 3.3 Entwicklungsserver starten
npm start

# Angular läuft auf: http://localhost:4200
```

### Schritt 4: Anwendung testen

1. **Browser öffnen**: http://localhost:4200
2. **Login mit Admin-Rechten**:
   - Benutzername: `admin`
   - Passwort: `admin`
3. **Login mit Leserechten** (beliebiger anderer Benutzer):
   - Benutzername: `user` (oder beliebig)
   - Passwort: `user` (gleich wie Benutzername)

### Schnellstart-Befehle (Zusammenfassung)

| Schritt             | Verzeichnis                                          | Befehl                       |
|---------------------|------------------------------------------------------|------------------------------|
| Backend bauen       | `vaadin_angular_migration/`                          | `mvn clean install -DskipTests` |
| Backend starten     | `vaadin_angular_migration/bookstore-starter-flow-ui/` | `mvn wildfly:run -PrunWar`   |
| Frontend installieren | `vaadin_angular_migration/bookstore-angular/`       | `npm install`                |
| Frontend starten    | `vaadin_angular_migration/bookstore-angular/`        | `npm start`                  |

### Ports und URLs

| Dienst           | URL                          | Beschreibung        |
|------------------|------------------------------|---------------------|
| Angular Frontend | http://localhost:4200        | Benutzeroberfläche  |
| WildFly Backend  | http://localhost:8080        | Application Server  |
| REST API         | http://localhost:4200/api/*  | Via Angular Proxy   |

**Hinweis:** Die Angular Anwendung verwendet einen Proxy (`proxy.conf.json`), der API-Anfragen an `/api/*` automatisch an den WildFly-Server weiterleitet.

### Anwendung beenden

- **Angular**: `Ctrl+C` im Terminal 2
- **WildFly**: `Ctrl+C` im Terminal 1

## Nächste Schritte

1. Integration Testing mit Backend
2. E2E Tests mit Playwright oder Cypress
3. Produktions-Deployment Konfiguration
4. CI/CD Pipeline einrichten

---

**Letzte Aktualisierung**: 28.01.2026
