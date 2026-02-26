# Vaadin Bookstore – Code-Archäologie

## 1. Projektübersicht

Die Anwendung ist ein **Bookstore-Starter** für **Vaadin Flow** (Version 24.3.12) mit **Jakarta EE 10** (CDI, Servlet 6). Sie demonstriert ein vollständiges CRUD-basiertes Warenwirtschaftssystem für Produkte mit Authentifizierung, Mehrsprachigkeit und responsivem Design.

| Eigenschaft | Wert |
|---|---|
| Group-ID | `com.vaadin` |
| Artifact-ID | `bookstore-starter-flow` |
| Version | `1.1-SNAPSHOT` |
| Java-Version | 17 |
| Vaadin-Version | 24.3.12 |
| Jakarta-EE-Version | 10.0.0 |
| Application Server | WildFly 27.0.0.Final |
| Build-Tool | Maven 3+ |
| Packaging (Parent) | POM (Multi-Modul) |

---

## 2. Modulstruktur

```
bookstore-starter-flow (Parent POM)
├── bookstore-starter-flow-backend      (JAR)  – Datenmodell und Mock-Services
├── bookstore-starter-flow-ui           (WAR)  – Vaadin-Views und UI-Logik
├── bookstore-starter-flow-my-component (JAR)  – Eigene Web-Komponente
├── bookstore-starter-flow-it           (WAR)  – Integrations-/TestBench-Tests
└── bookstore-starter-flow-ear          (EAR)  – Enterprise-Archiv für Produktion
```

### Abhängigkeiten zwischen Modulen

```
bookstore-starter-flow-ear
├── bookstore-starter-flow-ui (WAR)
│   ├── bookstore-starter-flow-backend (JAR, scope: provided)
│   └── bookstore-starter-flow-my-component (JAR)
└── bookstore-starter-flow-backend (JAR)

bookstore-starter-flow-it
└── bookstore-starter-flow-ui (WAR, scope: test)
```

Das Backend wird im UI-Modul als `provided` deklariert, da es im EAR-Archiv als eigenständiges JAR mitgeliefert wird. Im Entwicklungsmodus (`runWar`-Profil) wird es auf `compile` umgeschaltet.

---

## 3. Backend-Modul (`bookstore-starter-flow-backend`)

### 3.1 Datenmodell

#### `Availability` (Enum)

Drei Verfügbarkeitsstufen mit lesbarem Display-Namen:

| Wert | Anzeige |
|---|---|
| `COMING` | "Coming" |
| `AVAILABLE` | "Available" |
| `DISCONTINUED` | "Discontinued" |

#### `Category` (Entity)

| Feld | Typ | Validierung |
|---|---|---|
| `id` | `int` (default: -1) | `@NotNull` |
| `name` | `String` | `@Size(min = 2)` |

- `id = -1` signalisiert ein neues, noch nicht persistiertes Objekt.
- `toString()` gibt den Kategorienamen zurück.

#### `Product` (Entity)

| Feld | Typ | Default | Validierung |
|---|---|---|---|
| `id` | `int` | -1 | `@NotNull` |
| `productName` | `String` | `""` | `@NotBlank`, `@Size(min = 2)` |
| `price` | `BigDecimal` | `ZERO` | `@Min(0)` |
| `category` | `Set<Category>` | – | – |
| `stockCount` | `int` | 0 | `@Min(0)` |
| `availability` | `Availability` | `COMING` | `@NotNull` |

- Copy-Constructor vorhanden für defensives Kopieren.
- `isNewProduct()` prüft ob `id == -1`.
- `equals()` und `hashCode()` basieren auf dem `id`-Feld.
- Validierungsmeldungen sind in `ValidationMessages.properties` externalisiert (Englisch + Finnisch).

### 3.2 Service-Schicht

#### `DataService` (Interface)

Definiert die CRUD-Operationen. Erweitert `Serializable`.

| Methode | Beschreibung |
|---|---|
| `getAllProducts()` | Alle Produkte abrufen |
| `getAllCategories()` | Alle Kategorien abrufen |
| `updateProduct(Product)` | Produkt anlegen oder aktualisieren |
| `deleteProduct(int)` | Produkt nach ID löschen |
| `getProductById(int)` | Produkt nach ID suchen |
| `updateCategory(Category)` | Kategorie anlegen oder aktualisieren |
| `deleteCategory(int)` | Kategorie löschen (entfernt sie auch aus Produkten) |

