import { ComponentFixture } from '@angular/core/testing';
import { Settings } from './settings';

export function settingRow(fixture: ComponentFixture<Settings>, label: string): HTMLSelectElement {
  const labels = fixture.nativeElement.querySelectorAll('label') as NodeListOf<HTMLLabelElement>;
  const target = Array.from(labels).find((item) => item.textContent?.trim() === label);
  const select =
    target &&
    (fixture.nativeElement.querySelector(`#${target.htmlFor}`) as HTMLSelectElement | null);
  if (!select) throw new Error(`Setting not found: ${label}`);
  return select;
}

export function chooseSetting(
  fixture: ComponentFixture<Settings>,
  label: string,
  value: string,
): void {
  const select = settingRow(fixture, label);
  const option = Array.from(select.options).find((item) => item.textContent?.trim() === value);
  if (!option) throw new Error(`Option not found: ${value}`);
  select.value = option.value;
  select.dispatchEvent(new Event('change'));
  fixture.detectChanges();
}
