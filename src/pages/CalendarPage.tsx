import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMode, SELLER_MODE } from '@/context/ModeContext'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameDay,
  isSameMonth,
  isToday,
  format,
  getISOWeek,
} from 'date-fns'
import { fi } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useWorkOrders } from '@/context/WorkOrderContext'
import { parseFinnishDate } from '@/lib/date-utils'
import { spaces as spaceCatalog } from '@/data/mock'
import type { WorkOrderStatus } from '@/data/types'

type ViewMode = 'month' | 'week' | 'tilat'

interface CalendarEvent {
  workOrderId: string
  date: Date
  bookingStart: string
  bookingEnd: string
  label: string
  eventType: string
  status: WorkOrderStatus
  participants: number
}

interface SpaceBooking {
  workOrderId: string
  spaceId: string
  spaceName: string
  date: Date
  bookingStart: string
  bookingEnd: string
  label: string
  status: WorkOrderStatus
}

const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  uusi:        'bg-blue-500 text-white',
  tyonalla:    'bg-amber-500 text-white',
  asiakkaalla: 'bg-purple-500 text-white',
  vahvistettu: 'bg-emerald-500 text-white',
  ei_toteudu:  'bg-gray-400 text-white',
}

const WEEKDAY_HEADERS = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su']

const WEEK_START_OPTION = { weekStartsOn: 1 as const }