#### `MockDataService` (Implementierung)

- **Scope:** `@ApplicationScoped` – Singleton für die gesamte Anwendung.
- Speichert Daten **in-memory** in `List<Product>` und `List<Category>`.
- Die meisten Methoden sind `synchronized` (Thread-Sicherheit).
- Simuliert Datenbank-Latenz über `randomWait()` (50–200ms pro Aufruf).
- `getAllProducts()` gibt defensive Kopien zurück (über Copy-Constructor).
- Neue Objekte werden durch `id < 0` erkannt und bekommen eine neue ID.

#### `MockDataGenerator`

- **Scope:** `@ApplicationScoped`
- Generiert beim Start **8 Kategorien** und **100 Produkte** mit zufälligen Namen.
- Produktnamen entstehen aus Kombination zweier Wort-Arrays (je 21 Einträge), z.B. "Fermented Quark" oder "Sweetened Flux".
- Zufällige Preise (5.0–30.0), Verfügbarkeit und Lagerbestände (0–523).
- Jedes Produkt bekommt 1–2 zufällige Kategorien zugewiesen.
- Der `Random`-Generator ist mit Seed `1` initialisiert → reproduzierbare Daten.

### 3.3 Backend-Tests

`DataServiceTest` (JUnit 4) testet:

| Test | Prüft |
|---|---|
| `canFetchProducts` | Produktliste nicht leer |
| `canFetchCategories` | Kategorienliste nicht leer |
| `updateTheProduct` | Namensänderung wird persistiert |
| `addNewProduct` | Neues Produkt bekommt ID, Listengröße steigt |
| `updateNonExistentProduct` | Wirft `IllegalArgumentException` |
| `removeProduct` | Produkt wird entfernt, Listengröße sinkt |
| `findProductById` | Findet Produkt mit ID 1 |
| `findProductByNonExistentId` | Gibt `null` für ID 1000 zurück |
| `removeProductByNonExistentId` | Wirft `IllegalArgumentException` |

### 3.4 Backend-Abhängigkeiten

| Abhängigkeit | Version | Scope |
|---|---|---|
| `jakarta.validation-api` | 3.0.2 | compile |
| `jakarta.jakartaee-api` | 10.0.0 | provided |
| `slf4j-simple` | (via Vaadin BOM) | compile |
| `junit` | 4.13.2 | test |
| `mockito-all` | 1.10.19 | test |

---

## 4. UI-Modul (`bookstore-starter-flow-ui`)

### 4.1 Architektur: Model-View-Presenter (MVP)

Die CRUD-Ansicht folgt dem klassischen MVP-Muster:

```
┌─────────────────────┐
│  SampleCrudViewImpl  │ ← View (Vaadin-Komponenten)
│  (implements         │
│   SampleCrudView)    │
└──────────┬──────────┘
           │ delegiert an
┌──────────▼──────────┐
│ SampleCrudPresenter  │ ← Presenter (Geschäftslogik)
└──────────┬──────────┘
           │ nutzt
┌──────────▼──────────┐
│    DataService       │ ← Model (Backend)
└─────────────────────┘
```

### 4.2 Routing und Views

| Route | Klasse | Layout | Beschreibung |
|---|---|---|---|
| `/` (alias) | `SampleCrudViewImpl` | `MainLayout` | Produkt-Inventar (CRUD) |
| `/inventory` | `SampleCrudViewImpl` | `MainLayout` | Produkt-Inventar (CRUD) |
| `/about` | `AboutView` | `MainLayout` | Info-Seite mit Flow-Version |
| `/Login` | `LoginView` | – | Anmeldeseite |
| `/admin` | `AdminView` | `MainLayout` | Kategorien-Verwaltung (nur Admin) |
| (Fehler) | `ErrorView` | `MainLayout` | 404-Fehlerseite |

Die `AdminView` wird **dynamisch** nur registriert, wenn der Benutzer die Admin-Rolle hat.

### 4.3 Layout und Navigation

