import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/users').then(m => m.UsersComponent),
      },
      {
        path: 'mails',
        loadComponent: () =>
          import('./features/mails/mails').then(m => m.MailsComponent),
      },
      {
        path: 'data',
        loadComponent: () =>
          import('./features/data/data').then(m => m.DataComponent),
      },
    ],
  },
];

export enum RouteNames {
  Dashboard = 'dashboard',
  Users     = 'users',
  Mails     = 'mails',
  Data      = 'data',
}
