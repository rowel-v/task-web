import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { provideDefaultClient } from '../../api';
import { ViewportService } from '../../core/services/viewport-service/viewport-service';
import { UserService } from '../../domains/user/services/user-service';

import { MainLayout } from './main-layout';

@Component({ template: '' })
class TestPage {}

describe('MainLayout', () => {
  let fixture: ComponentFixture<MainLayout>;
  let router: Router;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideDefaultClient({ basePath: '' }),
        provideRouter([
          { path: 'overview', component: TestPage },
          { path: 'tasks/all', component: TestPage },
          { path: 'settings', component: TestPage },
        ]),
        { provide: ViewportService, useValue: { isMobile: signal(false) } },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    http = TestBed.inject(HttpTestingController);
    TestBed.inject(UserService).setDisplayName('Alex');
    await router.navigateByUrl('/overview');
    fixture = TestBed.createComponent(MainLayout);
    fixture.detectChanges();
    http.expectOne('/api/profile/photo').flush(null, { status: 404, statusText: 'Not Found' });
  });

  afterEach(() => http.verify());

  it('keeps the same profile component while changing page headers', async () => {
    const profile = fixture.nativeElement.querySelector('app-profile');
    expect(profile).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Alex');

    await router.navigateByUrl('/tasks/all');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-profile')).toBe(profile);
    expect(fixture.nativeElement.querySelector('app-task-header input[type="search"]')).toBeTruthy();
    http.expectNone('/api/profile/photo');

    await router.navigateByUrl('/settings');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-profile')).toBe(profile);
    expect(fixture.nativeElement.querySelector('app-settings-header')).toBeTruthy();
    http.expectNone('/api/profile/photo');
  });
});
