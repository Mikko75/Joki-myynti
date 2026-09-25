import { Calendar, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { WorkOrder, WorkOrderStatus, EventSource, SectionStatus } from '@/data/types'

interface KanbanCardProps {
  workOrder: WorkOrder
  onClick?: () => void
}

export const statusLabels: Record<WorkOrderStatus, string> = {
  uusi: 'Uusi liidi',
  tyonalla: 'Käsittelyssä',
  asiakkaalla: 'Tarjous asiakkaalla',
  vahvistettu: 'Vahvistettu',
  ei_toteudu: 'Ei toteudu',
}

export const statusColors: Record<WorkOrderStatus, string> = {
  uusi: 'bg-blue-100 text-blue-800',
  tyonalla: 'bg-amber-100 text-amber-800',
  asiakkaalla: 'bg-purple-100 text-purple-800',
  vahvistettu: 'bg-green-100 text-green-800',
  ei_toteudu: 'bg-gray-100 text-gray-600',
}

export const statusAccentColors: Record<WorkOrderStatus, string> = {
  uusi: 'border-blue-400',
  tyonalla: 'border-amber-400',
  asiakkaalla: 'border-purple-400',
  vahvistettu: 'border-green-400',
  ei_toteudu: 'border-gray-300',
}

const sourceLabels: Record<EventSource, string> = {
  web: 'Web',
  sahkoposti: 'Sähköposti',
  puhelin: 'Puhelin',
}

const sectionDotColor: Record<SectionStatus, string> = {
  valmis: 'bg-emerald-500',
  kaynnissa: 'bg-orange-400',
  ei_aloitettu: 'bg-gray-300',
}

export function KanbanCard({ workOrder, onClick }: KanbanCardProps) {
  const firstDate = workOrder.eventDays[0]?.date ?? '—'

  return (
    <div
      onClick={onClick}
      className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-gray-300 cursor-pointer transition-all duration-150"
    >
      <Badge className={cn('mb-2.5 border-0 rounded-md text-[11px] font-semibold px-2 py-0.5', statusColors[workOrder.status])}>
        {statusLabels[workOrder.status]}
      </Badge>

      <p className="text-[13px] font-semibold text-gray-900 leading-tight">{workOrder.customerCompany}</p>
      <p className="text-[12px] text-gray-500 mt-0.5">{workOrder.eventType}</p>

      <div className="mt-3 flex items-center gap-1.5 text-[12px] text-gray-500">
        <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <span>{firstDate}</span>
      </div>

      <div className="mt-1 flex items-center gap-1.5 text-[12px] text-gray-500">
        <Users className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <span>{workOrder.participantEstimate} hlö</span>
      </div>

      <div className="mt-3">
        <span className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] text-gray-500">
          {sourceLabels[workOrder.source]}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-1">
          <span className={cn('h-2 w-2 rounded-full', sectionDotColor[workOrder.sectionStatuses.tila])} />
          Tila
        </span>
        <span className="inline-flex items-center gap-1">
          <span className={cn('h-2 w-2 rounded-full', sectionDotColor[workOrder.sectionStatuses.catering])} />
          Catering.
        </span>
        <span className="inline-flex items-center gap-1">
          <span className={cn('h-2 w-2 rounded-full', sectionDotColor[workOrder.sectionStatuses.av])} />
          AV-tuotanto
        </span>
      </div>

      <div className="mt-3 border-t border-gray-100 pt-2.5">
        <p className="text-[11px] text-gray-400 leading-none">Seuraava askel</p>
        <p className="text-[12px] font-medium text-gray-700 mt-0.5">{workOrder.nextStep}</p>
      </div>
    </div>
  )
}
