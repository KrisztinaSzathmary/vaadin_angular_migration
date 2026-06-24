---
name: verify
description: Prüfe als unabhängiger Reviewer die funktionale Äquivalenz einer migrierten Angular-Komponente zur Vaadin-Quelle (Inferential Sensor, LLM-as-Judge + Playwright). Phase 4 des Migration-Harness.
---

# Verify — Funktionale Äquivalenz prüfen

Prüfe als unabhängiger Reviewer, ob die migrierte Angular-Komponente funktional äquivalent zur Vaadin-Ursprungskomponente ist. Dies ist der **Inferential Sensor** des Harness (nach Böckeler).

## Guide (Feedforward)

Du bist ein spezialisierter Verifikations-Agent. Du hast keine Investition in den generierten Code. Deine Aufgabe: Confirmation Bias durchbrechen und objektiv prüfen.

**Verifikations-Quellen:**
1. Vaadin-Quelldatei (Referenz)
2. Angular-Komponente (zu prüfen)
3. Analyse-Report aus `/analyze` (Akzeptanzkriterien)
4. Playwright-Tests (falls vorhanden)

## Verifikationsdimensionen

Bewerte jede Dimension: OK / WARNUNG / PROBLEM

### 1. Funktionale Äquivalenz
- Sind alle UI-Elemente aus dem Analyse-Report vorhanden?
- Verhalten sich Events (Submit, Click, Navigate) korrekt?
- Sind alle Validierungen implementiert?
- Gibt es serverseitige Logik, die nicht migriert wurde?

### 2. Angular Best Practices (nach Refactoring)
- Signals statt BehaviorSubject/mutable state?
- OnPush Change Detection genutzt?
- Korrekte Standalone-Component-Struktur?
- Keine direkten DOM-Manipulationen?

### 3. Testabdeckung
- Decken die Unit-Tests die Test-Liste aus dem Analyse-Report ab?
- Gibt es kritische Szenarien ohne Test?

### 4. Harness-Compliance
- Wurden alle HITL-Gates durchlaufen?
- Sind Computational Sensors grün (ng build + ng test + ng lint)?

## Playwright-Prüfung (falls E2E-Tests vorhanden)

```
npx playwright test
```

Führe aus und interpretiere das Ergebnis. Bei Fehlern: dokumentiere im Report — behebe nicht selbst (das geht zurück an `/translate` oder `/refactor`).

## Ausgabe-Format

```
VERIFY REPORT
=============
Komponente: [Name]
Vaadin-Referenz: [Pfad]

Funktionale Äquivalenz:  [OK|WARNUNG|PROBLEM] — <Begründung>
Angular Best Practices:  [OK|WARNUNG|PROBLEM] — <Begründung>
Testabdeckung:           [OK|WARNUNG|PROBLEM] — <Begründung>
Harness-Compliance:      [OK|WARNUNG|PROBLEM] — <Begründung>

Empfehlung: [AKZEPTIEREN | NACHBESSERN]
Offene Punkte:
- <Punkt 1>
```

## HITL-Gate

**STOPP.** Zeige den Report. Frage:
> "Empfehlung AKZEPTIEREN oder NACHBESSERN?"

Falls NACHBESSERN:
- Identifiziere die problematische Dimension
- Starte `/translate` oder `/refactor` erneut mit konkretem Hinweis

Falls AKZEPTIEREN:
> "Nächste Komponente mit `/migrate` oder Projekt abgeschlossen?"

Warte auf explizite Entscheidung.
