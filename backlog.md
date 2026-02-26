# Backlog – Vaadin-zu-Angular-21-Migration

> Dieses Backlog definiert alle Iterationen für die Migration der Vaadin Flow Bookstore-Anwendung
> zu einer Angular 21 SPA. Jede Iteration liefert ein eigenständiges, testbares Produktinkrement.
>
> **Regel:** Die Iterationen werden streng sequenziell abgearbeitet. Keine Iteration darf
> übersprungen oder zusammengefasst werden (siehe `claude.md`).
>
> **Hinweis:** REST-API-Endpunkte sind **neue Ergänzungen** zum bestehenden Backend.
> Die existierende Backend-Logik (`DataService`, `MockDataService`, Datenmodell) wird dabei
> nicht verändert – die REST-Schicht ruft lediglich die bestehenden Services auf.

---

## Phase A – Backend REST-API

### Iteration 1 – REST-API: Grundgerüst und Produkte lesen

**Status:** Offen
**Ziel:** Eine JAX-RS REST-API bereitstellen, über die Produkte gelesen werden können. Erster beweisbarer Integrationsschritt.
**Deliverables:**

- JAX-RS Application-Klasse (`BookstoreRestApplication`) mit Basispfad `/api`
- CORS-Filter für Angular-Dev-Server (localhost:4200)
- `ProductResource` mit:
  - `GET /api/products` – Alle Produkte als JSON
  - `GET /api/products/{id}` – Einzelnes Produkt nach ID
- `ProductDTO` und `CategoryDTO` (JSON-Serialisierung)
- `AvailabilityDTO` (Enum-Mapping)
- Jackson-Konfiguration für JSON-Serialisierung
- Manuelle Tests mit curl/Postman dokumentiert

---

### Iteration 2 – REST-API: Authentifizierung

**Status:** Offen
**Ziel:** Login/Logout über REST ermöglichen, sodass Angular-Clients sich authentifizieren können.
**Deliverables:**

- `AuthResource` mit:
  - `POST /api/auth/login` – Login (Username/Password → Token oder Session-Info)
  - `POST /api/auth/logout` – Logout
  - `GET /api/auth/me` – Aktuelle Benutzerinfo (Name, Rolle)
- Authentifizierungsmechanismus gemäß Stack.rules.md (JWT oder Session)
- `LoginRequestDTO`, `LoginResponseDTO`, `UserInfoDTO`
- Fehlerantworten bei ungültigen Credentials (401)

---

### Iteration 3 – REST-API: Produkte schreiben

**Status:** Offen
**Ziel:** Vollständige CRUD-Operationen für Produkte über die REST-API bereitstellen.
**Deliverables:**

- Erweiterung von `ProductResource`:
  - `POST /api/products` – Neues Produkt erstellen (nur Admin)
  - `PUT /api/products/{id}` – Produkt aktualisieren (nur Admin)
  - `DELETE /api/products/{id}` – Produkt löschen (nur Admin)
- Autorisierungsprüfung (Admin-Rolle) für schreibende Endpunkte
- Validierung der Eingabedaten (Bean Validation auf DTOs)
- Korrekte HTTP-Statuscodes (201 Created, 204 No Content, 400 Bad Request, 403 Forbidden, 404 Not Found)

---

### Iteration 4 – REST-API: Kategorien

**Status:** Offen
**Ziel:** CRUD-Operationen für Kategorien über die REST-API bereitstellen.
**Deliverables:**

- `CategoryResource` mit:
  - `GET /api/categories` – Alle Kategorien
  - `POST /api/categories` – Neue Kategorie (nur Admin)
  - `PUT /api/categories/{id}` – Kategorie aktualisieren (nur Admin)
  - `DELETE /api/categories/{id}` – Kategorie löschen (nur Admin)
- Autorisierungsprüfung für schreibende Endpunkte
- Validierung (Name min. 2 Zeichen)

---

## Phase B – Angular-Grundgerüst

### Iteration 5 – Angular-Projekt initialisieren

**Status:** Offen
**Ziel:** Ein lauffähiges Angular-21-Projekt aufsetzen, das im Browser eine leere Seite anzeigt und erfolgreich baut.
**Deliverables:**

- Angular 21 Projekt in `bookstore-angular/` (via Angular CLI)
- Standalone-Components-Architektur (keine NgModules)
- Grundlegende Verzeichnisstruktur:
  ```
  bookstore-angular/src/app/
  ├── core/           (Services, Guards, Interceptors)
  ├── features/       (Feature-Komponenten)
  ├── shared/         (Shared Components, Pipes, Directives)
  └── models/         (TypeScript Interfaces)
  ```
