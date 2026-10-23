import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard, statusAccentColors } from './KanbanCard'
import { kanbanColumns } from '@/data/mock'
import { useWorkOrders } from '@/context/WorkOrderContext'
import { useMode, SELLER_MODE } from '@/context/ModeContext'
import { cn } from '@/lib/utils'

interface KanbanBoardProps {
  statusFilter?: string | null
  sourceFilter?: string | null
  searchText?: string
}

export function KanbanBoard({ statusFilter, sourceFilter, searchText }: KanbanBoardProps = {}) {
  const navigate = useNavigate()
  const { workOrders } = useWorkOrders()
  const { setMode, setModeInfo } = useMode()
  const [activeTab, setActiveTab] = useState(kanbanColumns[0].status)

  function openWorkOrder(id: string) {
    setMode("seller")
    setModeInfo(SELLER_MODE)
    navigate(`/tyomarain/${id}`)
  }

  const filtered = workOrders
    .filter((wo) => !statusFilter || wo.status === statusFilter)
    .filter((wo) => !sourceFilter || wo.source === sourceFilter)
    .filter((wo) => !searchText || [wo.customerCompany, wo.customerName, wo.eventType].some((s) => s?.toLowerCase().includes(searchText.toLowerCase())))

  return (
    <>
      {/* MOBIILI: status-tabit + kortit allekkain */}
      <div className="md:hidden">
        <div className="flex overflow-x-auto gap-1 pb-2 mb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {kanbanColumns.map((col) => {
            const count = filtered.filter((wo) => wo.status === col.status).length
            const isActive = activeTab === col.status
            return (
              <button
                key={col.id}
                onClick={() => setActiveTab(col.status)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium whitespace-nowrap transition-colors shrink-0",
                  isActive
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-400 border-b-2 border-transparent hover:text-gray-600"
                )}
              >
                {col.title}
                <span className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
                  isActive ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex flex-col gap-3 pb-20">
          {filtered.filter((wo) => wo.status === activeTab).map((wo) => (
            <KanbanCard key={wo.id} workOrder={wo} onClick={() => openWorkOrder(wo.id)} />
          ))}
          {filtered.filter((wo) => wo.status === activeTab).length === 0 && (
            <p className="text-[13px] text-gray-400 text-center py-10">Ei työmääräimiä tässä tilassa.</p>
          )}
        </div>
      </div>

      {/* DESKTOP: normaali kanban-taulu */}
      <div className="hidden md:flex gap-5 overflow-x-auto pb-6 -mx-2 px-2">
        {kanbanColumns.map((column) => {
          const columnOrders = filtered.filter((wo) => wo.status === column.status)
          return (
            <KanbanColumn
              key={column.id}
              title={column.title}
              count={columnOrders.length}
              accentColor={statusAccentColors[column.status]}
            >
              {columnOrders.map((wo) => (
                <KanbanCard key={wo.id} workOrder={wo} onClick={() => openWorkOrder(wo.id)} />
              ))}
            </KanbanColumn>
          )
        })}
      </div>
    </>
  )
}
