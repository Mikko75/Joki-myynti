import { Link, useLocation, useParams } from "react-router-dom"
import { LayoutGrid, CalendarDays, Users, Plus, Home, LayoutDashboard, DoorOpen, UtensilsCrossed, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWorkOrders } from "@/context/WorkOrderContext"

const NAV_BG = {
  backgroundColor: "var(--color-sidebar-main)",
  paddingBottom: "env(safe-area-inset-bottom, 0px)",
  borderTop: "1px solid #2a2a2a",
}

export function MobileBottomNav() {
  const location = useLocation()
  const params = useParams<{ id: string }>()
  const woId = params.id ?? location.pathname.match(/\/tyomarain\/([^/]+)/)?.[1]
  const { getWorkOrder } = useWorkOrders()

  // ── Työmääräimen sisällä ───────────────────────────────────────────
  if (woId && location.pathname.includes("/tyomarain/")) {
    const base = `/tyomarain/${woId}`
    const lastSegment = location.pathname.split("/").pop() ?? ""
    const wo = getWorkOrder(woId)

    const hasDrafts = wo?.proposalSections?.some(p => p.status === "draft")
    const hasSpaces = (wo?.eventDays?.flatMap(d => d.spaces).length ?? 0) > 0
    const showPilleri = lastSegment !== "yleiskuva" && (hasDrafts || hasSpaces)

    const items = [
      { to: "/", icon: Home, label: "Koti", segment: "_home" },
      { to: `${base}/yleiskuva`, icon: LayoutDashboard, label: "Yleiskuva", segment: "yleiskuva", badge: showPilleri },
      { to: `${base}/tilat`, icon: DoorOpen, label: "Tilat", segment: "tilat" },
      { to: `${base}/catering`, icon: UtensilsCrossed, label: "Catering", segment: "catering" },
      { to: `${base}/tarjous`, icon: FileText, label: "Tarjous", segment: "tarjous" },
    ]

    return (
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-stretch" style={NAV_BG}>
        {items.map(({ to, icon: Icon, label, segment, badge }) => {
          const isActive = segment === "_home" ? false : lastSegment === segment
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors no-underline",
                isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {badge && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full"
                    style={{ backgroundColor: "var(--color-brand-green)" }} />
                )}
              </div>
              {label}
            </Link>
          )
        })}
      </nav>
    )
  }

  // ── Koti-näkymä: Koti · Kalenteri · Asiakkaat · + ─────────────────
  const mainItems = [
    { to: "/", icon: LayoutGrid, label: "Koti", exact: true },
    { to: "/kalenteri", icon: CalendarDays, label: "Kalenteri" },
    { to: "/asiakkaat", icon: Users, label: "Asiakkaat" },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-end justify-around" style={{ ...NAV_BG, minHeight: 64 }}>
      {mainItems.map(({ to, icon: Icon, label, exact }) => {
        const isActive = exact ? location.pathname === to : location.pathname.startsWith(to)
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 pb-3 text-[10px] font-medium transition-colors no-underline",
              isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        )
      })}

      {/* + korotettu — vain kotinäkymässä */}
      <Link to="/uusi-liidi" className="flex flex-col items-center no-underline px-3" style={{ marginBottom: 14 }}>
        <div className="flex h-11 w-11 items-center justify-center rounded-full shadow-lg"
          style={{ backgroundColor: "var(--color-brand-green)" }}>
          <Plus className="h-5 w-5 text-black" />
        </div>
      </Link>
    </nav>
  )
}
