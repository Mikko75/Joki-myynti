import { Link, useLocation } from "react-router-dom"
import { LayoutGrid, Users, CalendarDays, Settings, FileEdit } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { id: "tyomaarain", label: "Työpöytä", icon: LayoutGrid, to: "/" },
  { id: "asiakkaat", label: "Asiakkaat", icon: Users, to: "/asiakkaat" },
  { id: "kalenteri", label: "Kalenteri", icon: CalendarDays, to: "/kalenteri" },
  { id: "lomake", label: "Tarjouspyyntölomake", icon: FileEdit, to: "/lomake" },
  { id: "asetukset", label: "Asetukset", icon: Settings, to: "/" },
]

export function MainSidebar() {
  const location = useLocation()
  const match = navItems.find((item) => item.to !== "/" && location.pathname.startsWith(item.to))
  const activeItem = match ? match.id : "tyomaarain"

  return (
    <aside className="hidden md:flex flex-col items-center bg-gray-900 shrink-0 overflow-hidden py-4 w-16">
      {/* Logo */}
      <Link to="/" className="mb-6 flex items-center justify-center">
        <img src="/logo.png" alt="JOKI" className="h-10 w-auto" />
      </Link>

      {/* Nav icons */}
      <nav className="flex flex-col gap-2 items-center flex-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          return (
            <Link
              key={item.id}
              to={item.to}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors",
                isActive && "text-white"
              )}
              title={item.label}
            >
              <Icon className="h-5 w-5" />
            </Link>
          )
        })}
      </nav>

      {/* User avatar */}
      <div className="mt-auto">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-[12px] font-semibold text-white">ML</div>
      </div>
    </aside>
  )
}
