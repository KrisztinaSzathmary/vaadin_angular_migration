# Umsetzungsempfehlung: Product Form (Dialog)

> **Quelle:** `annotated/product-form.md`, `flows/03`, `flows/04`, `flows/05`
> **Stack:** Angular 22 · Standalone · Signals · Reactive Forms · Material 22 (M3)
> **Nur stabile, Angular-eigene APIs.**

## 1. Komponenten-Mapping

| Vaadin (Ist) | Angular Material (Soll) | Begründung |
|---|---|---|
| `ProductForm extends Dialog` | `MatDialog` + `ProductFormComponent` (Dialog-Inhalt) | Standard-Dialog-Muster; geöffnet aus Inventory. |
| `VerticalLayout` (content) | `<mat-dialog-content>` + `display:flex; flex-direction:column` | Material-Dialog-Struktur (`mat-dialog-title`/`-content`/`-actions`). |
| Produktname `TextField` (required) | `<mat-form-field>` + `matInput formControlName="productName"` | Required + min length über Validators. |
| Preis `TextField` (Suffix „€", rechtsbündig) | `<mat-form-field>` + `matInput` + `<span matSuffix>€</span>`, CSS rechtsbündig | `type="number"` oder String + Parsing (siehe Stolpersteine zum Converter). |
| Lagerbestand `TextField` (rechtsbündig) | `<mat-form-field>` + `matInput type="number" formControlName="stockCount"` | `@Min(0)` → `Validators.min(0)`. |
| Preis + Lagerbestand nebeneinander | CSS Flexbox (`display:flex; gap; flex-wrap:wrap`) | Entspricht `HorizontalLayout` mit `FlexWrap.WRAP`. |
| Verfügbarkeit `Select<Availability>` (Icon+Text) | `<mat-form-field>` + `<mat-select>` mit `<mat-option>` + Icon-Template | Ampel-Icon im Option-Template (`<mat-icon>` + CSS-Klasse). |
| Kategorie `MultiSelectComboBox` | `<mat-select multiple>` **oder** `MatChipGrid` + `MatAutocomplete` | `mat-select multiple` ist die einfachste Äquivalenz; Chips näher an der Optik (siehe Stolpersteine). |
| Save-`Button` (Primary, disabled bis valid+dirty) | `<button matButton="filled" [disabled]="form.invalid || form.pristine">` | M3 Filled; Enable-Logik via Form-State. |
| Discard-`Button` (warning, disabled bis dirty) | `<button matButton="tonal" [disabled]="form.pristine">` | Tonal Button (M3) für sekundäre Aktion; setzt Form zurück. |
| Cancel-`Button` | `<button matButton>` (Text) | Schließt Dialog (mit Dirty-Confirm). |
| Delete-`Button` (error, nur bei Bestand) | `<button matButton class="error">` + `@if (!isNew())` | M3 hat keine Error-Button-Variante out-of-the-box → Farbe via `--mat-sys-error`-Token. |
| Button-Leiste (`JustifyContent.BETWEEN`) | `<mat-dialog-actions>` mit `justify-content:space-between` | Reihenfolge delete/discard/cancel/save beibehalten. |
| Discard-`ConfirmDialog` | zweite `MatDialog` (`ConfirmDialogComponent`) | Header `discard-changes`, Text `unsaved-changes`, Buttons discard/cancel. |

## 2. Layout-Strategie

- Material-Dialog-Slots: `<h2 mat-dialog-title>`, `<mat-dialog-content>` (Felder),
  `<mat-dialog-actions>` (Buttons). Breite z. B. `width:'600px'` beim `open()`.
- Felder vertikal gestapelt (Flex column, `gap`), Preis+Lagerbestand in einer
  Flex-Row mit `flex:1` pro Feld und `flex-wrap`.
- Scrollbarer Inhalt bei kleinem Viewport (`mat-dialog-content` scrollt nativ) —
  entspricht `product-form--existing-product-scrolled.png`.
- Alle Maße/Farben über `--mat-sys-*`.

## 3. State & Forms

- **Reactive Form (FormGroup)** als 1:1-Ersatz für `BeanValidationBinder`:
  ```ts
  form = this.fb.group({
    productName: ['', [Validators.required, Validators.minLength(2)]], // @NotBlank, @Size(min=2)
    price:       [null, [Validators.required, Validators.min(0)]],     // @Min(0)
    stockCount:  [0,    [Validators.required, Validators.min(0)]],     // @Min(0)
    availability:[null, Validators.required],                          // @NotNull
    category:    [[]],
  }, { validators: availabilityVsStockValidator });
  ```
- **Kreuzfeld-Validator** (`availabilityVsStockValidator`) auf FormGroup-Ebene
  bildet `checkAvailabilityVsStockCount` ab:
  AVAILABLE → `stockCount > 0`; DISCONTINUED/COMING → `stockCount == 0`.
  Fehler über `<mat-error>` am passenden Feld anzeigen.
- **Dirty/Valid-Status:** Save enabled bei `form.valid && form.dirty`;
  Discard enabled bei `form.dirty`. Material Reactive Forms liefern
  `dirty`/`pristine` nativ — **kein** Custom-CSS-`"dirty"`-Tracking nötig.
- **Daten rein/raus:** `MAT_DIALOG_DATA` liefert `{ product }`. Form mit
  `patchValue(product)` füllen. Save → `dialogRef.close(formValue)`; Inventory
  ruft `ProductService.save()` und zeigt Snackbar.
- **Delete:** `dialogRef.close({ action: 'delete', id })` oder Confirm-Dialog
  direkt im Form öffnen, dann schließen. Löschen nur bei `!isNew()`.
- **Discard:** `form.reset(originalValue)` lädt Originalwerte (Workflow 4b).

## 4. Stolpersteine

- **`BeanValidationBinder` → Validators manuell:** Annotationen aus `Product.java`
  exakt nachbilden (`@NotBlank`/`@Size(min=2)`/`@Min(0)`/`@NotNull`). Keine
  Validierung auslassen oder hinzufügen.
- **`PriceConverter` / `StockCountConverter` (locale-sensitives Parsing):**
  Kein direktes Material-Pendant. Empfehlung: `matInput type="number"` für
  Lagerbestand; für Preis (BigDecimal, 2 Dezimalstellen) entweder `type="number"`
  + `DecimalPipe`-Anzeige oder ein eigener `ControlValueAccessor`/Parser, der
  String↔Number sauber konvertiert. Genauigkeit (BigDecimal) im Backend
  sicherstellen.
- **Kreuzfeld-Validierung:** Muss als Cross-Field-`ValidatorFn` auf der FormGroup
  liegen (nicht pro Control). Fehler gezielt einem Feld zuordnen für `mat-error`.
- **`MultiSelectComboBox`:** Kein 1:1-Pendant. `mat-select multiple` ist
  funktional ausreichend; `MatChipGrid` + `MatAutocomplete` näher an der Optik,
  aber aufwendiger. Empfehlung: mit `mat-select multiple` starten (funktionale
  Äquivalenz), Chips nur bei Bedarf.
- **`Select<Availability>` mit Icon-Renderer:** In `mat-option` ein Template mit
  `<mat-icon>` + Ampel-CSS-Klasse; ausgewählter Wert braucht ggf. einen
  `mat-select-trigger` für die Icon-Darstellung im geschlossenen Zustand.
- **Dialog-Close (X / Escape / Backdrop) bei Dirty:** `MatDialogRef` mit
  `disableClose: true` öffnen, `backdropClick()` und `keydownEvents()` (Escape)
  abfangen → bei `form.dirty` Confirm-Dialog, sonst schließen. Bildet
  `addDialogCloseActionListener` (Workflow 4d) ab.
- **Ctrl+S-Shortcut:** Nicht-Ziel — weglassen.
- **Delete-Button-Farbe:** M3 hat keine dedizierte Error-Button-Variante;
  Farbe über `--mat-sys-error`-Token, nicht hartkodiert.

## 5. Empfohlene Module/Imports

`MatDialogModule`, `MatFormFieldModule`, `MatInputModule`, `MatSelectModule`,
(`MatChipsModule` + `MatAutocompleteModule` optional), `MatButtonModule`,
`MatIconModule`, `ReactiveFormsModule`, `MatSnackBar`.

## Quellen

- [MatDialog Guide — angular/components](https://github.com/angular/components/blob/main/src/material/dialog/dialog.md)
- [Cross-field validation — angular.dev](https://angular.dev/guide/forms/form-validation#cross-field-validation)
- [mat-select — material.angular.dev](https://material.angular.dev/components/select/overview)
