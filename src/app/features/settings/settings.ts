import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LucideClipboardList, LucidePalette } from '@lucide/angular';
import { NotificationService } from '../../core/services/notification-service/notification-service';
import { DisplayPreferencesService } from '../../core/services/display-preferences-service/display-preferences-service';
import {
  TASK_SORT_OPTIONS,
  TASK_VIEWS,
  TaskPreferencesService,
} from '../tasks/services/task-preferences-service/task-preferences-service';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, LucideClipboardList, LucidePalette],
  templateUrl: './settings.html',
  styles: `
    .settings-select::picker(select) {
      background-color: var(--color-app-surface-deep);
      border-color: var(--color-app-input-border);
      color: var(--color-app-background-white);
      box-shadow: 0 8px 20px rgb(0 0 0 / 25%);
      z-index: 50;
    }

    .settings-select option {
      background-color: var(--color-app-surface-deep);
      color: var(--color-app-background-white);
    }

    .settings-select option:is(:hover, :focus-visible) {
      background-color: var(--color-app-button-hover-gray);
    }
  `,
})
export class Settings {
  private readonly preferences = inject(TaskPreferencesService);
  private readonly displayPreferences = inject(DisplayPreferencesService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  protected readonly taskViews = TASK_VIEWS;
  protected readonly sortOptions = TASK_SORT_OPTIONS;
  protected readonly form = this.fb.nonNullable.group({
    defaultView: this.preferences.defaultView(),
    defaultSort: this.preferences.defaultSort(),
  });
  protected readonly displayForm = this.fb.nonNullable.group({
    appearance: this.displayPreferences.appearance(),
    timeFormat: this.displayPreferences.timeFormat(),
  });
  private readonly taskValues = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });
  private readonly displayValues = toSignal(this.displayForm.valueChanges, {
    initialValue: this.displayForm.getRawValue(),
  });
  private readonly hasTaskChanges = computed(() => {
    const values = this.taskValues();
    return (
      values.defaultView !== this.preferences.defaultView() ||
      values.defaultSort !== this.preferences.defaultSort()
    );
  });
  private readonly hasDisplayChanges = computed(() => {
    const values = this.displayValues();
    return (
      values.appearance !== this.displayPreferences.appearance() ||
      values.timeFormat !== this.displayPreferences.timeFormat()
    );
  });
  protected readonly hasChanges = computed(() => this.hasTaskChanges() || this.hasDisplayChanges());

  protected openOptions(event: MouseEvent, select: HTMLSelectElement): void {
    if (event.target === select) return;

    event.preventDefault();
    select.focus();
    if (typeof select.showPicker === 'function') {
      try {
        select.showPicker();
      } catch {
        // The focused select remains available for keyboard interaction.
      }
    }
  }

  protected cancel(): void {
    this.form.reset({
      defaultView: this.preferences.defaultView(),
      defaultSort: this.preferences.defaultSort(),
    });
    this.displayForm.reset({
      appearance: this.displayPreferences.appearance(),
      timeFormat: this.displayPreferences.timeFormat(),
    });
  }

  protected save(): void {
    if (!this.hasChanges()) return;

    if (this.hasTaskChanges()) {
      if (!this.preferences.save(this.form.getRawValue())) {
        this.notifications.error('Some changes could not be saved. Please try again.');
        return;
      }
      this.form.markAsPristine();
    }

    if (this.hasDisplayChanges()) {
      if (!this.displayPreferences.save(this.displayForm.getRawValue())) {
        this.notifications.error('Some changes could not be saved. Please try again.');
        return;
      }
      this.displayForm.markAsPristine();
    }

    this.notifications.success('Settings saved successfully.');
  }
}
