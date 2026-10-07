import { Calendar } from 'vanilla-calendar-pro';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { LucideCalendarDays, LucideX } from '@lucide/angular';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-date-time-picker',
  standalone: true,
  imports: [DatePipe, LucideX, LucideCalendarDays],
  templateUrl: './date-time-picker.html',
})
export class DateTimePicker implements AfterViewInit {
  private readonly bp = inject(BreakpointObserver);
  protected readonly isMobile = toSignal(
    this.bp.observe(Breakpoints.Handset).pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  protected readonly selectedDate = signal<string>(''); // for display in its template
  dateSelected = output<string>(); // emits the chosen date as string format

  private calendar!: Calendar;

  private readonly calendarEl = viewChild.required<ElementRef>('calendarRef');

  ngAfterViewInit(): void {
    this.calendar = new Calendar(this.calendarEl().nativeElement, {
      inputMode: true, // renders as a closed input, opens on click

      disableDatesPast: true,

      positionToInput: 'auto',

      selectionTimeMode: 12,

      layouts: {
        default: `
          <div class="vc-header" data-vc="header" role="group" aria-label="Calendar Navigation">
            <#ArrowPrev [month] />
            <div class="vc-header__content" data-vc-header="content">
              <#Month />
              <#Year />
            </div>
            <#ArrowNext [month] />
          </div>
          <div class="vc-wrapper" data-vc="wrapper">
            <#WeekNumbers />
            <div class="vc-content" data-vc="content">
              <#Week />
              <#Dates />
            </div>
          </div>
          <#ControlTime />
          <button type="button" data-vc-save class="btn btn-accent btn-sm w-full mt-1">Confirm</button>
        `,
      },

      selectedDates: this.getCurrentDate(), // default selected date

      selectedTime: this.getCurrentTimeFormatted(), // default selected time

      onShow: (self) => {
        const popup = self.context.mainElement as HTMLElement;
        const dialogEl = this.calendarEl().nativeElement.closest('dialog');

        if (popup && dialogEl) {
          popup.style.position = 'absolute';
          popup.style.top = '50%';
          popup.style.left = this.isMobile() ? '65%' : '70%';
          popup.style.transform = 'translate(-50%, -50%)';
          popup.style.zIndex = '9999';

          dialogEl.appendChild(popup);
          dialogEl.classList.remove('overflow-hidden');
          dialogEl.classList.add('overflow-visible');
        }

        const backdrop = document.createElement('div');
        backdrop.dataset['vcBackdrop'] = '';
        backdrop.style.position = 'absolute';
        backdrop.style.inset = '0';
        backdrop.style.zIndex = '9998';
        backdrop.style.background = 'rgba(0,0,0,0.2)';
        backdrop.onclick = () => this.calendar.hide();

        dialogEl?.appendChild(backdrop);

        this.bindSave(self);
      },

      onClickDate: (self) => {
        const date = self.context.selectedDates[0];
        if (!date) return;

        // today keeps the current time, any other day defaults to 9:00 AM
        const isToday = date === this.getCurrentDate()[0];
        const time = isToday ? this.getCurrentTimeFormatted() : '09:00 AM';

        self.set({ selectedDates: [date], selectedTime: time });
        this.bindSave(self); // set() re-renders the popup, so bind Confirm again
      },

      onHide: () => {
        const dialogEl = this.calendarEl().nativeElement.closest('dialog');
        dialogEl?.classList.remove('overflow-visible');
        dialogEl?.classList.add('overflow-hidden');
        document.querySelector('[data-vc-backdrop]')?.remove();
      },
    });

    this.calendar.init();
  }

  /**
   * Returns today's date as a single-item array in "YYYY-MM-DD" format
   * (e.g. ["2026-09-22"]), using the local date (not UTC) so the
   * "is it today" check stays correct after midnight.
   */
  private readonly getCurrentDate = (): string[] => {
    return [new Date().toLocaleDateString('en-CA')];
  };

  /**
   * Returns the current time formatted as "hh:mm aa" (e.g. "02:37 PM"),
   * matching the format vanilla-calendar-pro's `selectedTime` option expects.
   */
  private readonly getCurrentTimeFormatted = (): string => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // attaches the Confirm click handler to the popup's current button
  // one delegated listener on the popup, so it survives re-renders of the button
  private bindSave(self: Calendar): void {
    const popup = self.context.mainElement as HTMLElement;

    popup.onpointerup = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('[data-vc-save]')) return;

      const date = self.context.selectedDates[0];
      const time = this.to24Hour(self.context.selectedTime);
      if (date) {
        const value = time ? `${date}T${time}` : date;
        this.selectedDate.set(value);
        this.dateSelected.emit(value);
      }
      this.calendar.hide();
    };
  }

  /**
   * Converts a 12-hour time string
   * (e.g. "02:37 PM") into 24-hour format ("14:37").
   */
  private readonly to24Hour = (time: string): string => {
    const [timePart, period] = time.split(' ');

    let hours = Number(timePart.split(':')[0]);
    const minutes = Number(timePart.split(':')[1]);

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    }

    if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
}
