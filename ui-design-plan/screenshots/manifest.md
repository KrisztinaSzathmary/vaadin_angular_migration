# UI Screenshot Manifest

**Aufgenommen:** 2026-06-25 UTC

**Basis-URL:** `http://localhost:8080/bookstore-starter-flow-ui-1.1-SNAPSHOT`

**App-Sprache:** Finnisch (Vaadin-Starter-Default). Wichtige Begriffe: Kirjakauppa = Bookstore, Valikoima = Inventory, Tietoja = About, Hallinta = Admin, Kirjaudu = Login, Kirjaudu ulos = Logout, Uusi tuote = New product, Tallenna = Save, Peruuta = Cancel, Hylkää = Discard, Poista = Delete.

**Technischer Hinweis:** Vaadin-Dev-Tools-Panel wurde per CSS ausgeblendet (pointer-events-Konflikt im Headless-Browser). Klicks auf interaktive Elemente erfolgten mit `force: true` oder via JavaScript-Events. Alle Screenshots zeigen den production-nahen Zustand ohne Dev-Tools-Overlay.

---

## login

**URL/Route:** `http://localhost:8080/bookstore-starter-flow-ui-1.1-SNAPSHOT/Login`

**Java-Klasse:** `LoginView.java` — `@Route("Login")`. Verwendet `vaadin-login-form` (Web Component). Layout: linke blaue Info-Spalte mit Test-Credential-Hinweis, rechts Login-Formular (Käyttäjänimi / Salasana). Submit-Button: "Kirjaudu". Link "Salasana unohtui" (Forgot password).

| Screenshot | Beschreibung |
|---|---|
| `login/login--default.png` | Login-Formular im Grundzustand — Felder leer, kein Fehler |
| `login/login--filled.png` | Login-Formular mit ausgefüllten Feldern (admin/admin) vor dem Absenden |
| `login/login--empty-submit.png` | Login-Formular nach Abschicken ohne Eingabe — Required-Markierung sichtbar |
| `login/login--wrong-credentials.png` | Login-Formular mit rotem Fehler-Banner nach falschen Zugangsdaten |
| `login/login--mobile.png` | Login-Ansicht im mobilen Viewport (390px Breite) |

---

## inventory

**URL/Route:** `http://localhost:8080/bookstore-starter-flow-ui-1.1-SNAPSHOT/inventory` (auch Root `/`)

**Java-Klasse:** `SampleCrudViewImpl.java` — `@Route("inventory")` + `@RouteAlias("")`. Layout: Links Sidebar-Navigation, oben Suchleiste ("Hae nimellä, saatavuudella tai kategorialla") + Button "Uusi tuote". Mitte: Produktgrid mit Spalten Tuotteen nimi / Hinta / Saatavuus (farbige Punkt-Indikatoren) / Varastossa / Kategoria. Rechts: Produktformular-Sidebar (öffnet bei Zeilenklick oder "Uusi tuote").

| Screenshot | Beschreibung |
|---|---|
| `inventory/inventory--default.png` | Inventar-View mit vollem Produktgrid im Grundzustand (keine Auswahl) |
| `inventory/inventory--filtered-java.png` | Produktgrid gefiltert nach Suchbegriff "Java" — nur passende Titel sichtbar |
| `inventory/inventory--empty-grid.png` | Produktgrid ohne Ergebnisse nach nicht-trefferdem Suchfilter |
| `inventory/inventory--row-selected.png` | Erste Zeile (Beginners guide to ice hockey) ausgewählt — Produktformular-Sidebar rechts mit Feldern und Buttons Poista/Hylkää/Peruuta/Tallenna |
| `inventory/inventory--mobile.png` | Inventar-View im mobilen Viewport (390px) |

---

## product-form

**URL/Route:** `http://localhost:8080/bookstore-starter-flow-ui-1.1-SNAPSHOT/inventory` (Sidebar innerhalb der Inventory-View)

**Java-Klasse:** `ProductForm.java` — rendert als rechtsbündige Sidebar (kein separates Fenster/Dialog). Felder: Tuotteen nimi (required, Text), Hinta (Preis, Dezimalzahl), Varastossa (Lagerbestand, Integer), Saatavuus (Select: Tulossa=Coming/Saatavilla=Available/Loppunut=Out of stock), Kategoriat (Multi-Select Checkbox). Buttons: Poista (rot, nur bei bestehendem Produkt), Hylkää (Discard, nur bei Dirty-State aktiv), Peruuta (Cancel, für neue Produkte), Tallenna (Save, nur bei valider Eingabe aktiv).

| Screenshot | Beschreibung |
|---|---|
| `product-form/product-form--new-empty.png` | Leeres Produktformular-Sidebar für neues Produkt (Tallenna deaktiviert, Saatavuus-Default: Tulossa) |
| `product-form/product-form--name-filled.png` | Produktformular nach JS-Eintrag des Produktnamens — weiteres Pflichtfeld noch leer |
| `product-form/product-form--partially-filled.png` | Produktformular mit Name und Preis ausgefüllt (JS-Eintrag) |
| `product-form/product-form--existing-product.png` | Produktformular-Sidebar mit Daten des ersten Produkts im Grundzustand |
| `product-form/product-form--existing-sidebar.png` | Vollbild: Inventory-Grid + Produktformular-Sidebar für bestehendes Produkt parallel sichtbar |
| `product-form/product-form--edit-mode.png` | Produktformular im Bearbeitungsmodus (Name via JS modifiziert) |
| `product-form/product-form--existing-fullpage.png` | Produktformular-Sidebar vollständige Seite (früherer Lauf, Grid ohne sichtbare Auswahl) |
| `product-form/product-form--existing-product-scrolled.png` | Produktformular-Sidebar nach unten gescrollt (früherer Lauf) |