#### `MainLayout`

- Erweitert `FlexLayout`, implementiert `RouterLayout`.
- Enthält das `Menu` und den Router-Outlet.
- Registriert die Admin-Ansicht bedingt nach Login.
- Liest die gespeicherte Sprache aus einem Cookie und setzt die Locale.

#### `Menu`

- Erweitert `FlexLayout`, implementiert `LocaleChangeObserver`.
- Enthält `SideNav` für die Navigation, `H3`-Titel ("Bookstore"), Logout-Button.
- Responsives Verhalten: Auf schmalen Bildschirmen wird ein Hamburger-Button angezeigt.
- Der Logout-Button ruft `AccessControl.signOut()` auf und leitet zur Login-Seite weiter.

### 4.4 Authentifizierung

#### `AccessControl` (Interface)

| Methode | Beschreibung |
|---|---|
| `signIn(username, password)` | Anmeldung (gibt `true` bei Erfolg) |
| `isUserSignedIn()` | Ist ein Benutzer angemeldet? |
| `isUserInRole(role)` | Hat der Benutzer eine bestimmte Rolle? |
| `getPrincipalName()` | Benutzername des aktuellen Benutzers |
| `signOut()` | Abmeldung |

Konstanten: `ADMIN_ROLE_NAME = "admin"`, `ADMIN_USERNAME = "admin"`.

#### `BasicAccessControl` (Implementierung)

- **Scope:** `@SessionScoped` – pro Browser-Session.
- **Anmeldung:** Jeder Benutzername mit demselben Passwort wird akzeptiert (`username.equals(password)`).
- **Admin-Erkennung:** Benutzername `"admin"` bekommt die Admin-Rolle.
- **Abmeldung:** Invalidiert die `VaadinSession` und leitet zum Login weiter.

#### `CurrentUser`

- **Scope:** `@SessionScoped`
- Einfacher Wrapper um einen `String` – speichert den aktuellen Benutzernamen.

#### `LoginView`

- Vaadin `LoginForm` mit Branding-Informationen.
- Sprachauswahl (Englisch/Finnisch) über `Select<Locale>` – wird in Cookie gespeichert.
- Registriert dynamisch die Admin-Ansicht bei Admin-Login.
- Leitet nach erfolgreicher Anmeldung zur Hauptansicht weiter.

#### `BookstoreBeforeEnterListener`

- CDI-Observer für `BeforeEnterEvent`.
- Prüft bei jedem Navigationsereignis, ob der Benutzer angemeldet ist.
- Nicht angemeldete Benutzer werden zur `LoginView` umgeleitet (außer sie sind bereits dort).

### 4.5 CRUD-Ansicht (Produkt-Inventar)

#### `SampleCrudViewImpl`

- **Route:** `/inventory` (und `/` als Alias).
- **Scope:** `@RouteScoped`.
- Enthält eine Filterzeile (TextField + "New Product"-Button) und ein zweigeteiltes Layout:
  - Links: `ProductGrid` (Produktliste)
  - Rechts: `ProductForm` (Bearbeitungsformular als Dialog)
- Tastaturkürzel: Page-Up/Page-Down zum Blättern durch Produkte.
- Implementiert `BeforeLeaveObserver` – warnt bei ungespeicherten Änderungen.
- Implementiert `HasUrlParameter<String>` – Produkt-ID kann über URL-Parameter ausgewählt werden.

#### `ProductGrid`

- Erweitert `Grid<Product>`.
- Spalten: Produktname, Preis (rechtsbündig), Verfügbarkeit (farbcodiert), Lagerbestand, Kategorien.
- Verfügbarkeit wird über CSS-Klassen farbcodiert: Grün (Available), Orange (Coming), Rot (Discontinued).
- Implementiert `LocaleChangeObserver` – Spaltenüberschriften werden lokalisiert.

#### `ProductForm`

