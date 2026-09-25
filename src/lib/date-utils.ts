import { parse, format } from "date-fns"
import { fi } from "date-fns/locale"

export function parseFinnishDate(str: string): Date {
  const parts = str.split(".")
  if (parts.length !== 3) return new Date()
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const year = parseInt(parts[2], 10)
  return new Date(year, month, day)
}

export function formatFinnishDate(date: Date): string {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
}

export function formatMonthYear(date: Date): string {
  return format(date, "LLLL yyyy", { locale: fi })
}

export function formatWeekDay(date: Date): string {
  return format(date, "EEEEEE", { locale: fi })
}
