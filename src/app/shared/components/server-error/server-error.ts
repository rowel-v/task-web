import { Component, output } from '@angular/core';
import { LucideCloudOff } from '@lucide/angular';

@Component({
  selector: 'app-server-error',
  imports: [LucideCloudOff],
  templateUrl: './server-error.html',
  styles: ``,
})
export class ServerError {
  retried = output<void>();
}
