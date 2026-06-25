# Workflow 03: Neues Produkt anlegen

## Vorbedingungen

- Benutzer ist als **Admin** angemeldet (Rolle `"admin"`)
- Inventory-View ist aktiv
- "Uusi tuote"-Button (New Product) ist aktiviert
- Kategorien sind bereits geladen (via `DataService.getAllCategories()`)

---

## Workflow 3a: Neues Produkt anlegen — Happy Path

**Ausgangszustand:** Inventory-View, kein Produkt ausgewählt, Formular geschlossen.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt "Uusi tuote" (New Product) | `presenter.newProduct()` → `view.clearSelection()` + `view.editProduct(new Product())` | — |
| 2 | Formular öffnet sich als Sidebar rechts | Leeres Formular: Produktname (leer, required), Preis (leer), Lagerbestand (leer), Verfügbarkeit (Dropdown, Default: erster Enum-Wert = "COMING"), Kategorien (leer); Buttons: kein Löschen-Button (ist neues Produkt), Verwerfen disabled, Abbrechen aktiv, Speichern disabled | `product-form/product-form--new-empty.png` |
| 3 | URL-Fragment wird aktualisiert | Browser-URL ändert sich auf `/inventory/new` (setFragmentParameter) | — |
| 4 | Benutzer gibt Produktname ein (z. B. "Testbuch") | Feld `productName` bekommt Wert; Dirty-Check: CSS-Klasse `"dirty"` wird auf Feld gesetzt; Binder-Status ändert sich | `product-form/product-form--name-filled.png` |
| 5 | Benutzer gibt Preis ein (z. B. `29.99`) | `price`-Feld mit Suffix "€"; `PriceConverter` prüft auf gültigen `BigDecimal` | `product-form/product-form--partially-filled.png` |
| 6 | Benutzer setzt Lagerbestand (z. B. `10`) | `StockCountConverter` prüft auf gültigen Integer | — |
| 7 | Benutzer wählt Verfügbarkeit "AVAILABLE" aus Dropdown | Ampel-Icon aktualisiert sich; Kreuzvalidierung: `AVAILABLE` erfordert `stockCount > 0` — bei `stockCount = 10` valide | — |
| 8 | Benutzer wählt mindestens eine Kategorie aus dem Multi-Select | Kategorie(n) ausgewählt | — |
| 9 | Formular ist valide (alle Pflichtfelder ausgefüllt, Kreuzvalidierung OK) | Binder-`StatusChangeEvent` → `save.setEnabled(true)`, `discard.setEnabled(true)` | — |
| 10 | Benutzer klickt "Tallenna" (Save) | `saveButtonClicked()` → `binder.writeBeanIfValid(currentProduct)` → `presenter.saveProduct(product)` | — |
| 11 | Speichervorgang | `presenter.saveProduct()` → `view.updateProduct(product)` → `dataProvider.save(product)` → `DataService.updateProduct(product)` | — |
| 12 | Erfolgsmeldung | Toast "Erstellt: Testbuch" (`Notification.show(getTranslation("created", productName))`) | — |
| 13 | Formular schließt sich | `view.clearSelection()` → Formular-Sidebar schließt, Grid-Auswahl aufgehoben, URL-Fragment geleert | — |
| 14 | Grid aktualisiert sich | Neues Produkt erscheint im Grid; Grid scrollt zum neuen Eintrag | `inventory/inventory--default.png` |

**Endzustand:** Neues Produkt ist gespeichert und im Grid sichtbar. Formular geschlossen. URL wieder `/inventory`.

---

## Workflow 3b: Neues Produkt anlegen — Abbruch

**Ausgangszustand:** Neues leeres Formular offen (Schritt 2 aus 3a).

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt "Peruuta" (Cancel) ohne Eingaben | Kein Dirty-State → `cancelProduct()` → `presenter.cancelProduct()` → `view.clearSelection()` | — |
| 2 | Formular schließt sich | Grid-Auswahl aufgehoben, URL-Fragment geleert | — |

---

## Workflow 3c: Neues Produkt anlegen — Abbruch bei Dirty-State

**Ausgangszustand:** Neues Formular offen, Benutzer hat Produktname eingegeben (Dirty-State aktiv).

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt "Peruuta" (Cancel) | `cancelProduct()`: `hasChanges == true` → `confirmDiscard()` wird aufgerufen | — |
| 2 | Bestätigungsdialog erscheint | Header: "Änderungen verwerfen?", Text: "Es gibt ungespeicherte Änderungen", Buttons: "Hylkää" (Discard, warning) + "Peruuta" (Cancel) | — |
| 3a | Benutzer klickt "Hylkää" (Discard) | `hasChanges = false` → `presenter.cancelProduct()` → Formular schließt sich | — |
| 3b | Benutzer klickt "Peruuta" (Cancel im Dialog) | Dialog schließt sich, Formular bleibt offen mit unverändertem Stand | — |

---

## Workflow 3d: Validierungsfehler beim Speichern

**Ausgangszustand:** Formular für neues Produkt offen, Benutzer hat Werte eingegeben.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer gibt Preis als Text ein (z. B. `abc`) | `PriceConverter` schlägt fehl → Feld zeigt Fehlermeldung ("Kann nicht konvertiert werden") | — |
| 2 | Speichern-Button bleibt disabled | `binder.hasValidationErrors()` → `save.setEnabled(false)` | — |
| 3 | Benutzer gibt `stockCount = 5` und `availability = DISCONTINUED` ein | Kreuzvalidierung: `DISCONTINUED` erfordert `stockCount == 0` → schlägt fehl | — |
| 4 | Benutzer klickt "Tallenna" | `saveButtonClicked()` → `binder.writeBeanIfValid()` → false (Kreuzvalidierungsfehler) → `flagStockCountAndAvailabilityInvalid()` | — |
| 5 | Fehlerzustand auf Feldern | `stockCount` und `availability` werden als invalid markiert mit Fehlermeldung "Verfügbarkeit/Lagerbestand stimmen nicht überein" | — |

---

## Validierungsregeln (Zusammenfassung)

| Feld | Regel |
|------|-------|
| Produktname | Pflichtfeld, min. 2 Zeichen (`@NotBlank`, `@Size(min=2)`) |
| Preis | Muss gültiger Dezimalwert sein, >= 0 (`@Min(0)`) |
| Lagerbestand | Muss gültiger Integer sein, >= 0 (`@Min(0)`) |
| Verfügbarkeit | Pflichtfeld (`@NotNull`) |
| Kreuzvalidierung | AVAILABLE → stockCount > 0; DISCONTINUED oder COMING → stockCount == 0 |

**Speichern-Button:** Wird nur aktiviert, wenn `hasChanges == true` UND alle Validierungen bestanden.
