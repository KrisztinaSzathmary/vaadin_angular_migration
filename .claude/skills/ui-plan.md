---
name: ui-plan
description: Orchestriert die UI-Design-Plan-Pipeline — erzeugt die visuelle und interaktive Referenz der Vaadin-Alt-App durch vier spezialisierte Agents (Recorder → Annotator → Flow-Mapper → Advisor). Use vor der Komponenten-Migration, um den fehlenden UI-Baustein des Harness zu erzeugen.
---

# UI-Plan — Orchestrator der UI-Design-Plan-Pipeline

Erzeugt den **UI-Design-Plan** — den im Harness ursprünglich fehlenden Baustein:
die visuelle und interaktive Spezifikation der Vaadin-Alt-Anwendung. Die Referenz
wird nicht handgemacht, sondern von einem Team spezialisierter Agents erstellt.

## Aufruf

```
/ui-plan
```

Optional mit Fokus auf eine View: `/ui-plan Produkte`

## Voraussetzung

Die Vaadin-Alt-App läuft und ist erreichbar (Standard: WildFly auf
`http://localhost:8080/...`). Ist sie es nicht, stoppe und weise darauf hin.

## Ablauf

Jede Phase läuft als isolierter Subagent. HITL-Gates sind obligatorisch.

### Phase 1: Aufnahme (Agent `ui-recorder`)

Starte den `ui-recorder`. Er navigiert die App per Playwright und legt Screenshots
+ Manifest unter `ui-design-plan/screenshots/` ab.

**[HITL-GATE 1]** Zeige Manifest + Screenshot-Übersicht. Frage:
> "Sind alle Views und Zustände erfasst? Weiter mit der Annotation?"

### Phase 2: Annotation (Agent `ui-annotator`)

Starte den `ui-annotator`. Er verbindet Screenshots mit dem Java-Quellcode
(Element → Quelle:Zeile → Verhalten) nach `ui-design-plan/annotated/`.

**[HITL-GATE 2]** Zeige eine Beispiel-Annotation. Frage:
> "Sind die Zuordnungen zum Quellcode korrekt? Weiter mit den Flows?"

### Phase 3: Workflows (Agent `ui-flow-mapper`)

Starte den `ui-flow-mapper`. Er dokumentiert Benutzer-Workflows als Sequenzen
nach `ui-design-plan/flows/`.

**[HITL-GATE 3]** Zeige die Workflow-Übersicht. Frage:
> "Sind die Kern-Workflows vollständig und korrekt? Weiter mit den Empfehlungen?"

### Phase 4: Angular-Empfehlungen (Agent `ui-advisor`)

Starte den `ui-advisor`. Er erstellt pro View Umsetzungsempfehlungen für Angular
Material nach `ui-design-plan/recommendations/` (recherchiert bei Bedarf aktuelle
Material-Patterns).

**[HITL-GATE 4]** Zeige eine Beispiel-Empfehlung. Frage:
> "Sind die Empfehlungen tragfähig? UI-Design-Plan abnehmen?"

## Ergebnis

```
ui-design-plan/
  screenshots/     # Recorder:    rohe Bilder + manifest.md
  annotated/       # Annotator:   Bilder + Code-Zuordnung
  flows/           # Flow-Mapper: Benutzer-Workflows
  recommendations/ # Advisor:     Angular-Umsetzungsempfehlungen
```

Dieser Plan ist Input für die spätere `/translate`-Phase jeder Komponente.

## Wichtige Invarianten

- Jeder Agent startet mit isoliertem Kontext.
- Kein Gate eigenständig überspringen.
- Die Pipeline dokumentiert nur den Ist-Zustand und empfiehlt — sie schreibt
  keinen Produktivcode (das ist Aufgabe von `/translate`).
- Reihenfolge ist fix: Recorder → Annotator → Flow-Mapper → Advisor (jeder Agent
  baut auf der Ausgabe des vorherigen auf).
