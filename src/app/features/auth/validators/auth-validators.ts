import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const nonBlank: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim() ? null : { required: true };

export const passwordByteLimit: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null =>
  new TextEncoder().encode(control.value ?? '').length > 72 ? { byteLimit: true } : null;

export const passwordsMatch: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  control.get('password')?.value === control.get('confirmPassword')?.value
    ? null
    : { passwordMismatch: true };
