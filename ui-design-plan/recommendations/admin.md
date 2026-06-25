# Umsetzungsempfehlung: Admin View (Kategorie-Verwaltung)

> **Quelle:** `annotated/admin.md`, `flows/06`
> **Stack:** Angular 22 · Standalone · Signals · Reactive Forms · Material 22 (M3)
> **Nur stabile, Angular-eigene APIs.** (Kein Screenshot des Desktop-Zustands —
> visuelle Struktur teils aus Code abgeleitet.)

## 1. Komponenten-Mapping

| Vaadin (Ist) | Angular Material (Soll) | Begründung |
|---|---|---|
| `AdminView extends VerticalLayout` | Standalone `AdminComponent` | Einfache CRUD-Liste. |
| `H2` Überschrift / `H4` Unterüberschrift | `<h1>`/`<h2>` mit M3-Typography | Plain Markup. |
| "Neue Kategorie"-`Button` (`setDisableOnClick`) | `<button matButton="filled">` + `<mat-icon>add</mat-icon>` | Disable-on-Click → `[disabled]`-Binding bis neue Zeile gespeichert. |
| `VirtualList<Category>` + `ComponentRenderer` | `@for`-Liste **oder** `cdk-virtual-scroll-viewport` | Kategorien sind wenige → einfaches `@for (… track …)` reicht; CDK-Virtual-Scroll nur bei großer Menge. |
| Kategorie-Editor-Zeile (`HorizontalLayout`) | `<div>` mit `display:flex` pro Zeile, gebunden an `FormGroup` aus `FormArray` | Eine `FormGroup` je Kategorie. |
| Kategorie-Name-`TextField` (kein Label, Auto-Fokus) | `<mat-form-field>` + `matInput formControlName="name"` | Auto-Fokus bei neuer Zeile via `@ViewChild`/`cdkFocusInitial`/`AfterViewInit`. |
| Delete-`Button` (Minus-Icon, error, conditional disabled) | `<button matIconButton>` + `<mat-icon>remove_circle_outline</mat-icon>` | `[disabled]="row.id <= 0 || group.invalid"`; Farbe via `--mat-sys-error`. |
| `Notification` (`category-saved`/`category-deleted`) | `MatSnackBar` | Standard-Entsprechung. |

## 2. Layout-Strategie

- Vertikal: Überschriften, „Neue Kategorie"-Button, dann die Zeilen-Liste.
- Jede Zeile als Flex-Row: `mat-form-field` (flex:1) + Delete-Icon-Button.
- Mobil (`admin--mobile.png`): volle Breite, Felder stapeln; Liste scrollbar.
- Maße/Farben über `--mat-sys-*`.

## 3. State & Forms

- **`CategoryService`** (`HttpClient` + Signals): `getAll()`, `update(cat)`,
  `delete(id)`.
- **`FormArray<FormGroup>`** — eine `FormGroup` je Kategorie:
  ```ts
  categories = this.fb.array<FormGroup>([]);
  // pro Kategorie:
  this.fb.group({
    id:   [cat.id],
    name: [cat.name, [Validators.required, Validators.minLength(2)]], // @Size(min=2)
  });
  ```
- **Auto-Save-Muster** (Workflow 6b/6c) ersetzt den fehlenden Save-Button:
  pro Zeile `group.controls.name.valueChanges` mit
  `debounceTime(...) → filter(() => group.valid) → switchMap(update)`. Bei Erfolg
  Snackbar `category-saved`, Delete-Button aktivieren, „Neue Kategorie"-Button
  wieder freigeben.
- **Neue Kategorie:** leere `FormGroup` ans `FormArray` anhängen, Fokus setzen,
  „Neue Kategorie"-Button bis erfolgreichem Save disabled (verhindert
  Doppelanlage, ersetzt `setDisableOnClick`).
- **Löschen ohne Bestätigung** (Workflow 6d): `delete(id)` → Eintrag aus
  `FormArray` + Signal entfernen → Snackbar `category-deleted`. **Kein**
  Confirm-Dialog (Original hat keinen — nicht hinzufügen).

## 4. Stolpersteine

- **Auto-Save statt Save-Button:** Kernverhalten. Mit `valueChanges` +
  `debounceTime` + `filter(valid)` nachbilden; nicht versehentlich einen
  Save-Button einführen (kein neues Feature).
- **Ein Binder pro Zeile → `FormArray`:** Jede Zeile isoliert validieren. Beim
  Translate auf korrektes Tracking in `@for` achten (`track group` bzw. stabile
  ID), sonst verlieren Felder Fokus/State.
- **Dynamische Admin-Route:** Statisch definieren, per `canActivate`-Admin-Guard
  schützen (siehe `main-layout.md` / `login.md`). Kein Session-Scope-Routing.
- **Delete ohne Confirm beibehalten:** Bewusst kein Dialog — funktionale
  Äquivalenz, keine „Verbesserung".
- **`VirtualList`:** Nur bei Bedarf CDK-Virtual-Scroll; sonst overengineered.
- **Backend-Fehler (Kategorie in Benutzung):** Original behandelt das nicht
  explizit in der UI. Optional: Fehler-Snackbar — aber als Abweichung markieren,
  nicht stillschweigend als Feature.
- **Kein Desktop-Screenshot:** Layout-Details (Abstände, Reihenfolge) gegen Code
  und `admin--add-category.png` validieren; in der Verify-Phase visuell prüfen.

## 5. Empfohlene Module/Imports

`ReactiveFormsModule`, `MatFormFieldModule`, `MatInputModule`, `MatButtonModule`,
`MatIconModule`, `MatSnackBar`, optional `ScrollingModule` (CDK Virtual Scroll).

## Quellen

- [FormArray — angular.dev](https://angular.dev/api/forms/FormArray)
- [valueChanges / reactive patterns — angular.dev](https://angular.dev/guide/forms/reactive-forms)
- [CDK Virtual Scroll — material.angular.dev](https://material.angular.dev/cdk/scrolling/overview)
