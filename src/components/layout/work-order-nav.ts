import {
  LayoutDashboard, DoorOpen, CalendarDays, UtensilsCrossed, PlusCircle,
  Video, MessageSquare, Plus, FileText,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
}

// Shared with UnifiedLayout.tsx's vertical sidebar and WorkOrderHeader's horizontal tab row
// so both navigations stay in sync for seller mode.
export const sellerNav: NavItem[] = [
  { id: "yleiskuva", label: "Yleiskuva", icon: LayoutDashboard },
  { id: "tilat", label: "Tilat & optio", icon: DoorOpen },
  { id: "aikataulu", label: "Aikataulu", icon: CalendarDays },
  { id: "catering", label: "Catering", icon: UtensilsCrossed },
  { id: "lisapalvelut", label: "Lisäpalvelut", icon: PlusCircle },
  { id: "av", label: "AV / tekniikka", icon: Video },
  { id: "keskustelut", label: "Kaikki keskustelut", icon: MessageSquare },
  { id: "lisaa-uusi", label: "Lisää uusi", icon: Plus },
  { id: "tarjous", label: "Yhteenveto", icon: FileText },
]
