---
name: translate
description: Übersetze eine Vaadin-Komponente in eine funktional äquivalente Angular Standalone Component inkl. Unit-Tests. Phase 2 des Migration-Harness. Basis ist der bestätigte Analyse-Report.
---

# Translate — Angular-Komponente generieren

Übersetze die Vaadin-Komponente in eine funktional äquivalente Angular Standalone Component. Basis: der bestätigte Analyse-Report aus `/analyze`.

## Guide (Feedforward)

Du bist ein spezialisierter Übersetzungs-Agent. Dein Ziel: **funktionale Äquivalenz**, nicht Schönheit. Der Code darf noch nicht idiomatisch sein — das kommt in `/refactor`.

## Regeln

- Kein Code, der über die im Analyse-Report beschriebene Funktionalität hinausgeht
- Standalone Component (kein NgModule)
- Der Code darf hässlich sein — Hauptsache funktional äquivalent
- Kein Refactoring in dieser Phase

## Dateistruktur

```
src/
  <komponente>/
    <komponente>.component.ts
    <komponente>.component.html
    <komponente>.component.css
    <komponente>.component.spec.ts
```

## Teststruktur

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KomponenteComponent } from './komponente.component';

describe('KomponenteComponent', () => {
  let component: KomponenteComponent;
  let fixture: ComponentFixture<KomponenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KomponenteComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(KomponenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // weitere Tests aus der Test-Liste
});
```

## Sensor-Check (Computational Sensors)

Führe aus:
```
ng build
ng test
ng lint
```

**Erwartetes Ergebnis:** Build erfolgreich, alle Tests grün, keine Lint-Fehler.

Bei Fehlern: behebe sie selbst und führe die Sensoren erneut aus. Kein HITL bis alle drei Sensoren grün sind.

## HITL-Gate

**STOPP.** Zeige die generierten Dateien und die Sensor-Ergebnisse. Frage:
> "Komponente funktional äquivalent und alle Sensoren grün? Weiter mit `/refactor`?"

Warte auf explizite Bestätigung.
