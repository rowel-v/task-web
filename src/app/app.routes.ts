import { Routes } from '@angular/router';
import { Tasks } from './features/tasks/tasks';
import { Settings } from './features/settings/settings';
import { MainLayout } from './layout/main-layout/main-layout';
import { Overview } from './features/overview/overview';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: 'overview',
        component: Overview,
      },
      {
        path: 'tasks',
        pathMatch: 'full',
        redirectTo: 'tasks/all',
      },
      {
        path: 'tasks/:tab',
        component: Tasks,
      },
      {
        path: 'settings',
        component: Settings,
      },
      {
        path: '',
        redirectTo: 'tasks',
        pathMatch: 'full',
      },
    ],
  },
];
