import { useParams } from "react-router-dom"
import { Search, HelpCircle, ChevronRight } from "lucide-react"
import { useMode } from "@/context/ModeContext"
import { useWorkOrders } from "@/context/WorkOrderContext"
import ClientPortal from "./ClientPortal"

export default function ClientPortalWrapper() {
  const { id } = useParams<{ id: string }>()
  const { modeInfo } = useMode()
  const { getWorkOrder } = useWorkOrders()
  const workOrder = getWorkOrder(id ?? "")

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-bold tracking-wide text-gray-900 shrink-0">VENUE OS</span>
          <nav className="hidden sm:flex items-center text-[13px]">
            <ChevronRight className="h-3.5 w-3.5 text-gray-300 mx-1.5" />
            <span className="text-gray-400">Asiakasportaali</span>
            {workOrder && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 mx-1.5" />
                <span className="text-gray-900 font-medium">{workOrder.customerCompany}</span>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Search className="h-4.5 w-4.5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <HelpCircle className="h-4.5 w-4.5" />
          </button>
          <div className="flex items-center gap-2.5 ml-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0"
              style={{ backgroundColor: modeInfo.color }}
            >
              {modeInfo.initials}
            </div>
            <div className="hidden lg:block">
              <p className="text-[13px] font-semibold leading-tight text-gray-900">{modeInfo.name}</p>
              <p className="text-[11px] text-gray-400">{modeInfo.role}</p>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto bg-gray-50/80">
        <ClientPortal workOrderId={id ?? ""} />
      </main>
    </div>
  )
}
