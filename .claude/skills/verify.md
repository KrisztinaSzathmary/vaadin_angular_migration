---
name: verify
description: Prüft eine migrierte Angular-Komponente in zwei Stufen — zuerst deterministische Computational Sensors (Build, Tests, Coverage, Architektur, Visual, A11y), dann ein klar getrennter Inferential Sensor (LLM-as-Judge) für fachliche Äquivalenz. Phase 4 des Migration-Harness.
---

# Verify — Äquivalenz & Qualität prüfen

Prüfe als unabhängiger Reviewer, ob die migrierte Angular-Komponente funktional
äquivalent zur Vaadin-Ursprungskomponente ist und den Qualitätsregeln entspricht.

Die Prüfung läuft in **zwei Stufen**, nach Böckelers Sensor-Unterscheidung:

1. **Computational Sensors (deterministisch)** — gleiche Eingabe, gleiches Ergebnis.
   Diese laufen zuerst und haben Vorrang. Reproduzierbare, harte Gates.
2. **Inferential Sensor (LLM-as-Judge)** — nur für das, was kein Tool messen kann.
   Klar getrennt, nicht reproduzierbar, ergänzend.

**Grundsatz:** So viel wie möglich deterministisch prüfen. Der LLM-Judge bewertet
ausschließlich den Rest, den die Tools nicht abdecken.

## Guide (Feedforward)

Du bist ein spezialisierter Verifikations-Agent ohne Investition in den
generierten Code. Aufgabe: Confirmation Bias durchbrechen, objektiv prüfen.

**Verifikations-Quellen:**
1. Vaadin-Quelldatei (Referenz)
2. Angular-Komponente (zu prüfen)
3. Analyse-Report aus `/analyze` (Akzeptanzkriterien, Test-Liste)
4. `ui-design-plan/flows/` (Workflows als E2E-Grundlage, falls vorhanden)

---

## Stufe 1 — Computational Sensors (deterministisch)

Alle `ng`-/`npx`-Befehle laufen in `bookstore-angular/`. Führe sie aus und
interpretiere die Ergebnisse. Bei Fehlern: **dokumentieren, nicht selbst beheben**
— Behebung geht zurück an `/translate` oder `/refactor`.

### 1a. Build & Typen

```
ng build
npx type-coverage --strict --at-least 95
```

- `ng build` → kompiliert ohne Fehler (TypeScript strict).
- `type-coverage` → Anteil explizit getypter Stellen über Schwellwert (kein `any`-Wildwuchs).

### 1b. Lint

```
ng lint
```

ESLint + angular-eslint → keine Regelverstöße (Best-Practice-Lints für Signals,
Standalone, Control Flow).

### 1c. Unit-Tests & Coverage

```
ng test --watch=false --code-coverage
```

- Alle Tests grün.
- Coverage über dem in der Projektkonfiguration gesetzten Schwellwert
  (sinnvolle Abdeckung kritischer Pfade, keine willkürliche Prozentzahl).

### 1d. Architektur / Abhängigkeiten

```
npx depcruise src --config .dependency-cruiser.js
```

**dependency-cruiser** → keine zyklischen Importe, keine verbotenen
Schicht-Übergriffe, keine Orphans. Harte Regel, deterministisch.

### 1e. Visuelle & funktionale Äquivalenz (E2E)

```
npx playwright test
```

- **Visual Regression** (`toHaveScreenshot()`, pixelmatch) gegen Baseline der
  Vaadin-App bzw. der abgenommenen Komponente.
- **E2E-Flows** aus `ui-design-plan/flows/` reproduzieren die Klickpfade.
- **ARIA-Snapshots** (`toMatchAriaSnapshot`) prüfen den Accessibility-Tree.

> **Determinismus-Bedingung (zwingend):** Visual-Baselines müssen in derselben
> Umgebung erzeugt werden, in der sie geprüft werden (Docker/CI). Andernfalls
> wird der Test flaky und verliert seine Deterministik. Regeln:
> - Animationen aus: `animations: 'disabled'`
> - dynamischen/zeitabhängigen Inhalt maskieren: `mask: [...]`
> - Baselines nur in der CI-/Container-Umgebung neu generieren, nie lokal ad hoc.

