---
name: migrate
description: Orchestriert den vollständigen Migrations-Zyklus einer Vaadin-Komponente (Analyze → Translate → Refactor → Verify) mit obligatorischen HITL-Gates. Use für eine komplette Komponenten-Migration end-to-end.
---

# Migrate — Orchestrator

Führt einen vollständigen Migrations-Zyklus für eine Vaadin-Komponente durch. Jede Phase läuft als isolierter Subagent mit eigenem Kontext. HITL-Gates sind obligatorisch — kein Überspringen.

## Aufruf

```
/migrate <Pfad-zur-Vaadin-Komponente>
```

Beispiel: `/migrate src/main/java/com/example/views/LoginView.java`

## Ablauf

### Phase 1: Analyze (Subagent)

Starte einen Subagenten mit dem Inhalt von `/analyze` und dem übergebenen Dateipfad.

Der Subagent liest die Vaadin-Komponente und erstellt:
- Komponentenbeschreibung (Zweck, UI-Elemente, Events)
- Backend-Abhängigkeiten (Services, APIs, Datenmodelle)
- Migrations-Plan (Angular-Äquivalente, Besonderheiten)
- Test-Liste (funktionale Anforderungen als überprüfbare Szenarien)

**[HITL-GATE 1]** Präsentiere Migrations-Plan + Test-Liste. Warte auf: "ja" / Korrektur / Abbruch.

### Phase 2: Translate (Subagent)

Starte einen Subagenten mit dem Inhalt von `/translate`.

Der Subagent generiert:
- Angular Standalone Component (`.component.ts` + `.component.html` + `.component.css`)
- Unit-Tests (`.component.spec.ts`)
- Führt `ng build` + `ng test` + `ng lint` aus

Bei Sensor-Fehlern: Subagent behebt selbst und wiederholt — erst nach grünen Sensoren kommt das Gate.

**[HITL-GATE 2]** Zeige Komponente + Sensoren. Warte auf Bestätigung.

### Phase 3: Refactor (Subagent)

Starte einen Subagenten mit dem Inhalt von `/refactor`.

Der Subagent verbessert das Design:
- Angular Best Practices (Signals statt BehaviorSubject, OnPush, etc.)
- Simple Design Regeln
- Führt `ng build` + `ng test` + `ng lint` aus

**[HITL-GATE 3]** Zeige refactored Code + Sensoren. Frage: "Nächste Komponente oder Zyklus abschließen?"

### Phase 4: Verify (Subagent)

Starte einen Verify-Subagenten mit dem Inhalt von `/verify`.

Der Subagent prüft:
- LLM-as-a-Judge: Funktionale Äquivalenz zur Vaadin-Komponente
- Playwright E2E: Visueller und funktionaler Vergleich
- stack.rules-Konformität

**[HITL-GATE 4]** Zeige VERIFY REPORT. Frage: "Akzeptiert? Nächste Komponente?"

## Wichtige Invarianten

- Jeder Subagent startet mit isoliertem Kontext (kein "Lost in the Middle")
- Claude darf KEIN Gate eigenständig überspringen
- Sensor-Fehler werden vom Subagenten behoben, nicht vom Nutzer
- Der Orchestrator gibt nach jedem Gate Kontrolle ab
