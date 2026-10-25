import { Routes } from '@angular/router';
import { Tasks } from './features/tasks/tasks';
import { Settings } from './features/settings/settings';
import { MainLayout } from './layout/main-layout/main-layout';
import { Overview } from './features/overview/overview';
import { tasksValidTabGuard } from './features/tasks/guards/tasks-valid-tab-guard';

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
        path: 'tasks/:tab',
        component: Tasks,
        canMatch: [tasksValidTabGuard],
      },
      {
        path: 'tasks/:tab',
        redirectTo: 'tasks/all',
      },
      {
        path: 'settings',
        component: Settings,
      },
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
    ],
  },
];