- Erweitert `Dialog` – wird als Offcanvas-Seitenleiste angezeigt.
- Felder: Produktname, Preis, Lagerbestand, Verfügbarkeit, Kategorien (MultiSelectComboBox).
- Buttons: Save, Discard, Cancel, Delete (Delete nur für bestehende Produkte).
- **BeanValidationBinder** für JSR-303-Validierung.
- Geänderte Felder werden visuell hervorgehoben (CSS-Klasse `dirty`).
- Eigene Converter: `PriceConverter` (String → BigDecimal), `StockCountConverter` (String → Integer).
- Bean-Level-Validierung: Prüft Konsistenz zwischen Verfügbarkeit und Lagerbestand.
- Bestätigungsdialog (`ConfirmDialog`) bei Discard und Delete.

#### `ProductDataProvider`

- **Scope:** `@VaadinSessionScoped`.
- Erweitert `ListDataProvider<Product>`.
- **Caching:** Daten werden nur neu geladen, wenn sie älter als 60 Sekunden sind.
- Filterung: Durchsucht Produktname, Verfügbarkeit und Kategorien (case-insensitive).
- Eigene `getId()`-Methode für Schlüsselzuordnung.

#### `SampleCrudPresenter`

- **Scope:** `@Dependent`.
- Koordiniert zwischen View und DataService.
- Steuert die Bearbeitungsrechte (nur Admin darf bearbeiten).
- Navigation: Produkt-ID wird als URL-Fragment gesetzt.

### 4.6 Admin-Ansicht

#### `AdminView`

- **Scope:** `@RouteScoped`.
- `VirtualList<Category>` zeigt alle Kategorien mit Inline-Bearbeitung.
- Jede Kategorie hat ein Textfeld und Speichern/Löschen-Buttons.
- Neue Kategorien werden über einen separaten Button angelegt.

### 4.7 Internationalisierung (i18n)

#### `CustomI18NProvider`

- **Scope:** `@VaadinServiceScoped`.
- Unterstützte Sprachen: Englisch (`en_GB`), Finnisch (`fi_FI`).
- Lädt Übersetzungen aus `translate_en_GB.properties` und `translate_fi_FI.properties`.
- Wird in der gesamten Anwendung über `getTranslation()` aufgerufen.

#### Sprachpersistierung

- `CookieUtil` liest/schreibt ein Cookie mit der gewählten Sprache.
- `MainLayout.onAttach()` liest das Cookie und setzt die Locale.
- `LoginView` bietet eine Sprachauswahl, die das Cookie aktualisiert.

#### Lokalisierte Validierungsmeldungen

- `ValidationMessages.properties` (Englisch) und `ValidationMessages_fi.properties` (Finnisch).
- Werden von Hibernate Validator über JSR-303 `{message}`-Interpolation aufgelöst.

### 4.8 Weitere Infrastruktur-Klassen

| Klasse | Beschreibung |
|---|---|
| `Configuration` | `AppShellConfigurator` – setzt Theme (`@Theme("bookstore")`) und PWA-Metadaten |
| `BookstoreInitListener` | CDI-Observer für `ServiceInitEvent` – registriert Locale aus Cookie |
| `CustomSystemMessagesProvider` | Benutzerdefinierte Vaadin-Systemmeldungen |
| `LoggerProducer` | CDI-Producer für `@Inject Logger` – erzeugt SLF4J-Logger mit dem Namen der injizierenden Klasse |
| `ErrorView` | `HasErrorParameter<NotFoundException>` – zeigt 404-Fehler an |
| `CookieUtil` | Statische Hilfsmethode zum Lesen von Cookies aus `VaadinRequest` |

### 4.9 UI-Abhängigkeiten

| Abhängigkeit | Version | Scope |
|---|---|---|
| `jakarta.jakartaee-api` | 10.0.0 | provided |
| `vaadin` (Full) | 24.3.12 (via BOM) | compile |
| `vaadin-cdi` | (via BOM) | compile |
| `bookstore-starter-flow-backend` | 1.1-SNAPSHOT | provided |
| `bookstore-starter-flow-my-component` | 1.1-SNAPSHOT | compile |
| `hibernate-validator` | 8.0.0.Final | compile |
| `jakarta.validation-api` | 3.0.2 | compile |
| `slf4j-simple` | (via BOM) | compile |

---

## 5. Custom-Component-Modul (`bookstore-starter-flow-my-component`)

### `BookstoreTitle`

Eine eigene Web-Komponente, die den Titel "Bookstore" als `<h1>` anzeigt.

