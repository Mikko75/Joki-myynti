import { Link, useParams } from "react-router-dom"
import {
  LayoutDashboard,
  MapPin,
  Clock,
  Package,
  UtensilsCrossed,
  ShoppingBag,
  Monitor,
  UserCircle,
  MessageSquare,
  Plus,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTeam } from "@/context/TeamContext"

interface WorkOrderSidebarProps {
  activeItem: string
}

const navItems = [
  { id: "yleiskuva", label: "Yleiskuva", icon: LayoutDashboard },
  { id: "tilat", label: "Tilat & optio", icon: MapPin },
  { id: "aikataulu", label: "Aikataulu", icon: Clock },
  { id: "lisapalvelut", label: "Lisäpalvelut", icon: Package },
  { id: "catering", label: "Catering", icon: UtensilsCrossed },
  { id: "tuotteet", label: "Tuotteet", icon: ShoppingBag },
  { id: "av", label: "AV / tekniikka", icon: Monitor },
  { id: "asiakas-chat", label: "Asiakas", icon: UserCircle },
  { id: "keskustelut", label: "Kaikki keskustelut", icon: MessageSquare },
  { id: "lisaa-uusi", label: "Lisää uusi", icon: Plus },
  { id: "tarjous", label: "Tarjous / Yhteenveto", icon: FileText },
]

export function WorkOrderSidebar({ activeItem }: WorkOrderSidebarProps) {
  const { id } = useParams<{ id: string }>()
  const { getMembersForSection } = useTeam()
  const basePath = `/tyomarain/${id}`

  return (
    <aside className="hidden md:flex w-52 flex-col bg-navy-900 shrink-0">
      <div className="px-5 py-5">
        <Link to="/" className="text-xl font-bold text-white tracking-wide no-underline hover:text-white/90">
          JOKI
        </Link>
      </div>
      <nav className="flex flex-col gap-0.5 px-3 mt-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          const sectionMembers = getMembersForSection(item.id)
          const to = `${basePath}/${item.id}`
          return (
            <Link
              key={item.id}
              to={to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white no-underline",
                isActive && "bg-white/10 text-white"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="flex-1 text-left truncate">{item.label}</span>
              {sectionMembers.length > 0 && (
                <span className="flex items-center -space-x-1">
                  {sectionMembers.slice(0, 3).map((member) => (
                    <span
                      key={member.id}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white border border-navy-900"
                      style={{ backgroundColor: member.color }}
                      title={member.name}
                    >
                      {member.initials.charAt(0)}
                    </span>
                  ))}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
