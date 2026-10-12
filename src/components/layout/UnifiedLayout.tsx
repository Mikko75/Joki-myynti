import { useState } from "react"
import { Outlet, useParams, useLocation, Link } from "react-router-dom"
import {
  LayoutDashboard, DoorOpen, CalendarDays, UtensilsCrossed, PlusCircle,
  Video, MessageSquare, FileText, ChevronsLeft, ChevronsRight,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { TopBar } from "./TopBar"
import { RightPanel } from "./RightPanel"
import { useTeam } from "@/context/TeamContext"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { useMode } from "@/context/ModeContext"
import { cn } from "@/lib/utils"
import {
  SIDEBAR_SHADOW_CLASS,
  SIDEBAR_WIDTH_CLASS,
  NAV_ITEM_TEXT_CLASS,
  NAV_ITEM_ACTIVE_CLASS,
  NAV_ICON_CLASS,
  COLLAPSED_NAV_ITEM_CLASS,
  COLLAPSED_NAV_ITEM_ACTIVE_CLASS,
  TOGGLE_BUTTON_CLASS,
  SECTION_LABEL_CLASS,
  LOGO_LINK_CLASS,
  LOGO_ICON_CLASS,
  USER_FOOTER_CLASS,
  USER_AVATAR_CLASS,
  USER_NAME_CLASS,
  USER_ROLE_CLASS,
} from "./sidebar-styles"
import { sellerNav, type NavItem } from "./work-order-nav"

const sectionIcons: Record<string, LucideIcon> = {
  yleiskuva: LayoutDashboard,
  catering: UtensilsCrossed,
  av: Video,
  aikataulu: CalendarDays,
  tuotteet: FileText,
  keskustelu: MessageSquare,
  tilat: DoorOpen,
  lisapalvelut: PlusCircle,
}

const AVATAR_COLORS = ["#26ad61", "#f59e0a", "#384ff7"]

export function UnifiedLayout() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const { members, getMemberSectionKeys } = useTeam()
  const { workOrders } = useWorkOrders()
  const { mode, modeInfo } = useMode()
  const workOrder = workOrders.find((wo) => wo.id === id)
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    const stored = localStorage.getItem("joki-sidebar-expanded")
    return stored !== null ? stored === "true" : true
  })

  if (!workOrder) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Työmääräintä ei löytynyt.</p>
      </div>
    )
  }

  const lastSegment = location.pathname.split("/").pop() ?? "yleiskuva"
  const isSeller = mode === "seller"
  const isClient = mode === "client"
  const isPartner = !isSeller && !isClient

  let navItems: NavItem[] = []

  if (isSeller) {
    navItems = sellerNav
  } else if (isClient) {
    navItems = [{ id: "asiakas", label: "Tarjous", icon: FileText }]
  } else if (isPartner) {
    const member = members.find((m) => m.id === mode)
    const sectionKeys = member ? getMemberSectionKeys(member.id) : []
    if (sectionKeys.includes("catering") && !sectionKeys.includes("tuotteet")) {
      sectionKeys.push("tuotteet")
    }
    navItems = [
      ...sectionKeys
        .map((key) => {
          const icon = sectionIcons[key]
          if (!icon) return null
          const labels: Record<string, string> = {
            catering: "Catering", av: "AV / tekniikka", tilat: "Tilat",
            aikataulu: "Aikataulu", tuotteet: "Tuotteet", lisapalvelut: "Lisäpalvelut",
          }
          return { id: key, label: labels[key] ?? key, icon }
        })
        .filter(Boolean) as NavItem[],
      { id: "aikataulu", label: "Aikataulu", icon: CalendarDays },
      { id: "keskustelu", label: "Keskustelu", icon: MessageSquare },
    ]
    const seen = new Set<string>()
    navItems = navItems.filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
  }

  const getMembersForSection = (sectionKey: string) =>
    members.filter((m) => m.sections.some((s) => {
      const keyMap: Record<string, string> = { "Catering": "catering", "AV / tekniikka": "av", "Aikataulut": "aikataulu" }
      return keyMap[s] === sectionKey
    }))

  function toggleSidebar() {
    const next = !sidebarExpanded
    setSidebarExpanded(next)
    localStorage.setItem("joki-sidebar-expanded", String(next))
  }

  const sectionLabel = (() => {
    const labels: Record<string, string> = {
      yleiskuva: "Yleiskuva", tilat: "Tilat", aikataulu: "Aikataulu",
      catering: "Catering", lisapalvelut: "Lisäpalvelut", av: "AV / tekniikka",
      keskustelut: "Kaikki keskustelut", tarjous: "Yhteenveto", asiakas: "Asiakasportaali",
      "asiakas-chat": "Asiakas", kutsu: "Kutsu", perustiedot: "Perustiedot", ehdotus: "Ehdotus",
    }
    if (labels[lastSegment]) return labels[lastSegment]
    const cs = workOrder?.customSections?.find((s) => s.id === lastSegment)
    if (cs) return cs.title
    return lastSegment
  })()

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      {sidebarExpanded ? (
        <aside className={cn("flex flex-col bg-white shrink-0 overflow-hidden", SIDEBAR_SHADOW_CLASS, SIDEBAR_WIDTH_CLASS)}>
          <div className="flex flex-col gap-6 p-4 flex-1 overflow-hidden">
            {/* Logo + collapse toggle */}
            <div className="flex items-center justify-between">
              <Link to="/" className={LOGO_LINK_CLASS}>
                JOKI
              </Link>
              <button
                onClick={toggleSidebar}
                className={TOGGLE_BUTTON_CLASS}
                title="Pienennä sivupalkki"
              >
                <ChevronsLeft className="h-5 w-5" />
              </button>
            </div>

            {/* Partner identity */}
            {isPartner && (
              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0" style={{ backgroundColor: modeInfo.color }}>
                    {modeInfo.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{modeInfo.name}</p>
                    <p className="text-xs text-gray-500 truncate">{modeInfo.role}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav Section */}
            <div className="flex flex-col gap-5 flex-1 overflow-y-auto">
              <p className={SECTION_LABEL_CLASS}>
                NAVIGAATIO
              </p>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = lastSegment === item.id
                  const sectionMembers = isSeller ? getMembersForSection(item.id) : []

                  return (
                    <Link
                      key={item.id}
                      to={`/tyomarain/${id}/${item.id}`}
                      className={cn(
                        "flex items-center justify-between group",
                        NAV_ITEM_TEXT_CLASS,
                        isActive && NAV_ITEM_ACTIVE_CLASS
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={cn(NAV_ICON_CLASS, item.iconColor)} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {sectionMembers.length > 0 && (
                          <span className="flex items-center">
                            {sectionMembers.slice(0, 3).map((m, i) => (
                              <span
                                key={m.id}
                                className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-semibold text-white border-[1.5px] border-white"
                                style={{
                                  backgroundColor: m.color || AVATAR_COLORS[i % AVATAR_COLORS.length],
                                  marginRight: i < Math.min(sectionMembers.length, 3) - 1 ? "-6px" : "0",
                                }}
                                title={m.name}
                              >
                                {m.initials.charAt(0)}
                              </span>
                            ))}
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* User info at bottom */}
          <div className={USER_FOOTER_CLASS}>
            <div className="flex items-center gap-3">
              <div className={USER_AVATAR_CLASS}>
                ML
              </div>
              <div className="min-w-0">
                <p className={USER_NAME_CLASS}>Mikko Lesonen</p>
                <p className={USER_ROLE_CLASS}>Ylläpitäjä</p>
              </div>
            </div>
          </div>
        </aside>
      ) : (
        <aside className={cn("flex flex-col items-center bg-white shrink-0 overflow-hidden py-4", SIDEBAR_SHADOW_CLASS)}>
          {/* Collapsed: logo icon */}
          <Link to="/" className={LOGO_ICON_CLASS}>
            J
          </Link>

          {/* Expand toggle */}
          <button
            onClick={toggleSidebar}
            className={cn(TOGGLE_BUTTON_CLASS, "mb-4")}
            title="Laajenna sivupalkki"
          >
            <ChevronsRight className="h-5 w-5" />
          </button>

          {/* Nav icons */}
          <nav className="flex flex-col gap-6 items-center flex-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = lastSegment === item.id
              return (
                <Link
                  key={item.id}
                  to={`/tyomarain/${id}/${item.id}`}
                  className={cn(COLLAPSED_NAV_ITEM_CLASS, isActive && COLLAPSED_NAV_ITEM_ACTIVE_CLASS)}
                  title={item.label}
                >
                  <Icon className={cn("h-6 w-6", item.iconColor)} />
                </Link>
              )
            })}
          </nav>

          {/* User avatar at bottom */}
          <div className="px-3 mt-auto">
            <div className={USER_AVATAR_CLASS}>
              ML
            </div>
          </div>
        </aside>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar
          breadcrumbs={[
            { label: isPartner ? modeInfo.role : isClient ? "Asiakasportaali" : "Työmääräin", to: "/" },
            { label: `${workOrder.number} • ${workOrder.customerCompany}`, to: `/tyomarain/${id}/yleiskuva` },
            { label: sectionLabel },
          ]}
        />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-auto p-6 lg:p-8 bg-[rgba(249,250,251,0.8)]">
            <Outlet />
          </main>
          {(isSeller && (lastSegment === "yleiskuva" || lastSegment === "catering" || lastSegment === "av")) && <RightPanel />}
          {isPartner && (lastSegment === "catering" || lastSegment === "av") && <RightPanel />}
        </div>
      </div>
    </div>
  )
}
