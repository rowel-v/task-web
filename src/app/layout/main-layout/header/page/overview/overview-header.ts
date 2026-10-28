import { Component, inject, output } from '@angular/core';
import { LucideMenu } from '@lucide/angular';
import { Profile } from '../../shared/profile/profile';
import { ViewportService } from '../../../../../core/services/viewport-service/viewport-service';

@Component({
  selector: 'app-overview-header',
  imports: [LucideMenu, Profile],
  templateUrl: './overview-header.html',
  styles: ``,
})
export class OverviewHeader {
  protected readonly isMobile = inject(ViewportService).isMobile;

  openSideNav = output<void>();

  protected readonly title = 'Home';
  protected readonly description = 'Overview of your Tasks';
}
