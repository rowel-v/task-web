import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly displayName = signal<string | undefined>(undefined);

  setDisplayName(displayName: string | undefined) {
    this.displayName.set(displayName);
  }

  getDisplayName() {
    return this.displayName();
  }
}
