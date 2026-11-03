// IANA time zones keep working when daylight-saving offsets change.
export const COMMON_TIME_ZONE_GROUPS = [
  {
    label: 'Asia',
    zones: [
      { value: 'Asia/Manila', label: 'Manila' },
      { value: 'Asia/Singapore', label: 'Singapore' },
      { value: 'Asia/Tokyo', label: 'Tokyo' },
      { value: 'Asia/Dubai', label: 'Dubai' },
      { value: 'Asia/Kolkata', label: 'Kolkata' },
    ],
  },
  {
    label: 'Europe',
    zones: [
      { value: 'Europe/London', label: 'London' },
      { value: 'Europe/Paris', label: 'Paris / Berlin' },
      { value: 'Europe/Istanbul', label: 'Istanbul' },
    ],
  },
  {
    label: 'United States',
    zones: [
      { value: 'America/New_York', label: 'Eastern (New York)' },
      { value: 'America/Chicago', label: 'Central (Chicago)' },
      { value: 'America/Denver', label: 'Mountain (Denver)' },
      { value: 'America/Los_Angeles', label: 'Pacific (Los Angeles)' },
    ],
  },
] as const;
