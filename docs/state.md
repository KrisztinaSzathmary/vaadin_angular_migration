# Claude Code Session State

**Letzte Aktualisierung:** 2026-01-28 14:05

## Projektübersicht

Migration einer Vaadin Flow 24.3 Bookstore-Anwendung zu Angular 18.

## Aktueller Branch

`opus_vaadin_angular_migration_1`

## Abgeschlossene Aufgaben

### Backend REST API (Jakarta EE / JAX-RS)
- [x] `RestApplication.java` - JAX-RS Konfiguration mit `/api` Basispfad
- [x] `ProductController.java` - CRUD Endpunkte für Produkte
- [x] `CategoryController.java` - CRUD Endpunkte für Kategorien
- [x] `AuthController.java` - Login/Logout mit JWT Token
- [x] `JwtTokenProvider.java` - JWT Generierung und Validierung
- [x] `CorsFilter.java` - CORS für Angular Entwicklungsserver
- [x] `LoginRequest.java`, `LoginResponse.java` - DTOs

### Angular Frontend (bookstore-angular)
- [x] Angular 18 Projekt mit standalone Komponenten erstellt
- [x] Angular Material UI integriert
- [x] Core Modul: AuthService, ProductService, CategoryService
- [x] Auth: authGuard, adminGuard, JWT Interceptor
- [x] Login Komponente
- [x] Layout: MainLayout, Sidenav
- [x] Inventory Feature: ProductGrid, ProductForm, InventoryStore (Signals)
- [x] Admin Feature: CategoryEditor
- [x] About und Error Komponenten
- [x] I18N: ngx-translate v17 (en-GB.json, fi-FI.json)
- [x] Proxy Konfiguration (`proxy.conf.json`) für Backend

### Dokumentation
- [x] MIGRATION.md mit vollständiger Dokumentation aktualisiert
- [x] Schritt-für-Schritt Anleitung hinzugefügt

## Letzter Commit

```
497166c - Angular Migration: Frontend und Backend REST API implementiert
```

**Hinweis:** Der Commit wurde noch nicht zum Remote gepusht.

## Laufende Dienste

| Dienst              | Port | Status                  |
|---------------------|------|-------------------------|
| Angular Dev Server  | 4200 | Kann im Hintergrund laufen |
| WildFly Backend     | 8080 | Manuell zu starten      |

## Startbefehle

### Backend (Terminal 1)
```bash
cd ~/IdeaProjects/vaadin_angular_migration/bookstore-starter-flow-ui
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.18/libexec/openjdk.jdk/Contents/Home
mvn wildfly:run -PrunWar
```

### Frontend (Terminal 2)
```bash
cd ~/IdeaProjects/vaadin_angular_migration/bookstore-angular
npm start
```

## Anmeldedaten

- **Admin:** `admin` / `admin` (Vollzugriff)
- **User:** beliebiger Name / gleiches Passwort (nur Lesezugriff)

## Wichtige Dateipfade

### Backend
- `bookstore-starter-flow-backend/src/main/java/com/vaadin/samples/backend/rest/` - REST Controller
- `bookstore-starter-flow-backend/src/main/java/com/vaadin/samples/backend/security/` - JWT Provider

### Frontend
- `bookstore-angular/src/app/core/` - Services, Models, Auth
- `bookstore-angular/src/app/features/` - Feature Komponenten
- `bookstore-angular/src/app/layout/` - Layout Komponenten
- `bookstore-angular/src/assets/i18n/` - Übersetzungsdateien
- `bookstore-angular/proxy.conf.json` - API Proxy Konfiguration

## Nächste mögliche Aufgaben

1. [ ] Push zum Remote und PR erstellen
2. [ ] E2E Tests schreiben (Playwright/Cypress)
3. [ ] Unit Tests hinzufügen
4. [ ] Produktions-Build und Deployment Konfiguration
5. [ ] CI/CD Pipeline einrichten

## Bekannte Probleme

- WildFly funktioniert nur mit Java 17 (Java 25 Security Manager Fehler)
- Der Befehl `mvn wildfly:run` muss im `bookstore-starter-flow-ui` Verzeichnis ausgeführt werden

## Hinweise zur Fortsetzung

Wenn du Claude neu startest:
1. Lies diese Datei ein: `@docs/state.md`
2. Das Projekt befindet sich auf dem Branch `opus_vaadin_angular_migration_1`
3. Die Angular Migration ist abgeschlossen, aber der Commit wurde noch nicht gepusht
4. Die Dokumentation ist auf Deutsch in `MIGRATION.md`
