import type { DateFormatStr } from './types'

export const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

export const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function toDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

export function isBeforeDay(a: Date, b: Date): boolean {
  return toDay(a) < toDay(b)
}

export function isAfterDay(a: Date, b: Date): boolean {
  return toDay(a) > toDay(b)
}

export function isBetweenDays(date: Date, start: Date, end: Date): boolean {
  const d = toDay(date).getTime()
  const s = toDay(start).getTime()
  const e = toDay(end).getTime()
  return d > s && d < e
}

export function addMonths(date: Date, n: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}

export function formatDate(date: Date, fmt: DateFormatStr): string {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = String(date.getFullYear())
  // Replace all tokens regardless of separator
  return fmt
    .replace('yyyy', y)
    .replace('MM', m)
    .replace('dd', d)
}

export function hexToRgb(hex: string): string {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r
    ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}`
    : '99, 102, 241'
}
