import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly token = signal<string | null>(null);

  setToken(token: string) {
    this.token.set(token);
  }

  getToken(): string | null {
    return this.token();
  }

  clearToken(): void {
    this.token.set(null);
  }
}
