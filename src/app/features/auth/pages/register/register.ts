import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AppButtonVariant } from '../../../../shared/directives/app-button-variant';
import { AuthService } from '../../services/auth-service';
import { nonBlank, passwordByteLimit, passwordsMatch } from '../../validators/auth-validators';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, AppButtonVariant],
  templateUrl: './register.html',
  host: { class: 'block' },
  styleUrl: './register.css',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly builder = inject(FormBuilder);
  readonly submitting = signal(false);
  readonly showPassword = signal(false);
  readonly form = this.builder.nonNullable.group(
    {
      username: ['', [nonBlank, Validators.maxLength(50)]],
      password: ['', [nonBlank, Validators.maxLength(255), passwordByteLimit]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  // triggers create account
  onSubmit(): void {
    if (this.submitting()) return;

    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.submitting.set(true);

    const { username, password } = this.form.getRawValue();

    this.auth
      .register({ username: username.trim(), password })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/login')
      });
  }

  // for animation when called this template
  protected open = signal(true);

  // route to login page
  goToLogin(): void {
    this.open.set(false);
    setTimeout(() => this.router.navigateByUrl('/login'), 200);
  }
}