const HOUR_HEIGHT = 60
const START_HOUR = 8
const END_HOUR = 22

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return h + m / 60
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const { setMode, setModeInfo } = useMode()

  function openWorkOrder(id: string) {
    setMode("seller")
    setModeInfo(SELLER_MODE)
    navigate(`/tyomarain/${id}`)
  }
  const { workOrders } = useWorkOrders()

  const [searchParams] = useSearchParams()
  const [currentDate, setCurrentDate] = useState(() => {
    const dateParam = searchParams.get("date")
    if (dateParam) {
      const d = new Date(dateParam)
      if (!isNaN(d.getTime())) return d
    }
    return new Date(2025, 9, 1)
  })
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  // Derive calendar events from all work orders
  const events = useMemo<CalendarEvent[]>(() => {
    return workOrders.flatMap((wo) =>
      wo.eventDays.map((day) => ({
        workOrderId: wo.id,
        date: parseFinnishDate(day.date),
        bookingStart: day.bookingStart,
        bookingEnd: day.bookingEnd,
        label: wo.customerCompany,
        eventType: wo.eventType,
        status: wo.status,
        participants: wo.participantEstimate,
      }))
    )
  }, [workOrders])

  // Derive per-space bookings from all work orders (rows = spaces, for the Tilat view)
  const spaceBookings = useMemo<SpaceBooking[]>(() => {
    return workOrders.flatMap((wo) =>
      wo.eventDays.flatMap((day) =>
        day.spaces.map((space) => ({
          workOrderId: wo.id,
          spaceId: space.spaceId,
          spaceName: space.spaceName,
          date: parseFinnishDate(day.date),
          bookingStart: day.bookingStart,
          bookingEnd: day.bookingEnd,
          label: wo.customerCompany,
          status: wo.status,
        }))
      )
    )
  }, [workOrders])

  // Navigation handlers
  const goToToday = () => setCurrentDate(new Date())

  const goPrev = () => {
    setCurrentDate((d) =>
      viewMode === 'month' ? subMonths(d, 1) : subWeeks(d, 1)
    )
  }

  const goNext = () => {
    setCurrentDate((d) =>
      viewMode === 'month' ? addMonths(d, 1) : addWeeks(d, 1)
    )
  }

  // Period label
  const periodLabel = useMemo(() => {
    if (viewMode === 'month') {
      const monthName = format(currentDate, 'LLLL yyyy', { locale: fi })
      return capitalize(monthName)
    }
    const weekStart = startOfWeek(currentDate, WEEK_START_OPTION)
    const weekEnd = endOfWeek(currentDate, WEEK_START_OPTION)
    const weekNum = getISOWeek(currentDate)
    const startStr = format(weekStart, 'd.', { locale: fi })
    const endStr = format(weekEnd, 'd.M.yyyy', { locale: fi })
    return `Viikko ${weekNum} · ${startStr}–${endStr}`
  }, [currentDate, viewMode])

  // Month view days
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, WEEK_START_OPTION)
    const calendarEnd = endOfWeek(monthEnd, WEEK_START_OPTION)
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentDate])

  // Week view days
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, WEEK_START_OPTION)
    const weekEnd = endOfWeek(currentDate, WEEK_START_OPTION)
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }, [currentDate])

  // Get events for a specific day
  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(e.date, day))

  // Hours array for week view
  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => START_HOUR + i
  )

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <Calendar className="h-6 w-6 text-gray-400" />
        <h1 className="text-2xl font-bold text-gray-900">Kalenteri</h1>
      </div>

      {/* Navigation row */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="icon"
          onClick={goPrev}
          aria-label="Edellinen"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm font-semibold text-gray-900 min-w-[220px] text-center">
          {periodLabel}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={goNext}
          aria-label="Seuraava"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" onClick={goToToday} className="ml-2">
          Tänään
        </Button>

        <div className="ml-auto flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            className={cn(
              'px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
              viewMode === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            )}
            onClick={() => setViewMode('month')}
          >
            Kuukausi
          </button>
          <button
            className={cn(
              'px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
              viewMode === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            )}
            onClick={() => setViewMode('week')}
          >
            Viikko
          </button>
          <button
            className={cn(
              'px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
              viewMode === 'tilat'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            )}
            onClick={() => setViewMode('tilat')}
          >
            Tilat
          </button>
        </div>
      </div>

      {/* Calendar body */}
      <div className="mt-4 flex-1 overflow-auto">
        {viewMode === 'month' ? (
          <MonthView
            days={monthDays}
            currentDate={currentDate}
            getEventsForDay={getEventsForDay}
            onEventClick={openWorkOrder}
          />
        ) : viewMode === 'week' ? (
          <WeekView
            days={weekDays}
            hours={hours}
            getEventsForDay={getEventsForDay}
            onEventClick={openWorkOrder}
          />
        ) : (
          <SpaceTimelineView
            days={weekDays}
            bookings={spaceBookings}
            onEventClick={openWorkOrder}
          />
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Month View                                                          */
/* ------------------------------------------------------------------ */

function MonthView({
  days,
  currentDate,
  getEventsForDay,
  onEventClick,
}: {
  days: Date[]
  currentDate: Date
  getEventsForDay: (day: Date) => CalendarEvent[]
  onEventClick: (id: string) => void
}) {
  const MAX_VISIBLE = 3

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {WEEKDAY_HEADERS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const today = isToday(day)
          const visibleEvents = dayEvents.slice(0, MAX_VISIBLE)
          const overflowCount = dayEvents.length - MAX_VISIBLE

          return (
            <div
              key={idx}
              className={cn(
                'min-h-[120px] border-b border-r border-gray-200 p-1.5',
                !isCurrentMonth && 'bg-gray-50/50',
                // Remove right border on last column
                (idx + 1) % 7 === 0 && 'border-r-0'
              )}
            >
              {/* Day number */}
              <div className="flex items-start justify-start mb-1">
                <span
                  className={cn(
                    'inline-flex items-center justify-center text-sm w-7 h-7 rounded-full',
                    today && 'bg-blue-600 text-white font-semibold',
                    !today && isCurrentMonth && 'text-gray-900',
                    !today && !isCurrentMonth && 'text-gray-300'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Event pills */}
              <div className="flex flex-col gap-0.5">
                {visibleEvents.map((ev, i) => (
                  <button
                    key={`${ev.workOrderId}-${i}`}
                    className={cn(
                      'w-full text-left text-[11px] font-medium rounded px-1.5 py-0.5 truncate cursor-pointer hover:opacity-80 transition-opacity',
                      STATUS_COLORS[ev.status]
                    )}
                    onClick={() => onEventClick(ev.workOrderId)}
                    title={`${ev.label} — ${ev.eventType}`}
                  >
                    {ev.label}
                  </button>
                ))}
                {overflowCount > 0 && (
                  <span className="text-[11px] text-blue-600 font-medium px-1.5 cursor-default">
                    +{overflowCount} lisää
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Week View                                                           */
/* ------------------------------------------------------------------ */

function WeekView({
  days,
  hours,
  getEventsForDay,
  onEventClick,
}: {
  days: Date[]
  hours: number[]
  getEventsForDay: (day: Date) => CalendarEvent[]
  onEventClick: (id: string) => void
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-[64px_repeat(7,1fr)] bg-gray-50 border-b border-gray-200">
        {/* Empty time column header */}
        <div className="border-r border-gray-200" />
        {days.map((day, i) => {
          const dayName = capitalize(format(day, 'EEEEEE', { locale: fi }))
          const today = isToday(day)
          return (
            <div
              key={i}
              className={cn(
                'py-2 text-center border-r border-gray-200 last:border-r-0',
                today && 'bg-blue-50'
              )}
            >
              <div className="text-xs font-medium text-gray-500">{dayName}</div>
              <div
                className={cn(
                  'text-lg font-semibold mt-0.5',
                  today ? 'text-blue-600' : 'text-gray-900'
                )}
              >
                {format(day, 'd')}
              </div>
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-[64px_repeat(7,1fr)] relative">
        {/* Time labels */}
        <div className="border-r border-gray-200">
          {hours.map((hour) => (
            <div
              key={hour}
              className="border-b border-gray-100 text-right pr-2 text-xs text-gray-400 relative"
              style={{ height: `${HOUR_HEIGHT}px` }}
            >
              <span className="absolute -top-2 right-2">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, dayIdx) => {
          const dayEvents = getEventsForDay(day)
          const today = isToday(day)
          return (
            <div
              key={dayIdx}
              className={cn(
                'relative border-r border-gray-200 last:border-r-0',
                today && 'bg-blue-50/30'
              )}
            >
              {/* Hour grid lines */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="border-b border-gray-100"
                  style={{ height: `${HOUR_HEIGHT}px` }}
                />
              ))}

              {/* Event blocks */}
              {dayEvents.map((ev, i) => {
                const startH = parseTime(ev.bookingStart)
                const endH = parseTime(ev.bookingEnd)
                const clampedStart = Math.max(startH, START_HOUR)
                const clampedEnd = Math.min(endH, END_HOUR)
                if (clampedEnd <= clampedStart) return null

                const top = (clampedStart - START_HOUR) * HOUR_HEIGHT
                const height = (clampedEnd - clampedStart) * HOUR_HEIGHT

                return (
                  <button
                    key={`${ev.workOrderId}-${i}`}
                    className={cn(
                      'absolute left-0.5 right-0.5 rounded-md px-2 py-1 text-left cursor-pointer hover:opacity-80 transition-opacity overflow-hidden',
                      STATUS_COLORS[ev.status],
                      'opacity-90'
                    )}
                    style={{ top: `${top}px`, height: `${height}px` }}
                    onClick={() => onEventClick(ev.workOrderId)}
                    title={`${ev.label} — ${ev.eventType} (${ev.bookingStart}–${ev.bookingEnd})`}
                  >
                    <div className="text-xs font-semibold truncate">
                      {ev.label}
                    </div>
                    <div className="text-[10px] opacity-90 truncate">
                      {ev.eventType}
                    </div>
                    <div className="text-[10px] opacity-80">
                      {ev.bookingStart}–{ev.bookingEnd}
                    </div>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Space Timeline View (Tilat)                                        */
/* ------------------------------------------------------------------ */

function SpaceTimelineView({
  days,
  bookings,
  onEventClick,
}: {
  days: Date[]
  bookings: SpaceBooking[]
  onEventClick: (id: string) => void
}) {
  const getBookingsForSpaceAndDay = (spaceId: string, day: Date) =>
    bookings.filter((b) => b.spaceId === spaceId && isSameDay(b.date, day))

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-[160px_repeat(7,1fr)] bg-gray-50 border-b border-gray-200">
        <div className="py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
          Tilat
        </div>
        {days.map((day, i) => {
          const today = isToday(day)
          const dayName = capitalize(format(day, 'EEEEEE', { locale: fi }))
          return (
            <div
              key={i}
              className={cn(
                'py-2 text-center border-r border-gray-200 last:border-r-0',
                today && 'bg-blue-50'
              )}
            >
              <div className="text-xs font-medium text-gray-500">{dayName}</div>
              <div
                className={cn(
                  'text-sm font-semibold',
                  today ? 'text-blue-600' : 'text-gray-900'
                )}
              >
                {format(day, 'd.M.')}
              </div>
            </div>
          )
        })}
      </div>

      {/* Space rows */}
      {spaceCatalog.map((space, rowIdx) => (
        <div
          key={space.id}
          className={cn(
            'grid grid-cols-[160px_repeat(7,1fr)]',
            rowIdx !== spaceCatalog.length - 1 && 'border-b border-gray-100'
          )}
        >
          <div className="py-2 px-3 text-sm font-medium text-gray-700 border-r border-gray-200 flex items-center">
            {space.name}
          </div>
          {days.map((day, dayIdx) => {
            const dayBookings = getBookingsForSpaceAndDay(space.id, day)
            return (
              <div
                key={dayIdx}
                className="p-1 border-r border-gray-100 last:border-r-0 flex flex-col gap-1 min-h-13"
              >
                {dayBookings.map((b, i) => (
                  <button
                    key={`${b.workOrderId}-${i}`}
                    className={cn(
                      'w-full text-left text-[11px] font-medium rounded px-1.5 py-0.5 truncate cursor-pointer hover:opacity-80 transition-opacity',
                      STATUS_COLORS[b.status]
                    )}
                    onClick={() => onEventClick(b.workOrderId)}
                    title={`${b.label} (${b.bookingStart}–${b.bookingEnd})`}
                  >
                    {b.bookingStart} {b.label}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
