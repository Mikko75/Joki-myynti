import { useState } from "react"
import { X, Send, ChevronDown, ChevronUp, PanelRightClose, PanelRightOpen, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { cn } from "@/lib/utils"

const PROPOSAL_META: Record<string, { label: string; badge: string }> = {
  draft: { label: "Luonnos", badge: "bg-gray-100 text-gray-600" },
  sent: { label: "Asiakkaalla", badge: "bg-amber-100 text-amber-700" },
  approved: { label: "Hyväksytty", badge: "bg-emerald-100 text-emerald-700" },
  changes_requested: { label: "Muutoksia pyydetty", badge: "bg-red-100 text-red-700" },
}

const SECTION_LABELS: Record<string, string> = {
  tilat: "Tilat",
  aikataulu: "Aikataulu",
  catering: "Catering",
  lisapalvelut: "Lisäpalvelut & AV",
}

function formatPrice(v: number) {
  return v.toLocaleString("fi-FI") + " €"
}

export function RightPanel() {
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const { getCateringPlan, getAVPlan, updateWorkOrder } = useWorkOrders()
  const [isOpen, setIsOpen] = useState(true)
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  if (!workOrder) return null

  const wo = workOrder
  const proposals = wo.proposalSections ?? []
  const hasDrafts = proposals.some((p) => p.status === "draft")

  const cateringPlan = getCateringPlan(workOrderId)
  const avPlan = getAVPlan(workOrderId)
  const allSpaces = wo.eventDays.flatMap((d) => d.spaces)
  const allScheduleItems = wo.eventDays.flatMap((d) => d.scheduleItems)

  function removeFromProposal(key: string) {
    updateWorkOrder(workOrderId, { proposalSections: proposals.filter((p) => p.sectionKey !== key) })
  }

  function sendProposal() {
    const now = new Date().toLocaleString("fi-FI")
    const updated = proposals.map((p) => p.status === "draft" ? { ...p, status: "sent" as const, sentAt: now } : p)
    updateWorkOrder(workOrderId, { proposalSections: updated, status: "asiakkaalla" })
  }

  function toggleCard(key: string) {
    setExpandedCards((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function getSectionContent(key: string): { lines: { label: string; value: string }[]; total?: number } {
    switch (key) {
      case "tilat":
        return {
          lines: allSpaces.map((s) => ({ label: s.spaceName, value: formatPrice(s.price) })),
          total: allSpaces.reduce((sum, s) => sum + (s.price ?? 0), 0),
        }
      case "aikataulu":
        return {
          lines: allScheduleItems.slice(0, 5).map((i) => ({ label: i.title, value: `${i.startTime}–${i.endTime}` })),
        }
      case "catering":
        return {
          lines: cateringPlan.moments.map((m) => ({ label: m.title, value: formatPrice(m.price) })),
          total: cateringPlan.moments.reduce((sum, m) => sum + m.price, 0),
        }
      case "lisapalvelut": {
        const avLines: { label: string; value: string }[] = []
        if (avPlan.microphones) avLines.push({ label: "Mikrofonit", value: avPlan.microphones })
        if (avPlan.audio) avLines.push({ label: "Äänentoisto", value: avPlan.audio })
        if (avPlan.screens) avLines.push({ label: "Näytöt", value: avPlan.screens })
        return {
          lines: avLines,
          total: avPlan.price ?? 0,
        }
      }
      default: {
        if (key.startsWith("custom-")) {
          const cs = wo.customSections?.find((s) => `custom-${s.id}` === key)
          if (cs) {
            const lines: { label: string; value: string }[] = []
            if (cs.description) lines.push({ label: "Kuvaus", value: cs.description.slice(0, 60) })
            return { lines, total: cs.price }
          }
        }
        return { lines: [] }
      }
    }
  }

  if (!isOpen) {
    return (
      <div className="hidden lg:flex shrink-0 border-l border-gray-200" style={{ backgroundColor: "#F8FAFC" }}>
        <button onClick={() => setIsOpen(true)} className="p-3 text-gray-400 hover:text-gray-600 transition-colors" title="Avaa">
          <PanelRightOpen className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <aside className="hidden lg:flex w-80 shrink-0 flex-col overflow-y-auto border-l border-gray-200 p-5" style={{ backgroundColor: "#F8FAFC" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-gray-900">Ehdotus asiakkaalle</h3>
        <button onClick={() => setIsOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors" title="Sulje">
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      <p className="text-[11px] text-gray-400 mt-1 mb-4">Lisää osioita kortteista (+) ja lähetä ehdotus.</p>

      {(() => {
        const approvedSections = proposals.filter((p) => p.status === "approved")
        if (approvedSections.length === 0) return null
        const names = approvedSections.map((p) =>
          SECTION_LABELS[p.sectionKey] ?? wo.customSections?.find((s) => `custom-${s.id}` === p.sectionKey)?.title ?? p.sectionKey
        ).join(", ")
        return (
          <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 mb-4">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-[12px] font-semibold text-emerald-800">
              Asiakas on hyväksynyt ehdotuksen: {names}
            </p>
          </div>
        )
      })()}

      {proposals.length > 0 ? (
        <div className="space-y-2 mb-4 flex-1">
          {proposals.map((p) => {
            const meta = PROPOSAL_META[p.status] ?? PROPOSAL_META.draft
            const isExpanded = expandedCards[p.sectionKey] ?? false
            const content = getSectionContent(p.sectionKey)
            const hasContent = content.lines.length > 0

            return (
              <div key={p.sectionKey} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                {/* Header — klikkaa auki/kiinni */}
                <button
                  type="button"
                  onClick={() => hasContent && toggleCard(p.sectionKey)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {hasContent && (
                      isExpanded
                        ? <ChevronUp className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        : <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    )}
                    <span className="text-[12px] font-medium text-gray-900">
                      {SECTION_LABELS[p.sectionKey] ?? wo.customSections?.find((s) => `custom-${s.id}` === p.sectionKey)?.title ?? p.sectionKey}
                    </span>
                    <Badge className={cn("text-[9px] px-1.5 py-0", meta.badge)}>{meta.label}</Badge>
                  </div>
                  {p.status === "draft" && (
                    <span
                      onClick={(e) => { e.stopPropagation(); removeFromProposal(p.sectionKey) }}
                      className="text-gray-300 hover:text-gray-500 shrink-0 ml-1 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>

                {/* Sisältö — auki */}
                {isExpanded && hasContent && (
                  <div className="px-3 pb-3 border-t border-gray-100">
                    <div className="mt-2 space-y-1">
                      {content.lines.map((line, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-600 truncate">{line.label}</span>
                          <span className="text-gray-900 font-medium shrink-0 ml-2">{line.value}</span>
                        </div>
                      ))}
                    </div>
                    {content.total != null && content.total > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-gray-50 flex items-center justify-between text-[11px]">
                        <span className="font-medium text-gray-700">Välisumma</span>
                        <span className="font-bold text-gray-900">{formatPrice(content.total)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Asiakkaan kommentti */}
                {p.clientComment && (
                  <div className="px-3 pb-2">
                    <p className="text-[10px] text-red-600 truncate">Asiakas: "{p.clientComment}"</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[12px] text-gray-400 text-center">Lisää osioita ehdotukseen<br />painamalla + korteista</p>
        </div>
      )}

      {proposals.length > 0 && (
        <Button
          className="w-full gap-2 bg-gray-900 hover:bg-gray-800"
          size="sm"
          disabled={!hasDrafts}
          onClick={sendProposal}
        >
          <Send className="h-3.5 w-3.5" />
          {hasDrafts ? "Lähetä ehdotus" : "Ehdotus lähetetty"}
        </Button>
      )}

      <div className="mt-auto pt-5">
        <p className="text-[10px] text-gray-400 text-center">Varsinainen tarjous lähetetään Yhteenveto-sivulta.</p>
      </div>
    </aside>
  )
}
