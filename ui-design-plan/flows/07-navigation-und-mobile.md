# Workflow 07: Navigation zwischen Views und mobile Nutzung

## Vorbedingungen

- Benutzer ist angemeldet
- MainLayout ist aktiv (Sidebar-Navigation sichtbar)

---

## Workflow 7a: Navigation zwischen Views (Desktop)

**Ausgangszustand:** Benutzer befindet sich auf einer beliebigen authentifizierten View.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt "Valikoima" (Inventory) in der Sidebar | Vaadin-Router navigiert zu `/inventory`; Inventory-View lädt | `main-layout/main-layout--desktop.png` |
| 2 | Benutzer klickt "Tietoja" (About) in der Sidebar | Router navigiert zu `/about`; About-View zeigt "Bookstore"-Titel und Versionsinfo | `about/about--default.png` |
| 3 | Benutzer klickt "Hallinta" (Admin, nur für Admins) in der Sidebar | Router navigiert zu `/admin`; Admin-View zeigt Kategorienverwaltung | `admin/admin--default.png` |

**Aktiver Zustand:** Das aktuell aktive Menüelement wird durch `SideNav` automatisch hervorgehoben (basierend auf der aktuellen Route).

---

## Workflow 7b: Navigationsguard bei ungespeicherten Änderungen

**Ausgangszustand:** Benutzer hat im Produktformular Änderungen vorgenommen (Dirty-State), befindet sich auf Inventory-View.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt auf anderen Menüeintrag (z. B. "Tietoja") | `BeforeLeaveObserver.beforeLeave()` → `form.getCurrentProduct() != null && form.hasChanges()` → `event.postpone()` | — |
| 2 | Navigation pausiert | Bestätigungsdialog für ungespeicherte Änderungen erscheint | — |
| 3a | Benutzer bestätigt "Hylkää" | Navigation wird fortgesetzt (`action.proceed()`), Ziel-View öffnet sich | — |
| 3b | Benutzer bricht ab | Benutzer bleibt auf Inventory mit Formular und Änderungen | — |

---

## Workflow 7c: Unbekannte Route (404)

**Ausgangszustand:** Benutzer ist angemeldet. Browser navigiert zu einer nicht existierenden URL.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer navigiert zu `/diese-seite-gibt-es-nicht` | Vaadin-Router: keine Route gefunden → `NotFoundException` | — |
| 2 | ErrorView wird ausgelöst | Laut Screenshot: App bleibt auf Inventory-View, ein Toast/Hinweis auf dem Grid-Bereich zeigt an, dass die Route nicht existiert | `error/error--404.png` |
| 3 | Kein separater 404-Screen | `ErrorView` mit `@ParentLayout(MainLayout.class)` würde eigentlich Fehler im MainLayout zeigen, aber das Verhalten in der laufenden App ist laut Manifest ein Toast statt eines dedizierten Error-Screens | `error/error--404.png` |

**Hinweis aus Manifest:** "Bei unbekannter Route wird kein dedizierter Error-Screen gezeigt — die App verbleibt auf Inventory und zeigt eine Toast-Benachrichtigung." Das tatsächliche Laufzeitverhalten weicht von der theoretischen `ErrorView`-Implementierung ab.

---

## Workflow 7d: Mobile Nutzung — Hamburger-Menü öffnen

**Ausgangszustand:** Anwendung auf mobilem Viewport (< 390px), Menü-Sidebar ausgeblendet.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Mobiler Viewport aktiv | Nur Header-Leiste sichtbar: "Valikko"-Button (Hamburger), Logo/App-Titel, "Kirjaudu ulos"-Button (Logout) | `main-layout/main-layout--mobile-closed.png` |
| 2 | Benutzer tippt auf "Valikko" (Menü) | `showMenu.addClickListener` → CSS-Klasse `"show-tabs"` wird auf `sideNav` togglet | — |
| 3 | Navigations-Dropdown öffnet sich | Menüeinträge erscheinen: "Valikoima" (Inventory), "Tietoja" (About), ggf. "Hallinta" (Admin für Admins) | `main-layout/main-layout--mobile-menu-open.png` |
| 4 | Benutzer tippt auf einen Menüeintrag | Navigation zur gewählten View; Menü schließt sich | — |
| 5 | Benutzer tippt erneut auf "Valikko" | CSS-Klasse wird wieder entfernt → Menü schließt sich | — |

