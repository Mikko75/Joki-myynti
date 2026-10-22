import { Calendar, MoreHorizontal, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import type { WorkOrder, WorkOrderStatus, EventSource, SectionStatus } from '@/data/types'
import { spaces as spaceCatalog } from '@/data/mock'

interface KanbanCardProps {
  workOrder: WorkOrder
  onClick?: () => void
}

export const statusLabels: Record<WorkOrderStatus, string> = {
  uusi: 'Uusi',
  tyonalla: 'Työn alla',
  asiakkaalla: 'Asiakkaalla',
  vahvistettu: 'Vahvistettu',
  ei_toteudu: 'Ei toteudu',
}

export const statusBadgeColors: Record<WorkOrderStatus, string> = {
  uusi: 'bg-blue-100 text-blue-700',
  tyonalla: 'bg-amber-100 text-amber-700',
  asiakkaalla: 'bg-purple-100 text-purple-700',
  vahvistettu: 'bg-emerald-100 text-emerald-700',
  ei_toteudu: 'bg-gray-100 text-gray-500',
}

// Keep for KanbanBoard column accent
export const statusColors = statusBadgeColors
export const statusAccentColors: Record<WorkOrderStatus, string> = {
  uusi: 'border-blue-400',
  tyonalla: 'border-amber-400',
  asiakkaalla: 'border-purple-400',
  vahvistettu: 'border-green-400',
  ei_toteudu: 'border-gray-300',
}

const sectionDotColor: Record<SectionStatus, string> = {
  valmis: 'bg-emerald-500',
  kaynnissa: 'bg-amber-400',
  ei_aloitettu: 'bg-gray-300',
}

const sectionStatusLabel: Record<SectionStatus, string> = {
  valmis: 'Valmis',
  kaynnissa: 'Kesken',
  ei_aloitettu: 'Ei aloitettu',
}

export function KanbanCard({ workOrder, onClick }: KanbanCardProps) {
  const navigate = useNavigate()
  const firstDate = workOrder.eventDays[0]?.date ?? '—'

  // Ensimmäisen valitun tilan kuva
  const firstSpace = workOrder.eventDays.flatMap(d => d.spaces)[0]
  const spaceImage = firstSpace ? spaceCatalog.find(s => s.id === firstSpace.spaceId)?.image : null

  // Progress: pipeline-pohjainen — seuraa workOrderin statusta
  const proposalProgress = (status: string): number => {
    switch (status) {
      case 'uusi':        return 5
      case 'tyonalla':    return 30
      case 'asiakkaalla': return 65
      case 'vahvistettu': return 100
      default:            return 0
    }
  }

  // Tarkennetaan proposalSections-datan perusteella työnalla-vaiheessa
  const proposals = workOrder.proposalSections ?? []
  const approvedCount = proposals.filter(p => p.status === 'approved').length
  const sentCount = proposals.filter(p => p.status === 'sent' || p.status === 'approved').length

  let progressPct = proposalProgress(workOrder.status)
  if (workOrder.status === 'tyonalla') {
    progressPct = Math.max(15, Math.min(55, 15 + sentCount * 10))
  } else if (workOrder.status === 'asiakkaalla') {
    progressPct = Math.max(60, Math.min(90, 60 + approvedCount * 8))
  }

  // Progress väri seuraa status-badgen väriä
  const progressColors: Record<string, string> = {
    uusi:        '#3b82f6',  // blue
    tyonalla:    '#f59e0b',  // amber
    asiakkaalla: '#8b5cf6',  // purple
    vahvistettu: '#22c55e',  // green
    ei_toteudu:  '#9ca3af',  // gray
  }
  const progressColor = progressColors[workOrder.status] ?? '#6b7280'

  // Participants for avatar row (first 3)
  const participants = workOrder.participants?.slice(0, 3) ?? []

  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#f3f4f6] shadow-[0px_2px_12px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col cursor-pointer hover:shadow-[0px_4px_16px_rgba(0,0,0,0.12)] hover:border-gray-200 transition-all duration-150"
    >
      <div className="p-4 flex flex-col gap-4">
      {/* Header: status badge + menu */}
      <div className="flex items-center justify-between">
        <span className={cn('text-[12px] font-semibold leading-4 px-3 py-1 rounded-full', statusBadgeColors[workOrder.status])}>
          {statusLabels[workOrder.status]}
        </span>
        <button
          onClick={(e) => e.stopPropagation()}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Company info */}
      <div>
        <p className="text-[16px] font-semibold leading-[22px] text-[#111827]">{workOrder.customerCompany}</p>
        <p className="text-[12px] leading-4 text-[#6b7280] mt-1">{workOrder.eventType}</p>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[14px] leading-5">
          <span className="text-gray-900 font-normal">Progress</span>
          <span className="font-semibold text-gray-900">{progressPct}%</span>
        </div>
        <div className="h-2 bg-[#e2e8f0] rounded-full w-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progressPct}%`, backgroundColor: progressColor }}
          />
        </div>
      </div>

      {/* Description */}
      {workOrder.eventDescription && (
        <p className="text-[12px] leading-4 text-[#4b5563] line-clamp-3">
          {workOrder.eventDescription}
        </p>
      )}

      {/* Status row */}
      <div className="flex items-start gap-[7px]">
        {/* Tila */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-[6px]">
            <span className={cn('h-[10px] w-[10px] rounded-[3px] shrink-0', sectionDotColor[workOrder.sectionStatuses.tila])} />
            <span className="text-[12px] font-semibold leading-4 text-[#111827]">Tila</span>
          </div>
          <span className="text-[12px] leading-4 text-[#6b7280]">{sectionStatusLabel[workOrder.sectionStatuses.tila]}</span>
        </div>

        <div className="self-stretch flex items-center justify-center w-px mx-0.5">
          <div className="w-px h-full bg-[#e5e7eb]" />
        </div>

        {/* Catering */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-[6px]">
            <span className={cn('h-[10px] w-[10px] rounded-[3px] shrink-0', sectionDotColor[workOrder.sectionStatuses.catering])} />
            <span className="text-[12px] font-semibold leading-4 text-[#111827]">Catering</span>
          </div>
          <span className="text-[12px] leading-4 text-[#6b7280]">{sectionStatusLabel[workOrder.sectionStatuses.catering]}</span>
        </div>

        <div className="self-stretch flex items-center justify-center w-px mx-0.5">
          <div className="w-px h-full bg-[#e5e7eb]" />
        </div>

        {/* AV */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-[6px]">
            <span className={cn('h-[10px] w-[10px] rounded-[3px] shrink-0', sectionDotColor[workOrder.sectionStatuses.av])} />
            <span className="text-[12px] font-semibold leading-4 text-[#111827]">AV-tuotanto</span>
          </div>
          <span className="text-[12px] leading-4 text-[#6b7280]">{sectionStatusLabel[workOrder.sectionStatuses.av]}</span>
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-[#f3f4f6] -mx-4" />

      {/* Notes / seuraava askel */}
      {workOrder.nextStep && (
        <div className="flex flex-col gap-2 py-1">
          <p className="text-[11px] font-medium leading-[14px] text-[#8f8f8f]">Seuraava askel:</p>
          <p className="text-[12px] leading-4 text-[#292b2d]">{workOrder.nextStep}</p>
        </div>
      )}

      {/* Source badge — varausjärjestelmä korostettuna */}
      {workOrder.source === 'varausjarjestelma' && (
        <div className="flex">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Varausjärjestelmä</span>
        </div>
      )}

      {/* Footer: avatars + date + calendar link + tilathumbnail */}
      <div className="flex items-center gap-2">
        {/* Participant avatars */}
        <div className="flex items-center">
          {participants.map((p, i) => (
            <div
              key={p.id}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[11px] font-semibold text-white shrink-0"
              style={{
                backgroundColor: p.color ?? '#4f46e5',
                marginLeft: i > 0 ? '-8px' : '0',
                zIndex: participants.length - i,
              }}
              title={p.name}
            >
              {p.initials}
            </div>
          ))}
        </div>

        {/* Date */}
        <div className="ml-auto flex items-center gap-1.5 text-[12px] text-[#6b7280]">
          <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <span>{firstDate}</span>
          {workOrder.eventDays[0]?.date && (
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/kalenteri?date=${workOrder.eventDays[0].date}`) }}
              className="text-gray-300 hover:text-primary-500 transition-colors ml-1"
              title="Näytä kalenterissa"
            >
              <ExternalLink className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
