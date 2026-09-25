import { cn } from "@/lib/utils"
import type { SectionStatus } from "@/data/types"

interface StatusBadgeProps {
  status: SectionStatus
}

const config: Record<SectionStatus, { label: string; dotClass: string }> = {
  valmis: { label: "Valmis", dotClass: "bg-status-green" },
  kaynnissa: { label: "Käynnissä", dotClass: "bg-status-orange" },
  ei_aloitettu: { label: "Ei aloitettu", dotClass: "bg-status-grey" },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, dotClass } = config[status]
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
      <span className={cn("h-2 w-2 rounded-full", dotClass)} />
      {label}
    </span>
  )
}
