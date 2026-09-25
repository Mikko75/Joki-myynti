import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EventDay } from "@/data/types"

interface DayTabsProps {
  days: EventDay[]
  activeDay: string
  onDayChange: (id: string) => void
  onAdd?: () => void
}

export function DayTabs({ days, activeDay, onDayChange, onAdd }: DayTabsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {days.map((day, i) => {
        const isActive = day.id === activeDay
        return (
          <button
            key={day.id}
            onClick={() => onDayChange(day.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-primary-500 bg-white text-primary-600"
                : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
            )}
          >
            Päivä {i + 1} – {day.date} – {day.label}
          </button>
        )
      })}
      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-full border border-dashed border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
        >
          <Plus className="h-4 w-4" />
          Lisää tapahtumapäivä
        </button>
      )}
    </div>
  )
}
