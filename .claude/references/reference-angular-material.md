# Referenz: Angular 22 & Angular Material 22 (M3) — Migrations-Wissensbasis

> **Zweck:** Faktenbasierte Referenz für den `ui-advisor`-Agenten bei der Übersetzung
> von Vaadin-Flow-Komponenten nach Angular Material.
> **Stand:** Juni 2026, verifiziert gegen angular.dev.

## Harte Vorgaben für diese Migration

1. **Nur stabile (stable) APIs verwenden.** Keine experimentellen oder
   Developer-Preview-Features im Produktivcode.
2. **Nur offizielle Angular-Pakete.** Erlaubt: `@angular/core`, `@angular/common`,
   `@angular/forms`, `@angular/router`, `@angular/material`, `@angular/cdk`.
   **Keine** Drittanbieter-Bibliotheken (PrimeNG, NG-Bootstrap, NGRX o. Ä.).

## Versionsstand

| Paket | Version | Quelle |
|-------|---------|--------|
| Angular | **22** (stable, Release 03.06.2026) | blog.angular.dev/announcing-angular-v22 |
| Angular Material / CDK | **22** (Lockstep mit Core) | github.com/angular/components Releases |
| Node.js | ≥ 20.x | angular.dev/reference/versions |

Aktive Unterstützung: v22 bis Dez. 2026, LTS bis Mai 2028. v21 (LTS bis Mai 2027),
v20 (LTS bis Nov. 2026) ebenfalls supported.

## Feature-Stabilität (verifiziert gegen angular.dev/roadmap)

**STABLE — verwenden:**

| Feature | Status |
|---------|--------|
| Standalone Components | stable seit v17 (Default) |
| Signals (`signal`, `computed`, `effect`, `linkedSignal`) | stable seit v20 |
| Signal-Inputs/Outputs/Queries (`input()`, `output()`, `model()`) | stable |
| Control Flow (`@if`, `@for`, `@switch`) | stable seit v18 |
| **Zoneless Change Detection** | **stable seit v20.2** |
| **Signal Forms** | **stable** |
| Reactive Forms (`FormGroup`, `Validators`) | stable (etabliert) |
| `inject()` | stable, vom Style Guide empfohlen |

**EXPERIMENTAL / NICHT verwenden (Vorgabe „nur stabil"):**

| Feature | Status |
|---------|--------|
| Resource API (`resource()`, `rxResource()`) | experimental |
| `httpResource()` | experimental |

→ Für Server-State stattdessen: **Service + `HttpClient` + Signals** (mit `toSignal()`).

## Angular-22-Idiome (für jede migrierte Komponente)

- **Immer Standalone**, kein NgModule. `imports`-Array in der Komponente. `standalone: true` ist Default und kann weggelassen werden.
- **Control Flow** `@if`/`@for`/`@switch` statt `*ngIf`/`*ngFor`. `@for` braucht `track`.
- **`inject()`** statt Constructor-DI (nicht mischen).
- **Signals** für lokalen State; **Service + HttpClient + Signals** für Server-State.
- **OnPush** Change Detection (bzw. zoneless-ready schreiben — keine Zone.js-Magie voraussetzen).

```ts
// Standalone-Komponente mit Signals + inject() — Grundmuster
import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';

@Component({
  selector: 'app-example',
  imports: [/* Material-Module hier */],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `…`,
})
export class ExampleComponent {
  private service = inject(ExampleService);
  readonly items = signal<Item[]>([]);
  readonly count = computed(() => this.items().length);
}
```

## Forms — Reactive Forms (stabil, Default für diese Migration)

```ts
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-book-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <form [formGroup]="form">
      <mat-form-field appearance="outline">
        <mat-label>E-Mail</mat-label>
        <input matInput formControlName="email" />
        @if (form.controls.email.hasError('required')) {
          <mat-error>E-Mail ist erforderlich</mat-error>
        }
        @if (form.controls.email.hasError('email')) {
          <mat-error>Ungültiges Format</mat-error>
        }
      </mat-form-field>
    </form>
  `,
})
export class BookForm {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
}
```

> **Hinweis Signal Forms:** Seit v22 stabil. Reactive Forms bleiben für diese
> Migration der Default (bewährt, gut testbar, direkte Entsprechung zu Vaadins
> Binder). Signal Forms nur einsetzen, wenn explizit gewünscht.

## Material 22 (M3)

- **M3 ist der aktuelle Standard.** M2-Themes sind deprecated.
- Theme über **`mat.theme()`**-Mixin in SCSS; eigene Styles über **`--mat-sys-*`**-Design-Tokens (CSS Custom Properties), keine hartkodierten Farben.

```scss
@use '@angular/material' as mat;

