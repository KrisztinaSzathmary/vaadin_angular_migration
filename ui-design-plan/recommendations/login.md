# Umsetzungsempfehlung: Login View

> **Quelle:** `annotated/login.md`, `flows/01-login-logout.md`
> **Stack:** Angular 22 · Standalone · Signals · Reactive Forms · Material 22 (M3)
> **Nur stabile, Angular-eigene APIs.**

## 1. Komponenten-Mapping

| Vaadin (Ist) | Angular Material (Soll) | Begründung |
|---|---|---|
| `FlexLayout` (zweispaltig: Info / Form) | CSS Flexbox (`display:flex`) im Komponenten-SCSS | Kein Material-Layout-Wrapper nötig; reines CSS, siehe Layout-Strategie. |
| `LoginForm` (Compound) | Eigenes `<form [formGroup]>` mit `MatFormField` + `matInput` + `MatButton` | Kein 1:1-Pendant. Vaadins `LoginForm` aufbrechen in zwei `mat-form-field` (Username, Password) + Submit-Button. |
| Username-Feld | `<mat-form-field>` + `<input matInput formControlName="username">` | Standard. Label via `<mat-label>`. |
| Password-Feld | `<mat-form-field>` + `<input matInput type="password" formControlName="password">` | Optional `matSuffix` mit `mat-icon-button` zum Ein-/Ausblenden (Material-Standardmuster, kein neues Feature). |
| Submit-Button | `<button matButton="filled">` (M3 Filled Button) | Entspricht primärem Vaadin-Login-Button. M3-Variante über `matButton="filled"`. |
| "Passwort vergessen"-Link | `<button matButton>` (Text-Variante) oder `<a matButton>` | Löst nur Snackbar aus (kein Backend). |
| Fehlerzustand `setError(true)` | `MatError` im Formular **und/oder** `MatSnackBar` | Falsche Credentials → Banner unter dem Formular (siehe Stolpersteine). |
| `H1` / `Span` (Infobox) | Plain `<h1>` / `<p>` mit M3-Typography-Tokens | Kein Material-Element nötig. |
| Sprach-`Select<Locale>` | **Entfällt** in dieser Migration | Sprachumschaltung ist Nicht-Ziel (siehe `flows/overview.md`, „Nicht modellierte Pfade"). Falls später benötigt: `mat-select`. |
| `Notification.show` (Forgot-Hint) | `MatSnackBar` | Standard-Entsprechung. |

## 2. Layout-Strategie

- Zweispaltiges Layout (links Info-Panel, rechts zentriertes Formular) als
  `display:flex; min-height:100vh;`. Linke Spalte mit fixer/relativer Breite,
  rechte Spalte `flex:1` mit `justify-content:center; align-items:center;`.
- **Responsive (mobil, 390 px):** Per Media Query (`@media (max-width: 600px)`)
  auf `flex-direction:column` umstellen; Info-Panel oben oder ausblenden,
  Formular füllt die Breite. Entspricht `login--mobile.png`.
- Farben/Abstände ausschließlich über `--mat-sys-*`-Tokens, keine Hexwerte.
- Login-Route bekommt **kein** MainLayout (eigenständige Route, kein Drawer).

## 3. State & Forms

- **Reactive Form:**
  ```ts
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  ```
  Leeres Submit → `MatError` pro Feld (entspricht `login--empty-submit.png`,
  Vaadins Required-Markierung).
- **Auth-Service:** `AuthService` mit `HttpClient` + Signals (kein `resource()`).
  `signIn(username, password): Observable<AuthResult>`. Login-Status als
  `signal<User|null>` im Service, abgeleitete `isAdmin = computed(...)`.
- **Lokaler State** der View: `loginError = signal(false)` für den Fehlerbanner.
- **Nach Erfolg:** `router.navigate(['/inventory'])`. Admin-Rolle nicht über
  dynamische Routen, sondern im `AuthService`-State halten und per `canActivate`
  (Admin-Guard) auswerten (siehe `main-layout.md`).

## 4. Stolpersteine

- **`LoginForm` ist Compound:** Fehlerlogik (`setError`) und i18n-Labels stecken
  in der Vaadin-Komponente. In Angular explizit modellieren: ein `loginError`-
  Signal steuert einen sichtbaren Fehlerbanner; Feld-Required über `MatError`.
- **`changeSessionId()` / Session-Fixation:** Serverseitiger Schutz. Im
  Angular-SPA nicht nachbaubar — muss das Backend beim Login (Token-Rotation)
  leisten. In der Empfehlung dokumentieren, nicht clientseitig „simulieren".
- **Mock-Auth (`username == password`):** Reale Auth läuft übers Backend; der
  Client ruft nur den Endpunkt auf. Keine Auth-Logik im Client nachbauen.
- **Admin-Rolle:** Statt serverseitiger dynamischer Route-Registrierung wird die
  Rolle aus der Login-Antwort gelesen und im `AuthService` gehalten. Routen sind
  statisch, `/admin` per `canActivate`-Guard geschützt.
- **Sprach-Selektor:** bewusst weggelassen (Nicht-Ziel). Beim Translate nicht
  versehentlich als Feature wieder einführen.
- **Redirect-Guard:** Vaadins globaler `BeforeEnterListener` → in Angular ein
  funktionaler `authGuard` (`CanActivateFn`) auf allen geschützten Routen, der
  bei fehlendem Login zu `/login` umleitet.

## 5. Empfohlene Module/Imports

`ReactiveFormsModule`, `MatFormFieldModule`, `MatInputModule`, `MatButtonModule`,
`MatIconModule` (Password-Toggle), `MatSnackBar` (über `inject`).

## Quellen

- [Reactive Forms / Validators — angular.dev](https://angular.dev/guide/forms/reactive-forms)
- [Route guards (CanActivateFn) — angular.dev](https://angular.dev/guide/routing/route-guards)
- Material-Mapping siehe `.claude/references/reference-angular-material.md`.
