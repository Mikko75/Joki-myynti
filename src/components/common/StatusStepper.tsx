import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { statusLabels, statusAccentColors } from "@/components/kanban/KanbanCard"
import type { WorkOrderStatus } from "@/data/types"

const PIPELINE: WorkOrderStatus[] = ["uusi", "tyonalla", "asiakkaalla", "vahvistettu"]

interface StatusStepperProps {
  status: WorkOrderStatus
  className?: string
}

export function StatusStepper({ status, className }: StatusStepperProps) {
  if (status === "ei_toteudu") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-500",
          className
        )}
      >
        Ei toteudu
      </div>
    )
  }

  const currentIndex = PIPELINE.indexOf(status)

  return (
    <div className={cn("flex items-center", className)}>
      {PIPELINE.map((step, i) => {
        const isDone = i < currentIndex
        const isCurrent = i === currentIndex
        const isUpcoming = i > currentIndex
        const accent = statusAccentColors[step]

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-semibold",
                  isDone && cn(accent, "bg-white text-gray-700"),
                  isCurrent && cn(accent, "bg-white text-gray-900 ring-2 ring-offset-1", accent.replace("border-", "ring-")),
                  isUpcoming && "border-gray-200 text-gray-400"
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium whitespace-nowrap",
                  isUpcoming ? "text-gray-400" : "text-gray-700"
                )}
              >
                {statusLabels[step]}
              </span>
            </div>
            {i < PIPELINE.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-px w-8 shrink-0 border-t",
                  isDone ? accent : "border-gray-200"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
