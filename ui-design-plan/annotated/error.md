# Error View — Annotation

## Screenshots

| Datei | Beschreibung |
|---|---|
| `screenshots/error/error--404.png` | 404-Fehler bei nicht vorhandener Route |

## Rendierende Java-Klasse

`ErrorView.java` — `@ParentLayout(MainLayout.class)`

Erbt von `VerticalLayout`. Implementiert `HasErrorParameter<NotFoundException>`.

Kein `@Route`-Annotation — wird vom Vaadin-Router automatisch bei
`NotFoundException` aktiviert (404-Handling).

## UI-Elemente → Vaadin-Quelle → Verhalten

| UI-Element (sichtbar) | Vaadin-Konstrukt | Quelldatei:Zeile | Verhalten / Event |
|---|---|---|---|
| Fehler-Überschrift | `H1` (header) | `ErrorView.java:30` | Text i18n-Key `view-not-found`; CSS-Klasse `LumoUtility.TextColor.ERROR` (roter Text) |
| Erklärungs-Text | `Span` (explanation) | `ErrorView.java:34-35` | Text wird in `setErrorParameter()` gesetzt; i18n-Key `cant-navigate` mit Pfad als Parameter |

## Event-Handler

| Event | Methode | Quelldatei:Zeile | Logik |
|---|---|---|---|
| Route not found | `setErrorParameter(event, parameter)` | `ErrorView.java:39-43` | Setzt `explanation`-Text auf `getTranslation("cant-navigate", event.getLocation().getPath())`; gibt HTTP 404 zurück |

## Backend-Abhängigkeiten

Keine. Rein navigationsbezogene View.

## Besonderheiten / Risiken für die Migration

- In Angular: `**`-Wildcard-Route am Ende der Route-Konfiguration, die auf eine `NotFoundComponent` zeigt.
- `@ParentLayout(MainLayout.class)` bewirkt, dass die ErrorView innerhalb des MainLayouts gerendert wird (mit Navigationsmenü). In Angular kann das über eine verschachtelte Route im MainLayout-Router-Outlet abgebildet werden.
- Der Pfad der fehlerhaften Route (`event.getLocation().getPath()`) wird in der Fehlermeldung angezeigt; in Angular via `ActivatedRoute.url` oder `Router.url`.
- HTTP-Statuscode 404 zurückgeben (`HttpServletResponse.SC_NOT_FOUND`): Im Angular-SPA-Kontext ist das serverseitig — ein SSR-Server oder der Backend-Proxy muss 404 für wirklich nicht existierende Routen liefern.
