# CLAUDE.md — Vaadin→Angular Migration Harness (BP3-Demo)

Dieses Projekt ist die Demo-Umgebung für **Blogpost 3** der Serie *AI-Assisted
Vaadin→Angular Migration*. Es zeigt nicht, wie man einen Harness *benutzt*,
sondern wie man einen **Migration Harness baut** — von der Konzeption bis zum
ersten vollständigen Migrations-Zyklus.

Du arbeitest nach dem **Vaadin→Angular Migration Workflow**, der auf zwei Quellen
basiert:

1. **EXACT Coding** (EXample-guided AI-Collaborative Test-driven Coding) —
   strukturierter, beispielgetriebener Workflow mit HITL-Gates
2. **Harness Engineering** (Birgitta Böckeler, martinfowler.com) —
   Agent = Model + Harness: Guides (Feedforward) + Sensors (Computational + Inferential)

## Formel

```
Agent   = Model + Harness
Harness = Guides (CLAUDE.md + Skills) + Sensors (Computational + Inferential)
```

## Einstiegspunkt & Harness-Hierarchie

**`/migrate-project`** ist der Einstiegspunkt für eine vollständige Migration.
Er dirigiert grob→fein und ruft die untergeordneten Orchestratoren auf:

```
/migrate-project                Einstiegspunkt (plant & dirigiert, kein Code)
   ├─ /ui-plan                  UI-Design-Plan-Pipeline (Voraussetzungen erkennen)
   │     └─ Agents: ui-recorder → ui-annotator → ui-flow-mapper → ui-advisor
   ├─ migration-planner (Agent) Survey → Dependency-Map → Backlog (grob→fein)
   └─ /migrate <komponente>     Komponenten-Zyklus, je Backlog-Eintrag (Loop)
         (Analyze → Translate → Refactor → Verify)
```

Einzelne Skills bleiben manuell aufrufbar (`/analyze`, `/translate`, `/refactor`,
`/verify`, `/review`, `/migrate`, `/ui-plan`). Kommunikation zwischen den Schritten
läuft über Dateien (`migration-roadmap.md`, `migration-backlog.md`,
`migration-state.md`, `ui-design-plan/`).

## Workflow-Disziplin (ZWINGEND)

Die Phasenreihenfolge ist nicht verhandelbar:
**Analyze → Translate → Refactor → Verify**

- Niemals eine Phase überspringen oder zusammenführen
- `/migrate` orchestriert den vollständigen Durchlauf
- Einzelne Skills (`/analyze`, `/translate`, `/refactor`, `/verify`) für manuelle Kontrolle

## Human in the Loop (HITL) — ABSOLUT OBLIGATORISCH

Du stoppst und wartest auf explizite Freigabe nach:

- **Analyze** — Migrations-Plan bestätigen
- **Translate** — Angular-Komponente bestätigen
- **Refactor** — Design bestätigen
- **Verify** — Äquivalenz-Report akzeptieren

Kein selbstständiges Durchlaufen mehrerer Phasen.

## Migrations-Invarianten

- **Funktionale Äquivalenz ist Pflicht** — nicht optionale Verbesserung
- Die Vaadin-Quelldatei bleibt lesbar als Referenz
- Keine neuen Features während der Translation
- Jede Komponente einzeln migrieren — kein Batch-Ansatz

## Simple Design (Prioritätsreihenfolge im Refactor)

1. Alle Tests grün
2. Keine Duplizierung
3. Intention durch Benennung kommuniziert
4. Minimale Elemente — YAGNI

## Harness Sensor-Protokoll

Alle `ng`-Befehle laufen im Angular-Projektverzeichnis **`bookstore-angular/`**,
nicht im Repo-Root.

**Computational Sensors (deterministisch)** — nach Translate und Refactor das
schnelle Kernset, in `/verify` das volle Set:

```
cd bookstore-angular
ng build                  # Build + TypeScript strict
ng test --watch=false     # Unit-Tests (+ --code-coverage in /verify)
ng lint                   # ESLint + angular-eslint
```

Volles deterministisches Set in `/verify` zusätzlich: `type-coverage` (Typabdeckung),
`dependency-cruiser` (Architektur/Importe), `playwright` (E2E + Visual Regression +
ARIA-Snapshots), `@axe-core/playwright` (WCAG-A11y). Playwright ist deterministisch
— Bedingung: Baselines in fixer Umgebung (Docker/CI), Animationen aus, dynamischer
Inhalt maskiert.

**Inferential Sensor (LLM-as-Judge, nicht reproduzierbar)** — in `/verify`, klar
getrennt nach den Computational Sensors. Bewertet nur, was kein Tool messen kann
(fachliche Äquivalenz, Angemessenheit). Ein roter Computational Sensor kann durch
den Judge nicht überstimmt werden.

Du interpretierst jedes Ergebnis explizit. Bei Fehlern: selbst beheben, erneut
prüfen — kein HITL-Checkpoint, bis alle Computational Sensors grün sind.

## Projektstruktur

| Pfad | Inhalt |
|------|--------|
| `bookstore-starter-flow-ui/src/main/java/com/vaadin/samples/` | **Vaadin-Quellcode** (Migrations-Referenz) |
| `bookstore-starter-flow-backend/` | Java-EE-Backend, CDI-basiert, **kein REST** (in-process `DataService`, bleibt unverändert) |
| `bookstore-starter-flow-ear/` | EAR-Packaging fürs Deployment |
| `bookstore-angular/` | **Angular-Zielprojekt** (wird im Lauf der Migration aufgebaut) |
| `.claude/skills/` | Harness-Skills — lade mit `/skillname` |
| `docs/migration-reports/` | Analyse- und Verify-Reports pro Iteration |

## Stack

- **Quelle:** Vaadin 24 (Flow) + Java EE, Backend auf Port 8080
- **Ziel:** Angular 22.0.x (exakte Patch-Version bei Provisionierung bestätigen, siehe
  `.claude/references/reference-angular-material.md`), Standalone Components, Signals,
  Reactive Forms, Material 22 (M3)
- **Stack-Vorgabe:** nur stabile APIs, nur offizielle Angular-Pakete (kein Drittanbieter)
- Sensoren: `ng build` + `ng test` + `ng lint` + Playwright E2E
- Skills: `analyze`, `translate`, `refactor`, `verify`, `migrate`, `review`

## Bewusste Nicht-Ziele (Scope der Demo)

- **Keyboard Shortcuts** — explizit ausgeschlossen
- Zweite Sprache: **Deutsch** (statt Finnisch im Original)
