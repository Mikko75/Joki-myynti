import { Outlet, useParams, Link, useLocation } from "react-router-dom"
import { LayoutDashboard, UtensilsCrossed, Monitor, Clock, MessageSquare, MapPin, Package, ShoppingBag, Search, HelpCircle, ChevronRight } from "lucide-react"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { useMode } from "@/context/ModeContext"
import { useTeam } from "@/context/TeamContext"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface Props {
  role: string
}

const sectionNav: Record<string, { label: string; icon: LucideIcon }> = {
  yleiskuva: { label: "Yleiskuva", icon: LayoutDashboard },
  catering: { label: "Catering", icon: UtensilsCrossed },
  av: { label: "AV / tekniikka", icon: Monitor },
  tilat: { label: "Tilat", icon: MapPin },
  aikataulu: { label: "Aikataulu", icon: Clock },
  keskustelu: { label: "Keskustelu", icon: MessageSquare },
  lisapalvelut: { label: "Lisäpalvelut", icon: Package },
  tuotteet: { label: "Tuotteet", icon: ShoppingBag },
}

export function PartnerWorkOrderLayout({ role: _role }: Props) {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const { getWorkOrder } = useWorkOrders()
  const { modeInfo, mode } = useMode()
  const { getMemberSectionKeys, members } = useTeam()
  const workOrder = getWorkOrder(id ?? "")

  const lastSegment = location.pathname.split("/").pop() ?? ""

  const member = members.find((m) => m.id === mode)
  const sectionKeys = member ? getMemberSectionKeys(member.id) : []
  if (member?.seeSchedule && !sectionKeys.includes("aikataulu")) {
    sectionKeys.push("aikataulu")
  }
  if (sectionKeys.includes("catering") && !sectionKeys.includes("tuotteet")) {
    sectionKeys.push("tuotteet")
  }
  const allowedKeys = ["yleiskuva", ...sectionKeys, "keskustelu"]

  const navItems = allowedKeys
    .map((key) => {
      const nav = sectionNav[key]
      if (!nav) return null
      return { id: key, label: nav.label, icon: nav.icon }
    })
    .filter(Boolean) as Array<{ id: string; label: string; icon: LucideIcon }>

  if (!workOrder) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Työmääräintä ei löytynyt.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="hidden md:flex w-52 flex-col bg-navy-900 shrink-0">
        <div className="px-5 py-5">
          <span className="text-xl font-bold text-white tracking-wide">JOKI</span>
        </div>
        <div className="px-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0"
              style={{ backgroundColor: modeInfo.color }}
            >
              {modeInfo.initials}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-white truncate">{modeInfo.name}</p>
              <p className="text-[11px] text-white/50 truncate">{modeInfo.role}</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-0.5 px-3 mt-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = lastSegment === item.id
            return (
              <Link
                key={item.id}
                to={`/tyomarain/${id}/${item.id}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white no-underline",
                  isActive && "bg-white/10 text-white"
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-bold tracking-wide text-gray-900 shrink-0">VENUE OS</span>
            <nav className="hidden sm:flex items-center text-[13px]">
              <ChevronRight className="h-3.5 w-3.5 text-gray-300 mx-1.5" />
              <span className="text-gray-400">{modeInfo.role}</span>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300 mx-1.5" />
              <span className="text-gray-900 font-medium">{workOrder.number} • {workOrder.customerCompany}</span>
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

        <main className="flex-1 overflow-auto p-6 lg:p-8 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
