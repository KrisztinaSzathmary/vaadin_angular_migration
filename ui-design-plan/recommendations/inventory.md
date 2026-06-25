# Umsetzungsempfehlung: Inventory View

> **Quelle:** `annotated/inventory.md`, `flows/02`, `flows/04`, `flows/05`
> **Stack:** Angular 22 · Standalone · Signals · Reactive Forms · Material 22 (M3)
> **Nur stabile, Angular-eigene APIs.**

## 1. Komponenten-Mapping

| Vaadin (Ist) | Angular Material (Soll) | Begründung |
|---|---|---|
| `SampleCrudViewImpl` (`HorizontalLayout`) | Standalone `InventoryComponent` | Hält TopBar + Tabelle; Form als Dialog (siehe `product-form.md`). |
| TopBar (`HorizontalLayout`) | CSS Flexbox (`display:flex; gap; align-items:center`) | Sucheingabe links, Neu-Button rechts. |
| Suchfeld `TextField` + Lupen-Prefix | `<mat-form-field>` + `matInput` + `<mat-icon matPrefix>search</mat-icon>` | Standard. Wert als Signal/FormControl, filtert die Tabelle. |
| "Neues Produkt"-`Button` (Primary, +Icon) | `<button matButton="filled">` + `<mat-icon>add</mat-icon>` | M3 Filled. `[disabled]="!auth.isAdmin()"` (entspricht Vaadin-Disable für Nicht-Admins). |
| `ProductGrid extends Grid<Product>` | `<table mat-table>` + `MatTableDataSource` | Direkteste Grid-Entsprechung, eingebautes Sort/Filter. |
| SingleSelect + `rowSelected` | Row-Click-Handler `(click)="onRow(row)"` | Material-Table hat keine eingebaute Selection-API für Edit; Click-Handler + optionale `cdk`-Selection-Klasse für Highlight (`inventory--row-selected.png`). |
| Spalte Produktname (sortierbar, Tooltip) | `matColumnDef` + `mat-sort-header` + `matTooltip` | Standard. |
| Spalte Preis (LitRenderer, rechtsbündig, „€", 2 Dez.) | `matColumnDef` + `CurrencyPipe`/`DecimalPipe`, CSS `text-align:right` | Formatierung per Pipe statt Lit-Template. |
| Spalte Verfügbarkeit (Icon + Label, Ampel) | `matColumnDef` mit `<mat-icon>` + Span; Ampelfarbe via CSS-Klasse je Enum | Eigene Cell mit `@switch` auf `Availability`. |
| Spalte Lagerbestand (0→"-", rechtsbündig) | `matColumnDef` mit Inline-Ausdruck `{{ row.stockCount || '-' }}` | Triviale Logik im Template. |
| Spalte Kategorien (komma-sep., Tooltip) | `matColumnDef` + Pipe/Methode zum Joinen | `matTooltip` mit gleichem Text. |
| Row-Stripes / kein Rahmen | CSS auf `mat-row` (`:nth-child` Stripes) via `--mat-sys-*` | Styling-Detail. |
| Delete-`ConfirmDialog` | `MatDialog` mit kleiner `ConfirmDialogComponent` | Header/Text/Buttons als `data`. |
| Success-`Notification` (`created`/`updated`/`removed`) | `MatSnackBar` | Standard-Entsprechung. |
| Fehler-`Notification` (ungültige ID) | `MatSnackBar` (Error-Styling) | Bei ungültigem URL-Param. |

## 2. Layout-Strategie

- Seite vertikal: TopBar (`flex row`) über der Tabelle. Tabelle in scrollbarem
  Container.
- **Form als `MatDialog`**, nicht als Sidebar — funktional äquivalent zur
  Vaadin-Sidebar/Dialog (Original ist `vaadin-dialog`, siehe `product-form.md`).
  Alternativ optisch als rechte Sidebar via zweitem `mat-sidenav`; Dialog ist die
  einfachere, näher am Original liegende Lösung.
- **Mobil:** TopBar auf `flex-wrap`/Spalte; Tabelle horizontal scrollbar oder
  spaltenreduziert. Entspricht `inventory--mobile.png`.
- Sortier-Pfeile über `matSort` + `mat-sort-header`.

## 3. State & Forms

- **`ProductService`** (`HttpClient` + Signals): `products = signal<Product[]>([])`,
  `loadProducts()`, `getById(id)`, `save(p)`, `delete(id)`. Kein `resource()`.
- **Tabelle:** `dataSource = new MatTableDataSource<Product>()`; bei Datenänderung
  `dataSource.data = products()`. Sort via `@ViewChild(MatSort)` in
  `ngAfterViewInit`. (Hinweis: `MatTableDataSource` ist imperativ — sauber mit
  einem `effect()` synchronisieren, das `dataSource.data` setzt.)
- **Filter:** Suchfeld als FormControl/Signal → `dataSource.filterPredicate`
  selbst setzen, um die OR-Logik (Name OR Verfügbarkeit OR Kategorie,
  case-insensitive) aus `ProductDataProvider.java:117-119` exakt nachzubilden.
  `valueChanges` ggf. mit `debounceTime`.
- **Selection/Edit:** Row-Click → nur wenn `auth.isAdmin()` → Dialog öffnen
  (`MatDialog.open(ProductFormComponent, { data: { product } })`). Ergebnis über
  `afterClosed()` verarbeiten (Save/Delete → Snackbar + Liste neu laden).
- **URL-Sync:** Route `inventory/:id` und `inventory/new`. `ActivatedRoute`
  `paramMap` lesen → entsprechendes Produkt laden und Dialog öffnen. Bei
  ungültiger ID → Error-Snackbar (statt MIDDLE-Notification).
- **Default-Route:** `{ path: '', redirectTo: 'inventory', pathMatch: 'full' }`
  (entspricht `@RouteAlias("")`).

## 4. Stolpersteine

- **`BeforeLeaveObserver` (Dirty-Guard):** Kein direktes Material-Pendant.
  Als **funktionaler `CanDeactivateFn`-Guard** auf der Inventory-Route
  implementieren, der bei offenem, dirty Formular einen Confirm-Dialog zeigt
  (Workflow 4e). Siehe auch `product-form.md` (Dirty-Tracking via
  `form.dirty`).
- **Keyboard-Shortcuts** (Ctrl+F, Alt+N, Page-Up/Down): Nicht-Ziel — weglassen.
- **`MatTableDataSource` vs. Signals:** Bewusst entscheiden — DataSource ist
  imperativ. Empfehlung: `products`-Signal als Single Source of Truth,
  DataSource per `effect()` befüllen. Nicht beide State-Modelle vermischen.
- **`@VaadinSessionScoped`-Cache (1 Min TTL):** Backend-Detail; nicht
  nachbauen. Client lädt Produkte über den Service; ein einfacher
  In-Memory-Signal-Cache reicht, falls Caching erwünscht ist.
- **Verfügbarkeits-Ampel:** Icon-Farbe je Enum über CSS-Klassen
  (`available`/`coming`/`discontinued`) mit `--mat-sys-*`-Tokens, kein
  Lit-Template.
- **Row-Wechsel verwirft still (Workflow 4f):** Bewusst kein Dialog beim
  Produkt-Wechsel im Grid — nur beim Verlassen der View. Verhalten exakt
  übernehmen, nicht „verbessern".
- **Serverseitiges Paging:** Original ist In-Memory (`ListDataProvider`);
  `MatPaginator` optional. Bei großen Datenmengen wäre serverseitiges Paging
  selbst zu bauen — für diese Demo nicht nötig (funktionale Äquivalenz).

## 5. Empfohlene Module/Imports

`MatTableModule`, `MatSortModule`, (`MatPaginatorModule` optional),
`MatFormFieldModule`, `MatInputModule`, `MatButtonModule`, `MatIconModule`,
`MatTooltipModule`, `MatDialog`, `MatSnackBar`, `ReactiveFormsModule`,
`CommonModule`-Pipes (`DecimalPipe`/`CurrencyPipe`), `RouterModule`.

## Quellen

- [mat-table Guide — angular/components](https://github.com/angular/components/blob/main/src/material/table/table.md)
- [CanDeactivateFn — angular.dev](https://angular.dev/api/router/CanDeactivateFn)
- Mapping-Basis: `.claude/references/reference-angular-material.md`.