**Java-Seite** (`BookstoreTitle.java`):
- Erweitert `Component`.
- Annotationen: `@Tag("bookstore-title")`, `@JsModule("./src/bookstore-title.js")`, `@CssImport`.

**JavaScript-Seite** (`bookstore-title.js`):
- Polymer-Element mit `ThemableMixin`.
- Einfaches HTML-Template mit `<h1>Bookstore</h1>`.
- Lifecycle-Callbacks mit Console-Logging (`constructor`, `ready`, `connectedCallback`, `disconnectedCallback`).

**CSS** (`my-styles.css`):
- Setzt die Textfarbe auf `--lumo-primary-text-color` (Lumo Design-Token).

Dieses Modul demonstriert, wie ein wiederverwendbarer Vaadin-Webkomponent als separates Maven-Modul erstellt wird.

---

## 6. Frontend-Theming

### Theme-Struktur

```
frontend/themes/bookstore/
├── theme.json              – Lumo-Imports (typography, color, spacing, badge, utility)
├── styles.css              – Hauptstilvorlage der Anwendung
└── components/
    ├── vaadin-button.css   – Warning-Theme-Variante für Buttons
    └── vaadin-text-field.css – Gelber Hintergrund-Theme für Textfelder
```

### Wichtige CSS-Konzepte

- **Responsives Design:** Zwei Breakpoints (`800px` und `570px`) ändern das Layout von horizontal zu vertikal.
- **Verfügbarkeits-Farbcodes:** `.Available` (Grün), `.Coming` (Orange), `.Discontinued` (Rot).
- **Dirty-Markierung:** Geänderte Formularfelder bekommen einen gestrichelten, orangen Rahmen.
- **Produktformular:** Als absolute-positionierte Seitenleiste (Offcanvas-Stil).
- **Custom Loading Indicator:** Ersetzt den Standard-Vaadin-Ladeindikator.
- **Lumo Design Tokens:** Durchgängig werden CSS Custom Properties aus dem Lumo-Theme verwendet.

---

## 7. Integrationstests (`bookstore-starter-flow-it`)

### Testframework

- **Vaadin TestBench** (kommerziell) auf Basis von Selenium WebDriver.
- ChromeDriver Version 75.0.3770.8 (konfiguriert in `drivers.xml`).
- Maven-Failsafe-Plugin für Integrationstest-Ausführung.

### `AbstractViewTest` (Basis-Testklasse)

- Erweitert `ParallelTest` (TestBench).
- Unterstützt lokale Ausführung (ChromeDriver) und CI-Umgebung (Test-Hub).
- Server läuft auf `localhost:8080`.
- Screenshot-on-Failure-Rule für Fehlerdiagnose.

### Test-Elemente (Page Objects)

| Klasse | Element | Aufgabe |
|---|---|---|
| `MainLayoutElement` | `div.main-layout` | Menü-Navigation |
| `LoginFormElement` | `vaadin-login-form` | Login-Formular ausfüllen |
| `ProductFormElement` | `div.product-form` | Produktformular bedienen |

### Testfälle

| Test | Prüft |
|---|---|
| `AboutViewIT.openAboutView_showsFlowVersion` | About-Seite zeigt Flow-Version |
| `LoginScreenIT.loginForm_isLumoThemed` | Login-Formular hat Lumo-Theme |
| `LoginScreenIT.loginAsAdmin_hasAdminViewLink` | Admin sieht Admin-Menüpunkt |
| `LoginScreenIT.loginAsUser_noAdminViewLink` | Normaler Benutzer sieht keinen Admin-Menüpunkt |
| `SampleCrudViewIT.userSelectsProduct_cannotEditProductInformation` | Normaler Benutzer kann nicht bearbeiten |
| `SampleCrudViewIT.adminSelectsProduct_canUpdateProductInformation` | Admin kann Produkte aktualisieren |
| `SampleCrudViewIT.adminCreatesNewProduct_productIsAvailableInGird` | Admin kann neue Produkte anlegen |

---

## 8. EAR-Modul (`bookstore-starter-flow-ear`)

