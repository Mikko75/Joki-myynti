import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  title: string
  count: number
  accentColor?: string
  children: ReactNode
}

export function KanbanColumn({ title, count, accentColor, children }: KanbanColumnProps) {
  return (
    <div className="flex min-w-65 max-w-70 shrink-0 flex-col">
      <div className={cn('mb-3 flex items-center gap-2.5 border-t-2 pt-2.5', accentColor ?? 'border-gray-200')}>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-200 px-1.5 text-[11px] font-semibold text-gray-600">
          {count}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5">
        {children}
      </div>
    </div>
  )
}