- `proxy.conf.json` für API-Proxy zum Backend (localhost:8080)
- Globale Styles-Datei mit Basis-CSS (Farben, Schriften)
- Erfolgreicher Build (`ng build`) und Dev-Server (`ng serve`)

---

### Iteration 6 – TypeScript-Modelle und Product-API-Service

**Status:** Offen
**Ziel:** TypeScript-Interfaces für alle Datenmodelle und einen HttpClient-Service für Produkte bereitstellen.
**Deliverables:**

- TypeScript Interfaces:
  - `Product` (id, productName, price, stockCount, availability, category)
  - `Category` (id, name)
  - `Availability` (Enum: COMING, AVAILABLE, DISCONTINUED)
- `ProductService` (`@Injectable({providedIn: 'root'})`):
  - `getAll(): Observable<Product[]>`
  - `getById(id: number): Observable<Product>`
  - `create(product: Product): Observable<Product>`
  - `update(product: Product): Observable<Product>`
  - `delete(id: number): Observable<void>`
- `CategoryService`:
  - `getAll(): Observable<Category[]>`
  - `create(category: Category): Observable<Category>`
  - `update(category: Category): Observable<void>`
  - `delete(id: number): Observable<void>`

---

### Iteration 7 – Authentifizierungs-Service und Auth-Guard

**Status:** Offen
**Ziel:** Die Angular-seitige Authentifizierung implementieren, sodass Login-Status verwaltet und geschützte Routen abgesichert werden.
**Deliverables:**

- `AuthService` (`@Injectable({providedIn: 'root'})`):
  - `login(username, password): Observable<LoginResponse>`
  - `logout(): Observable<void>`
  - `getCurrentUser(): Observable<UserInfo>`
  - `isLoggedIn(): Signal<boolean>`
  - `isAdmin(): Signal<boolean>`
- `AuthInterceptor` (HttpInterceptor):
  - Fügt Auth-Token/Session-Info zu jedem Request hinzu
  - Leitet bei 401-Antworten zum Login weiter
- `AuthGuard` (CanActivate):
  - Schützt Routen vor nicht-angemeldeten Benutzern
- `AdminGuard` (CanActivate):
  - Schützt Admin-Routen vor Nicht-Admins

---

## Phase C – Angular-Views

### Iteration 8 – Login-Seite

**Status:** Offen
**Ziel:** Eine funktionsfähige Login-Seite, über die sich Benutzer an der Angular-Anwendung anmelden können.
**Deliverables:**

- `LoginComponent` mit:
  - Username- und Password-Felder (Reactive Forms)
  - Login-Button
  - Fehlermeldung bei ungültigen Credentials
  - Info-Text ("Log in as admin for full access...")
  - Weiterleitung nach `/inventory` bei Erfolg
- Route: `/login`
- Styling gemäß ui-design-plan/

---

### Iteration 9 – Hauptlayout mit Navigation

**Status:** Offen
**Ziel:** Das Grundgerüst der Anwendung mit Seitennavigation, Routing und Logout bereitstellen.
**Deliverables:**

- `MainLayoutComponent`:
  - Sidebar-Navigation mit Links (Inventory, About)
  - Admin-Link nur sichtbar, wenn Benutzer Admin-Rolle hat
  - Logout-Button (ruft `AuthService.logout()` auf)
  - Router-Outlet für Kinder-Routen
- Routing-Konfiguration:
  - `/` → Redirect zu `/inventory`
  - `/inventory` → ProductListComponent (Platzhalter)
  - `/about` → AboutComponent (Platzhalter)
  - `/admin` → AdminComponent (Platzhalter, AdminGuard)
  - `**` → NotFoundComponent
- Alle Routen geschützt durch `AuthGuard` (außer `/login`)

---

### Iteration 10 – Produkt-Grid (nur Lesen)

**Status:** Offen
**Ziel:** Alle Produkte in einer Tabelle anzeigen – erster datengetriebener View in Angular.
**Deliverables:**

- `ProductListComponent` mit Datentabelle:
  - Spalten: Produktname, Preis (rechtsbündig, €), Verfügbarkeit (mit Farb-Icon), Lagerbestand, Kategorien
  - Daten werden beim Laden vom `ProductService` abgerufen
  - Verfügbarkeits-Farbcodes: Grün (Available), Orange (Coming), Rot (Discontinued)
  - Sortierung per Klick auf Spaltenüberschriften
- Route: `/inventory`
- Styling gemäß ui-design-plan/ (Lumo-ähnlich, Row-Stripes)

