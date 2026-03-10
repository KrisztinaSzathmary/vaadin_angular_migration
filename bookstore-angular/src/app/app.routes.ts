import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';
import { EmptyRouteComponent } from './shared/components/empty-route/empty-route.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'inventory', pathMatch: 'full' },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./features/inventory/product-list.component').then((m) => m.ProductListComponent),
        canDeactivate: [unsavedChangesGuard],
        children: [{ path: ':id', component: EmptyRouteComponent }],
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/about/about.component').then((m) => m.AboutComponent),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin.component').then((m) => m.AdminComponent),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
