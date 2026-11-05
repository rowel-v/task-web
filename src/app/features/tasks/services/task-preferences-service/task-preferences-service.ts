import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export const TASK_VIEWS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Today' },
  { value: 'archive', label: 'Archive' },
] as const;

export const TASK_SORT_OPTIONS = [
  { value: 'due-asc', label: 'Due date: soonest' },
  { value: 'due-desc', label: 'Due date: latest' },
  { value: 'priority-high', label: 'Priority: high' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
  { value: 'created', label: 'Newest created' },
] as const;

export type TaskView = (typeof TASK_VIEWS)[number]['value'];
export type TaskSort = (typeof TASK_SORT_OPTIONS)[number]['value'];

interface TaskPreferences {
  defaultView: TaskView;
  defaultSort: TaskSort;
}

const STORAGE_KEY = 'task-preferences';
const DEFAULT_PREFERENCES: TaskPreferences = { defaultView: 'all', defaultSort: 'due-asc' };

@Injectable({ providedIn: 'root' })
export class TaskPreferencesService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly preferences = signal<TaskPreferences>(this.load());
  readonly defaultView = () => this.preferences().defaultView;
  readonly defaultSort = () => this.preferences().defaultSort;

  save(preferences: TaskPreferences): boolean {
    if (!this.isBrowser) return false;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      this.preferences.set(preferences);
      return true;
    } catch {
      return false;
    }
  }

  private load(): TaskPreferences {
    if (!this.isBrowser) return DEFAULT_PREFERENCES;

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      return {
        defaultView: TASK_VIEWS.find((view) => view.value === stored?.defaultView)?.value ?? 'all',
        defaultSort:
          TASK_SORT_OPTIONS.find((sort) => sort.value === stored?.defaultSort)?.value ?? 'due-asc',
      };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }
}