---

### Iteration 11 – Produkt-Filter

**Status:** Offen
**Ziel:** Benutzer können die Produktliste nach Name, Verfügbarkeit und Kategorie durchsuchen.
**Deliverables:**

- Suchfeld oberhalb der Tabelle (mit Lupen-Icon)
- Client-seitige Filterung (case-insensitive Suche in Produktname, Verfügbarkeit, Kategorienamen)
- Filter-Eingabe mit Debounce (300ms)
- "New Product"-Button rechts neben dem Suchfeld (deaktiviert für Nicht-Admins)

---

### Iteration 12 – Produkt-Formular (Erstellen und Bearbeiten)

**Status:** Offen
**Ziel:** Admin-Benutzer können Produkte erstellen und bearbeiten. Das Formular öffnet sich als Seitenleiste.
**Deliverables:**

- `ProductFormComponent` (Dialog/Seitenleiste):
  - Felder: Produktname, Preis (€-Suffix, rechtsbündig), Lagerbestand, Verfügbarkeit (Dropdown), Kategorien (Multi-Select)
  - Reactive Forms mit Validierung:
    - Produktname: required, min. 2 Zeichen
    - Preis: required, >= 0
    - Lagerbestand: required, >= 0
    - Verfügbarkeit: required
  - Bean-Level-Validierung: Konsistenz Verfügbarkeit ↔ Lagerbestand
  - Save-Button (erstellt oder aktualisiert Produkt via `ProductService`)
  - Discard-Button (setzt Formular zurück)
  - Cancel-Button (schließt Formular)
  - Visuelles Feedback: geänderte Felder markiert (CSS-Klasse `dirty`)
- Formular öffnet sich bei Klick auf Tabellenzeile (nur Admin) oder "New Product"
- Erfolgsbenachrichtigung nach Speichern ("Produkt erstellt" / "Produkt aktualisiert")

---

### Iteration 13 – Produkt löschen

**Status:** Offen
**Ziel:** Admin-Benutzer können Produkte löschen, mit Bestätigungsdialog.
**Deliverables:**

- Delete-Button im Produktformular (nur für bestehende Produkte sichtbar)
- Bestätigungsdialog: "'{Name}' will be deleted." mit Confirm/Cancel
- Nach Bestätigung: Produkt via `ProductService.delete()` löschen
- Benachrichtigung nach Löschung ("'{Name}' removed")
- Formular wird nach Löschung geschlossen

---

### Iteration 14 – Admin-Ansicht (Kategorien-Verwaltung)

**Status:** Offen
**Ziel:** Admin-Benutzer können Kategorien erstellen, bearbeiten und löschen.
**Deliverables:**

- `AdminComponent` mit:
  - Überschrift "Admin" / "Edit categories"
  - Liste aller Kategorien mit Inline-Bearbeitung (Textfeld + Save/Delete-Buttons)
  - "Add new category"-Button
  - Validierung: Name min. 2 Zeichen
  - Benachrichtigung bei Speichern/Löschen
- Route: `/admin` (geschützt durch `AdminGuard`)

---

### Iteration 15 – About-Seite und Fehlerseite

**Status:** Offen
**Ziel:** Statische Seiten für Informationen und Fehlerfälle bereitstellen.
**Deliverables:**

- `AboutComponent`:
  - Info-Icon und Text mit Angular-Version
  - Route: `/about`
- `NotFoundComponent`:
  - Fehlermeldung "The view could not be found."
  - Route: `**` (Wildcard)

---

## Phase D – Erweiterte Funktionalität

### Iteration 16 – URL-basierte Produktnavigation

**Status:** Offen
**Ziel:** Produkte können über URL-Parameter direkt angesteuert werden (Bookmarkable URLs).
**Deliverables:**

- Route: `/inventory/:id` → öffnet Formular mit dem Produkt der gegebenen ID
- Route: `/inventory/new` → öffnet leeres Formular für neues Produkt
- URL wird beim Öffnen/Schließen des Formulars aktualisiert
- Ungültige Produkt-IDs zeigen Fehlerbenachrichtigung

---

### Iteration 17 – Ungespeicherte Änderungen (Dirty State)

**Status:** Offen
**Ziel:** Benutzer werden gewarnt, bevor ungespeicherte Änderungen verloren gehen.
**Deliverables:**

- `UnsavedChangesGuard` (CanDeactivate):
  - Warnt bei Navigation weg von Formular mit Änderungen
- Bestätigungsdialog bei:
  - Schließen des Formulars mit Änderungen
  - Navigation zu einer anderen Seite mit Änderungen
  - Wechsel zu einem anderen Produkt mit Änderungen
