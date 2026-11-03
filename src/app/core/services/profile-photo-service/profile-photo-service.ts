import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProfilePhotoService {
  private readonly photoState = signal<string | null>(null);
  readonly photoUrl = this.photoState.asReadonly();
  private requestVersion = 0;

  // Ignore an older photo load if a newer upload has already started.
  beginRequest(): number {
    return ++this.requestVersion;
  }

  isCurrent(request: number): boolean {
    return request === this.requestVersion;
  }

  setPhotoUrl(url: string | null): void {
    const previous = this.photoState();
    this.photoState.set(url);
    if (previous && previous !== url) URL.revokeObjectURL(previous);
  }
}
