# Workflow 02: Produktliste ansehen und filtern

## Vorbedingungen

- Benutzer ist angemeldet (beliebige Rolle)
- Inventory-View ist die Standardansicht nach dem Login (`@RouteAlias("")`)
- Backend liefert Produkte via `DataService.getAllProducts()` (gecacht, 1 Minute TTL)

---

## Workflow 2a: Produktliste im Grundzustand betrachten

**Ausgangszustand:** Benutzer ist gerade eingeloggt oder navigiert zu `/inventory`.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Inventory-View wird geöffnet | `afterNavigation()` → `dataProvider.loadData()` → `DataService.getAllProducts()` lädt alle Produkte; `presenter.requestCategories()` lädt Kategorien | — |
| 2 | Grid rendert | Produktliste mit Spalten: Produktname, Preis (EUR, 2 Dezimalstellen, rechtsbündig), Verfügbarkeit (farbiges Ampel-Icon + Label), Lagerbestand (0 → "-"), Kategorien (kommagetrennt) | `inventory/inventory--default.png` |
| 3 | Keine Zeile ausgewählt | Produktformular-Sidebar ist geschlossen | `inventory/inventory--default.png` |

**Endzustand:** Vollständige Produktliste sichtbar, kein Produkt ausgewählt, Formular geschlossen.

---

## Workflow 2b: Produkte nach Namen filtern

**Ausgangszustand:** Inventory-View aktiv, alle Produkte sichtbar, Suchfeld leer.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt in das Suchfeld (Lupe-Icon, Placeholder: "Hae nimellä, saatavuudella tai kategorialla") | Suchfeld erhält Fokus | — |
| 2 | Benutzer tippt `Java` | `ValueChangeListener` → `dataProvider.setFilter("Java")` | — |
| 3 | Grid aktualisiert sich sofort (kein separater Submit) | Nur Produkte angezeigt, deren Name, Verfügbarkeitslabel oder Kategoriename (case-insensitive) `"Java"` enthält | `inventory/inventory--filtered-java.png` |
| 4 | Benutzer löscht den Filtertext (Backspace bis leer) | `dataProvider.setFilter("")` → alle Produkte werden wieder angezeigt | `inventory/inventory--default.png` |

**Filterlogik (aus `ProductDataProvider.java:117-119`):** Treffer, wenn `productName`, `availability.name()` (Enum-Name) oder irgendein `category.name` den Suchbegriff enthält (case-insensitive `contains`, OR-Verknüpfung).

---

## Workflow 2c: Suche ohne Treffer

**Ausgangszustand:** Inventory-View aktiv.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer gibt einen Begriff ein, der in keinem Produkt vorkommt (z. B. `xyzxyz`) | `dataProvider.setFilter("xyzxyz")` | — |
| 2 | Grid zeigt keine Zeilen | Leeres Grid (keine Zeilen, kein Ladezustand, kein Fehler) | `inventory/inventory--empty-grid.png` |
| 3 | Benutzer leert das Suchfeld | Alle Produkte erscheinen wieder | `inventory/inventory--default.png` |

**Endzustand:** Grid leer, keine Fehlermeldung. Produkte kehren zurück wenn Filter geleert wird.

---

## Workflow 2d: Direktzugriff auf Produkt via URL-Parameter

**Ausgangszustand:** Benutzer ist angemeldet (Admin-Rolle). URL enthält Produkt-ID, z. B. `/inventory/42`.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Browser navigiert zu `/inventory/42` | `setParameter(event, "42")` speichert Parameter | — |
| 2 | `afterNavigation()` → `presenter.enter("42")` | `dataService.getProductById(42)` wird aufgerufen | — |
| 3a | Produkt mit ID 42 existiert | `view.selectRow(product)` → Grid-Zeile wird ausgewählt → Formular öffnet sich mit Produktdaten | — |
| 3b | Produkt mit ID 42 existiert nicht | `view.showNotValidProductIdNotification("42")` → roter Toast-Hinweis in der Bildschirmmitte | — |
| 4 | URL `/inventory/new` aufgerufen | `presenter.enter("new")` → `presenter.newProduct()` → leeres Formular öffnet sich | — |

---

## Workflow 2e: Grid-Spalten sortieren

**Vorbedingung:** Inventory-View mit sichtbaren Produkten.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt auf Spaltenheader "Tuotteen nimi" (Produktname) | Grid sortiert aufsteigend nach Produktname | — |
| 2 | Erneuter Klick auf denselben Header | Grid sortiert absteigend | — |
| 3 | Klick auf "Hinta" (Preis) | Grid sortiert nach `BigDecimal`-Preis (numerisch, nicht alphabetisch) | — |

Alle Spalten sind sortierbar (definiert in `ProductGrid.java`): Produktname, Preis, Verfügbarkeit, Lagerbestand, Kategorien.

---

## Verzweigungen und Fehlerpfade

| Situation | Verhalten |
|-----------|-----------|
| Backend nicht erreichbar beim Laden | Fehler im Server-Log; Grid bleibt leer (kein expliziter UI-Fehlerzustand dokumentiert) |
| Nicht-Admin klickt auf Grid-Zeile | `presenter.rowSelected()` → `isUserInRole("admin")` = false → keine Aktion, kein Formular öffnet sich |
| Filter bleibt aktiv bei Navigation weg und zurück | Filter-State ist in `ProductDataProvider` (Session-Scope) gespeichert; beim Zurücknavigieren ist der Filter noch aktiv |
