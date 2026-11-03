import { Sidebar } from './sidebar/sidebar';
import { Component, computed, inject, linkedSignal } from '@angular/core';

import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';

import { TaskHeader } from './header/page/tasks/task-header';
import { OverviewHeader } from './header/page/overview/overview-header';
import { SettingsHeader } from './header/page/settings/settings-header';
import { ProfileHeader } from './header/page/profile/profile-header';
import { ViewportService } from '../../core/services/viewport-service/viewport-service';
import { Profile } from './header/shared/profile/profile';
import { UserService } from '../../domains/user/services/user-service';

type CurrentHeader = 'home' | 'tasks' | 'settings' | 'profile';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    Sidebar,
    OverviewHeader,
    TaskHeader,
    SettingsHeader,
    ProfileHeader,
    Profile,
  ],
  templateUrl: './main-layout.html',
  styles: ``,
})
export class MainLayout {
  private readonly router = inject(Router);
  protected readonly isMobile = inject(ViewportService).isMobile;
  protected readonly openSideNav = linkedSignal(() => !this.isMobile());
  protected readonly userService = inject(UserService);

  // Derived from the actual route — correct on load, refresh, back/forward, not just clicks
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly currentHeader = computed<CurrentHeader>(() => {
    const url = this.url();
    if (url.startsWith('/tasks')) return 'tasks';
    if (url.startsWith('/settings')) return 'settings';
    if (url.startsWith('/profile')) return 'profile';
    return 'home';
  });

  onOpenSideNav() {
    this.openSideNav.set(!this.openSideNav());
  }
}
