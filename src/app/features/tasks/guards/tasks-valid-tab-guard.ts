import { CanMatchFn } from '@angular/router';

const VALID_TABS = new Set([
  'all',
  'pending',
  'in-progress',
  'completed',
  'overdue',
  'today',
  'archive',
]);

export const tasksValidTabGuard: CanMatchFn = (_route, segments) => {
  return segments.length === 2 && segments[0].path === 'tasks' && VALID_TABS.has(segments[1].path);
};
