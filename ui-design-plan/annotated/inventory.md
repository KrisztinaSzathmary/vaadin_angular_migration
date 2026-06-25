# Inventory View — Annotation

## Screenshots

| Datei | Beschreibung |
|---|---|
| `screenshots/inventory/inventory--default.png` | Produktgrid im Grundzustand |
| `screenshots/inventory/inventory--filtered-java.png` | Grid gefiltert nach "Java" |
| `screenshots/inventory/inventory--empty-grid.png` | Kein Suchergebnis |
| `screenshots/inventory/inventory--mobile.png` | Mobiler Viewport (390 px) |

## Rendierende Java-Klassen

| Klasse | Rolle |
|---|---|
| `crud/SampleCrudViewImpl.java` | Haupt-View, `@Route("inventory")`, `@RouteAlias("")` |
| `crud/ProductGrid.java` | Grid-Komponente (eingebettet) |
| `crud/ProductDataProvider.java` | In-Memory-ListDataProvider mit Filter |
| `crud/SampleCrudPresenter.java` | Presenter (MVP-Muster) |

Layout: `MainLayout` als Router-Eltern-Layout.

## UI-Elemente → Vaadin-Quelle → Verhalten

| UI-Element (sichtbar) | Vaadin-Konstrukt | Quelldatei:Zeile | Verhalten / Event |
|---|---|---|---|
| Gesamt-Seitenlayout | `HorizontalLayout` (SampleCrudViewImpl erbt) | `SampleCrudViewImpl.java:51` | Linke Spalte: Grid + TopBar; rechte Spalte: ProductForm-Dialog |
| Obere Leiste (TopBar) | `HorizontalLayout` (createTopBar) | `SampleCrudViewImpl.java:138-162` | Enthält Suchfeld + Neu-Button |
| Suchfeld (Filter) | `TextField` (filter) | `SampleCrudViewImpl.java:68`, `139-146` | Prefix: Lupen-Icon (`VaadinIcon.SEARCH`); Placeholder i18n `filter`; ValueChangeListener → `dataProvider.setFilter(value)`; Shortcut: Ctrl+F |
| "Neues Produkt"-Button | `Button` (newProduct) | `SampleCrudViewImpl.java:72`, `148-153` | Variant: `LUMO_PRIMARY`; Icon: `VaadinIcon.PLUS_CIRCLE`; Click → `presenter.newProduct()`; Shortcut: Alt+N; für Nicht-Admins disabled |
| Produktgrid | `ProductGrid extends Grid<Product>` | `ProductGrid.java:25`, `SampleCrudViewImpl.java:86-89` | SingleSelect; ValueChangeListener → `presenter.rowSelected(value)` |
| Grid-Spalte: Produktname | `addColumn(Product::getProductName)` | `ProductGrid.java:39-42` | flexGrow 20; sortierbar; Tooltip = Produktname |
| Grid-Spalte: Preis | `addColumn(LitRenderer)` mit Template `<div style='text-align: right'>` | `ProductGrid.java:51-55` | DecimalFormat 2 Nachkommastellen + " €"; flexGrow 3; sortierbar nach `BigDecimal` |
| Grid-Spalte: Verfügbarkeit | `addColumn(LitRenderer)` mit `vaadin-icon` | `ProductGrid.java:62-76` | Traffic-Light-Icon (CSS-Klasse = Enum-Name); Label i18n-übersetzt; flexGrow 2; sortierbar |
| Grid-Spalte: Lagerbestand | `addColumn` mit Lambda | `ProductGrid.java:78-83` | 0 → "-", sonst Integer als String; flexGrow 2; rechtsbündig; sortierbar |
| Grid-Spalte: Kategorien | `addColumn(this::formatCategories)` | `ProductGrid.java:86-88` | Komma-getrennte Kategorie-Namen sortiert nach ID; flexGrow 12; Tooltip = gleicher Text |
| Row-Stripes / kein Rahmen | `GridVariant.LUMO_ROW_STRIPES`, `LUMO_NO_ROW_BORDERS` | `ProductGrid.java:36-37` | Visuelles Styling |
| ConfirmDialog (Delete) | `ConfirmDialog` | `SampleCrudViewImpl.java:204-218` | Öffnet sich wenn `presenter.deleteProduct()` aufgerufen; Bestätigen → `dataProvider.delete()` + Notification; Abbrechen → `editProduct()` erneut öffnen |
| Success-Notification | `Notification.show()` | `SampleCrudViewImpl.java:165`, `170` | i18n-Keys `created` (neu) und `updated` (Update) |
| Fehler-Notification (ungültige ID) | `Notification` mit `LUMO_ERROR`, Position MIDDLE | `SampleCrudViewImpl.java:302-305` | Wird angezeigt wenn URL-Parameter keine gültige Produkt-ID enthält |

