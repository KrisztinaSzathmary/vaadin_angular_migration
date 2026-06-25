# Migration State — Vaadin → Angular (Bookstore)

**Stand:** 2026-06-25
**Branch:** `bp3-harness-demo`

## Aktueller Status

### Abgeschlossen

| Schritt | Ergebnis |
|---|---|
| `/ui-plan` Phase 1 — ui-recorder | 27 Screenshots in `ui-design-plan/screenshots/` + `manifest.md` |
| `/ui-plan` Phase 2 — ui-annotator | 7 Annotationsdateien in `ui-design-plan/annotated/` |
| `/ui-plan` Phase 3 — ui-flow-mapper | 8 Flow-Dateien in `ui-design-plan/flows/` |
| `/ui-plan` Phase 4 — ui-advisor | 7 Empfehlungsdateien in `ui-design-plan/recommendations/` |
| `migration-planner` | `migration-backlog.md` + `migration-roadmap.md` im Repo-Root |

### Nächster Schritt

**M-00 — E2E-Test-Harness** (Playwright-Grundkonfiguration für `bookstore-angular/`)

Aufruf: `/migrate M-00`

Danach sequenziell: M-01 → M-02 → … → M-14 (je mit HITL-Gate nach Analyze, Translate, Refactor, Verify).

## Backlog-Übersicht

| ID | Einheit | Komplexität | Abhängt von | Status |
|---|---|---|---|---|
| M-00 | E2E-Test-Harness | M | — | **offen** |
| M-01 | Domänenmodelle (Product, Category, Availability) | S | — | offen |
| M-02 | DataService (HTTP-Anbindung) | M | M-01 | offen |
| M-03 | i18n / Übersetzungen (de+en) | S | — | offen |
| M-04 | Auth-Domäne (AccessControl) | M | M-03 | offen |
| M-05 | ProductDataProvider → Signal-Store | M | M-01, M-02 | offen |
| M-06 | Routing & Auth-Guard | M | M-04 | offen |
| M-07 | AppComponent / Shell | S | M-06 | offen |
| M-08 | MainLayout / Navigation | M | M-04, M-07 | offen |
| M-09 | LoginView | M | M-04, M-06 | offen |
| M-10 | AboutView | S | M-07, M-08 | offen |
| M-11 | Inventory CRUD-View | L | M-05, M-08, M-09 | offen |
| M-12 | ProductForm | L | M-01, M-05, M-11 | offen |
| M-13 | ErrorView / 404-Route | S | M-06 | offen |
| M-14 | AdminView (Kategorie-Verwaltung) | M | M-02, M-08 | offen |

## Offene Punkte / Entscheidungen

1. **`BookstoreTitle` Custom Element** — JS-Implementierung liegt in
   `bookstore-starter-flow-my-component/src/main/java/com/vaadin/samples/BookstoreTitle.java`
   als `@Tag("bookstore-title")`-Wrapper. Die eigentliche JS-Datei (`bookstore-title.js`)
   noch nicht analysiert. Vor M-10 (AboutView) klären.
2. **ErrorView-Verhalten** — Laufzeit zeigt Toast statt separatem Screen (lt. flow-mapper).
   In M-13 als Wildcard-Route + Notification umgesetzt (kein 1:1 zur Java-Impl).
3. **BeforeLeave-Guard / Dirty-Wechsel im Grid** — Vaadin schützt nur beim Verlassen
   der gesamten Inventory-View, nicht beim Produkt-Wechsel innerhalb des Grids.
   In Angular mit `CanDeactivateFn` bewusst entscheiden: gleiches Verhalten oder
   verbessertes (Guard auch beim Grid-Klick)?

## Vaadin-App starten

```bash
source ~/.sdkman/bin/sdkman-init.sh
mvn wildfly:run -PrunWar -pl bookstore-starter-flow-ui
# URL: http://localhost:8080/bookstore-starter-flow-ui-1.1-SNAPSHOT/
```

## Harness-Hierarchie (Referenz)

```
/migrate-project
   ├─ /ui-plan                  ✅ abgeschlossen
   │     Recorder → Annotator → Flow-Mapper → Advisor
   ├─ migration-planner (Agent) ✅ abgeschlossen → migration-backlog.md
   └─ /migrate <M-XX>           ⏳ nächster Schritt: M-00
         Analyze → Translate → Refactor → Verify (je mit HITL-Gate)
```