---

## Workflow 7e: Mobile Nutzung — Inventory und Formular

**Ausgangszustand:** Inventory-View auf mobilem Viewport.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Inventory-View auf Mobile | Grid mit Produktspalten (möglicherweise reduziert/gestapelt durch responsives Layout) | `inventory/inventory--mobile.png` |
| 2 | Admin klickt auf Grid-Zeile | Formular-Sidebar öffnet sich (als Dialog/vollflächige Überlagerung auf Mobile) | — |
| 3 | Benutzer navigiert zurück | Cancel-Button oder Sidebar schließt sich | — |

---

## Workflow 7f: Mobile Nutzung — Login

**Ausgangszustand:** Login-View auf mobilem Viewport (390px).

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Login-View auf Mobile | Gestapeltes Layout: Info-Spalte oberhalb des Login-Formulars (statt nebeneinander) | `login/login--mobile.png` |
| 2 | Login-Ablauf | Identisch zu Desktop-Login-Workflow (1a–1d) | — |

---

## Workflow 7g: Mobile Nutzung — Admin-View

**Ausgangszustand:** Admin-View auf mobilem Viewport.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Admin-View auf Mobile | Kategorienliste vertikal gestapelt; "Lisää kategoria"-Button und Listenzeilen passen sich an die Breite an | `admin/admin--mobile.png` |
| 2 | Interaktion | Identisch zu Desktop-Admin-Workflow (6b–6d) | — |

---

## View-Navigationskarte

```
[Login-View] (/Login)
     |
     | (erfolgreich angemeldet)
     v
[Inventory-View] (/inventory, /)  <---+
     |                                |
     | Sidebar: "Tietoja"             | Sidebar: "Valikoima"
     v                                |
[About-View] (/about)  --------------+
     |                                |
     | Sidebar: "Hallinta" (Admin)    | Sidebar: "Valikoima"
     v                                |
[Admin-View] (/admin)  --------------+
     |
     | Logout
     v
[Login-View] (/Login)

[Fehlerbehandlung]
     |
     | Unbekannte Route → Toast auf Inventory (laut Laufzeitverhalten)
     v
[Inventory-View mit Toast]
```

---

## Routentabelle

| Route | View-Klasse | Layout | Zugriff |
|-------|-------------|--------|---------|
| `/Login` | `LoginView` | — (eigenständig) | Jeder (unauthentifiziert) |
| `/inventory` | `SampleCrudViewImpl` | `MainLayout` | Alle angemeldeten Benutzer |
| `/` | `SampleCrudViewImpl` | `MainLayout` | Alle angemeldeten Benutzer (RouteAlias) |
| `/inventory/{id}` | `SampleCrudViewImpl` | `MainLayout` | Alle angemeldeten Benutzer (Formular öffnet Produkt mit ID) |
| `/inventory/new` | `SampleCrudViewImpl` | `MainLayout` | Admin (Formular für neues Produkt) |
| `/about` | `AboutView` | `MainLayout` | Alle angemeldeten Benutzer |
| `/admin` | `AdminView` | `MainLayout` | Admin (dynamisch registriert) |
| `/**` (unbekannt) | `ErrorView` | `MainLayout` | Alle angemeldeten Benutzer → Toast-Hinweis |

**Global-Guard:** `BookstoreBeforeEnterListener` leitet alle nicht angemeldeten Benutzer auf `/Login` um — für jede Route außer `/Login` selbst.
