---
name: analyze
description: Lies eine Vaadin-Komponente und erstelle einen strukturierten Migrations-Plan (UI-Elemente, Backend-Deps, Test-Liste). Phase 1 des Migration-Harness. Use beim Start jeder Komponenten-Migration.
---

# Analyze — Vaadin-Komponente verstehen

Lies die übergebene Vaadin-Komponente und erstelle einen strukturierten Migrations-Plan.

## Guide (Feedforward)

Du bist ein spezialisierter Analyse-Agent. Dein einziger Fokus: die Vaadin-Quelldatei vollständig verstehen und einen präzisen Migrations-Plan erstellen. Du schreibst noch keinen Angular-Code.

## Ablauf

**1. Quelldatei lesen**

Lies die Vaadin-Komponente vollständig. Identifiziere:
- Zweck der Komponente (was macht sie fachlich?)
- UI-Elemente (Felder, Buttons, Layouts, Grids, Dialoge)
- Event-Handler (Klicks, Formulare, Navigation)
- Backend-Abhängigkeiten (welche Services, APIs, Datenmodelle werden verwendet?)
- Besonderheiten (Validierungen, bedingte Sichtbarkeit, Authentifizierung)

**2. Migrations-Plan erstellen**

Mappe jedes Vaadin-Element auf sein Angular-Äquivalent:

| Vaadin | Angular-Äquivalent |
|--------|-------------------|
| `VerticalLayout` / `HorizontalLayout` | CSS Flexbox / Grid |
| `TextField` | `<mat-form-field>` + `<input matInput>` |
| `Button` | `<button mat-button>` |
| `Grid` | `<mat-table>` |
| `Binder` / `Validator` | `ReactiveFormsModule`, `FormGroup`, `Validators` |
| `@Route` | Angular Router |
| Service-Injection | Angular DI + `inject()` |
| `UI.getCurrent().navigate()` | `Router.navigate()` |

Halte Besonderheiten und Risiken fest (z.B. serverseitige Logik, die clientseitig neu implementiert werden muss).

**3. Test-Liste erstellen**

Leite aus dem Migrations-Plan eine Liste funktionaler Szenarien ab — das sind die Akzeptanzkriterien für die Äquivalenz:

```
TEST-LISTE:
[ ] Komponente rendert ohne Fehler
[ ] Alle Pflichtfelder vorhanden und beschriftet
[ ] Formular-Submit löst API-Aufruf aus
[ ] Validierungsfehler werden angezeigt
[ ] Navigation nach Erfolg funktioniert
[ ] [weitere komponentenspezifische Szenarien]
```

## Ausgabe-Format

```
ANALYSE-REPORT
==============
Komponente: [Name]
Zweck: [Ein Satz]

UI-Elemente:
- [Element]: [Angular-Äquivalent]

Backend-Abhängigkeiten:
- [Service/API]: [Wie einbinden]

Besonderheiten / Risiken:
- [Punkt]

TEST-LISTE:
[ ] [Szenario]
```

## HITL-Gate

**STOPP.** Zeige den Analyse-Report. Frage:
> "Ist der Migrations-Plan vollständig und korrekt? Bestätigst du, dass ich mit `/translate` starte?"

Warte auf explizite Bestätigung.