html {
  color-scheme: light dark;
  @include mat.theme((
    color: mat.$violet-palette,
    typography: Roboto,
    density: 0,
  ));
}
```

### mat-table

`MatTableDataSource` ist für die meisten realen Fälle die beste Wahl (eingebautes
Sort/Filter/Pagination) und die direkteste Entsprechung zu Vaadins `Grid`.
Sort/Paginator via `@ViewChild` in `ngAfterViewInit` verdrahten.

```ts
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';

dataSource = new MatTableDataSource<Book>([]);
@ViewChild(MatSort) sort!: MatSort;
@ViewChild(MatPaginator) paginator!: MatPaginator;
ngAfterViewInit() {
  this.dataSource.sort = this.sort;
  this.dataSource.paginator = this.paginator;
}
```

### MatDialog

```ts
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Aufrufer
private dialog = inject(MatDialog);
const ref = this.dialog.open(BookDialog, { width: '600px', data: { book } });
ref.afterClosed().subscribe((result?: Book) => { if (result) { /* … */ } });

// Im Dialog
data = inject<{ book: Book }>(MAT_DIALOG_DATA);
private ref = inject(MatDialogRef<BookDialog>);
save(updated: Book) { this.ref.close(updated); }
```

## Vaadin → Angular Material Mapping

| Vaadin (Flow) | Angular / Material | Worauf achten |
|---|---|---|
| `Grid<T>` | `mat-table` + `MatTableDataSource` | Spalten als `matColumnDef`; Sort/Paginator via `@ViewChild`. Vaadins lazy `DataProvider` → Daten ins `MatTableDataSource` laden oder serverseitiges Paging selbst bauen. |
| `Binder<T>` + `Validator` | **Reactive Forms** + `Validators` | Binder-Bindings → `formControlName`; Validatoren → `Validators.*`/eigene `ValidatorFn`; Fehler über `<mat-error>`. |
| `TextField`, `ComboBox`, `DatePicker` | `mat-form-field` + `matInput` / `mat-select` / `MatDatepicker` | Immer in `<mat-form-field>` wrappen, Label via `<mat-label>`. |
| `VerticalLayout` | `display:flex; flex-direction:column;` | reines CSS Flexbox, Vaadin-Spacing → `gap`. |
| `HorizontalLayout` | `display:flex; flex-direction:row;` | dito. |
| `FormLayout` | CSS Grid | `responsiveSteps` → `grid-template-columns` + Media Queries. |
| `Dialog` | `MatDialog` | Daten via `data` + `MAT_DIALOG_DATA`, Rückgabe via `close()` + `afterClosed()`. Serverseitiger Lifecycle entfällt. |
| `Button` | `mat-button` / `mat-raised-button` / Tonal Button (M3) | `ButtonVariant` → Material-Varianten. |
| `Notification` | `MatSnackBar` | Standard-Entsprechung. |

## Quellen

- [Announcing Angular v22 — blog.angular.dev](https://blog.angular.dev/announcing-angular-v22-c52bb83a4664)
- [Angular Roadmap (Feature-Stabilität) — angular.dev/roadmap](https://angular.dev/roadmap)
- [Version compatibility — angular.dev/reference/versions](https://angular.dev/reference/versions)
- [Releases & EOL — angular.dev/reference/releases](https://angular.dev/reference/releases)
- [Angular Style Guide — angular.dev/style-guide](https://angular.dev/style-guide)
- [Theming Angular Material — material.angular.dev/guide/theming](https://material.angular.dev/guide/theming)
- [mat-table guide — angular/components](https://github.com/angular/components/blob/main/src/material/table/table.md)
- [MatDialog guide — angular/components](https://github.com/angular/components/blob/main/src/material/dialog/dialog.md)
- [angular/components Releases (Material v22)](https://github.com/angular/components/releases)
