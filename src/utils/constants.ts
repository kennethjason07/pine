// Storage keys for AsyncStorage
export const STORAGE_KEYS = {
  PERIOD_DATES: '@period_dates',
  CYCLE_SETTINGS: '@cycle_settings',
  DAY_DETAILS: '@day_details',
  MEDICATIONS: '@medications',
  CURRENT_CYCLE: '@current_cycle',
  CYCLES: '@cycles',
  NOTIFICATION_SETTINGS: '@notification_settings'
} as const; 

// Phase colors for calendar
export const PHASE_COLORS = {
  menstruation: '#E76F51',
  follicular: '#2A9D8F',
  ovulation: '#E9C46A',
  luteal: '#264653'
} as const; 