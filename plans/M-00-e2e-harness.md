# Plan M-00 — E2E-Test-Harness

**Erstellt:** 2026-06-26  
**Branch:** `bp3-harness-demo`  
**Backlog-Eintrag:** `migration-backlog.md` Z. 12–21  
**HITL-Gates:** nach Phase 2 (Analyze), Phase 3 (Translate), Phase 4 (Refactor), Phase 5 (Verify)

---

## Kontext & Ziel

`bookstore-angular/` existiert noch nicht. **Das Anlegen des Angular-Projekts ist expliziter
Teil von M-00** (nicht Vorbedingung außerhalb des Backlogs) — siehe `migration-backlog.md`
M-00 „Enthält als frühere Teilschritte". M-00 legt das Angular-22-Projekt-Scaffold an
(`ng new`, gepinnte Version, Baseline-Scripts) und richtet danach den vollständigen
deterministischen Sensor-Stack ein, der für alle späteren Iterations-Zyklen (M-01..M-14)
als Prüf-Infrastruktur dient.

M-00 hat keine Vaadin-Quelle — es ist ein reines Infrastruktur-Ticket. Die Vorlage sind
die 7 Flow-Dateien in `ui-design-plan/flows/`.

---

## Phase 0: Documentation Discovery (erledigt)

**Quellen konsultiert:**
- `migration-backlog.md` Z. 12–21 (Akzeptanzkriterien M-00)
- `migration-roadmap.md` (Sensor-Protokoll)
- `CLAUDE.md` (Harness-Formel, Stack-Vorgabe, Sensoren)
- `.claude/skills/verify.md` (Tool-Tabelle + Playwright-Kommandos)
- `ui-design-plan/flows/01..07` + `overview.md` (alle Flow-Dateien vollständig)
- `migration-state.md` (aktueller Stand)

**Erlaubte APIs / Tool-Versionen:**
| Tool | npm-Paket | Zweck |
|------|-----------|-------|
| `@playwright/test` | latest | E2E, Visual Regression, ARIA-Snapshots |
| `@axe-core/playwright` | latest | WCAG-A11y (`@a11y`-Tag) |
| `type-coverage` | latest | Typ-Abdeckung (% any) |
| `dependency-cruiser` | latest | Architektur-/Import-Regeln |

**Angular-Version:** 22 (per `nvm-provisioner` sicherstellen vor `ng new`)  
**Dev-Server-Port:** 4200 (Standard, für `baseURL` in `playwright.config.ts`)  
**Vaadin-Backend-Port:** 8080 (für spätere E2E mit echtem Backend; M-00 nur Smoke-Spec ohne Backend)

**Anti-Pattern-Guards:**
- KEIN pnpm — Harness-Branch stellt auf npm um (Commit `039fe74`)
- KEINE Visual-Regression-Baselines jetzt — entstehen View-by-View ab M-09
- KEIN Mock-Backend für M-00 — Smoke-Spec prüft nur Angular-Startup + Browser-Launch

---

## Phase 1: Voraussetzungen sicherstellen (nvm-provisioner) + Angular-Scaffold

**Aktion:** nvm-provisioner-Agent bestätigen, dass Node ≥ 20 + Angular CLI 22 verfügbar.

```bash
# Prüfen
node --version      # ≥ 20.x erwartet
npm --version
ng version          # Angular CLI 22.x erwartet
```

Falls nicht vorhanden: User durch SDKMAN/nvm-Schritte führen (interaktiv).

**Verification:**
- `node --version` gibt `v20.x.x` oder höher aus
- `ng version` gibt `Angular CLI: 22.x.x` aus

**Anschließend: Angular-Projekt-Scaffold anlegen** (`bookstore-angular/` existiert vor diesem
Schritt noch nicht — das Scaffolding ist Teil von M-00, keine externe Vorbedingung):

```bash
# Im Repo-Root
ng new bookstore-angular --standalone --routing=false --style=scss --skip-git --strict
node -v | sed 's/^v//' > bookstore-angular/.nvmrc   # Node-Version reproduzierbar festschreiben
```

