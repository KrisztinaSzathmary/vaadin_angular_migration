import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/inventory', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component'),
    title: 'Login - Bookstore'
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component'),
    canActivate: [authGuard],
    children: [
      {
        path: 'inventory',
        loadComponent: () => import('./features/inventory/inventory.component'),
        title: 'Inventory - Bookstore'
      },
      {
        path: 'inventory/:id',
        loadComponent: () => import('./features/inventory/inventory.component'),
        title: 'Product - Bookstore'
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin.component'),
        canActivate: [adminGuard],
        title: 'Admin - Bookstore'
      },
      {
        path: 'about',
        loadComponent: () => import('./features/about/about.component'),
        title: 'About - Bookstore'
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./features/error/error.component'),
    title: 'Not Found - Bookstore'
  }
];
