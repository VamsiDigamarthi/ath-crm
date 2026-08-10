export type DatePickerMode = 'single' | 'range'

// All 6 combinations: 3 orders × 2 separators
export type DateFormatStr =
  | 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy/MM/dd'
  | 'dd-MM-yyyy' | 'MM-dd-yyyy' | 'yyyy-MM-dd'

export interface DateRange {
  start: Date | null
  end: Date | null
}

export interface AppDatePickerProps {
  mode?: DatePickerMode
  // Single mode
  value?: Date | null
  onChange?: (date: Date | null) => void
  // Range mode
  range?: DateRange
  onRangeChange?: (range: DateRange) => void
  // Constraints
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  // Display
  placeholder?: string
  format?: DateFormatStr
  label?: string
  labelSize?: 'xs' | 'sm' | 'md'
  error?: string
  disabled?: boolean
  clearable?: boolean
  accentColor?: string
}
