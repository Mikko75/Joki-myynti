import type { ReactNode } from "react"
import type { WorkOrder } from "@/data/types"

interface WorkOrderHeaderProps {
  workOrder: WorkOrder
  title: string
  right?: ReactNode
}

export function WorkOrderHeader({ workOrder, title, right }: WorkOrderHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500">
          {workOrder.customerCompany} · {workOrder.eventType}
        </p>
      </div>
      {right && <div className="flex items-center gap-4">{right}</div>}
    </div>
  )
}
