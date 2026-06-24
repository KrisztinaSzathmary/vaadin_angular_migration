---
name: migrate-project
description: Einstiegspunkt für eine vollständige Vaadin→Angular Migration. Orchestriert grob→fein die gesamte Migration — startet die UI-Design-Plan-Pipeline, lässt das Migrations-Backlog erstellen und führt dann komponentenweise die Migrations-Loop mit HITL-Gate nach jeder Komponente aus.
---

# Migrate-Project — Orchestrator & Einstiegspunkt

Der oberste Dirigent des Vaadin→Angular Migration Harness. **Du planst und
steuerst — du schreibst keinen Migrationscode selbst.** Code-Erzeugung delegierst
du an die untergeordneten Skills (`/ui-plan`, `/migrate`) und Agents.

Vorgehen: **grob → fein**. Erst Voraussetzungen und Gesamtbild, dann das
sequenzierte Backlog, dann eine Komponente nach der anderen.

## Aufruf

```
/migrate-project
```

## Architektur (flach halten)

Du rufst die bestehenden Orchestratoren auf — du spawnst keine dritte Agent-Ebene.
`/ui-plan` und `/migrate` verwalten ihre eigenen Subagents.

```
/migrate-project
   ├─ 1. /ui-plan            (UI-Pipeline: Recorder→Annotator→Flow-Mapper→Advisor)
   ├─ 2. migration-planner   (Survey→Dependency-Map→Backlog)
   └─ 3. Loop: /migrate <komponente>  je Backlog-Eintrag
```

## Ablauf

### Phase 0: Voraussetzungen prüfen

- Läuft die Vaadin-Alt-App? (UI-Pipeline braucht sie.) Wenn nicht: weise darauf
  hin und stoppe — starte sie nicht ungefragt.
- Existiert das Angular-Zielprojekt `bookstore-angular/`? Wenn nicht, ist das ok —
  es wird im Lauf aufgebaut; merke es als offenen Setup-Punkt vor der ersten Translate.

### Phase 1: UI-Design-Plan (Voraussetzungen erkennen)

Rufe `/ui-plan` auf. Die Pipeline erzeugt die UI-Referenz unter `ui-design-plan/`
(Screenshots, Annotationen, Flows, Angular-Empfehlungen).

**[HITL-GATE 1]** Zeige eine Zusammenfassung der UI-Referenz. Frage:
> "UI-Design-Plan abgenommen? Weiter mit der Migrationsplanung?"

### Phase 2: Migrationsplanung (grob→fein)

Starte den Agent `migration-planner`. Er scannt die Codebasis, baut eine belegte
Dependency-Map und schreibt `migration-roadmap.md` + `migration-backlog.md`.

**[HITL-GATE 2]** Zeige Roadmap-Übersicht + Backlog (M-IDs + Reihenfolge). Frage:
> "Sind Komponentenliste, Abhängigkeiten und Reihenfolge korrekt? Backlog freigeben?"

Korrekturen des Nutzers in die Backlog-Datei einarbeiten, bevor die Loop startet.

### Phase 3: Migrations-Loop (komponentenweise)

Initialisiere `migration-state.md` (welche M-IDs offen/erledigt). Dann für jeden
Backlog-Eintrag in der freigegebenen Reihenfolge:

1. Prüfe, dass die Abhängigkeiten (`Hängt ab von`) bereits erledigt sind.
2. Rufe `/migrate <Vaadin-Quellpfad des Eintrags>` auf. Dessen vier HITL-Gates
   (Analyze/Translate/Refactor/Verify) laufen wie gewohnt.
3. Aktualisiere `migration-state.md` (Eintrag erledigt, Verweis auf Reports).

**[HITL-GATE 3 — nach JEDER Komponente]** Frage:
> "M-XX abgeschlossen und akzeptiert. Nächste Komponente (M-YY) starten,
>  pausieren oder Reihenfolge anpassen?"

Kein eigenständiges Weiterlaufen zur nächsten Komponente ohne diese Freigabe.

## Zustandsdateien (grob→fein, Kommunikation über Dateien)

| Datei | Ebene | Inhalt |
|-------|-------|--------|
| `migration-roadmap.md` | grob | Gesamtbild, Dependency-Map, Reihenfolge-Begründung |
| `migration-backlog.md` | fein | M-IDs mit Quelle, Ziel, Abhängigkeiten, Akzeptanzkriterien |
| `migration-state.md` | Fortschritt | Was ist offen/in Arbeit/erledigt + Report-Verweise |
| `ui-design-plan/` | Referenz | Ergebnis der UI-Pipeline (Input für Translate) |

## Wichtige Invarianten

- Du dirigierst, du migrierst nicht selbst.
- Reihenfolge der Phasen ist fix: UI-Plan → Planung → Loop (Backlog kommt NACH
  dem UI-Plan, weil UI-Erkenntnisse die Zerlegung beeinflussen).
- Kein Gate überspringen; nach jeder Komponente wird gefragt.
- Abhängigkeiten respektieren: keine Komponente migrieren, deren Vorbedingungen
  laut Backlog noch offen sind.
- Architektur flach halten — keine zusätzliche Agent-Ebene über die bestehenden
  Orchestratoren hinaus.
