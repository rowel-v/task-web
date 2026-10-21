import { CanMatchFn, Routes } from '@angular/router';
import { Tasks } from './features/tasks/tasks';
import { Settings } from './features/settings/settings';
import { MainLayout } from './layout/main-layout/main-layout';
import { Overview } from './features/overview/overview';

const VALID_TABS = new Set(['all', 'pending', 'in-progress', 'completed', 'overdue', 'today', 'archive']);
// true only when the URL is /tasks/<one of the valid tabs>
const validTabGuard: CanMatchFn = (_route, segments) => VALID_TABS.has(segments[1]?.path);

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
        canMatch: [validTabGuard],
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
