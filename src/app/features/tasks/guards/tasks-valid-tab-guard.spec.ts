import { UrlSegment } from '@angular/router';
import { tasksValidTabGuard } from './tasks-valid-tab-guard';

describe('tasksValidTabGuard', () => {
  it('matches supported tabs', () => {
    expect(tasksValidTabGuard({}, [new UrlSegment('tasks', {}), new UrlSegment('today', {})])).toBe(
      true,
    );
  });
  it('rejects unsupported tabs so the fallback route can match', () => {
    expect(
      tasksValidTabGuard({}, [new UrlSegment('tasks', {}), new UrlSegment('unknown', {})]),
    ).toBe(false);
  });
});
