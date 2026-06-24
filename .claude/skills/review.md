---
name: review
description: Analysiere eine migrierte Angular-Komponente als unabhängiger Code-Reviewer auf Code-Qualität (Inferential Sensor, ergänzend zu /verify). Use für Qualitätsprüfung getrennt von Äquivalenzprüfung.
---

# Review — Code-Qualität prüfen

Analysiere die migrierte Angular-Komponente als unabhängiger Code-Reviewer. Dies ist ein **Inferential Sensor** des Harness (nach Böckeler): semantisch reich, langsamer, ergänzend zu `/verify`.

> **Abgrenzung zu `/verify`:** `/verify` prüft *funktionale Äquivalenz* (stimmt das Verhalten?). `/review` prüft *Code-Qualität* (ist der Code gut geschrieben?). Beide können unabhängig voneinander aufgerufen werden.

## Reviewdimensionen

Bewerte jede Dimension: OK / WARNUNG / PROBLEM

### 1. Korrektheit
- Implementieren die Tests die Anforderungen aus dem Analyse-Report?
- Gibt es Edge Cases ohne Test-Abdeckung?

### 2. Angular Best Practices
- Signals, OnPush, Standalone Components korrekt eingesetzt?
- Reactive Forms statt Template-driven (sofern nicht begründet abgewichen)?
- Keine direkten DOM-Manipulationen?

### 3. Wartbarkeit
- Kann ein neuer Entwickler die Komponente sofort verstehen?
- Typannotationen vollständig und korrekt?
- Keine unnötige Komplexität?

### 4. Harness-Compliance
- Wurden alle Phasen (Analyze → Translate → Refactor → Verify) durchlaufen?
- Sind alle Computational Sensors grün?

## Ausgabe-Format

```
REVIEW REPORT
=============
Korrektheit:          [OK|WARNUNG|PROBLEM] — <Begründung>
Angular Best Practices: [OK|WARNUNG|PROBLEM] — <Begründung>
Wartbarkeit:          [OK|WARNUNG|PROBLEM] — <Begründung>
Harness-Compliance:   [OK|WARNUNG|PROBLEM] — <Begründung>

Empfehlung: [AKZEPTIEREN | ÜBERARBEITEN]
Offene Punkte:
- <Punkt 1>
```

## HITL-Gate

**STOPP.** Zeige den Report. Frage:
> "Empfehlung AKZEPTIEREN oder ÜBERARBEITEN?"

Falls ÜBERARBEITEN:
- Identifiziere die problematische Dimension
- Starte `/translate`, `/refactor` oder `/verify` erneut mit konkretem Hinweis

Falls AKZEPTIEREN:
> "Nächste Komponente mit `/migrate`?"

Warte auf explizite Entscheidung.
