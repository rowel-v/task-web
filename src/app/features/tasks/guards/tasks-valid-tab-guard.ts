import { CanActivateFn } from '@angular/router';

const VALID_TABS = new Set([
  'all',
  'pending',
  'in-progress',
  'completed',
  'overdue',
  'today',
  'archive',
]);

export const tasksValidTabGuard: CanActivateFn = (_route, state) => {
  const segments = state.url
    .split(/[?#]/)[0] // Remove query parameters and the fragment.
    .split('/') // Split the URL path into segments.
    .filter(Boolean); // Remove empty segments caused by leading or trailing slashes.

  return segments.length === 2 && segments[0] === 'tasks' && VALID_TABS.has(segments[1]);
};
