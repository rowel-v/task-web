import {
  ApplicationConfig,
  inject,
  PLATFORM_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TaskService } from './core/services/task-service/task-service';
import { provideDefaultClient } from './api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    // Only fetch tasks in the browser — skip during SSR/build-time route extraction
    // so ng build doesn't hang waiting for the backend API.
    provideAppInitializer(() => {
      if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
      return firstValueFrom(inject(TaskService).getAllTask());
    }),
    provideDefaultClient({ basePath: 'http://localhost:8080' }),
  ],
};
