import type { ReactNode } from "react"
import { Info, X } from "lucide-react"

interface InfoBannerProps {
  children: ReactNode
  onDismiss?: () => void
}

export function InfoBanner({ children, onDismiss }: InfoBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-md border-l-4 border-blue-500 bg-blue-50 p-4">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
      <div className="flex-1 text-sm text-blue-800">{children}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 text-blue-400 hover:text-blue-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