- Discard-Button im Formular zeigt Bestätigungsdialog

---

### Iteration 18 – Internationalisierung (i18n)

**Status:** Offen
**Ziel:** Die Angular-Anwendung unterstützt Englisch und Deutsch mit dynamischem Sprachwechsel.
**Deliverables:**

- i18n-Lösung gemäß Stack.rules.md (z.B. `ngx-translate` oder `@angular/localize`)
- Übersetzungsdateien:
  - `en.json` (48 Schlüssel, aus `translate_en_GB.properties` konvertiert)
  - `de.json` (neue deutsche Übersetzungen)
- Sprachauswahl auf der Login-Seite (Englisch / Deutsch)
- Cookie-basierte Sprachpersistierung
- Alle UI-Texte über Übersetzungsschlüssel referenziert (kein Hardcoded-Text)

---

### Iteration 19 – Keyboard-Shortcuts

**Status:** Offen
**Ziel:** Die gleichen Keyboard-Shortcuts wie in der Vaadin-Anwendung bereitstellen.
**Deliverables:**

- `Ctrl+F` → Fokus auf Suchfeld
- `Alt+N` → Neues Produkt (nur Admin)
- `Ctrl+S` → Produkt speichern (im Formular)
- `Escape` → Formular schließen / abbrechen
- `Page Down` → Nächstes Produkt bearbeiten (im Formular)
- `Page Up` → Vorheriges Produkt bearbeiten (im Formular)
- `Ctrl+L` → Logout

---

### Iteration 20 – Responsives Design

**Status:** Offen
**Ziel:** Die Angular-Anwendung passt sich an verschiedene Bildschirmgrößen an.
**Deliverables:**

- Breakpoint 800px: Layout wechselt von horizontal (Sidebar + Content) zu vertikal
- Breakpoint 570px: Weitere Anpassungen für kleine Bildschirme
- Hamburger-Menü für Navigation auf schmalen Bildschirmen
- Produktformular als Vollbild-Overlay auf kleinen Bildschirmen
- Tabelle scrollbar mit fixierten Spaltenüberschriften

---

## Phase E – Qualitätssicherung

### Iteration 21 – Unit-Tests

**Status:** Offen
**Ziel:** Alle Angular-Services, Guards und kritische Komponenten sind durch Unit-Tests abgedeckt.
**Deliverables:**

- Tests für Services: `AuthService`, `ProductService`, `CategoryService`
- Tests für Guards: `AuthGuard`, `AdminGuard`, `UnsavedChangesGuard`
- Tests für Interceptors: `AuthInterceptor`
- Tests für Komponenten: `LoginComponent`, `ProductListComponent`, `ProductFormComponent`, `AdminComponent`
- Mindestabdeckung: 80% Line Coverage
- Alle Tests grün (`ng test`)

---

### Iteration 22 – End-to-End-Tests

**Status:** Offen
**Ziel:** Alle kritischen Benutzerflüsse sind durch E2E-Tests abgesichert.
**Deliverables:**

- E2E-Testframework gemäß Stack.rules.md (Cypress oder Playwright)
- Testfälle:
  - Login als Admin → sieht Admin-Link
  - Login als User → sieht keinen Admin-Link
  - Admin erstellt Produkt → erscheint im Grid
  - Admin bearbeitet Produkt → Änderung sichtbar
  - Admin löscht Produkt → verschwindet aus Grid
  - User kann Produkte nicht bearbeiten
  - Filter filtert Produkte korrekt
  - Admin verwaltet Kategorien (erstellen, bearbeiten, löschen)
  - Sprachumschaltung ändert UI-Texte
  - Ungespeicherte Änderungen zeigen Warnung
- Alle Tests grün

---

### Iteration 23 – Abschluss und Dokumentation

**Status:** Offen
**Ziel:** Migration abschließen, Dokumentation aktualisieren, State.md finalisieren.
**Deliverables:**

- `State.md` aktualisiert mit:
  - Alle Iterationen als abgeschlossen markiert
  - Feature-Parität-Checkliste (Vaadin ↔ Angular)
  - Bekannte Unterschiede und Limitierungen
- `README.md` aktualisiert mit:
  - Angular-Projekt Setup-Anleitung
  - Build- und Start-Befehle
  - Entwicklungs-Workflow (Frontend + Backend)
- Aufräumarbeiten:
  - Nicht mehr benötigte Vaadin-Frontend-Dateien identifizieren
  - Entscheidung über Koexistenz oder Ablösung der Vaadin-UI
