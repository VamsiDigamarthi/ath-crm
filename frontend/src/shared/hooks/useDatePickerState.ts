import { useState } from 'react'
import type { DatePickerMode, DateFormatStr, DateRange } from '@/shared/components/datepicker/types'

type FormatOrder = 'dmy' | 'mdy' | 'ymd'
type Separator   = '/' | '-'

function buildFormat(order: FormatOrder, sep: Separator): DateFormatStr {
  const map: Record<FormatOrder, Record<Separator, DateFormatStr>> = {
    dmy: { '/': 'dd/MM/yyyy', '-': 'dd-MM-yyyy' },
    mdy: { '/': 'MM/dd/yyyy', '-': 'MM-dd-yyyy' },
    ymd: { '/': 'yyyy/MM/dd', '-': 'yyyy-MM-dd' },
  }
  return map[order][sep]
}

export function useDatePickerState() {
  const [mode, setMode]               = useState<DatePickerMode>('single')
  const [value, setValue]             = useState<Date | null>(null)
  const [range, setRange]             = useState<DateRange>({ start: null, end: null })
  const [formatOrder, setFormatOrder] = useState<FormatOrder>('dmy')
  const [separator, setSeparator]     = useState<Separator>('/')
  const [accentColor, setAccent]      = useState('#6366f1')
  const [clearable, setClearable]     = useState(true)
  const [disabled, setDisabled]       = useState(false)
  const [showLabel, setShowLabel]     = useState(true)
  const [showError, setShowError]     = useState(false)
  const [labelSize, setLabelSize]     = useState<'xs'|'sm'|'md'>('sm')
  const [minDateStr, setMinDateStr]   = useState('')
  const [maxDateStr, setMaxDateStr]   = useState('')

  const format  = buildFormat(formatOrder, separator)
  const minDate = minDateStr ? new Date(minDateStr + 'T00:00:00') : undefined
  const maxDate = maxDateStr ? new Date(maxDateStr + 'T00:00:00') : undefined

  return {
    mode, setMode,
    value, setValue,
    range, setRange,
    formatOrder, setFormatOrder,
    separator, setSeparator,
    format,
    accentColor, setAccent,
    clearable, setClearable,
    disabled, setDisabled,
    showLabel, setShowLabel,
    showError, setShowError,
    labelSize, setLabelSize,
    minDateStr, setMinDateStr,
    maxDateStr, setMaxDateStr,
    minDate, maxDate,
  }
}

export type DatePickerState = ReturnType<typeof useDatePickerState>
