import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideCircleUserRound,
  LucidePencil,
  LucideUser,
  LucideGlobe,
  LucideAlignLeft,
} from '@lucide/angular';
import {
  TaskControllerService,
  TaskUserProfileControllerService,
  TaskUserProfileResponse,
} from '../../api';
import { ProfilePhotoService } from '../../core/services/profile-photo-service/profile-photo-service';
import { NotificationService } from '../../core/services/notification-service/notification-service';
import { COMMON_TIME_ZONE_GROUPS } from './time-zones';
import { TimeZoneService } from '../../core/services/time-zone-service/time-zone-service';
import { UserService } from '../../domains/user/services/user-service';

@Component({
  selector: 'app-profile-page',
  imports: [
    ReactiveFormsModule,
    LucideCircleUserRound,
    LucidePencil,
    LucideUser,
    LucideGlobe,
    LucideAlignLeft,
  ],
  templateUrl: './profile.html',
  styles: `
    .time-zone-select:is(:focus, :focus-within, :open) {
      border-color: color-mix(in srgb, var(--color-app-button-purple) 70%, transparent);
      outline: none;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-app-button-purple) 20%, transparent);
    }

    @media (forced-colors: active) {
      .time-zone-select:focus-visible {
        outline: 2px solid Highlight;
        outline-offset: 2px;
      }
    }
  `,
})
export class Profile implements OnInit {
  private readonly api = inject(TaskUserProfileControllerService);
  private readonly tasksApi = inject(TaskControllerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly photoService = inject(ProfilePhotoService);
  private readonly notifications = inject(NotificationService);
  protected readonly timeZoneService = inject(TimeZoneService);
  protected readonly photoUrl = this.photoService.photoUrl;
  protected readonly photoPreview = signal<string | null>(null);
  protected readonly stagedPhoto = signal<File | null>(null);
  private initialValues = { displayName: '', bio: '', timeZone: '' };
  protected readonly user = signal<Pick<
    TaskUserProfileResponse,
    'username' | 'displayName' | 'bio'
  > | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveError = signal('');
  protected readonly saved = signal(false);
  protected readonly timeZoneGroups = COMMON_TIME_ZONE_GROUPS;

  protected get previousTimeZone(): string | null {
    const zone = this.initialValues.timeZone;
    if (
      !zone ||
      zone === 'UTC' ||
      this.timeZoneGroups.some((group) => group.zones.some((item) => item.value === zone))
    )
      return null;
    return zone;
  }
  protected readonly form = this.fb.nonNullable.group({
    displayName: ['', Validators.maxLength(100)],
    bio: ['', Validators.maxLength(500)],
    timeZone: ['', Validators.maxLength(100)],
  });

  ngOnInit(): void {
    this.loadProfile();
    this.destroyRef.onDestroy(() => this.clearPhotoPreview());
  }

  protected loadProfile(): void {
    this.loading.set(true);
    this.error.set(false);
    this.tasksApi
      .getTasks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const user = response.data;
          if (user) this.timeZoneService.setTimeZone(user.timeZone || null);
          this.user.set(
            user
              ? {
                  username: user.username,
                  displayName: user.displayName,
                  bio: user.bio,
                }
              : null,
          );
          this.error.set(!user);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  protected startEditing(): void {
    const user = this.user();
    if (!user) return;
    this.initialValues = {
      displayName: user.displayName ?? '',
      bio: user.bio ?? '',
      timeZone: this.timeZoneService.timeZone() ?? '',
    };
    this.form.reset(this.initialValues);
    this.saved.set(false);
    this.saveError.set('');
    this.editing.set(true);
  }

  protected cancelEditing(): void {
    if (this.saving()) return;
    this.clearPhotoPreview();
    this.editing.set(false);
  }

  private clearPhotoPreview(): void {
    const preview = this.photoPreview();
    this.photoPreview.set(null);
    this.stagedPhoto.set(null);
    if (preview) URL.revokeObjectURL(preview);
  }

  protected hasProfileChanges(): boolean {
    const values = this.form.getRawValue();
    return (
      values.displayName !== this.initialValues.displayName ||
      values.bio !== this.initialValues.bio ||
      values.timeZone !== this.initialValues.timeZone
    );
  }

  protected onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || this.saving()) return;
    if (
      !['image/jpeg', 'image/png'].includes(file.type) ||
      file.size > 2 * 1024 * 1024 ||
      !file.size
    ) {
      this.notifications.error('Choose a JPEG or PNG image up to 2 MB.');
      return;
    }
    this.clearPhotoPreview();
    this.stagedPhoto.set(file);
    this.photoPreview.set(URL.createObjectURL(file));
    this.saveError.set('');
  }

  protected saveProfile(): void {
    const profileChanged = this.hasProfileChanges();
    if (this.saving() || (!profileChanged && !this.stagedPhoto())) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saveError.set('');
    this.saving.set(true);
    if (!profileChanged) {
      this.savePhoto(false);
      return;
    }
    this.api
      .save(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (!response.data) {
            this.saveError.set('Could not save your profile. Please try again.');
            this.saving.set(false);
            return;
          }
          this.userService.setDisplayName(response.data.displayName ?? undefined);
          this.user.set(response.data);
          this.timeZoneService.setTimeZone(response.data.timeZone || null);
          this.initialValues = this.form.getRawValue();
          this.savePhoto(true);
          this.notifications.success(response.message);
        },
        error: () => {
          this.saving.set(false);
          this.saveError.set('Could not save your profile. Please try again.');
        },
      });
  }

  private savePhoto(profileSaved: boolean): void {
    const file = this.stagedPhoto();
    if (!file) {
      this.finishSaving();
      return;
    }
    const request = this.photoService.beginRequest();
    this.api
      .uploadPhoto(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const preview = this.photoPreview();
          this.photoPreview.set(null);
          this.stagedPhoto.set(null);
          if (preview) {
            if (this.photoService.isCurrent(request)) this.photoService.setPhotoUrl(preview);
            else URL.revokeObjectURL(preview);
          }
          this.finishSaving();
        },
        error: () => {
          this.saving.set(false);
          this.saveError.set(
            profileSaved
              ? 'Your profile details were saved, but the photo could not be uploaded. Please try again.'
              : 'Could not upload the photo. Choose a valid JPEG or PNG up to 2 MB and 4096 pixels wide and high.',
          );
        },
      });
  }

  private finishSaving(): void {
    this.saving.set(false);
    this.editing.set(false);
    this.saved.set(true);
  }
}
