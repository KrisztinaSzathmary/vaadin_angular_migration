# Login View — Annotation

## Screenshots

| Datei | Beschreibung |
|---|---|
| `screenshots/login/login--default.png` | Grundzustand, leeres Formular |
| `screenshots/login/login--empty-submit.png` | Abschicken ohne Eingabe |
| `screenshots/login/login--wrong-credentials.png` | Fehlermeldung bei falschen Zugangsdaten |
| `screenshots/login/login--mobile.png` | Mobiler Viewport (390 px) |

## Rendierende Java-Klasse

`authentication/LoginView.java` — `@Route("Login")`, `@RouteScoped`, `@CdiComponent`

Erbt von `FlexLayout`. Implementiert `HasDynamicTitle`, `LocaleChangeObserver`,
`AfterNavigationObserver`.

## UI-Elemente → Vaadin-Quelle → Verhalten

| UI-Element (sichtbar) | Vaadin-Konstrukt | Quelldatei:Zeile | Verhalten / Event |
|---|---|---|---|
| Gesamtlayout (Flex, links Info / rechts Form) | `FlexLayout` | `LoginView.java:45`, `LoginView.java:84-88` | `setSizeFull()`, linke Spalte loginInformation, rechte centeringLayout |
| Linke Infobox — Überschrift | `H1` (loginInfoHeader) | `LoginView.java:113` | Text kommt aus i18n-Key `login-info`; reaktiv via `localeChange` |
| Linke Infobox — Beschreibungstext | `Span` (loginInfoText) | `LoginView.java:115` | i18n-Key `login-info-text`; reaktiv via `localeChange` |
| Sprach-Selektor (Dropdown) | `Select<Locale>` (lang) | `LoginView.java:62`, `LoginView.java:119-133` | Items: `CustomI18NProvider.locales` (fi_FI, en_GB); ValueChangeListener setzt Session-Attribut `locale` und UI-Locale |
| Vaadin LoginForm-Komponente | `LoginForm` | `LoginView.java:57`, `LoginView.java:76-81` | Enthält Username-Feld, Password-Feld, Submit-Button, Forgot-Password-Link |
| Benutzername-Feld | Teil von `LoginForm` (i18n-Label) | `LoginView.java:101` | i18n-Key `username` |
| Passwort-Feld | Teil von `LoginForm` (i18n-Label) | `LoginView.java:100` | i18n-Key `password` |
| Anmelde-Button | Teil von `LoginForm` (i18n-Label) | `LoginView.java:104` | i18n-Key `login-button`; löst `LoginEvent` aus → `login()` |
| "Passwort vergessen"-Link | Teil von `LoginForm` | `LoginView.java:78-79` | `addForgotPasswordListener` → `Notification.show(getTranslation("hint"))` |
| Fehlerzustand (rote Meldung) | `LoginForm.setError(true)` | `LoginView.java:146` | Wird gesetzt, wenn `accessControl.signIn()` false zurückgibt |

## Event-Handler

| Event | Methode | Quelldatei:Zeile | Logik |
|---|---|---|---|
| Login-Submit | `login(LoginForm.LoginEvent)` | `LoginView.java:138-148` | Ruft `accessControl.signIn(username, password)` auf; bei Erfolg: `changeSessionId()`, optionale Admin-Route-Registrierung, `navigate("")`; bei Fehler: `setError(true)` |
| ForgotPassword-Klick | Lambda in `buildUI` | `LoginView.java:78-79` | `Notification.show(getTranslation("hint"))` — kein Backend-Aufruf |
| Sprach-Dropdown Änderung | Lambda in `buildLoginInformation` | `LoginView.java:123-133` | Session-Attribut `"locale"` setzen + `ui.setLocale()` |
| `AfterNavigationEvent` | `afterNavigation()` | `LoginView.java:176-188` | Liest Cookie `"language"`, setzt ggf. `lang.setValue()` und UI-Locale |
| `LocaleChangeEvent` | `localeChange()` | `LoginView.java:169-173` | Aktualisiert `loginForm.setI18n()`, InfoHeader, InfoText |

## Backend-Abhängigkeiten

| Service | Methode | Aufruf in | Zweck |
|---|---|---|---|
| `AccessControl` (Interface) | `signIn(username, password)` | `LoginView.java:139` | Authentifizierung; Implementierung: `BasicAccessControl` — akzeptiert jeden String als Passwort, wenn `username == password` |
| `AccessControl` | `isUserInRole(ADMIN_ROLE_NAME)` | `LoginView.java:153` | Entscheidet, ob `AdminView`-Route dynamisch registriert wird |

## Routing & Navigation

- Route: `@Route("Login")` — kein Layout-Wrapper (eigenständig)
- Globaler Guard: `BookstoreBeforeEnterListener.java:25-30` — leitet nicht
  angemeldete Benutzer zu `LoginView` um, auf **jede** andere Route
- Nach erfolgreichem Login: `navigate("")` → landet auf `inventory` (RouteAlias)

## Besonderheiten / Risiken für die Migration

- `LoginForm` ist eine Vaadin-eigene Compound-Komponente. In Angular muss ein
  Reactive-Form-Formular mit zwei Feldern plus Submit-Button gebaut werden.
- Die Fehlermeldungslogik (`setError(true)`) ist in `LoginForm` eingebettet;
  in Angular explizit als Formular-Fehlerzustand modellieren.
- Der Sprach-Selektor ist Teil der Login-UI (ungewöhnlich); er manipuliert die
  Server-Session. In Angular wird Locale-Verwaltung client-seitig (Angular i18n
  oder ngx-translate) implementiert — kein 1:1-Äquivalent.
- `changeSessionId()` nach Login ist eine CSRF-/Session-Fixation-Schutzmaßnahme;
  in Angular muss das Backend diesen Schutz selbst implementieren.
- `BasicAccessControl.signIn()` akzeptiert jeden Nicht-Leer-String als Passwort,
  solange `username == password` — reine Mock-Logik, kein echtes Auth-Backend.
