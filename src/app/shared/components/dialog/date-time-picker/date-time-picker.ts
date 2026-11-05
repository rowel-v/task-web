import { Calendar, FormatDateString } from 'vanilla-calendar-pro';
import { TimeZoneDatePipe } from '../../../../core/services/time-zone-service/time-zone-date.pipe';
import { TimeZoneService } from '../../../../core/services/time-zone-service/time-zone-service';
import { NotificationService } from '../../../../core/services/notification-service/notification-service';
import { DisplayPreferencesService } from '../../../../core/services/display-preferences-service/display-preferences-service';
import { LucideCalendarDays, LucideX } from '@lucide/angular';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-date-time-picker',
  standalone: true,
  imports: [TimeZoneDatePipe, LucideX, LucideCalendarDays],
  templateUrl: './date-time-picker.html',
})
export class DateTimePicker {
  protected readonly timeZones = inject(TimeZoneService);
  private readonly notifications = inject(NotificationService);
  private readonly displayPreferences = inject(DisplayPreferencesService);
  private readonly bp = inject(BreakpointObserver);
  protected readonly isMobile = toSignal(
    this.bp.observe(Breakpoints.Handset).pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  defaultDate = input<string>();
  // parsed default, or null when there's no valid value
  private readonly initial = computed(() => {
    const raw = this.defaultDate();
    if (!raw) return null;

    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;

    const date = this.timeZones.dateKey(d);
    const time = this.formatCalendarTime(d);

    return { date, time, value: d.toISOString() };
  });

  // follows the default, but the user's pick or Clear can overwrite it
  // for display in its template
  protected readonly selectedDate = linkedSignal(() => this.initial()?.value ?? '');

  dateSelected = output<string>(); // emits the chosen date as string format

  private calendar!: Calendar;
  private readonly calendarEl = viewChild.required<ElementRef>('calendarRef');

  constructor() {
    afterNextRender(() => {
      const initial = this.initial(); // read once

      this.calendar = new Calendar(this.calendarEl().nativeElement, {
        inputMode: true, // renders as a closed input, opens on click

        selectedDates: [initial?.date ?? this.getCurrentDate()],
        selectedTime: initial?.time ?? this.getCurrentTimeFormatted(),

        dateToday: this.getCurrentDate(),
        dateMin: this.getCurrentDate(),
        disableDatesPast: false,

        positionToInput: 'auto',

        selectionTimeMode: this.displayPreferences.is12Hour() ? 12 : 24,

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
          const isToday = date === this.getCurrentDate();
          const time = isToday
            ? this.getCurrentTimeFormatted()
            : this.displayPreferences.is12Hour() ? '09:00 AM' : '09:00';

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
    });
  }

  /**
   * Returns today's date in the selected or device time zone.
   */
  private readonly getCurrentDate = (): FormatDateString => {
    return this.timeZones.dateKey(new Date()) as FormatDateString;
  };

  private readonly getCurrentTimeFormatted = (): string => {
    return this.formatCalendarTime(new Date());
  };

  private readonly formatCalendarTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      timeZone: this.timeZones.timeZone() ?? undefined,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: this.displayPreferences.is12Hour() ? 'h12' : 'h23',
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
        const value = this.timeZones.wallTimeToIso(`${date}T${time}`);
        if (!value) {
          this.notifications.error('That time does not exist in the selected time zone. Please choose another time.');
          return;
        }
        this.selectedDate.set(value);
        this.dateSelected.emit(value);
      }
      this.calendar.hide();
    };
  }

  /**
   * Converts a 12-hour or 24-hour time string to 24-hour format.
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
