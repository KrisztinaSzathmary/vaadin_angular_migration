# Umsetzungsempfehlung: Error View (404)

> **Quelle:** `annotated/error.md`, `flows/07`
> **Stack:** Angular 22 · Standalone · Material 22 (M3)
> **Nur stabile, Angular-eigene APIs.**

## 1. Komponenten-Mapping

| Vaadin (Ist) | Angular Material (Soll) | Begründung |
|---|---|---|
| `ErrorView implements HasErrorParameter<NotFoundException>` | Standalone `NotFoundComponent` an Wildcard-Route `**` | Angulars Mechanismus für „Route nicht gefunden". |
| `H1` Fehler-Überschrift (`TextColor.ERROR`) | `<h1 class="error-title">` mit `color: var(--mat-sys-error)` | Rote Überschrift über M3-Error-Token, nicht hartkodiert. |
| Erklärungs-`Span` (`cant-navigate` + Pfad) | `<span>{{ message }}</span>` mit `router.url` | Pfad der fehlerhaften Route anzeigen. |

## 2. Layout-Strategie

- Einfaches zentriertes Layout (`display:flex; flex-direction:column;
  align-items:center; justify-content:center`).
- **Verschachtelung:** Wildcard-Route als Kind-Route unter dem MainLayout, damit
  der Drawer/Nav erhalten bleibt (entspricht `@ParentLayout(MainLayout.class)`):
  ```ts
  { path: '', component: MainLayoutComponent, canActivate: [authGuard], children: [
      // ... inventory, about, admin ...
      { path: '**', component: NotFoundComponent },
  ]}
  ```
- Maße/Farben über `--mat-sys-*`.

## 3. State & Forms

- Kein Formular, kein Backend-Call.
- Fehlerpfad aus `Router.url` bzw. `ActivatedRoute` lesen und in die Meldung
  interpolieren (ersetzt `event.getLocation().getPath()`).

## 4. Stolpersteine

- **HTTP-404-Statuscode:** Vaadin gibt serverseitig `SC_NOT_FOUND` zurück. Im
  Angular-SPA ist die `**`-Route ein Client-Render mit HTTP 200. Ein echter
  404-Status erfordert SSR oder eine Backend-/Proxy-Regel — außerhalb der
  Client-Komponente. Als Infrastruktur-Hinweis dokumentieren, nicht im Client
  „faken".
- **Laufzeit-Abweichung beachten:** Laut `flows/overview.md` zeigt die laufende
  Vaadin-App bei unbekannter Route faktisch einen **Toast auf Inventory**, nicht
  den dedizierten ErrorView-Screen. Vor dem Translate klären, welches Verhalten
  Ziel ist:
  - **Option A (Code-treu):** dedizierte `NotFoundComponent` an `**`.
  - **Option B (Laufzeit-treu):** Redirect auf `/inventory` + Error-Snackbar.
  Empfehlung: Option A (sauberes, erwartbares SPA-Verhalten), Abweichung
  dokumentieren. Entscheidung gehört in die HITL-Bestätigung.
- **`**`-Route ans Ende** der Konfiguration setzen (sonst greift sie zu früh).

## 5. Empfohlene Module/Imports

`RouterModule` (für `router.url`). Optional `MatButtonModule` für einen
„Zurück"-Link. Bei Option B zusätzlich `MatSnackBar`.

## Quellen

- [Wildcard / not-found routes — angular.dev](https://angular.dev/guide/routing/common-router-tasks)
- Mapping-Basis: `.claude/references/reference-angular-material.md`.