### 1f. Accessibility (WCAG)

```
npx playwright test --grep @a11y
```

**axe-core** (`@axe-core/playwright`, `injectAxe` + `checkA11y`) → regelbasierte
WCAG-Prüfung, deterministisch.

### Sensor-Ergebnis

Fasse Stufe 1 als Tabelle zusammen — jede Zeile GRÜN/ROT mit dem konkreten
Tool-Output (Zahlen, Fehlermeldungen). Ist ein Computational Sensor ROT, ist die
Empfehlung automatisch **NACHBESSERN** — der LLM-Judge kann das nicht überstimmen.

---

## Stufe 2 — Inferential Sensor (LLM-as-Judge)

Nur ausführen, wenn Stufe 1 vollständig grün ist (oder zur Einordnung roter
Sensoren). Bewertet ausschließlich, was die Tools **nicht** messen können.

Bewerte jede Dimension: OK / WARNUNG / PROBLEM

### Fachliche Äquivalenz (nicht tool-messbar)
- Bildet die Komponente die *fachliche Absicht* der Vaadin-Quelle ab, nicht nur
  die Oberfläche? (z. B. Geschäftsregeln, Validierungslogik, Sonderfälle)
- Gibt es serverseitige Vaadin-Logik, die clientseitig sinnvoll nachgebildet
  wurde — oder nur scheinbar?
- Sind die E2E-Flows fachlich vollständig, oder fehlen Pfade, die kein Test abdeckt?

### Angemessenheit (nicht tool-messbar)
- Passt die gewählte Material-/Angular-Lösung zur fachlichen Aufgabe?
- Wurden im Analyse-Report genannte Risiken tatsächlich adressiert?

---

## Ausgabe-Format

```
VERIFY REPORT
=============
Komponente: [Name]   Vaadin-Referenz: [Pfad]

— STUFE 1: COMPUTATIONAL SENSORS (deterministisch) —
Build & Typen (ng build / type-coverage):   [GRÜN|ROT] — <Output>
Lint (ng lint):                             [GRÜN|ROT] — <Output>
Unit-Tests & Coverage (ng test):            [GRÜN|ROT] — <Output>
Architektur (dependency-cruiser):           [GRÜN|ROT] — <Output>
E2E / Visual / ARIA (playwright):           [GRÜN|ROT] — <Output>
Accessibility (axe-core):                   [GRÜN|ROT] — <Output>

— STUFE 2: INFERENTIAL SENSOR (LLM-as-Judge) —
Fachliche Äquivalenz:   [OK|WARNUNG|PROBLEM] — <Begründung>
Angemessenheit:         [OK|WARNUNG|PROBLEM] — <Begründung>

Empfehlung: [AKZEPTIEREN | NACHBESSERN]
   (Regel: ein roter Computational Sensor ⇒ immer NACHBESSERN)
Offene Punkte:
- <Punkt 1>
```

## HITL-Gate

**STOPP.** Zeige den Report. Frage:
> "Empfehlung AKZEPTIEREN oder NACHBESSERN?"

Falls NACHBESSERN:
- Benenne die rote Dimension konkret.
- Starte `/translate` oder `/refactor` erneut mit konkretem Hinweis.

Falls AKZEPTIEREN:
> "Nächste Komponente mit `/migrate` oder Projekt abgeschlossen?"

Warte auf explizite Entscheidung.

---

## Tool-Voraussetzungen (einmalig im Angular-Projekt einrichten)

Diese deterministischen Tools müssen im `bookstore-angular/`-Projekt verfügbar
sein. Fehlt eines, im Report als „Sensor nicht verfügbar" markieren statt
stillschweigend überspringen.

| Tool | Paket | Zweck |
|------|-------|-------|
| Angular CLI | (im Projekt) | `ng build`/`test`/`lint` |
| type-coverage | `type-coverage` | Typabdeckung |
| dependency-cruiser | `dependency-cruiser` | Architektur-/Import-Regeln |
| Playwright | `@playwright/test` | E2E, Visual, ARIA-Snapshots |
| axe für Playwright | `@axe-core/playwright` | WCAG-A11y |
