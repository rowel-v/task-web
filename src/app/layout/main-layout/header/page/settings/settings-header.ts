import { Component, inject, output } from '@angular/core';
import { LucideMenu } from '@lucide/angular';
import { ViewportService } from '../../../../../core/services/viewport-service/viewport-service';

@Component({
  selector: 'app-settings-header',
  imports: [LucideMenu],
  templateUrl: './settings-header.html',
  styles: ``,
})
export class SettingsHeader {

  protected readonly isMobile = inject(ViewportService).isMobile;

  openSideNav = output<void>();

  protected readonly title = 'Settings';
  protected readonly description = 'Manage your preferences';
}
