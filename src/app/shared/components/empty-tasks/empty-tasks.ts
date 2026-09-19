import { Component, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-tasks',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './empty-tasks.html',
  styles: ``,
})
export class EmptyTasks {
  createTask = output<void>();
}
