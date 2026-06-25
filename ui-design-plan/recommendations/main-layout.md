# Umsetzungsempfehlung: Main Layout

> **Quelle:** `annotated/main-layout.md`, `flows/01`, `flows/07`
> **Stack:** Angular 22 · Standalone · Signals · Material 22 (M3)
> **Nur stabile, Angular-eigene APIs.**

## 1. Komponenten-Mapping

| Vaadin (Ist) | Angular Material (Soll) | Begründung |
|---|---|---|
| `MainLayout implements RouterLayout` | Standalone `MainLayoutComponent` mit `<router-outlet>` | Konzeptionell identisch: Layout-Shell, die authentifizierte Views umschließt. |
| `Menu extends FlexLayout` (Sidebar) | `<mat-sidenav-container>` + `<mat-sidenav>` | Direkte Material-Entsprechung für Drawer/Content-Split inkl. responsivem Verhalten. |
| Hamburger-`Button` (mobil) | `<button matIconButton>` mit `<mat-icon>menu</mat-icon>` | Ruft `sidenav.toggle()`. Nur im `over`-Modus sichtbar. |
| Toggle via CSS-Klasse `show-tabs` | `MatSidenav.opened` / `.toggle()` + `mode`-Binding | Material steuert das eingebaut; kein CSS-Klassen-Hack. |
| Logo-`Image` (`resolveResource`) | `<img src="assets/img/table-logo.png">` | Statisches Asset nach `assets/img/`. |
| `H3` App-Titel | `<h1>`/`<span class="app-title">` mit M3-Typography | Plain Markup. |
| `SideNav` + `SideNavItem` | `<mat-nav-list>` mit `<a mat-list-item routerLink ...>` | Standard-Navigation; aktiver Zustand via `routerLinkActive`. |
| Nav-Icons (`VaadinIcon.*`) | `<mat-icon>` (Material Symbols) | EDIT→`edit`/`inventory_2`, INFO_CIRCLE→`info`, SIGN_OUT→`logout`. |
| Admin-Item (conditional) | `@if (auth.isAdmin())` um den `mat-list-item` | Rollenbasiert statt dynamischer Server-Route. |
| Logout-`Button` (unten) | `<button matButton>` / `mat-list-item`, per `margin-top:auto` ans Ende | Click → `auth.signOut()` + Navigate `/login`. |

## 2. Layout-Strategie

- **`mat-sidenav-container`** als Wurzel (`height:100vh`). Sidenav links,
  Content (`<mat-sidenav-content>`) mit `<router-outlet>`.
- **Responsiver Modus über `BreakpointObserver` (CDK) + Signals** (recherchiert):
  ```ts
  private bp = inject(BreakpointObserver);
  isHandset = toSignal(
    this.bp.observe('(max-width: 800px)').pipe(map(r => r.matches)),
    { initialValue: false },
  );
  sidenavMode = computed<MatDrawerMode>(() => this.isHandset() ? 'over' : 'side');
  sidenavOpened = computed(() => !this.isHandset());
  ```
  Template: `[mode]="sidenavMode()" [opened]="sidenavOpened()"`. Hamburger nur
  `@if (isHandset())`. Entspricht `main-layout--desktop` vs.
  `--mobile-closed` / `--mobile-menu-open`.
- Logout-Item per Flex ans untere Drawer-Ende (`margin-top:auto`).
- Abstände/Farben über `--mat-sys-*`; Theme über `mat.theme()` im globalen SCSS.

## 3. State & Forms

- Keine Forms. State kommt aus `AuthService`:
  - `currentUser = signal<User|null>(...)`, `isAdmin = computed(...)`.
  - Admin-Nav-Item per `@if (auth.isAdmin())`.
- `BreakpointObserver`-Ergebnis als Signal (`toSignal`), siehe oben.
- **Logout:** `auth.signOut()` (Backend-Call, der Session/Token invalidiert) →
  `router.navigate(['/login'])`. State im Service zurücksetzen.

## 4. Stolpersteine

- **Dynamische Admin-Route (Session-Scoped):** Vaadin registriert `/admin` zur
  Laufzeit. In Angular: **statische** `/admin`-Route + `canActivate`-Admin-Guard;
  Nav-Item nur per `isAdmin()`-Signal einblenden. Kein `Router.resetConfig()`.
- **`RoutesChangeListener`:** entfällt komplett — durch reaktives `isAdmin()`
  ersetzt.
- **Ctrl+L-Logout-Shortcut:** Nicht-Ziel (CLAUDE.md) — nicht migrieren.
- **Locale aus Cookie (`afterNavigation`):** i18n ist Nicht-Ziel dieser Demo;
  nicht implementieren. Falls später: `APP_INITIALIZER` + `LOCALE_ID`.
- **`mat-nav-list` aktiver Zustand:** Vaadins SideNavItem-Highlight → über
  `routerLinkActive="active-link"` + `[routerLinkActiveOptions]` nachbilden.
- **ErrorView als Kind des Layouts:** 404 als verschachtelte Route unter dem
  MainLayout rendern (siehe `error.md`), damit der Drawer erhalten bleibt.

## 5. Empfohlene Module/Imports

`RouterOutlet`, `RouterLink`, `RouterLinkActive`, `MatSidenavModule`,
`MatListModule`, `MatToolbarModule` (optional für Header), `MatButtonModule`,
`MatIconModule`, `LayoutModule` (CDK `BreakpointObserver`).

## Quellen

- [Responsive Sidenav mit BreakpointObserver — zoaibkhan.com](https://zoaibkhan.com/blog/create-a-responsive-sidebar-menu-with-angular-material/) (recherchiert)
- [CDK Layout / BreakpointObserver — material.angular.dev](https://material.angular.dev/cdk/layout/overview)
- [Route guards — angular.dev](https://angular.dev/guide/routing/route-guards)
