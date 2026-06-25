# Product Form View — Annotation

## Screenshots

| Datei | Beschreibung |
|---|---|
| `screenshots/product-form/product-form--new-empty.png` | Leerer Dialog, neues Produkt |
| `screenshots/product-form/product-form--partially-filled.png` | Name + Preis ausgefüllt |
| `screenshots/product-form/product-form--existing-product.png` | Bestehendes Produkt geladen |

## Kontext

Das Produktformular wird als `vaadin-dialog` (Modal) innerhalb der Inventory-View
geöffnet — es hat keine eigene Route. Die Form ist Teil von
`SampleCrudViewImpl.java` und wird über `presenter` gesteuert.

## Rendierende Java-Klassen

| Klasse | Rolle |
|---|---|
| `crud/ProductForm.java` | Formular-Dialog selbst (`extends Dialog`) |
| `crud/SampleCrudPresenter.java` | Steuert Öffnen/Schließen/Speichern/Löschen |
| `crud/SampleCrudViewImpl.java` | Instanziiert ProductForm, ruft `form.editProduct()` auf |

## UI-Elemente → Vaadin-Quelle → Verhalten

| UI-Element (sichtbar) | Vaadin-Konstrukt | Quelldatei:Zeile | Verhalten / Event |
|---|---|---|---|
| Dialog-Container | `Dialog` (ProductForm erbt) | `ProductForm.java:49` | `setClassName("product-form")`; öffnet sich via `setOpened(true)` |
| Vertikaler Inhalts-Container | `VerticalLayout` (content) | `ProductForm.java:65`, `136-139` | Enthält alle Formularfelder und Button-Leiste |
| Produktname-Feld | `TextField` (productName) | `ProductForm.java:67`, `143-147` | Label i18n `product-name`; `setRequired(true)`; `ValueChangeMode.EAGER`; Binder-Binding via `bindInstanceFields` |
| Preis-Feld | `TextField` (price) | `ProductForm.java:68`, `149-152` | Suffix "€"; `LUMO_ALIGN_RIGHT`; `EAGER`; Binding mit `PriceConverter` (StringToBigDecimal, 2 Dezimalstellen) |
| Lagerbestand-Feld | `TextField` (stockCount) | `ProductForm.java:69`, `154-157` | `LUMO_ALIGN_RIGHT`; `EAGER`; Binding mit `StockCountConverter` (StringToInteger, kein Tausendertrenner) |
| Preis + Lagerbestand nebeneinander | `HorizontalLayout` | `ProductForm.java:158-163` | `FlexWrap.WRAP`; beide Felder flexGrow 1 |
| Verfügbarkeit-Selektor | `Select<Availability>` (availability) | `ProductForm.java:70`, `165-170` | Label i18n `availability`; Items: alle `Availability`-Enum-Werte; `ComponentRenderer` mit Icon (Ampel-Farbe via CSS-Klasse) + Text |
| Kategorie-Multi-Selektor | `MultiSelectComboBox<Category>` (category) | `ProductForm.java:71`, `172-177` | Label i18n `categories`; id `"category"`; `AutoExpandMode.VERTICAL`; Items werden via `setCategories()` gesetzt |
| Speichern-Button | `Button` (save) | `ProductForm.java:73`, `200-205` | Variant: `LUMO_PRIMARY`, `LUMO_SMALL`; Click → `saveButtonClicked()`; Shortcut: Ctrl+S; initial disabled |
| Verwerfen-Button | `Button` (discard) | `ProductForm.java:74`, `207-213` | Theme `warning small`; Click → `presenter.editProduct(currentProduct)` + `hasChanges = false`; initial disabled |
| Abbrechen-Button | `Button` (cancel) | `ProductForm.java:75`, `215-221` | Variant `LUMO_SMALL`; Click + Shortcut Escape → `cancelProduct()` |
| Löschen-Button | `Button` (delete) | `ProductForm.java:76`, `223-229` | Variant `LUMO_ERROR`, `LUMO_SMALL`; Click → `presenter.deleteProduct(currentProduct)`; nur sichtbar bei bestehendem Produkt (`!isNewProduct()`) |
| Button-Leiste | `HorizontalLayout` (buttons) | `ProductForm.java:232-239` | Reihenfolge: delete, discard, cancel, save; `JustifyContent.BETWEEN`; save hat flexGrow 1 |

## Validierungen (Binder)

| Feld | Validierungs-Art | Quelldatei:Zeile | Regel |
|---|---|---|---|
| productName | `@NotBlank` (Bean-Validation) | `Product.java:17-18`, `ProductForm.java:179` | Pflichtfeld, min. 2 Zeichen (`@Size(min=2)`) |
| price | `PriceConverter` + `@Min(0)` | `ProductForm.java:180-183`, `Product.java:20` | Muss parseable BigDecimal sein; nicht negativ |
| stockCount | `StockCountConverter` + `@Min(0)` | `ProductForm.java:184-187`, `Product.java:23` | Muss parseable Integer sein; nicht negativ |
| availability | `@NotNull` (Bean-Validation) | `Product.java:25` | Pflichtfeld |
| Kreuz-Validierung: availability vs. stockCount | `binder.withValidator(this::checkAvailabilityVsStockCount)` | `ProductForm.java:191` | AVAILABLE → stockCount > 0; DISCONTINUED → stockCount == 0; COMING → stockCount == 0 |
| Binder-Status-Listener | `handleBinderStatusChange()` | `ProductForm.java:272-281` | Save-Button enabled wenn `hasChanges && isValid`; Discard-Button enabled wenn `hasChanges` |

