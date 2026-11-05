import { Component, computed, inject, model } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideMenu,
  LucideX,
  LucideHouse,
  LucideBadgeCheck,
  LucideSettings,
} from '@lucide/angular';
import { ViewportService } from '../../../core/services/viewport-service/viewport-service';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideMenu,
    LucideX,
    LucideHouse,
    LucideBadgeCheck,
    LucideSettings,
  ],
  templateUrl: './sidebar.html',
  host: { class: 'contents' },
})
export class Sidebar {
  readonly open = model(false);
  protected readonly isMobile = inject(ViewportService).isMobile;
  protected readonly expanded = computed(() => this.isMobile() || this.open());
  protected readonly hidden = computed(() => this.isMobile() && !this.open());
  protected readonly navItems = [
    { key: 'home', label: 'Home', route: '/overview' },
    { key: 'tasks', label: 'Tasks', route: '/tasks' },
    { key: 'settings', label: 'Settings', route: '/settings' },
  ];

  protected closeOnMobile(): void {
    if (this.isMobile()) this.open.set(false);
  }
}
