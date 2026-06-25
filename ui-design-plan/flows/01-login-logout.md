# Workflow 01: Login und Logout

## Vorbedingungen

- Anwendung läuft unter `http://localhost:8080/bookstore-starter-flow-ui-1.1-SNAPSHOT`
- Keine aktive Session (nicht angemeldet)
- Mock-Authentifizierung: Zugangsdaten sind valide, wenn `username == password`
  (z. B. `admin/admin` oder `user/user`); Admin-Rolle wird nur für den Benutzernamen
  `admin` gewährt (`BasicAccessControl.java`)

---

## Workflow 1a: Erfolgreicher Login als Admin

**Ausgangszustand:** Browser öffnet beliebige URL der App. Keine aktive Session.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Browser navigiert zu einer beliebigen Route (z. B. `/inventory`) | `BookstoreBeforeEnterListener` erkennt keine aktive Session → leitet automatisch auf `/Login` um | — |
| 2 | Login-View rendert | Linke Info-Spalte (blau) mit Hinweis auf Test-Credentials, rechts `vaadin-login-form` mit leerem Benutzername- und Passwortfeld, Submit-Button "Kirjaudu" (Login), Link "Salasana unohtui" (Forgot password) | `login/login--default.png` |
| 3 | Benutzer gibt `admin` in das Benutzernamefeld ein | Feld zeigt eingegebenen Text | `login/login--filled.png` |
| 4 | Benutzer gibt `admin` in das Passwortfeld ein | Feld zeigt Maskierung (Passwortfeld) | `login/login--filled.png` |
| 5 | Benutzer klickt "Kirjaudu" (Submit) | `login(LoginEvent)` wird ausgelöst → `accessControl.signIn("admin", "admin")` → `true` → `changeSessionId()` → `registerAdminViewIfApplicable()`: Admin-Route `"admin"` wird in Session-Scope registriert → `navigate("")` | — |
| 6 | Navigation zu `""` (RouteAlias) | Inventory-View lädt, MainLayout zeigt Sidebar-Navigation mit Menüeinträgen "Valikoima" (Inventory), "Tietoja" (About) **und** "Hallinta" (Admin) | `main-layout/main-layout--desktop.png` |
| 7 | Inventory-View ist aktiv | Produktgrid mit allen Produkten, Suchfeld, "Uusi tuote"-Button (New Product) ist aktiviert (Admin-Berechtigung) | `inventory/inventory--default.png` |

**Endzustand:** Benutzer ist als Admin angemeldet, befindet sich auf `/inventory`, Produktformular ist geschlossen, Admin-Menüeintrag ist sichtbar.

---

## Workflow 1b: Erfolgreicher Login als Nicht-Admin

**Ausgangszustand:** Wie 1a, aber Benutzername ist nicht `admin` (z. B. `user/user`).

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1–4 | Wie 1a, aber Benutzername `user`, Passwort `user` | — | — |
| 5 | Klick auf Submit | `signIn("user", "user")` → `true` → `registerAdminViewIfApplicable()`: `isUserInRole("admin")` ist `false` → Admin-Route wird **nicht** registriert → `navigate("")` | — |
| 6 | Inventory-View lädt | Sidebar **ohne** "Hallinta"-Eintrag; "Uusi tuote"-Button ist **deaktiviert** (Nicht-Admin) | — |
| 7 | Grid-Zeilenklick hat keine Wirkung | `presenter.rowSelected()` → `isUserInRole("admin")` = false → kein `editProduct()` | — |

**Endzustand:** Benutzer ist angemeldet, aber ohne Admin-Rechte. Inventory ist schreibgeschützt (kein Formular öffnet sich bei Klick).

---

## Workflow 1c: Fehlgeschlagener Login — falsche Zugangsdaten

**Ausgangszustand:** Login-View angezeigt.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer gibt `admin` als Benutzername ein, `falsch` als Passwort | Felder ausgefüllt | — |
| 2 | Klick auf Submit | `signIn("admin", "falsch")` → `false` → `loginForm.setError(true)` | — |
| 3 | Fehlermeldung erscheint | Roter Fehler-Banner im Login-Formular ("Falsche Zugangsdaten" o. ä.) | `login/login--wrong-credentials.png` |
| 4 | Benutzer bleibt auf Login-View | Keine Navigation, Felder bleiben befüllt | — |

**Endzustand:** Login-View mit sichtbarem Fehlerzustand. Benutzer kann Eingaben korrigieren und erneut versuchen.

---

## Workflow 1d: Login mit leeren Feldern

**Ausgangszustand:** Login-View angezeigt, Felder leer.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt Submit ohne Eingabe | `vaadin-login-form` markiert Pflichtfelder als ungültig; kein Backend-Aufruf | `login/login--empty-submit.png` |
| 2 | Required-Markierung sichtbar | Beide Felder zeigen Pflichtfeld-Hinweis | `login/login--empty-submit.png` |

**Endzustand:** Login-View, Fehlerzustand bei Leerfeldern, kein Backend-Aufruf erfolgte.

---

## Workflow 1e: "Passwort vergessen"-Klick

**Ausgangszustand:** Login-View angezeigt.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt "Salasana unohtui" (Forgot password) | `addForgotPasswordListener` → `Notification.show(getTranslation("hint"))` | — |
| 2 | Toast-Benachrichtigung erscheint | Kurze Info-Meldung (i18n-Key "hint"), keine Navigation, kein Backend-Aufruf | — |

**Endzustand:** Login-View unverändert, Toast verschwindet nach kurzer Zeit automatisch.

---

## Workflow 1f: Logout

**Vorbedingung:** Benutzer ist angemeldet, befindet sich auf einer beliebigen authentifizierten View.

| Schritt | Aktion | Erwartete Reaktion | Screenshot-Referenz |
|---------|--------|--------------------|---------------------|
| 1 | Benutzer klickt "Kirjaudu ulos" (Logout) in der Sidebar | `Menu.logoutButton` Click → `accessControl.signOut()` → `VaadinSession.getCurrent().invalidate()` → `UI.getCurrent().navigate("")` | `main-layout/main-layout--desktop.png` |
| 2 | Session wird ungültig | Alle Session-Scope-Routen (inkl. Admin) werden gelöscht | — |
| 3 | Navigation zu `""` | `BookstoreBeforeEnterListener`: keine aktive Session → Redirect auf `/Login` | — |
| 4 | Login-View erscheint | Leeres Login-Formular, kein Fehlerzustand | `login/login--default.png` |

**Endzustand:** Benutzer ist abgemeldet, Login-View wird angezeigt.

---

## Verzweigungen und Fehlerpfade

| Situation | Verhalten |
|-----------|-----------|
| Direktzugriff auf `/inventory` ohne Session | Automatischer Redirect auf `/Login` |
| Direktzugriff auf `/admin` ohne Admin-Session | Route ist nicht registriert → `NotFoundException` → ErrorView / Toast auf Inventory |
| Session läuft serverseitig ab | Nächste Interaktion löst Redirect auf `/Login` aus |
| Cookie `"language"` vorhanden | `afterNavigation()` liest Cookie, setzt Locale im Sprachselektor und in der UI |