## Event-Handler

| Event | Methode | Quelldatei:Zeile | Logik |
|---|---|---|---|
| Save-Button Klick (Ctrl+S) | `saveButtonClicked()` | `ProductForm.java:250-257` | `binder.writeBeanIfValid(currentProduct)` → `presenter.saveProduct()`; bei Fehler ohne Felder-Fehler: stockCount + availability als invalid markieren |
| Discard-Button Klick | Lambda in Konstruktor | `ProductForm.java:209-212` | `presenter.editProduct(currentProduct)` lädt Originalwerte neu; `hasChanges = false` |
| Cancel-Button Klick / Escape | `cancelProduct()` | `ProductForm.java:292-302` | Wenn dirty: `confirmDiscard` Dialog; sonst: `presenter.cancelProduct()` |
| Delete-Button Klick | Lambda in Konstruktor | `ProductForm.java:226-229` | `presenter.deleteProduct(currentProduct)` |
| Dialog-Close-Action (X-Button) | `addDialogCloseActionListener` | `ProductForm.java:241-247` | Wenn `binder.hasChanges()`: `confirmDiscard(() -> close())`; sonst direkt `close()` |
| Dirty-Tracking auf jedem Feld | `addDirtyCheck(field)` | `ProductForm.java:195`, `361-366` | Jedes Feld bekommt `addValueChangeListener` — bei Client-Änderung: CSS-Klasse `"dirty"` hinzufügen |
| Binder-StatusChange | `handleBinderStatusChange()` | `ProductForm.java:272-281` | Steuert Save/Discard-enabled-Status |

## Discard-Bestätigungsdialog

Wird an mehreren Stellen ausgelöst (`confirmDiscard()`, `ProductForm.java:336-350`):

- Beim Cancel bei dirty Form
- Beim Dialog-Schließen (X) bei dirty Form
- Bei Navigation zum nächsten/vorherigen Produkt via Shortcut bei dirty Form
- Bei `BeforeLeaveEvent` in SampleCrudViewImpl

Dialog zeigt: Header i18n `discard-changes`, Text i18n `unsaved-changes`, Buttons: `discard` (warning) + `cancel`.

## Backend-Abhängigkeiten

| Service | Methode | Aufruf-Kette | Zweck |
|---|---|---|---|
| `DataService` | `updateProduct(product)` | `ProductForm` → `presenter.saveProduct()` → `view.updateProduct()` → `dataProvider.save()` | Speichern/Aktualisieren |
| `DataService` | `deleteProduct(id)` | `ProductForm` → `presenter.deleteProduct()` → `view.removeProduct()` → Confirm → `dataProvider.delete()` | Löschen mit Bestätigung |
| `DataService` | `getAllCategories()` | `presenter.requestCategories()` → `view.setCategories()` → `form.setCategories()` | Kategorie-Dropdown befüllen |

## Bedingte Sichtbarkeit

| Element | Bedingung | Quelldatei:Zeile |
|---|---|---|
| Löschen-Button | Nur sichtbar wenn `!product.isNewProduct()` (id != -1) | `ProductForm.java:324` |
| Save-Button enabled | `hasChanges && isValid` (Binder-Status) | `ProductForm.java:279` |
| Discard-Button enabled | `hasChanges` (Binder-Status) | `ProductForm.java:280` |
| "Neues Produkt"-Button (in Inventory) | Nur für Admins enabled | `SampleCrudPresenter.java:44` |
| Gesamtes Form | `form.setOpened(show)` | `SampleCrudViewImpl.java:235-237` | Gesteuert vom Presenter |

## Besonderheiten / Risiken für die Migration

- `ProductForm extends Dialog` — in Angular: `MatDialog` mit einer separaten Komponente als Dialog-Inhalt.
- `BeanValidationBinder` verbindet automatisch Jakarta-Bean-Validation-Annotationen; in Angular: Reactive Forms mit `Validators` manuell definieren (entspricht `@NotBlank`, `@Min`, `@Size`).
- Kreuzfeld-Validierung (Availability vs. StockCount) muss als Custom Validator oder Cross-Field-Validator auf der FormGroup implementiert werden.
- `PriceConverter` und `StockCountConverter` machen locale-sensitive Zahlen-Parsing; in Angular: Input type=number + eigener `ControlValueAccessor` oder Pipe.
- Dirty-Tracking via CSS-Klasse `"dirty"` auf Feldern: In Angular Reactive Forms via `AbstractControl.dirty` nativ vorhanden — kein Custom-Tracking nötig.
- `MultiSelectComboBox` (Kategorien): nächstes Äquivalent in Angular Material wäre `mat-select` mit `multiple` oder `mat-autocomplete` mit Chip-Input.
- `Select<Availability>` mit `ComponentRenderer` (Icon + Text): in Angular als `mat-select` mit `mat-option` + eigenem Template.
- Shortcut Ctrl+S für Save ist als Nicht-Ziel ausgeschlossen.
