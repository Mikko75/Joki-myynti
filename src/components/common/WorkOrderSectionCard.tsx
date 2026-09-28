import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusRowItem {
  label: string
  value: string
  dotClassName: string
}

interface CardMember {
  id: string
  name: string
  initials: string
  color: string
}

interface WorkOrderSectionCardProps {
  to?: string
  onClick?: () => void
  title: string
  subtitle?: string
  badgeLabel: string
  badgeClassName: string
  badgeIcon?: ReactNode
  progress: number
  hideProgress?: boolean
  description: string
  members?: CardMember[]
  dateLabel?: string
  statusRow?: StatusRowItem[]
  note?: string
}

export function WorkOrderSectionCard({
  to,
  onClick,
  title,
  subtitle,
  badgeLabel,
  badgeClassName,
  badgeIcon,
  progress,
  hideProgress,
  description,
  members = [],
  dateLabel,
  statusRow,
  note,
}: WorkOrderSectionCardProps) {
  const isClickable = Boolean(to || onClick)
  const Wrapper = to ? Link : "div"
  const wrapperProps = to ? { to } : {}

  return (
    <Wrapper
      {...(wrapperProps as any)}
      onClick={!to ? onClick : undefined}
      className={cn(
        "flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition-all",
        isClickable ? "no-underline hover:shadow-md hover:border-gray-300 cursor-pointer" : ""
      )}
    >
      <div className="flex items-start">
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold", badgeClassName)}>
          {badgeIcon}
          {badgeLabel}
        </span>
      </div>

      <h3 className="mt-3 text-lg font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}

      {!hideProgress && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-gray-500">Progress</span>
            <span className="font-bold text-gray-900">{progress}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <p className="mt-4 text-[13px] text-gray-600 leading-relaxed line-clamp-3">
        {description}
      </p>

      {statusRow && statusRow.length > 0 && (
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          {statusRow.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 text-[12px]">
              <span className={cn("h-2 w-2 rounded-full shrink-0", s.dotClassName)} />
              <span className="font-medium text-gray-700">{s.label}</span>
              <span className="text-gray-400">{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {note && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Muistio</p>
          <p className="mt-1 text-[12px] text-gray-600 leading-relaxed line-clamp-2">{note}</p>
        </div>
      )}

      <div className="mt-auto pt-4 flex items-center justify-between">
        <div className="flex items-center">
          {members.slice(0, 3).map((m, i) => (
            <div
              key={m.id}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white border-2 border-white"
              style={{ backgroundColor: m.color, marginLeft: i > 0 ? "-8px" : "0" }}
              title={m.name}
            >
              {m.initials}
            </div>
          ))}
        </div>
        {dateLabel && (
          <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            {dateLabel}
          </div>
        )}
      </div>
    </Wrapper>
  )
}
