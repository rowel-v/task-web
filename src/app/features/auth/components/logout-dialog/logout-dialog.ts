import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { LucideLogOut } from '@lucide/angular';
import { finalize } from 'rxjs';
import { Button } from '../../../../shared/components/button/button';
import { AppButtonVariant } from '../../../../shared/directives/app-button-variant';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-logout-dialog',
  imports: [LucideLogOut, Button, AppButtonVariant],
  templateUrl: './logout-dialog.html',
})
export class LogoutDialog {
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly loggingOut = signal(false);
  readonly cancelled = output<void>();

  constructor() {
    afterNextRender(() => this.dialogRef().nativeElement.showModal());
  }

  protected onLogout(): void {
    if (this.loggingOut()) return;
    this.loggingOut.set(true);
    this.auth
      .logout()
      .pipe(finalize(() => this.loggingOut.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl('/login', { replaceUrl: true }),
        error: () => undefined,
      });
  }
}