- **Angular-Version pinnen:** exakte 22.0.x-Patch-Version zum Zeitpunkt der Ausführung
  fixieren (siehe `.claude/references/reference-angular-material.md` für den zuletzt
  verifizierten Stand; bei Abweichung dort aktualisieren).
- **Baseline-Scripts in `bookstore-angular/package.json` sicherstellen** (von `ng new`
  vorbelegt, hier nur verifizieren): `"build": "ng build"`, `"test": "ng test"`,
  `"lint": "ng lint"`.

**Verification:**
- `bookstore-angular/` existiert mit Standard-Angular-Struktur
- `cd bookstore-angular && ng build && ng test --watch=false && ng lint` laufen grün auf
  dem leeren Scaffold

---

## Phase 2: Analyze — Infrastruktur-Plan (HITL-Gate 1)

**Was zu analysieren:**

Kein Vaadin-Quellcode — stattdessen werden die Akzeptanzkriterien M-00 in
prüfbare Anforderungen übersetzt:

1. **Angular-Projekt-Scaffold** — bereits in Phase 1 angelegt (`ng new bookstore-angular`,
   Angular 22.0.x, standalone, no routing yet (folgt M-06), strict, SSR=false,
   inline-style=false, skip-git=true (bereits im Harness-Repo), `.nvmrc` gepinnt).
   Ab hier nur noch die E2E-/Sensor-Infrastruktur *innerhalb* des bestehenden Projekts.
2. **Playwright-Konfiguration** (`playwright.config.ts`):
   - `baseURL: 'http://localhost:4200'`
   - `use: { actionTimeout: 5000, animations: 'disabled' }`
   - `fullyParallel: false` (deterministisch)
   - Retries: 0 lokal, 2 in CI
   - Reporter: list + html
   - `webServer`-Block: startet `ng serve` vor den Tests
3. **`@axe-core/playwright`** eingebunden — Hilfsfunktion `checkA11y` in `e2e/helpers/a11y.ts`
4. **Smoke-Spec** (`e2e/smoke.spec.ts`) — navigiert zu `/`, erwartet 200 (kein 404)
5. **Flow-Referenz-Kommentare** (`e2e/flows/`) — leere Spec-Dateien je Flow (01..07),
   Kommentare verweisen auf `ui-design-plan/flows/NN-*.md`
6. **dependency-cruiser-Konfiguration** (`.dependency-cruiser.js`) — verbietet Kreisimporte,
   erzwingt `core/` → kein Import aus `feature/`
7. **type-coverage-Skript** in `package.json`: `"type-coverage": "type-coverage --at-least 95"`

**Migrations-Plan (für HITL-Bestätigung):**

```
bookstore-angular/
├── e2e/
│   ├── helpers/
│   │   └── a11y.ts          ← @axe-core/playwright Wrapper
│   ├── flows/
│   │   ├── 01-login.spec.ts         (leer, Flow-Ref-Kommentar)
│   │   ├── 02-inventory.spec.ts     (leer, Flow-Ref-Kommentar)
│   │   ├── 03-produkt-anlegen.spec.ts
│   │   ├── 04-produkt-bearbeiten.spec.ts
│   │   ├── 05-produkt-loeschen.spec.ts
│   │   ├── 06-kategorie.spec.ts
│   │   └── 07-navigation.spec.ts
│   └── smoke.spec.ts        ← läuft jetzt grün
├── playwright.config.ts
├── .dependency-cruiser.js
└── package.json             ← type-coverage-Skript ergänzt
```

**[HITL-GATE 1]** Präsentiere diesen Plan. Warte auf Freigabe.

---

## Phase 3: Translate — Scaffold + Konfiguration (HITL-Gate 2)

**Aktion (Subagent):**

1. `bookstore-angular/` Scaffold bereits vorhanden (Phase 1) — hier nur `cd bookstore-angular`
2. `npm install --save-dev @playwright/test @axe-core/playwright`
3. `npx playwright install chromium` (nur Chromium, deterministisch)
4. Schreibe `playwright.config.ts` nach obiger Spezifikation
5. Schreibe `e2e/helpers/a11y.ts`:
   ```ts
   import { Page } from '@playwright/test';
   import AxeBuilder from '@axe-core/playwright';
   export async function checkA11y(page: Page) {
     const results = await new AxeBuilder({ page }).analyze();
     return results.violations;
   }
   ```
