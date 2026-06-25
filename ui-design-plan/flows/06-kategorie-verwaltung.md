# Workflow 06: Kategorie-Verwaltung (Admin)

## Vorbedingungen

- Benutzer ist als **Admin** angemeldet
- Admin-Route `"admin"` ist in der Session-Scope-Route-Registry registriert (geschieht automatisch beim Admin-Login)
- "Hallinta"-Menüeintrag ist in der Sidebar sichtbar

---

## Workflow 6a: Admin-View öffnen

**Ausgangszustand:** Benutzer ist auf Inventory- oder einer anderen View.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt auf "Hallinta" (Admin) in der Sidebar | Navigation zu `/admin` | — |
| 2 | Admin-View rendert | Überschrift "Hallinta", Unterüberschrift "Muokkaa kategorioita" (Edit categories), Button "Lisää kategoria" (Add category), Liste aller bestehenden Kategorien (jede mit Textfeld + Löschen-Icon) | `admin/admin--default.png` |
| 3 | Kategorien werden geladen | `DataService.getAllCategories()` beim Initialisieren der View | — |

**Endzustand:** Admin-View mit vollständiger Kategorieliste.

---

## Workflow 6b: Neue Kategorie anlegen

**Ausgangszustand:** Admin-View aktiv, Kategorieliste sichtbar.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt "Lisää kategoria" (Add category) | `newCategoryButton.setDisableOnClick(true)` → Button wird deaktiviert; neue leere `Category()` wird zu DataProvider hinzugefügt; `dataProvider.refreshAll()` | — |
| 2 | Neue leere Eingabezeile erscheint am Ende der Liste | Textfeld erhält automatisch Fokus (`nameField.focus()` wenn `category.getId() < 0`); Löschen-Button der neuen Zeile ist **disabled** (id <= 0) | `admin/admin--add-category.png` |
| 3 | Benutzer tippt Kategoriename (min. 2 Zeichen) | `binder.addValueChangeListener` → `binder.isValid()` prüft `@Size(min=2)` | — |
| 4 | Gültiger Name eingegeben (>= 2 Zeichen) | `binder.isValid()` = true → `dataService.updateCategory(category)` → Löschen-Button der neuen Zeile wird aktiviert; `newCategoryButton.setEnabled(true)` (Button wieder klickbar) → Toast "Kategorie gespeichert" | — |
| 5 | Kategorie ist gespeichert | Liste bleibt angezeigt, neuer Eintrag dauerhaft in Backend | — |

**Auto-Save-Verhalten:** Es gibt keinen expliziten Speichern-Button. Die Kategorie wird automatisch gespeichert, sobald der Name valide ist (>= 2 Zeichen). Jede weitere Zeichenänderung löst erneut einen `updateCategory`-Aufruf aus.

**Endzustand:** Neue Kategorie in der Liste, Backend aktualisiert, "Lisää kategoria"-Button wieder aktiv.

---

## Workflow 6c: Kategoriename bearbeiten (bestehende Kategorie)

**Ausgangszustand:** Admin-View, bestehende Kategorie in der Liste.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt in das Textfeld einer bestehenden Kategorie | Feld erhält Fokus | — |
| 2 | Benutzer ändert den Namen | `binder.addValueChangeListener` → bei jeder Änderung | — |
| 3a | Neuer Name >= 2 Zeichen | `binder.isValid()` = true → `dataService.updateCategory(category)` → Toast "Kategorie gespeichert" | — |
| 3b | Neuer Name < 2 Zeichen | `binder.isValid()` = false → kein Backend-Aufruf, kein Save | — |

**Endzustand:** Kategorie mit neuem Namen gespeichert (bei valider Eingabe).

---

## Workflow 6d: Kategorie löschen

**Ausgangszustand:** Admin-View, bestehende Kategorie in der Liste (id > 0, Löschen-Button aktiviert).

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt Löschen-Icon (Minus-Kreis-Button) einer Kategoriezeile | `deleteButton.addClickListener` → `dataService.deleteCategory(category.getId())` | `admin/admin--default.png` |
| 2 | Kategorie wird aus DataProvider entfernt | `dataProvider.getItems().remove(category)` → `dataProvider.refreshAll()` | — |
| 3 | Toast erscheint | "Kategorie gelöscht" | — |
| 4 | Zeile verschwindet aus der Liste | Liste aktualisiert sich sofort | — |

**Kein Bestätigungsdialog:** Das Löschen einer Kategorie erfolgt ohne vorherigen Bestätigungsdialog — unmittelbare Wirkung.

**Endzustand:** Kategorie dauerhaft gelöscht, aus der Liste entfernt.

---

## Bedingte Sichtbarkeit und Berechtigungen

| Element | Bedingung |
|---------|-----------|
| "Hallinta"-Menüpunkt | Nur sichtbar nach Admin-Login (dynamische Route-Registrierung) |
| Gesamte Admin-View | Nur für Session mit Admin-Route; Zugriff ohne Admin-Session → nicht-existente Route → Error-Toast |
| Löschen-Button (neue Kategorie) | Disabled bis Kategorie erstmals gespeichert wurde (id > 0) |
| "Lisää kategoria"-Button | Disabled nach Klick bis neue Kategorie gültig gespeichert ist (verhindert Doppel-Anlage) |

---

## Fehlerpfade

| Situation | Verhalten |
|-----------|-----------|
| Kategoriename < 2 Zeichen | Kein Backend-Aufruf, kein Save; kein expliziter Fehlerzustand in der UI dokumentiert (Binder markiert Feld als invalid) |
| Kategorielöschen, wenn Produkte diese Kategorie verwenden | Backend entscheidet; kein expliziter UI-Fehlerdialog dokumentiert |
| Nicht-Admin-Benutzer navigiert direkt zu `/admin` | Route ist in Session-Scope nicht registriert → Fehlerbehandlung wie Route-nicht-gefunden |