- Packt Backend (JAR) und UI (WAR) in ein Enterprise-Archiv.
- Verwendet `maven-ear-plugin` Version 3.3.0 (Java EE 7-Deskriptor).
- WildFly-Maven-Plugin für Deployment konfiguriert.
- Produktions-Deployment: `mvn clean install -Pproduction` im Parent, dann `mvn clean wildfly:run -Pproduction` im EAR-Modul.
- Produktions-URL: `http://localhost:8080/bookstore-starter-flow-ui/`.

---

## 9. CDI-Scope-Architektur

Die Anwendung macht intensiven Gebrauch von Jakarta CDI Scopes:

| Scope | Klassen | Verwendungszweck |
|---|---|---|
| `@ApplicationScoped` | `MockDataService`, `MockDataGenerator`, `LoggerProducer` | Singleton-Services, Datenhaltung |
| `@SessionScoped` | `BasicAccessControl`, `CurrentUser` | Benutzer-Session-Zustand |
| `@VaadinSessionScoped` | `ProductDataProvider` | Vaadin-Session-gebundener Cache |
| `@VaadinServiceScoped` | `CustomI18NProvider`, `CustomSystemMessagesProvider` | Vaadin-Service-Ebene |
| `@RouteScoped` | `SampleCrudViewImpl`, `AdminView`, `LoginView` | Route-gebundene Views |
| `@Dependent` | `MainLayout`, `Menu`, `SampleCrudPresenter`, `BookstoreBeforeEnterListener` | Kurzlebige Beans |

Die `beans.xml` ist auf `bean-discovery-mode="annotated"` gesetzt – nur explizit annotierte Beans werden erkannt.

---

## 10. Build-Konfiguration

### Maven-Profile

| Profil | Aktivierung | Zweck |
|---|---|---|
| `runWar` | `-PrunWar` | Entwicklungsmodus mit eingebettetem WildFly und Hot-Deploy |
| `production` | `-Pproduction` | Produktionsmodus mit optimiertem Frontend-Build |
| `integration-tests` | `-Pintegration-tests` | Integrationstest-Ausführung |

### Vaadin-Maven-Plugin

- `prepare-frontend`: Synchronisiert Java-Abhängigkeiten mit Frontend-Imports.
- `build-frontend` (nur Production): Erstellt optimiertes Frontend-Bundle.
- PNPM als Paketmanager aktiviert (`pnpmEnable=true`).

### Entwicklungs-Workflow

```bash
# Gesamtes Projekt bauen
mvn install                              # im Parent-Verzeichnis

# Entwicklungsmodus starten
mvn clean wildfly:run -PrunWar           # im UI-Modul
# → http://localhost:8080/bookstore-starter-flow-ui-1.1-SNAPSHOT/

# Produktionsmodus bauen und starten
mvn clean install -Pproduction           # im Parent-Verzeichnis
mvn clean wildfly:run -Pproduction       # im EAR-Modul
# → http://localhost:8080/bookstore-starter-flow-ui/
```

---

## 11. Zusammenfassung der Architekturentscheidungen

| Entscheidung | Details |
|---|---|
| **Kein ORM / keine Datenbank** | Bewusste Entscheidung für Mock-Services mit In-Memory-Daten |
| **MVP statt MVVM** | Presenter steuert die Interaktion zwischen View und Model |
| **Dialog statt Navigation** | Produktformular ist ein Dialog (Offcanvas), keine eigene Route |
| **CDI statt Spring** | Jakarta-EE-konform, kein Spring-Framework |
| **WildFly statt Tomcat** | Vollständiger Jakarta-EE-Container erforderlich (CDI, Servlet 6) |
| **PNPM statt NPM** | Schnellerer und platzsparender Paketmanager |
| **Lumo-Theme** | Vaadins Standard-Design-System als Basis |
| **Polymer (Legacy)** | Custom Component nutzt Polymer statt Lit (älterer Ansatz) |
| **Synchronized** | Thread-Sicherheit über `synchronized` statt Lock-Objekte |
| **Seeded Random** | Reproduzierbare Mock-Daten durch festen Seed-Wert |

---

## 12. Dateiverzeichnis

### Backend (`bookstore-starter-flow-backend`)

