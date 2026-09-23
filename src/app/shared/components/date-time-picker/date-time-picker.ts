import { Calendar } from 'vanilla-calendar-pro';
import { AfterViewInit, Component, ElementRef, output, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LucideCalendarDays, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-date-time-picker',
  standalone: true,
  imports: [DatePipe, LucideX, LucideCalendarDays],
  templateUrl: './date-time-picker.html',
})
export class DateTimePicker implements AfterViewInit {
  private readonly calendarEl = viewChild.required<ElementRef>('calendarRef');
  dateSelected = output<string>(); // emits the chosen date as string format
  protected readonly selectedDate = signal<string>(''); // for display in its template
  private calendar!: Calendar;
  ngAfterViewInit(): void {
    this.calendar = new Calendar(this.calendarEl().nativeElement, {
      inputMode: true, // ← key option: renders as a closed input, opens on click
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
        if (popup) {
          popup.style.position = 'fixed';
          popup.style.top = '52%';
          popup.style.left = '58%';
          popup.style.transform = 'translate(-50%, -50%)';
          popup.style.zIndex = '9999';
        }
        const backdrop = document.createElement('div');
        backdrop.dataset['vcBackdrop'] = '';
        backdrop.style.position = 'fixed';
        backdrop.style.inset = '0';
        backdrop.style.zIndex = '9998'; // just below the calendar's z-index (9999)
        backdrop.style.background = 'transparent';
        backdrop.onclick = () => this.calendar.hide();
        document.body.appendChild(backdrop);

        // Wire up the Confirm button
        const saveBtn = popup.querySelector('[data-vc-save]') as HTMLButtonElement;
        if (saveBtn) {
          saveBtn.onclick = () => {
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
      },
      onHide: () => {
        document.querySelector('[data-vc-backdrop]')?.remove();
      },
    });

    this.calendar.init();
  }

  /**
   * Converts a 12-hour time string
   * (e.g. "02:37 PM") into 24-hour format ("14:37").
   */
  private to24Hour(time: string): string {
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
  }

  /**
   * Returns the current time formatted as "hh:mm aa" (e.g. "02:37 PM"),
   * matching the format vanilla-calendar-pro's `selectedTime` option expects.
   */
  private getCurrentTimeFormatted(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Returns today's date as a single-item array in "YYYY-MM-DD" format
   * (e.g. ["2026-09-22"]),  matching the format vanilla-calendar-pro's
   * what `selectedDates` expects.
   */
  private getCurrentDate(): string[] {
    return [new Date().toISOString().split('T')[0]];
  }
}
