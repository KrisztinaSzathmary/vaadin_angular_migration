# Workflow 04: Bestehendes Produkt bearbeiten

## Vorbedingungen

- Benutzer ist als **Admin** angemeldet
- Inventory-View ist aktiv mit sichtbaren Produkten
- Grid-Zeilen sind klickbar (nur für Admins)

---

## Workflow 4a: Produkt bearbeiten — Happy Path

**Ausgangszustand:** Inventory-View, kein Produkt ausgewählt, Formular geschlossen.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt auf eine Zeile im Grid (z. B. "Beginners guide to ice hockey") | `grid.asSingleSelect().addValueChangeListener` → `presenter.rowSelected(product)` | — |
| 2 | Presenter prüft Admin-Rolle | `accessControl.isUserInRole("admin")` = true → `editProduct(product)` | — |
| 3 | Formular öffnet sich als Sidebar rechts | Alle Felder mit Produktdaten befüllt: Produktname, Preis, Lagerbestand, Verfügbarkeit (Ampel), Kategorien; Löschen-Button sichtbar (ist kein neues Produkt); Speichern und Verwerfen disabled (kein Dirty-State) | `inventory/inventory--row-selected.png` |
| 4 | URL-Fragment wird aktualisiert | Browser-URL: `/inventory/{id}` (Produkt-ID im Fragment) | — |
| 5 | Benutzer ändert den Produktnamen | Feld bekommt CSS-Klasse `"dirty"`; Binder erkennt Änderung | `product-form/product-form--edit-mode.png` |
| 6 | Dirty-State aktiv | `handleBinderStatusChange()` → `discard.setEnabled(true)`; `save.setEnabled(true)` wenn auch valide | — |
| 7 | Benutzer klickt "Tallenna" (Save) | `saveButtonClicked()` → `binder.writeBeanIfValid(currentProduct)` → `presenter.saveProduct(currentProduct)` | — |
| 8 | Speichervorgang | `dataProvider.save(product)` → `DataService.updateProduct(product)` | — |
| 9 | Erfolgsmeldung | Toast "Aktualisiert: [Produktname]" (`getTranslation("updated", productName)`) | — |
| 10 | Formular schließt sich | `view.clearSelection()` → Formular-Sidebar schließt, Grid-Auswahl aufgehoben | — |
| 11 | Grid zeigt aktualisierte Daten | Grid scrollt zum aktualisierten Eintrag | — |

**Endzustand:** Änderungen gespeichert, Formular geschlossen, Grid zeigt aktualisierte Daten.

---

## Workflow 4b: Änderungen verwerfen (Discard)

**Ausgangszustand:** Bestehendes Produkt im Formular geladen, Änderungen vorgenommen (Dirty-State).

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt "Hylkää" (Discard) | `presenter.editProduct(currentProduct)` → Originalwerte aus dem Backend-Objekt werden neu geladen | — |
| 2 | `hasChanges = false` | Felder werden mit ursprünglichen Werten befüllt; `"dirty"`-CSS-Klasse entfernt | — |
| 3 | Speichern und Verwerfen wieder disabled | Binder-Status: keine Änderungen mehr | — |

**Endzustand:** Formular zeigt wieder die ursprünglichen Produktdaten. Keine Speicherung erfolgt.

---

## Workflow 4c: Abbruch bei Dirty-State (Cancel)

**Ausgangszustand:** Bestehendes Produkt geladen, Änderungen vorgenommen.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt "Peruuta" (Cancel) | `cancelProduct()`: `hasChanges == true` → `confirmDiscard()` | — |
| 2 | Bestätigungsdialog erscheint | Header: "Änderungen verwerfen?", Buttons: "Hylkää" + "Peruuta" | — |
| 3a | Benutzer bestätigt mit "Hylkää" | `presenter.cancelProduct()` → `view.clearSelection()` → Formular schließt sich ohne Speichern | — |
| 3b | Benutzer bricht ab mit "Peruuta" | Dialog schließt, Formular bleibt offen | — |

---

## Workflow 4d: Dialog-Schließen (X-Button) bei Dirty-State

**Ausgangszustand:** Bestehendes Produkt geladen, Änderungen vorgenommen.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt X-Button des Dialogs | `addDialogCloseActionListener` → `binder.hasChanges()` = true → `confirmDiscard(() -> close())` | — |
| 2 | Bestätigungsdialog erscheint | Wie in 4c | — |
| 3a | Benutzer bestätigt | Dialog schließt sich, Formular schließt sich | — |
| 3b | Benutzer bricht ab | Formular bleibt offen | — |

---

## Workflow 4e: Navigation von aktiver Bearbeitung weg (BeforeLeave-Guard)

**Ausgangszustand:** Formular mit Änderungen offen (Dirty-State).

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt auf Navigationslink (z. B. "Tietoja" / About) in der Sidebar | `BeforeLeaveEvent` → `form.getCurrentProduct() != null && form.hasChanges()` → `event.postpone()` | — |
| 2 | Navigation wird pausiert | Bestätigungsdialog erscheint ("Ungespeicherte Änderungen?") | — |
| 3a | Benutzer bestätigt Verwerfen | `action.proceed()` → Navigation wird fortgesetzt → About-View öffnet sich | — |
| 3b | Benutzer bricht ab | Dialog schließt, Benutzer bleibt auf Inventory mit offenen Änderungen | — |

---

## Workflow 4f: Zwischen Produkten wechseln bei Dirty-State

**Ausgangszustand:** Produkt A im Formular geladen, Änderungen vorgenommen.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt eine andere Grid-Zeile (Produkt B) | `presenter.rowSelected(productB)` → `editProduct(productB)` wird vorbereitet, aber Dirty-State-Prüfung — Hinweis: laut Quellcode prüft `rowSelected()` Dirty nicht explizit; der BeforeLeave-Guard ist auf View-Ebene | — |
| 2 | Formular lädt Produkt B | Bisherige Änderungen an Produkt A gehen verloren (kein automatischer Dialog bei Grid-Klick — nur bei Navigation weg von der View) | — |

**Hinweis:** Der Dirty-State-Guard greift nur beim Verlassen der gesamten Inventory-View (BeforeLeave), nicht beim Wechsel zwischen Produkten innerhalb der View. Beim Klick auf eine andere Grid-Zeile werden ungespeicherte Änderungen stillschweigend verworfen.
