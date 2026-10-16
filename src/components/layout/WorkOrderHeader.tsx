import type { ReactNode } from "react"
import type { WorkOrder, WorkOrderStatus } from "@/data/types"
import { cn } from "@/lib/utils"

interface WorkOrderHeaderProps {
  workOrder: WorkOrder
  title: string
  right?: ReactNode
}

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  uusi: "Uusi",
  tyonalla: "Käsittelyssä",
  asiakkaalla: "Tarjous asiakkaalla",
  vahvistettu: "Vahvistettu",
  ei_toteudu: "Ei toteudu",
}

const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  uusi: "bg-blue-100 text-blue-700",
  tyonalla: "bg-amber-100 text-amber-700",
  asiakkaalla: "bg-purple-100 text-purple-700",
  vahvistettu: "bg-emerald-100 text-emerald-700",
  ei_toteudu: "bg-gray-100 text-gray-500",
}

export function WorkOrderHeader({ workOrder, title, right }: WorkOrderHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full", STATUS_COLORS[workOrder.status])}>
            {STATUS_LABELS[workOrder.status]}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          {workOrder.customerCompany} · {workOrder.eventType}
        </p>
      </div>
      {right && <div className="flex items-center gap-4">{right}</div>}
    </div>
  )
}
