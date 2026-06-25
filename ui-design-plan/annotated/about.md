# About View — Annotation

## Screenshots

| Datei | Beschreibung |
|---|---|
| `screenshots/about/about--default.png` | Grundzustand |
| `screenshots/about/about--mobile.png` | Mobiler Viewport (390 px) |

## Rendierende Java-Klasse

`about/AboutView.java` — `@Route(value = "about", layout = MainLayout.class)`

Erbt von `VerticalLayout`. Implementiert `HasDynamicTitle`.

## UI-Elemente → Vaadin-Quelle → Verhalten

| UI-Element (sichtbar) | Vaadin-Konstrukt | Quelldatei:Zeile | Verhalten / Event |
|---|---|---|---|
| Gesamtes Layout | `VerticalLayout` (AboutView erbt) | `AboutView.java:15` | `setSizeFull()`; `setJustifyContentMode(CENTER)`; `setAlignItems(CENTER)` — alles vertikal + horizontal zentriert |
| App-Titel (Bookstore-Headline) | `BookstoreTitle extends Component` | `AboutView.java:28`, `BookstoreTitle.java:11` | Custom Web Component: `@Tag("bookstore-title")`, JS-Modul `./src/bookstore-title.js`, CSS `./styles/my-styles.css`; liegt in Modul `bookstore-starter-flow-my-component` |
| Info-Zeile (Icon + Text) | `HorizontalLayout` (hl) | `AboutView.java:21` | `setSizeFull()`; `JustifyContentMode.CENTER`; `Alignment.CENTER` |
| Info-Icon | `VaadinIcon.INFO_CIRCLE.create()` | `AboutView.java:22` | Statisches Icon, kein Event |
| Info-Text | `Span(getTranslation(INFO_TEXT, Version.getFullVersion()))` | `AboutView.java:23` | i18n-Key `info-text` mit Vaadin-Version als Parameter (`{0}` Placeholder) |

## Event-Handler

Keine interaktiven Event-Handler. Die View ist rein informational.

`getPageTitle()` gibt i18n-Key `about` zurück (`AboutView.java:36`).

## Backend-Abhängigkeiten

Keine. Die View ruft keinen DataService auf.

`Version.getFullVersion()` ist eine Vaadin-Framework-Utility-Methode — gibt die
laufende Vaadin-Version zurück (keine Backend-Abhängigkeit).

## Ungeklärte Punkte

- `BookstoreTitle` (`BookstoreTitle.java:9-10`): Die Java-Klasse ist eine dünne
  Wrapper-Klasse. Das eigentliche Rendering liegt in `bookstore-title.js` (JS-Modul
  im Modul `bookstore-starter-flow-my-component`). Dieses JS-File wurde noch nicht
  gelesen — die exakte visuelle Darstellung (Schriftart, Logo-Bild, HTML-Struktur)
  ist daher noch nicht vollständig belegt. Die CSS-Datei `my-styles.css` ebenfalls
  ungeklärt.

## Besonderheiten / Risiken für die Migration

- Sehr einfache, statische View — geringer Migrationsaufwand bei den Vaadin-Standardelementen.
- `BookstoreTitle` ist ein Custom Element (`<bookstore-title>`): In Angular als eigenständige `@Component` mit Selector `bookstore-title` neu bauen. Das JS-Modul des Original-Custom-Elements muss separat analysiert werden.
- `Version.getFullVersion()` in der UI anzeigen: In Angular kann eine environment-Variable die App-Version halten (`environment.ts` → `version: '...'`).
- i18n-Key `info-text` enthält einen positional Parameter `{0}` (Vaadin-Version); in Angular ngx-translate oder Angular i18n mit Parameter-Interpolation.
