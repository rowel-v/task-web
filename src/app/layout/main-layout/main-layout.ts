import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
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
import { SearchService } from '../../core/services/search-service/search-service';
import { FormsModule } from '@angular/forms';

type CurrentSidenav = 'home' | 'tasks' | 'settings';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    RouterLink,
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
  protected openSideNav = signal<boolean>(true);
  protected currentSideNav = signal<CurrentSidenav>('home');
  protected title = computed(() => {
    switch (this.currentSideNav()) {
      case 'home':
        return 'Good morning';
      case 'tasks':
        return 'Tasks';
      case 'settings':
        return 'Settings';
    }
  });
  protected description = computed(() => {
    switch (this.currentSideNav()) {
      case 'home':
        return "Here's your task overview for today.";
      case 'tasks':
        return 'Manage your todos and stay organized.';
      case 'settings':
        return 'Settings Description later.';
    }
  });
  protected openedProfile = signal<boolean>(false);
  protected closingProfile = signal<boolean>(false);

  protected readonly searchService = inject(SearchService);

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
