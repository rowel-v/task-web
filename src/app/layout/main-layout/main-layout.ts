import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { SearchService } from '../../core/services/search-service/search-service';
import { FormsModule } from '@angular/forms';
import {
  LucideMenu,
  LucideHouse,
  LucideBadgeCheck,
  LucideSettings,
  LucideX,
  LucideUser,
  LucideLogOut,
  LucideSearch,
} from '@lucide/angular';

type CurrentSidenav = 'home' | 'tasks' | 'settings';

interface NavItem {
  key: CurrentSidenav;
  label: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideMenu,
    LucideHouse,
    LucideBadgeCheck,
    LucideSettings,
    LucideX,
    LucideUser,
    LucideLogOut,
    LucideSearch,
    FormsModule,
  ],
  templateUrl: './main-layout.html',
  styles: ``,
})
export class MainLayout {
  private readonly router = inject(Router);
  protected readonly searchService = inject(SearchService);
  protected readonly openSideNav = signal<boolean>(true);
  protected readonly navItems: NavItem[] = [
    { key: 'home', label: 'Home', route: '/overview' },
    { key: 'tasks', label: 'Tasks', route: '/tasks' },
    { key: 'settings', label: 'Settings', route: '/settings' },
  ];
  protected readonly openedProfile = signal<boolean>(false);
  protected readonly closingProfile = signal<boolean>(false);

  // Derived from the actual route — correct on load, refresh, back/forward, not just clicks
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly currentSideNav = computed<CurrentSidenav>(() => {
    const url = this.url();
    if (url.startsWith('/tasks')) return 'tasks';
    if (url.startsWith('/settings')) return 'settings';
    return 'home';
  });

  protected readonly title = computed(() => {
    switch (this.currentSideNav()) {
      case 'home':
        return 'Good morning';
      case 'tasks':
        return 'Tasks';
      case 'settings':
        return 'Settings';
    }
  });

  protected readonly description = computed(() => {
    switch (this.currentSideNav()) {
      case 'home':
        return "Here's your task overview for today.";
      case 'tasks':
        return 'Manage your tasks and stay organized.';
      case 'settings':
        return 'Settings Description later.';
    }
  });

  protected openProfile() {
    this.closingProfile.set(false);
    this.openedProfile.set(true);
  }

  protected closeProfile() {
    if (!this.openedProfile()) {
      return;
    }

    this.closingProfile.set(true);

    setTimeout(() => {
      this.openedProfile.set(false);
      this.closingProfile.set(false);
    }, 200);
  }
}
