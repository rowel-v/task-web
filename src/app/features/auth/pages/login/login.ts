import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AppButtonVariant } from '../../../../shared/directives/app-button-variant';
import { AuthIllustration } from '../../components/auth-illustration/auth-illustration';
import { AuthService } from '../../services/auth-service';
import { nonBlank, passwordByteLimit } from '../../validators/auth-validators';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AppButtonVariant, AuthIllustration],
  templateUrl: './login.html',
  host: { class: 'block' },
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly builder = inject(FormBuilder);
  readonly submitting = signal(false);
  readonly showPassword = signal(false);
  readonly form = this.builder.nonNullable.group({
    username: ['', [nonBlank, Validators.maxLength(50)]],
    password: ['', [nonBlank, Validators.maxLength(255), passwordByteLimit]],
  });

  onLogin(): void {
    if (this.submitting()) return;

    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.submitting.set(true);

    const { username, password } = this.form.getRawValue();

    this.auth
      .login({ username: username.trim(), password })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl('/overview'),
      });
  }

  // for animation when called this template
  protected readonly open = signal(true);

  // route to register page
  goToRegister(): void {
    this.open.set(false);

    setTimeout(() => {
      void this.router.navigateByUrl('/register');
    }, 200);
  }
}
