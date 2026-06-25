# Umsetzungsempfehlung: About View

> **Quelle:** `annotated/about.md`, `flows/07`
> **Stack:** Angular 22 · Standalone · Material 22 (M3)
> **Nur stabile, Angular-eigene APIs.**

## 1. Komponenten-Mapping

| Vaadin (Ist) | Angular Material (Soll) | Begründung |
|---|---|---|
| `AboutView extends VerticalLayout` (zentriert) | Standalone `AboutComponent` | Rein statische, informationale View. |
| `BookstoreTitle` (Custom Element `<bookstore-title>`) | Eigene `@Component` (Selector `app-bookstore-title` o. ä.) | JS-Custom-Element neu als Angular-Komponente bauen (siehe Stolpersteine). |
| Info-Zeile (`HorizontalLayout`, zentriert) | `<div>` mit `display:flex; gap; align-items:center; justify-content:center` | Icon + Text nebeneinander. |
| `VaadinIcon.INFO_CIRCLE` | `<mat-icon>info</mat-icon>` | Statisches Material-Icon. |
| Info-`Span` (i18n `info-text` mit `{0}`=Version) | `<span>{{ infoText }}</span>` | Text aus `environment.version` interpolieren. |

## 2. Layout-Strategie

- Gesamtes Layout vertikal und horizontal zentriert: `display:flex;
  flex-direction:column; justify-content:center; align-items:center;
  min-height:100%`. Entspricht Vaadins `JustifyContentMode.CENTER` +
  `Alignment.CENTER`.
- Innerhalb des MainLayout-`<router-outlet>` gerendert (Drawer bleibt sichtbar).
- Mobil (`about--mobile.png`): identisches zentriertes Layout, volle Breite.
- Farben/Typography über `--mat-sys-*`.

## 3. State & Forms

- Kein Formular, kein Backend-Call, kein lokaler State.
- App-Version aus `environment.ts` (`version: '...'`) statt
  `Version.getFullVersion()`. In den Info-Text interpolieren.

## 4. Stolpersteine

- **`BookstoreTitle` Custom Element:** Das eigentliche Rendering liegt in
  `bookstore-title.js` + `my-styles.css` (laut `annotated/about.md` noch nicht
  analysiert). Vor dem Translate die JS/CSS-Quelle lesen, um Schrift, Logo und
  HTML-Struktur zu reproduzieren. Bis dahin als offener Punkt markieren.
- **`Version.getFullVersion()`:** Vaadin-Framework-Version ergibt in Angular
  fachlich keinen Sinn. Empfehlung: stattdessen App-/Build-Version aus
  `environment` zeigen — als bewusste Abweichung dokumentieren (kein 1:1-Wert).
- **i18n-Parameter `{0}`:** i18n ist Nicht-Ziel dieser Demo; Text fest in
  Deutsch (CLAUDE.md), Version per Interpolation einsetzen.

## 5. Empfohlene Module/Imports

`MatIconModule`. (Keine Forms, kein Dialog.)

## Quellen

- Keine externe Recherche nötig — Standard-Angular/Material-Bausteine.
- Mapping-Basis: `.claude/references/reference-angular-material.md`.
