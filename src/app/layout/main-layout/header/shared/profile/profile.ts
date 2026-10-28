import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { LucideLogOut, LucideSettings, LucideUser } from '@lucide/angular';

@Component({
  selector: 'app-profile',
  imports: [LucideUser, LucideSettings, LucideLogOut],
  templateUrl: './profile.html',
  styles: ``,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onCloseProfile()',
  },
})
export class Profile {
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
