import {
  LayoutDashboard, DoorOpen, CalendarDays, UtensilsCrossed, PlusCircle,
  FileText,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  iconColor?: string
}

export const sellerNav: NavItem[] = [
  { id: "yleiskuva", label: "Yleiskuva", icon: LayoutDashboard },
  { id: "tilat", label: "Tilat", icon: DoorOpen },
  { id: "aikataulu", label: "Aikataulu", icon: CalendarDays },
  { id: "catering", label: "Catering", icon: UtensilsCrossed },
  { id: "lisapalvelut", label: "Lisäpalvelut & AV", icon: PlusCircle },
  { id: "tarjous", label: "Yhteenveto", icon: FileText },
]
