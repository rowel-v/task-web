import { Component, inject, output } from '@angular/core';
import { LucideMenu } from '@lucide/angular';
import { ViewportService } from '../../../../../core/services/viewport-service/viewport-service';

@Component({
  selector: 'app-profile-header',
  imports: [LucideMenu],
  templateUrl: './profile-header.html',
  styles: ``,
})
export class ProfileHeader {

  protected readonly isMobile = inject(ViewportService).isMobile;
  readonly openSideNav = output<void>();
  protected readonly title = 'Profile';
  protected readonly description = 'Your account information';
}
