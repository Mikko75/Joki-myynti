import { useNavigate } from 'react-router-dom'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard, statusAccentColors } from './KanbanCard'
import { kanbanColumns } from '@/data/mock'
import { useWorkOrders } from '@/context/WorkOrderContext'
import { useMode, SELLER_MODE } from '@/context/ModeContext'

interface KanbanBoardProps {
  statusFilter?: string | null
  sourceFilter?: string | null
  searchText?: string
}

export function KanbanBoard({ statusFilter, sourceFilter, searchText }: KanbanBoardProps = {}) {
  const navigate = useNavigate()
  const { workOrders } = useWorkOrders()
  const { setMode, setModeInfo } = useMode()

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
    <div className="flex gap-5 overflow-x-auto pb-6 -mx-2 px-2">
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
              <KanbanCard
                key={wo.id}
                workOrder={wo}
                onClick={() => openWorkOrder(wo.id)}
              />
            ))}
          </KanbanColumn>
        )
      })}
    </div>
  )
}
