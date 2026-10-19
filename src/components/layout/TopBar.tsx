import { useState } from "react"
import { Home, Search, Bell, ChevronRight, Plus, Check } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useTeam } from "@/context/TeamContext"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { useMode } from "@/context/ModeContext"
import { InviteModal } from "@/components/common/InviteModal"

interface BreadcrumbItem {
  label: string
  to?: string
}

interface TopBarProps {
  breadcrumbs: BreadcrumbItem[]
}

const AVATAR_COLORS = ["#384ff7", "#26ad61", "#f59e0a", "#e84545", "#944ade"]

export function TopBar({ breadcrumbs }: TopBarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { members } = useTeam()
  const { workOrders, getAllCateringPlans } = useWorkOrders()
  const { mode } = useMode()
  const isSeller = mode === "seller"
  const [showSaved, setShowSaved] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)

  const notifications: { woId: string; woNumber: string; label: string }[] = []
  if (isSeller) {
    for (const wo of workOrders) {
      // Catering-kumppanin ehdotus
      const plans = getAllCateringPlans(wo.id)
      for (const [pid, p] of Object.entries(plans)) {
        if (p.status === "vastattu") {
          const partner = members.find((m) => m.id === pid)
          notifications.push({ woId: wo.id, woNumber: wo.number, label: `${partner?.name ?? pid} lähetti catering-ehdotuksen` })
        }
      }
      // Asiakas päivitti tietojaan
      if (wo.clientUpdatedAt) {
        notifications.push({ woId: wo.id, woNumber: wo.number, label: "Asiakas päivitti tapahtuman tietoja" })
      }
    }
  }

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
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1
              return (
                <span key={i} className="flex items-center shrink-0">
                  <ChevronRight className="h-4.5 w-4.5 text-[#a3adb8] mx-0.5" />
                  {crumb.to && !isLast ? (
                    <button
                      onClick={() => navigate(crumb.to!)}
                      className="text-sm text-[#66707a] hover:text-[#1c2126] hover:underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className={isLast ? "text-sm font-semibold text-[#1c2126]" : "text-sm text-[#66707a]"}>
                      {crumb.label}
                    </span>
                  )}
                </span>
              )
            })}
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
        <div className="relative">
          <button
            onClick={() => setBellOpen(!bellOpen)}
            className="flex items-center justify-center rounded-lg size-8 text-[#66707a] hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {notifications.length}
              </span>
            )}
          </button>
          {bellOpen && notifications.length > 0 && (
            <div className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-gray-200 bg-white shadow-lg py-2">
              <p className="px-4 py-1 text-[11px] font-semibold text-gray-500 uppercase">Ilmoitukset</p>
              {notifications.map((n, i) => (
                <button
                  key={i}
                  onClick={() => { navigate(`/tyomarain/${n.woId}/catering`); setBellOpen(false) }}
                  className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <p className="text-[13px] font-medium text-gray-900">{n.label}</p>
                    <p className="text-[11px] text-gray-500">{n.woNumber}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

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
