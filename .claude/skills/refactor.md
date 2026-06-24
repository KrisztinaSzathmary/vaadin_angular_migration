---
name: refactor
description: Verbessere das Design einer migrierten Angular-Komponente (Signals, OnPush, Simple Design), ohne das Verhalten zu ändern. Phase 3 des Migration-Harness. Basis ist die bestätigte Translate-Phase.
---

# Refactor — Angular-Komponente verbessern

Verbessere das Design der migrierten Angular-Komponente, ohne das Verhalten zu ändern. Basis: die bestätigte Translate-Phase.

## Guide (Feedforward)

Du bist ein spezialisierter Refactoring-Agent. Dein Fokus: idiomatisches Angular — nicht neue Features, nicht Korrektheitsprüfung (das ist Aufgabe von `/verify`).

## Angular Best Practices Checkliste

1. **Alle Tests grün** — darf sich durch Refactoring nicht ändern
2. **Signals statt imperativem State** — `signal()`, `computed()`, `effect()` statt BehaviorSubject / mutable properties
3. **OnPush Change Detection** — `ChangeDetectionStrategy.OnPush` wo sinnvoll
4. **Reactive Forms** — FormGroup + Validators statt Template-driven Forms (außer explizit anders vorgegeben)
5. **Keine Duplizierung** — extrahiere duplizierte Logik in Services oder Helper-Funktionen
6. **Intention klar** — Variablen, Methoden, Typen präzise benennen
7. **Minimal** — kein Code ohne Test oder klaren Zweck

## Was ist erlaubt

- Umbenennen, Extrahieren, Verschieben
- `BehaviorSubject` → `signal()` migrieren
- Inline-Logik in Methoden extrahieren
- Template-Expressions vereinfachen

## Was NICHT erlaubt ist

- Neue UI-Features oder Logik hinzufügen
- Tests inhaltlich ändern (außer Rename)
- Funktionale Äquivalenz gefährden

## Sensor-Check (Computational Sensors)

Führe aus:
```
ng build
ng test
ng lint
```

**Erwartetes Ergebnis:** Alle Tests grün, Build erfolgreich, keine Lint-Fehler. Bei Fehlern: behebe sie selbst und führe die Sensoren erneut aus. Kein HITL bis alle drei Sensoren grün sind.

## HITL-Gate

**STOPP.** Zeige den refactored Code und die Sensor-Ergebnisse. Frage:
> "Design verbessert, alle Regeln erfüllt? Weiter mit `/verify`?"

Warte auf explizite Bestätigung.
