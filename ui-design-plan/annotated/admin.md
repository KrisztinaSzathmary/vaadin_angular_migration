# Admin View — Annotation

## Screenshots

Kein Screenshot vorhanden. Laut Manifest:

> AdminView.java (@RouteScoped/@RouteScopeOwner) hat keinen eigenen Tab im
> Navigationsmenü. Vorhandene Tabs: []

Die View ist nur für Admin-Benutzer zugänglich und wird nicht im normalen
Navigationsmenü angezeigt. Sie wird dynamisch registriert.

## Rendierende Java-Klasse

`AdminView.java` — kein `@Route`-Annotation (dynamisch registriert)

- `@RouteScoped`, `@RouteScopeOwner(MainLayout.class)`, `@CdiComponent`
- Erbt von `VerticalLayout`. Implementiert `HasDynamicTitle`, `LocaleChangeObserver`.
- Route-Name: `AdminView.VIEW_NAME = "admin"`

Registrierung: Beim Admin-Login via `LoginView.registerAdminViewIfApplicable()`
(`LoginView.java:151-160`) → `RouteConfiguration.forSessionScope().setRoute("admin", AdminView.class, MainLayout.class)`

## UI-Elemente → Vaadin-Quelle → Verhalten

| UI-Element (sichtbar) | Vaadin-Konstrukt | Quelldatei:Zeile | Verhalten / Event |
|---|---|---|---|
| Seiten-Überschrift | `H2` (h2) | `AdminView.java:57`, `84` | Text i18n-Key `admin`; reaktiv via `localeChange` |
| Seiten-Unterüberschrift | `H4` (h4) | `AdminView.java:58`, `85` | Text i18n-Key `edit-categories`; reaktiv via `localeChange` |
| "Neue Kategorie"-Button | `Button` (newCategoryButton) | `AdminView.java:55`, `76-82` | Text i18n `add-new-category`; `setDisableOnClick(true)`; Click → neue leere `Category` in DataProvider; reaktiv via `localeChange` |
| Kategorie-Liste | `VirtualList<Category>` (categoriesListing) | `AdminView.java:53`, `62` | Virtualisierte Liste; `ComponentRenderer` → `createCategoryEditor()` |
| Kategorie-Editor-Zeile (pro Item) | `HorizontalLayout` aus `createCategoryEditor()` | `AdminView.java:90-123` | Enthält Textfeld + Delete-Button |
| Kategorie-Name-Textfeld | `TextField` (nameField) | `AdminView.java:91` | Kein Label; automatischer Fokus bei neuer Kategorie (id < 0) |
| Kategorie-Delete-Button | `Button` (deleteButton) | `AdminView.java:96-103` | Icon: `VaadinIcon.MINUS_CIRCLE_O`; Variant `LUMO_ERROR`; Tooltip i18n `delete`; initial disabled wenn `id <= 0` |

## Event-Handler

| Event | Methode | Quelldatei:Zeile | Logik |
|---|---|---|---|
| "Neue Kategorie" Klick | Lambda | `AdminView.java:77-81` | Neue `Category()` zu `dataProvider.getItems()` hinzufügen + `refreshAll()` |
| Kategorie-Textfeld Änderung | `binder.addValueChangeListener` | `AdminView.java:110-117` | Wenn `binder.isValid()`: `dataService.updateCategory(category)` + Delete-Button enabled + newCategoryButton enabled + Notification `category-saved` |
| Delete-Button Klick | Lambda | `AdminView.java:97-102` | `dataService.deleteCategory(id)` + Item aus DataProvider entfernen + `refreshAll()` + Notification `category-deleted` |

## Validierungen

| Feld | Constraint | Quelldatei:Zeile | Regel |
|---|---|---|---|
| Kategorie-Name | `@Size(min=2)` (Bean-Validation) | `Category.java:11` | Mindestens 2 Zeichen; via `BeanValidationBinder` |

Save passiert automatisch bei gültiger Eingabe (kein expliziter Save-Button) —
Auto-Save-Muster via Binder-ValueChangeListener.

## Backend-Abhängigkeiten

| Service | Methode | Aufruf in | Zweck |
|---|---|---|---|
| `DataService` | `getAllCategories()` | `AdminView.java:66` | Initialladen aller Kategorien für VirtualList |
| `DataService` | `updateCategory(category)` | `AdminView.java:112` | Auto-Save bei gültiger Namensänderung |
| `DataService` | `deleteCategory(id)` | `AdminView.java:98` | Kategorie löschen |

## Bedingte Sichtbarkeit / Berechtigungen

| Element | Bedingung | Quelldatei:Zeile |
|---|---|---|
| Gesamte View | Nur für Benutzer mit Rolle `"admin"` (route ist session-scoped) | `LoginView.java:153`, `AccessControl.java:11` |
| Admin-Menü-Item | Erscheint nur nach Admin-Login | `MainLayout.java:67-69` |
| Delete-Button | Disabled wenn `category.getId() <= 0` (neue, noch nicht gespeicherte Kategorie) | `AdminView.java:118` |
| Delete-Button (nach Eingabe) | Enabled wenn `binder.isValid()` | `AdminView.java:113` |

## Besonderheiten / Risiken für die Migration

- **Auto-Save-Muster**: Das Textfeld speichert automatisch ohne expliziten Save-Button. In Angular: `valueChanges`-Observable mit `debounceTime` + `filter(valid)` + Service-Call.
- `VirtualList` mit `ComponentRenderer`: In Angular `cdk-virtual-scroll-viewport` mit `*cdkVirtualFor` oder einfache `*ngFor` wenn Datenmenge gering ist (Kategorien sind typischerweise wenige).
- `BeanValidationBinder` für jede Zeile individuell (eine Binder-Instanz pro Category-Item): In Angular ein separates `FormGroup` pro Kategorie-Zeile in einem `FormArray`.
- Dynamische Route-Registrierung per Session: In Angular mit `canActivate`-Guard ersetzen, der auf Admin-Rolle prüft — Route ist statisch definiert, aber nur zugänglich für Admins.
- `setDisableOnClick(true)` auf newCategoryButton: Verhindert Doppelklick-Erstellung; in Angular: Button disabled setzen bis Eingabe valid und gespeichert.
- Kein Screenshot vorhanden — visuelle Struktur kann nicht vollständig verifiziert werden.
