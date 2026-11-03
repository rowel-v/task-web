import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../../../../core/services/notification-service/notification-service';
import { LucideLogOut, LucideSettings, LucideUser } from '@lucide/angular';
import { RouterLink } from '@angular/router';
import { ProfilePhotoService } from '../../../../../core/services/profile-photo-service/profile-photo-service';
import { UserService } from '../../../../../domains/user/services/user-service';

@Component({
  selector: 'app-profile',
  imports: [LucideUser, LucideSettings, LucideLogOut, RouterLink],
  templateUrl: './profile.html',
  styles: ``,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onCloseProfile()',
  },
})
export class Profile implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly notifications = inject(NotificationService);
  protected readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly photoService = inject(ProfilePhotoService);
  protected readonly photoUrl = this.photoService.photoUrl;

  ngOnInit(): void {
    if (this.isBrowser) this.loadPhoto();
    this.destroyRef.onDestroy(() => {
      this.photoService.setPhotoUrl(null);
    });
  }

  private loadPhoto(): void {
    const request = this.photoService.beginRequest();
    this.http
      .get('/api/profile/photo', { responseType: 'blob' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (photo) => {
          if (!this.photoService.isCurrent(request)) return;
          this.photoService.setPhotoUrl(URL.createObjectURL(photo));
        },
        error: (error: HttpErrorResponse) => {
          if (this.photoService.isCurrent(request) && error.status !== 404)
            this.notifications.error('Could not load your profile photo.');
        },
      });
  }

  protected openedProfile = signal(false);
  protected closingProfile = signal(false);

  protected onOpenProfile() {
    this.closingProfile.set(false);
    this.openedProfile.set(true);
  }

  protected onCloseProfile() {
    if (!this.openedProfile()) {
      return;
    }

    this.closingProfile.set(true);

    setTimeout(() => {
      this.openedProfile.set(false);
      this.closingProfile.set(false);
    }, 200);
  }

  private readonly profileRef = viewChild<ElementRef<HTMLElement>>('profileRef');
  protected onDocumentClick(event: MouseEvent): void {
    const profile = this.profileRef()?.nativeElement;

    if (profile && !profile.contains(event.target as Node)) {
      this.onCloseProfile();
    }
  }
}
