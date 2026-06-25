# Main Layout — Annotation

## Screenshots

| Datei | Beschreibung |
|---|---|
| `screenshots/main-layout/main-layout--desktop.png` | Desktop mit Navigationsmenü und Produktgrid |
| `screenshots/main-layout/main-layout--mobile-closed.png` | Mobiler Viewport, Drawer geschlossen |

## Rendierende Java-Klassen

| Klasse | Rolle |
|---|---|
| `MainLayout.java` | Router-Layout-Wrapper (`implements RouterLayout`) |
| `Menu.java` | Seitennavigation, Logo, Logout-Button |

`MainLayout` ist das Eltern-Layout für alle authentifizierten Views:
`SampleCrudViewImpl`, `AboutView`, dynamisch `AdminView`.

## UI-Elemente → Vaadin-Quelle → Verhalten

| UI-Element (sichtbar) | Vaadin-Konstrukt | Quelldatei:Zeile | Verhalten / Event |
|---|---|---|---|
| Gesamt-Wrapper | `FlexLayout` (MainLayout erbt) | `MainLayout.java:35` | `setSizeFull()`, `setClassName("main-layout")`; enthält `menu` + Seiten-Content-Slot |
| Menü-Sidebar | `Menu extends FlexLayout` | `Menu.java:27`, `MainLayout.java:55` | `setClassName("menu-bar")` |
| Hamburger-Button (mobil) | `Button` (showMenu) | `Menu.java:36`, `43-52` | Klick togglet CSS-Klasse `show-tabs` auf `sideNav`; Icon: `VaadinIcon.MENU`; Text i18n `menu` |
| Logo-Bild | `Image` | `Menu.java:63-65` | Ressource `img/table-logo.png` via `VaadinServletService.resolveResource` |
| App-Titel | `H3` (title) | `Menu.java:34`, `60` | Text i18n-Key `bookstore`; reaktiv via `localeChange` |
| SideNav-Container | `SideNav` | `Menu.java:33`, `71-73` | Padding MEDIUM; Items werden via `addView()` hinzugefügt |
| Nav-Item "Inventory" | `SideNavItem` | `Menu.java:98`, `MainLayout.java:50-52` | Ziel: `SampleCrudViewImpl.class`; Icon: `VaadinIcon.EDIT`; Label i18n `inventory` |
| Nav-Item "About" | `SideNavItem` | `Menu.java:98`, `MainLayout.java:53-54` | Ziel: `AboutView.class`; Icon: `VaadinIcon.INFO_CIRCLE`; Label i18n `about` |
| Nav-Item "Admin" (conditional) | `SideNavItem` | `MainLayout.java:67-69` | Nur sichtbar nach Admin-Login; dynamisch registriert via `RouteConfiguration.forSessionScope()` |
| Logout-Button | `Button` (logoutButton) | `Menu.java:37`, `76-83` | Icon: `VaadinIcon.SIGN_OUT`; Text i18n `logout`; Click → `accessControl.signOut()`; Margin Top Auto (an unteres Ende geschoben) |

## Event-Handler

| Event | Methode | Quelldatei:Zeile | Logik |
|---|---|---|---|
| Hamburger-Klick | Lambda in Menu-Konstruktor | `Menu.java:43-49` | Togglet `"show-tabs"` CSS-Klasse auf sideNav |
| Logout-Klick | Lambda + `accessControl.signOut()` | `Menu.java:77-78`, `BasicAccessControl.java:64-66` | `VaadinSession.invalidate()` + `UI.navigate("")` — landet auf LoginView wegen Guard |
| Shortcut Ctrl+L | Lambda in `onAttach` | `MainLayout.java:62-63` | `accessControl.signOut()` — globaler Logout-Shortcut (als Nicht-Ziel in CLAUDE.md ausgeschlossen) |
| `AfterNavigationEvent` | `afterNavigation()` | `MainLayout.java:87-99` | Liest Cookie `"language"`, setzt UI-Locale |
| Admin-Route-Änderung | `RoutesChangeListener` | `MainLayout.java:76-83` | Wenn `AdminView` zur Session-Route-Registry hinzukommt, wird Menü-Item dynamisch ergänzt |
| `LocaleChangeEvent` | `localeChange()` in Menu | `Menu.java:103-107` | Aktualisiert title, showMenu-Text, logoutButton-Text |

## Backend-Abhängigkeiten

| Service | Methode | Aufruf in | Zweck |
|---|---|---|---|
| `AccessControl` | `signOut()` | `Menu.java:78` | Session-Invalidierung |
| `AccessControl` | `isUserInRole("admin")` | Indirekt via Presenter bei Init | Steuert Admin-Menü-Item-Sichtbarkeit (über Route-Registrierung in LoginView) |

## Admin-Menü-Dynamik

Das Admin-Menü-Item existiert nicht im normalen Navigationsmenü. Es wird:

1. Bei Login von `LoginView.registerAdminViewIfApplicable()` (`LoginView.java:151-160`) in die Session-Route-Registry eingetragen, wenn `accessControl.isUserInRole("admin")` true ist.
2. Von `MainLayout.onAttach()` (`MainLayout.java:66-83`) via `RoutesChangeListener` beobachtet und das Menü-Item dann hinzugefügt.

## Besonderheiten / Risiken für die Migration

- `RouterLayout`-Konzept: In Angular ist das Äquivalent ein Layout-Komponent mit `<router-outlet>` — konzeptionell sehr ähnlich.
- `SideNav` mit `SideNavItem` navigiert via Vaadin Router; in Angular Material: `mat-nav-list` mit `routerLink`.
- Hamburger-Toggle via CSS-Klasse: In Angular Material `mat-sidenav` / `mat-drawer` mit `opened`-Binding oder `toggle()`.
- Admin-Route wird server-seitig dynamisch registriert (Session-Scoped). In Angular: `Router.resetConfig()` oder route Guards (`canActivate`) mit rollenbasierter Logik — vorzugsweise statische Routen mit `canActivate`-Guard der auf Admin-Rolle prüft.
- Locale aus Cookie in `afterNavigation`: In Angular beim App-Start im `APP_INITIALIZER` auslesen und `LOCALE_ID`-Token setzen.
- Der Shortcut Ctrl+L (Logout) ist als Nicht-Ziel ausgeschlossen.
- `resolveResource` für Logo-Bild: In Angular statisches Asset in `assets/img/` ablegen, `<img src="assets/img/table-logo.png">`.
