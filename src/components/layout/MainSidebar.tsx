import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { LayoutGrid, Users, CalendarDays, Settings, ChevronsLeft, ChevronsRight } from "lucide-react"
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

const navItems = [
  { id: "tyomaarain", label: "Työmääräin", icon: LayoutGrid, to: "/" },
  { id: "asiakkaat", label: "Asiakkaat", icon: Users, to: "/asiakkaat" },
  { id: "kalenteri", label: "Kalenteri", icon: CalendarDays, to: "/kalenteri" },
  { id: "asetukset", label: "Asetukset", icon: Settings, to: "/" },
]

export function MainSidebar() {
  const location = useLocation()
  const match = navItems.find((item) => item.to !== "/" && location.pathname.startsWith(item.to))
  const activeItem = match ? match.id : "tyomaarain"

  const [expanded, setExpanded] = useState(() => {
    const stored = localStorage.getItem("joki-sidebar-expanded")
    return stored !== null ? stored === "true" : true
  })

  function toggleSidebar() {
    const next = !expanded
    setExpanded(next)
    localStorage.setItem("joki-sidebar-expanded", String(next))
  }

  if (!expanded) {
    return (
      <aside className={cn("hidden md:flex flex-col items-center bg-white shrink-0 overflow-hidden py-4", SIDEBAR_SHADOW_CLASS)}>
        <Link to="/" className={LOGO_ICON_CLASS}>
          J
        </Link>
        <button
          onClick={toggleSidebar}
          className={cn(TOGGLE_BUTTON_CLASS, "mb-4")}
          title="Laajenna sivupalkki"
        >
          <ChevronsRight className="h-5 w-5" />
        </button>
        <nav className="flex flex-col gap-6 items-center flex-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            return (
              <Link
                key={item.id}
                to={item.to}
                className={cn(COLLAPSED_NAV_ITEM_CLASS, isActive && COLLAPSED_NAV_ITEM_ACTIVE_CLASS)}
                title={item.label}
              >
                <Icon className="h-6 w-6" />
              </Link>
            )
          })}
        </nav>
        <div className="px-3 mt-auto">
          <div className={USER_AVATAR_CLASS}>
            ML
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className={cn("hidden md:flex flex-col bg-white shrink-0 overflow-hidden", SIDEBAR_SHADOW_CLASS, SIDEBAR_WIDTH_CLASS)}>
      <div className="flex flex-col gap-6 p-4 flex-1 overflow-hidden">
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

        <div className="flex flex-col gap-5 flex-1 overflow-y-auto">
          <p className={SECTION_LABEL_CLASS}>
            NAVIGAATIO
          </p>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.id
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3",
                    NAV_ITEM_TEXT_CLASS,
                    isActive && NAV_ITEM_ACTIVE_CLASS
                  )}
                >
                  <Icon className={NAV_ICON_CLASS} />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

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
  )
}
