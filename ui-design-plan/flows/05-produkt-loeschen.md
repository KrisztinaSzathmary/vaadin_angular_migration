# Workflow 05: Produkt löschen

## Vorbedingungen

- Benutzer ist als **Admin** angemeldet
- Ein bestehendes Produkt (id != -1) ist im Formular geladen
- Der "Poista"-Button (Delete) ist sichtbar (nur bei bestehenden Produkten)

---

## Workflow 5a: Produkt löschen — Bestätigung

**Ausgangszustand:** Bestehendes Produkt im Formular-Sidebar geladen.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt "Poista" (Delete, roter Button links unten) | `ProductForm.delete.addClickListener` → `presenter.deleteProduct(currentProduct)` | `inventory/inventory--row-selected.png` |
| 2 | `presenter.deleteProduct()` | → `view.removeProduct(product)` | — |
| 3 | Bestätigungsdialog erscheint | `ConfirmDialog` mit Header i18n `"confirm"`, Text i18n `"will-delete"` (Produktname als Parameter), Cancel-Button, Bestätigen-Button (warning-Stil) mit Text i18n `"delete"` | — |
| 4 | Benutzer klickt Bestätigen-Button | `confirm.addConfirmListener` → `form.clearProduct()` → `dataProvider.delete(product)` → `DataService.deleteProduct(product.id)` → `showNotification(getTranslation("removed", productName))` | — |
| 5 | Toast-Benachrichtigung erscheint | "Entfernt: [Produktname]" | — |
| 6 | Grid aktualisiert sich | Gelöschtes Produkt ist nicht mehr im Grid sichtbar | — |
| 7 | Formular schließt sich | `presenter.clearSelection()` → `form.clearProduct()`, Grid-Selektion aufgehoben | — |

**Endzustand:** Produkt ist dauerhaft gelöscht, nicht mehr im Grid sichtbar, Formular geschlossen.

---

## Workflow 5b: Löschvorgang abbrechen

**Ausgangszustand:** Bestätigungsdialog offen (Schritt 3 aus 5a).

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt Cancel im Bestätigungsdialog | `confirm.addCancelListener` → `editProduct(product)` — Formular wird erneut mit dem Produkt befüllt | — |
| 2 | Formular zeigt Produkt wieder | Keine Änderung, Produkt bleibt im Backend erhalten | — |

**Endzustand:** Produkt unverändert, Formular zeigt das Produkt weiterhin an.

---

## Bedingte Sichtbarkeit des Löschen-Buttons

Der "Poista"-Button ist **nur** sichtbar, wenn `!product.isNewProduct()` (d. h. `product.id != -1`). Bei einem neuen, noch nicht gespeicherten Produkt wird der Button ausgeblendet (`delete.setVisible(false)`).

**Quelldatei:** `ProductForm.java:324` → `delete.setVisible(!product.isNewProduct())`

---

## Fehlerpfade

| Situation | Verhalten |
|-----------|-----------|
| Backend-Fehler beim Löschen | Nicht explizit behandelt in der UI; serverseitige Exception würde auf dem Server geloggt; Grid-Stand ist möglicherweise inkonsistent |
| Produkt hat Abhängigkeiten im Backend | Backend entscheidet; kein expliziter UI-Fehlerdialog dokumentiert |
| Löschen eines neuen (noch nicht gespeicherten) Produkts | Nicht möglich — Delete-Button ist ausgeblendet |