## Event-Handler

| Event | Methode | Quelldatei:Zeile | Logik |
|---|---|---|---|
| Filter-Texteingabe | ValueChangeListener | `SampleCrudViewImpl.java:144-145` | `dataProvider.setFilter(value)` — filtert nach Produktname, Verfügbarkeit, Kategorie (OR-Verknüpfung) |
| "Neues Produkt" Klick | `presenter.newProduct()` | `SampleCrudViewImpl.java:151`, `SampleCrudPresenter.java:105-108` | `view.clearSelection()` + `view.editProduct(new Product())` |
| Grid-Zeilenauswahl | `presenter.rowSelected(value)` | `SampleCrudViewImpl.java:88-89`, `SampleCrudPresenter.java:110-114` | Nur für Admins: `editProduct(product)` — für Nicht-Admins keine Aktion |
| Shortcut Page-Down | Lambda | `SampleCrudViewImpl.java:104-112` | Wenn Form offen: nächstes Produkt im Grid editieren (mit Dirty-Check) |
| Shortcut Page-Up | Lambda | `SampleCrudViewImpl.java:114-122` | Wenn Form offen: vorheriges Produkt editieren (mit Dirty-Check) |
| `AfterNavigationEvent` | `afterNavigation()` | `SampleCrudViewImpl.java:286-294` | `dataProvider.loadData()`, `presenter.requestCategories()`, optionales URL-Parameter-Enter |
| `BeforeLeaveEvent` | `beforeLeave()` | `SampleCrudViewImpl.java:261-266` | Wenn Form dirty: Navigation postponieren und `confirmDiscard` zeigen |
| `LocaleChangeEvent` | `localeChange()` | `SampleCrudViewImpl.java:275-278` | newProduct-Text + filter-Placeholder neu setzen |

## Backend-Abhängigkeiten

| Service | Methode | Aufruf in | Zweck |
|---|---|---|---|
| `DataService` | `getAllProducts()` | `ProductDataProvider.java:63` | Initialladen aller Produkte (gecacht: 1 Minute TTL) |
| `DataService` | `getAllCategories()` | `SampleCrudPresenter.java:54` | Kategorien für Formular-Dropdown |
| `DataService` | `updateProduct(product)` | `ProductDataProvider.java:80` | Speichern / Aktualisieren |
| `DataService` | `deleteProduct(id)` | `ProductDataProvider.java:98` | Löschen nach Bestätigung |
| `DataService` | `getProductById(id)` | `SampleCrudPresenter.java:82` | Direkt-Navigation via URL-Parameter |
| `AccessControl` | `isUserInRole("admin")` | `SampleCrudPresenter.java:44`, `111` | Steuert "Neues Produkt"-Button-Sichtbarkeit und Grid-Row-Edit-Berechtigung |

## Daten-Modell (Product)

Felder laut `Product.java`:

| Feld | Typ | Constraint |
|---|---|---|
| `id` | `int` (default -1 = neu) | `@NotNull` |
| `productName` | `String` | `@NotBlank`, `@Size(min=2)` |
| `price` | `BigDecimal` | `@Min(0)` |
| `category` | `Set<Category>` | — |
| `stockCount` | `int` | `@Min(0)` |
| `availability` | `Availability` (enum) | `@NotNull` |

Filter-Logik in `ProductDataProvider.java:117-119`: produktName OR availability OR category (case-insensitive `contains`).

## Besonderheiten / Risiken für die Migration

- **Keyboard-Shortcuts** (Page-Down/Up, Ctrl+F, Alt+N) sind in CLAUDE.md als Nicht-Ziel markiert — nicht migrieren.
- Grid-Spalte Preis verwendet ein LitRenderer-Template mit direktem `style`-Attribut; in Angular Material Table werden Spalten als `<ng-container matColumnDef>` definiert.
- Die Verfügbarkeitsspalte kombiniert Icon + Label via LitRenderer-Template — in Angular als eigene Cell-Komponente oder `*matCellDef` mit ng-template.
- `BeforeLeaveObserver` (Navigation Guard) hat kein direktes Angular-Äquivalent; muss als `CanDeactivate`-Guard implementiert werden.
- `@RouteAlias(value = "", layout = MainLayout.class)` — Inventory ist die Default-Route; in Angular als `redirectTo: 'inventory'` oder Default-Route konfigurieren.
- URL-Parameter-Sync (ProductId im Fragment): Vaadin nutzt `HasUrlParameter<String>` mit optionalem Parameter; in Angular: `ActivatedRoute.params` mit `snapshot.paramMap`.
- `ProductDataProvider` ist `@VaadinSessionScoped` — ein Cache über die Browser-Session; in Angular muss explizites State-Management (Signal, Service mit Subject) entschieden werden.