---

## about

**URL/Route:** `http://localhost:8080/bookstore-starter-flow-ui-1.1-SNAPSHOT/about`

**Java-Klasse:** `AboutView.java` — `@Route("about", layout = MainLayout.class)`. Einfache Infoseite mit zentriertem "Bookstore"-Titel und Text "Tämä sovellus on tehty Vaadin Flow versiolla 24.3.10." Keine interaktiven Elemente außer der Sidebar-Navigation.

| Screenshot | Beschreibung |
|---|---|
| `about/about--default.png` | About-View im Grundzustand (Desktop 1280px) |
| `about/about--mobile.png` | About-View im mobilen Viewport (390px) |

---

## admin

**URL/Route:** `http://localhost:8080/bookstore-starter-flow-ui-1.1-SNAPSHOT/admin`

**Java-Klasse:** `AdminView.java` — `@RouteScoped` + `@RouteScopeOwner(MainLayout.class)`. Navigationspunkt "Hallinta" im Sidebar-Menü (als `<a href="admin">`). Zeigt Kategorienverwaltung: Titel "Hallinta / Muokkaa kategorioita". Kategorieliste mit Minus-Icon-Button zum Löschen. Button "Lisää kategoria" (Add category) oben — fügt neue leere Zeile hinzu.

| Screenshot | Beschreibung |
|---|---|
| `admin/admin--default.png` | Admin-View (Hallinta) im Grundzustand — vollständige Kategorieliste (8 Kategorien) |
| `admin/admin--add-category.png` | Admin-View nach Klick auf "Lisää kategoria" — neue leere Eingabezeile am Ende der Liste sichtbar |
| `admin/admin--mobile.png` | Admin-View im mobilen Viewport (390px) |

---

## main-layout

**URL/Route:** `http://localhost:8080/bookstore-starter-flow-ui-1.1-SNAPSHOT/inventory`

**Java-Klasse:** `MainLayout.java` — `vaadin-app-layout`. Sidebar-Navigation links: App-Logo "Kirjakauppa" (Bookstore-Icon + Text) oben, darunter: Valikoima (Inventory-Icon), Tietoja (Info-Icon), Hallinta (Person-Icon). Ganz unten: "Kirjaudu ulos" (Logout-Icon + Text). Mobil: "Valikko"-Button (Hamburger-Äquivalent) öffnet Dropdown-Menü.

| Screenshot | Beschreibung |
|---|---|
| `main-layout/main-layout--desktop.png` | Vollständiges Hauptlayout Desktop (1280px) mit Sidebar-Navigation und Produktgrid |
| `main-layout/main-layout--mobile-closed.png` | Hauptlayout mobiler Viewport (390px) — nur Header-Leiste mit Valikko/Logo/Kirjaudu-ulos sichtbar |
| `main-layout/main-layout--mobile-menu-open.png` | Hauptlayout mobiler Viewport — Navigations-Dropdown nach Valikko-Klick geöffnet (Valikoima/Tietoja/Hallinta) |

---

## error

**URL/Route:** `http://localhost:8080/bookstore-starter-flow-ui-1.1-SNAPSHOT/this-route-does-not-exist-404`

**Java-Klasse:** `ErrorView.java`. Verhalten: Bei unbekannter Route wird kein dedizierter Error-Screen gezeigt — die App verbleibt auf Inventory und zeigt eine Toast-Benachrichtigung im Grid-Bereich ("Route does not exist" o.ä.). Kein eigenständiger 404-Screen.

| Screenshot | Beschreibung |
|---|---|
| `error/error--404.png` | Reaktion auf unbekannte Route — Toast-Hinweis im Inventory-Grid sichtbar, App bleibt auf Inventory |

---

## Offene Punkte

- **Vaadin-Dev-Tools-Overlay:** Die laufende Dev-Build-App enthält ein `vaadin-dev-tools` Panel, das Klick-Ziele überlagert. Screenshots wurden mit ausgeblendetem Panel aufgenommen. Im Production-Build entfällt dieses Element.
- **Produktformular-Validierung:** "Tallenna" (Save) ist per Vaadin-Binding nur aktiv, wenn alle required-Felder valide sind. Disabled-Zustand in `product-form--new-empty.png` dokumentiert; aktivierter Zustand in `inventory--row-selected.png` sichtbar (Tallenna grau = kein Dirty-State, Poista-Button nur bei bestehendem Produkt).
- **ErrorView:** Zeigt keinen dedizierten Error-Screen, sondern ein Toast-Overlay auf Inventory. Für die Angular-Migration ist zu klären, ob dies durch eine eigene Route ersetzt werden soll.
- **Authentifizierungspflichtige Views:** Alle Views außer Login erfordern eine gültige Session. Unauthenticated-Redirect via `BookstoreBeforeEnterListener.java` (Redirect auf `/Login`). Kein Screenshot des Unauthenticated-Redirect-Zustands aufgenommen (entspricht `login--default.png`).
