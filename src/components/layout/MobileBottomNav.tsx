import { Link, useLocation, useParams } from "react-router-dom"
import { Home, LayoutDashboard, DoorOpen, UtensilsCrossed, FileText, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWorkOrders } from "@/context/WorkOrderContext"

export function MobileBottomNav() {
  const location = useLocation()
  const params = useParams<{ id: string }>()
  const woId = params.id ?? location.pathname.match(/\/tyomarain\/([^/]+)/)?.[1]
  const { getWorkOrder } = useWorkOrders()

  const insideWO = !!(woId && location.pathname.includes("/tyomarain/"))
  const lastSegment = location.pathname.split("/").pop() ?? ""
  const wo = insideWO ? getWorkOrder(woId!) : null

  const hasDrafts = wo?.proposalSections?.some(p => p.status === "draft")
  const hasSpaces = (wo?.eventDays?.flatMap(d => d.spaces).length ?? 0) > 0
  const showPilleri = insideWO && lastSegment !== "yleiskuva" && (hasDrafts || hasSpaces)

  const base = insideWO ? `/tyomarain/${woId}` : null

  const items = [
    { icon: Home, label: "Koti", to: "/", active: location.pathname === "/" || !insideWO && lastSegment === "" },
    { icon: LayoutDashboard, label: "Yleiskuva", to: base ? `${base}/yleiskuva` : null, segment: "yleiskuva", badge: showPilleri },
    { icon: DoorOpen, label: "Tilat", to: base ? `${base}/tilat` : null, segment: "tilat" },
    { icon: UtensilsCrossed, label: "Catering", to: base ? `${base}/catering` : null, segment: "catering" },
    { icon: FileText, label: "Tarjous", to: base ? `${base}/tarjous` : null, segment: "tarjous" },
  ]

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-stretch"
      style={{
        backgroundColor: "var(--color-sidebar-main)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        borderTop: "1px solid #2a2a2a",
        minHeight: 56,
      }}
    >
      {items.map(({ icon: Icon, label, to, segment, badge, active }) => {
        const isActive = active !== undefined
          ? active
          : insideWO && segment ? lastSegment === segment : false
        const disabled = !to

        const content = (
          <>
            <div className="relative">
              <Icon className="h-5 w-5" />
              {badge && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full"
                  style={{ backgroundColor: "var(--color-brand-green)" }} />
              )}
            </div>
            <span>{label}</span>
          </>
        )

        const cls = cn(
          "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors no-underline",
          isActive ? "text-white" : disabled ? "text-gray-700" : "text-gray-500 hover:text-gray-300"
        )

        if (disabled) return <div key={label} className={cls}>{content}</div>

        return (
          <Link key={label} to={to!} className={cls}>
            {content}
          </Link>
        )
      })}

      {/* + Uusi — korotettu */}
      <Link
        to="/uusi-liidi"
        className="flex flex-col items-center justify-end gap-0.5 pb-2 no-underline px-3"
        style={{ marginBottom: 8 }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full shadow-lg"
          style={{ backgroundColor: "var(--color-brand-green)" }}>
          <Plus className="h-5 w-5 text-black" />
        </div>
        <span className="text-[10px] font-medium text-gray-500">Uusi</span>
      </Link>
    </nav>
  )
}