```
src/main/java/com/vaadin/samples/backend/
├── DataService.java                    – Service-Interface (CRUD)
├── data/
│   ├── Availability.java              – Enum (COMING, AVAILABLE, DISCONTINUED)
│   ├── Category.java                  – Kategorie-Entity
│   └── Product.java                   – Produkt-Entity
└── mock/
    ├── MockDataGenerator.java         – Testdaten-Generator (8 Kategorien, 100 Produkte)
    └── MockDataService.java           – In-Memory-Implementierung des DataService

src/main/resources/META-INF/
└── beans.xml                          – CDI Bean-Discovery

src/test/java/com/vaadin/samples/backend/mock/
└── DataServiceTest.java               – Unit-Tests (JUnit 4, 9 Tests)
```

### UI (`bookstore-starter-flow-ui`)

```
src/main/java/com/vaadin/samples/
├── MainLayout.java                    – Router-Layout mit Menü
├── Menu.java                          – Navigationsleiste (SideNav)
├── AdminView.java                     – Kategorien-Verwaltung
├── ErrorView.java                     – 404-Fehlerseite
├── Configuration.java                 – Theme- und PWA-Konfiguration
├── CookieUtil.java                    – Cookie-Hilfsfunktionen
├── CustomI18NProvider.java            – Mehrsprachigkeit (EN/FI)
├── CustomSystemMessagesProvider.java  – Vaadin-Systemmeldungen
├── LoggerProducer.java                – CDI Logger-Producer
├── BookstoreInitListener.java         – Service-Initialisierung
├── BookstoreBeforeEnterListener.java  – Zugriffskontrolle (Route Guard)
├── about/
│   └── AboutView.java                – Info-Seite
├── authentication/
│   ├── AccessControl.java            – Zugriffskontrolle (Interface)
│   ├── BasicAccessControl.java       – Einfache Authentifizierung
│   ├── CurrentUser.java              – Session-gebundener Benutzer
│   └── LoginView.java                – Anmeldeseite
└── crud/
    ├── SampleCrudView.java            – View-Interface (MVP)
    ├── SampleCrudViewImpl.java        – View-Implementierung
    ├── SampleCrudPresenter.java       – Presenter (MVP)
    ├── ProductDataProvider.java       – Caching-Datenprovider
    ├── ProductGrid.java              – Produkt-Tabelle
    └── ProductForm.java              – Produkt-Bearbeitungsformular

src/main/resources/
├── ValidationMessages.properties      – Validierungsmeldungen (EN)
├── ValidationMessages_fi.properties   – Validierungsmeldungen (FI)
├── translate_en_GB.properties         – UI-Texte (EN)
├── translate_fi_FI.properties         – UI-Texte (FI)
├── simplelogger.properties            – SLF4J-Konfiguration
└── vaadin-featureflags.properties     – Vaadin Feature Flags

src/main/webapp/WEB-INF/
└── beans.xml                          – CDI-Konfiguration (annotated mode)

frontend/themes/bookstore/
├── theme.json                         – Lumo-Imports
├── styles.css                         – Hauptstile (responsiv, Farben, Layout)
└── components/
    ├── vaadin-button.css              – Warning-Button-Variante
    └── vaadin-text-field.css          – Yellow-Background-Variante
```

### Custom Component (`bookstore-starter-flow-my-component`)

```
src/main/java/com/vaadin/samples/
└── BookstoreTitle.java                – Java-Komponente (@Tag, @JsModule)

src/main/resources/META-INF/resources/frontend/
├── src/
│   └── bookstore-title.js            – Polymer Web Component
└── styles/
    └── my-styles.css                  – Komponenten-Stile
```

### Integrationstests (`bookstore-starter-flow-it`)

```
src/test/java/com/vaadin/samples/
├── AbstractViewTest.java              – Basis-Testklasse (TestBench)
├── MainLayoutElement.java             – Page Object: Hauptlayout
├── about/
│   └── AboutViewIT.java              – About-Seite-Test
├── authentication/
│   ├── LoginFormElement.java          – Page Object: Login-Formular
│   └── LoginScreenIT.java            – Login-Tests
└── crud/
    ├── ProductFormElement.java        – Page Object: Produktformular
    └── SampleCrudViewIT.java          – CRUD-Tests

drivers.xml                            – ChromeDriver-Konfiguration
```