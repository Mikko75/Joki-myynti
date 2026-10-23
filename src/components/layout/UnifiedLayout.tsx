import { useState } from "react"
import { Outlet, useParams, useLocation, Link } from "react-router-dom"
import {
  LayoutDashboard, DoorOpen, CalendarDays, UtensilsCrossed, PlusCircle,
  Video, MessageSquare, FileText, FileCheck, ChevronsLeft, ChevronsRight, ChevronLeft, Edit3, Menu, X,
  // X ja FileText käytetään myös mobile bottom sheetissä
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
  WORK_ORDER_SIDEBAR_BG,
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

const AVATAR_COLORS = ["#7c3aed", "#111827", "#22c55e"]

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [mobileProposalOpen, setMobileProposalOpen] = useState(false)

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
    navItems = [
      { id: "oma-pyynto", label: "Oma pyyntöni", icon: Edit3 },
      { id: "ehdotus", label: "Ehdotukset", icon: FileText },
      { id: "lopullinen-tarjous", label: "Lopullinen tarjous", icon: FileCheck },
    ]
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
        <aside className={cn("hidden md:flex flex-col shrink-0 overflow-hidden", WORK_ORDER_SIDEBAR_BG, SIDEBAR_SHADOW_CLASS, SIDEBAR_WIDTH_CLASS)}>
          <div className="flex flex-col gap-6 p-4 flex-1 overflow-hidden">
            {/* Collapse toggle */}
            <div className="flex items-center justify-end">
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
              <div className="pb-4 border-b border-gray-700">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0" style={{ backgroundColor: modeInfo.color }}>
                    {modeInfo.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{modeInfo.name}</p>
                    <p className="text-xs text-gray-500 truncate">{modeInfo.role}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav Section */}
            <div className="flex flex-col gap-5 flex-1 overflow-y-auto">
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

        </aside>
      ) : (
        <aside className={cn("hidden md:flex flex-col items-center shrink-0 overflow-hidden py-4", WORK_ORDER_SIDEBAR_BG, SIDEBAR_SHADOW_CLASS)}>
          {/* Expand toggle */}
          <button
            onClick={toggleSidebar}
            className={cn(TOGGLE_BUTTON_CLASS, "mb-4")}
            title="Laajenna sivupalkki"
          >
            <ChevronsRight className="h-5 w-5" />
          </button>

        </aside>
      )}

      {/* Mobile drawer overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileNavOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside
            className="absolute left-0 top-0 bottom-0 flex flex-col overflow-hidden"
            style={{ width: 280, backgroundColor: "var(--color-sidebar-workorder)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-[13px] font-semibold text-gray-300">Navigaatio</span>
              <button onClick={() => setMobileNavOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-3 flex-1 overflow-y-auto">
              {navItems
                .filter(item => !["yleiskuva", "tilat", "catering", "tarjous"].includes(item.id))
                .map((item) => {
                  const Icon = item.icon
                  const isActive = lastSegment === item.id
                  return (
                    <Link
                      key={item.id}
                      to={`/tyomarain/${id}/${item.id}`}
                      onClick={() => setMobileNavOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 text-[14px] font-medium transition-colors no-underline",
                        isActive
                          ? "text-white bg-gray-700"
                          : "text-gray-300 hover:text-white hover:bg-gray-700"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar
          breadcrumbs={[
            { label: `${workOrder.number} • ${workOrder.customerCompany}`, to: `/tyomarain/${id}/yleiskuva` },
            { label: sectionLabel },
          ]}
          onMenuOpen={() => setMobileNavOpen(true)}
        />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-auto bg-[rgba(249,250,251,0.8)]" style={{ padding: "var(--spacing-content)" }}>
            <Outlet />
          </main>
          {(isSeller && (lastSegment === "yleiskuva" || lastSegment === "catering" || lastSegment === "av")) && <RightPanel />}
          {isPartner && (lastSegment === "catering" || lastSegment === "av") && <RightPanel />}
        </div>

        {/* Mobiili: Ehdotus floating nappi */}
        {isSeller && (lastSegment === "yleiskuva" || lastSegment === "catering" || lastSegment === "av") && (() => {
          const proposalCount = (workOrder.proposalSections ?? []).filter(p => p.status === "draft" || p.status === "sent").length
          return (
            <button
              onClick={() => setMobileProposalOpen(true)}
              className="lg:hidden fixed bottom-20 right-4 z-30 flex items-center gap-2 rounded-full bg-gray-900 text-white px-4 py-2.5 text-[13px] font-semibold shadow-lg"
            >
              <FileText className="h-4 w-4" />
              Ehdotus
              {proposalCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-brand-green)] text-black text-[11px] font-bold px-1">
                  {proposalCount}
                </span>
              )}
            </button>
          )
        })()}

        {/* Mobiili: RightPanel bottom sheet */}
        {mobileProposalOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileProposalOpen(false)} />
            <div className="relative bg-white overflow-hidden flex flex-col max-h-[85vh]" style={{ borderRadius: "20px 20px 0 0" }}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                <span className="text-[15px] font-semibold text-gray-900">Ehdotus</span>
                <button onClick={() => setMobileProposalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <RightPanel mobile />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
