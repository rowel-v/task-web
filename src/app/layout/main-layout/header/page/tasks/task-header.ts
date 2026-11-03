import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideMenu, LucideSearch } from '@lucide/angular';
import { SearchService } from '../../../../../core/services/search-service/search-service';
import { SelectModeService } from '../../../../../features/tasks/services/select-mode-service/select-mode-service';
import { TaskService } from '../../../../../domains/tasks/services/task-service';
import { ViewportService } from '../../../../../core/services/viewport-service/viewport-service';

@Component({
  selector: 'app-task-header',
  imports: [FormsModule, LucideMenu, LucideSearch],
  templateUrl: './task-header.html',
  styles: ``,
})
export class TaskHeader {

  protected readonly searchService = inject(SearchService);
  protected readonly selectModeService = inject(SelectModeService);
  protected readonly taskService = inject(TaskService);
  protected readonly isMobile = inject(ViewportService).isMobile;

  openSideNav = output<void>();

  protected readonly title = 'Tasks';
  protected readonly description = 'Stay organized';

  protected onSelectToggle(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) this.selectModeService.toggleOn();
    else this.selectModeService.toggleOff();
  }
}