6. Schreibe `e2e/smoke.spec.ts`:
   ```ts
   import { test, expect } from '@playwright/test';
   test('app startet', async ({ page }) => {
     await page.goto('/');
     await expect(page).not.toHaveTitle(/Error/);
   });
   ```
7. Schreibe `e2e/flows/01-login.spec.ts` bis `07-navigation.spec.ts` (leere Specs mit
   Flow-Referenz-Kommentar, je `test.skip(...)` als Platzhalter)
8. Initialisiere `dependency-cruiser`: `npx --yes depcruise --init`
9. Ergänze `package.json` um `"type-coverage"` Skript

**Sensoren nach Translate:**
```bash
cd bookstore-angular
ng build                      # TypeScript strict grün
ng test --watch=false         # leere Karma-Suite grün
ng lint                       # ESLint grün
npx playwright test           # smoke.spec.ts grün (mit ng serve im Hintergrund)
```

Bei Fehlern: Subagent behebt selbst, wiederholt bis alle grün.

**[HITL-GATE 2]** Zeige Ausgaben aller vier Sensoren + File-Tree. Warte auf Bestätigung.

---

## Phase 4: Refactor — Simple Design Check (HITL-Gate 3)

**Aktion (Subagent):**

Simple Design auf die Infrastruktur anwenden:

1. Prüfe `a11y.ts` auf unnötige Abhängigkeiten — nur was M-00 braucht
2. Prüfe `playwright.config.ts` — keine toten Optionen (z. B. `use.screenshot` wenn nicht gebraucht)
3. Prüfe `dependency-cruiser`-Regeln — dokumentiere explizit was erlaubt/verboten ist
4. Prüfe `type-coverage`-Schwellwert 95% — ist das erreichbar für leere App?
5. Sensoren erneut laufen lassen

**Sensoren nach Refactor:**
```bash
cd bookstore-angular
ng build && ng test --watch=false && ng lint
npx playwright test
```

**[HITL-GATE 3]** Zeige refactored Konfiguration + Sensor-Ausgaben. Freigabe abwarten.

---

## Phase 5: Verify — Äquivalenz-Report (HITL-Gate 4)

**Computational Sensors (deterministisch):**

| Sensor | Kommando | Erwartetes Ergebnis |
|--------|----------|---------------------|
| Build | `ng build` | Exit 0, kein TypeScript-Fehler |
| Unit Tests | `ng test --watch=false` | Alle grün (leere Suite OK) |
| Linter | `ng lint` | Keine Fehler |
| E2E Smoke | `npx playwright test e2e/smoke.spec.ts` | Grün |
| A11y | `npx playwright test --grep @a11y` | Keine Fixtures → Skip OK |
| Dep-Cruiser | `npx depcruise src` | Keine Regelverletzung |
| Type-Coverage | `npm run type-coverage` | ≥ 95% (leere App: 100%) |

**Inferential Sensor (LLM-as-Judge):**

Bewertet:
- Sind alle 7 Flow-Dateien als Spec-Vorlagen referenziert?
- Ist die Playwright-Konfiguration für deterministische Ausführung geeignet?
- Sind die A11y-Helpers korrekt eingebunden?
- Sind die Anti-Pattern-Guards (kein pnpm, kein SSR, strict mode) eingehalten?

**[HITL-GATE 4]** Zeige VERIFY REPORT. Frage: Akzeptiert?

---

## Akzeptanzkriterien (aus migration-backlog.md M-00)

- [ ] Playwright läuft deterministisch (Animationen aus, dynamischer Inhalt maskiert)
- [ ] Leeres Smoke-Spec grün
- [ ] `@axe-core/playwright` eingebunden
- [ ] Flow-Dateien (01..07) als Testvorlagen referenziert

---

## Nach M-00: Nächster Schritt

M-01 und M-03 haben keine gemeinsamen Abhängigkeiten und können parallel gestartet
werden, aber per CLAUDE.md Workflow-Disziplin: je eine Komponente sequenziell.
Empfehlung: M-01 (Domänenmodelle) als nächstes, da M-02, M-05, M-10, M-11 davon abhängen.
