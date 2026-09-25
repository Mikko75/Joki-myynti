import { useState } from "react"
import { Home, Search, Bell, ChevronRight, Plus, Check } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useTeam } from "@/context/TeamContext"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { useMode } from "@/context/ModeContext"
import { InviteModal } from "@/components/common/InviteModal"

interface TopBarProps {
  breadcrumbs: string[]
}

const AVATAR_COLORS = ["#384ff7", "#26ad61", "#f59e0a", "#e84545", "#944ade"]

export function TopBar({ breadcrumbs }: TopBarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { members } = useTeam()
  const { workOrders } = useWorkOrders()
  const { mode } = useMode()
  const isSeller = mode === "seller"
  const [showSaved, setShowSaved] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)

  const isInsideWorkOrder = location.pathname.includes("/tyomarain/")

  const segments = location.pathname.split("/").filter(Boolean)
  const workOrderId = isInsideWorkOrder ? segments[1] : undefined
  const workOrder = workOrderId ? workOrders.find((wo) => wo.id === workOrderId) : undefined

  function handleBack() {
    if (isInsideWorkOrder) {
      setShowSaved(true)
      setTimeout(() => {
        setShowSaved(false)
        navigate("/")
      }, 1500)
    } else {
      navigate("/")
    }
  }

  const allParticipants = workOrder
    ? [
        ...workOrder.participants,
        ...members.map((m) => ({ id: m.id, name: m.name, initials: m.initials, color: m.color })),
      ].filter((p, i, arr) => arr.findIndex((x) => x.name === p.name) === i)
    : []

  const displayAvatars = allParticipants.slice(0, 5)

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#ebedf0] bg-white px-6 shrink-0">
      <div className="flex items-center gap-1 min-w-0">
        <button
          onClick={handleBack}
          className="flex items-center justify-center rounded-lg size-8 text-[#66707a] hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
        >
          <Home className="h-5 w-5" />
        </button>

        {breadcrumbs.length > 0 && (
          <nav className="flex items-center">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center shrink-0">
                <ChevronRight className="h-4.5 w-4.5 text-[#a3adb8] mx-0.5" />
                <span
                  className={
                    i === breadcrumbs.length - 1
                      ? "text-sm font-semibold text-[#1c2126]"
                      : "text-sm text-[#66707a]"
                  }
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        )}

        {showSaved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium ml-3">
            <Check className="h-3.5 w-3.5" />
            Tallennettu automaattisesti
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center justify-center rounded-lg size-8 text-[#66707a] hover:text-gray-900 hover:bg-gray-100 transition-colors">
          <Search className="h-5 w-5" />
        </button>
        <button className="flex items-center justify-center rounded-lg size-8 text-[#66707a] hover:text-gray-900 hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5" />
        </button>

        {displayAvatars.length > 0 && (
          <div className="flex items-start overflow-hidden">
            {displayAvatars.map((p, i) => (
              <div
                key={p.id}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white border-2 border-white shrink-0"
                style={{
                  backgroundColor: p.color || AVATAR_COLORS[i % AVATAR_COLORS.length],
                  marginRight: i < displayAvatars.length - 1 ? "-8px" : "0",
                }}
                title={p.name}
              >
                {p.initials}
              </div>
            ))}
          </div>
        )}

        {isInsideWorkOrder && isSeller && (
          <>
            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-1 border border-[#d9dee5] rounded-lg pl-4 pr-3 py-2 text-sm font-semibold text-[#363d45] hover:bg-gray-50 transition-colors"
            >
              Kutsu
              <Plus className="h-4.5 w-4.5" />
            </button>
            <InviteModal open={inviteOpen} onOpenChange={setInviteOpen} />
          </>
        )}
      </div>
    </header>
  )
}
