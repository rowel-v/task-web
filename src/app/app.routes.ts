import { Routes } from '@angular/router';
import { Tasks } from './features/tasks/tasks';
import { Settings } from './features/settings/settings';
import { MainLayout } from './layout/main-layout/main-layout';
import { Overview } from './features/overview/overview';
import { tasksValidTabGuard } from './features/tasks/guards/tasks-valid-tab-guard';
import { authGuard } from './core/guards/auth-guard';
import { Register } from './features/auth/pages/register/register';
import { Login } from './features/auth/pages/login/login';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign in | My Task',
    component: Login,
  },
  {
    path: 'register',
    title: 'Create account | My Task',
    component: Register,
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
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
