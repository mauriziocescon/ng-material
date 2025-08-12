import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'instance-list', loadChildren: () => import('./instance-list/routes') },
  { path: 'instance-detail/:id', loadChildren: () => import('./instance-detail/routes') },
  { path: '**', redirectTo: '/instance-list' },
];
