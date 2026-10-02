import { useState } from "react"
import { CheckCircle2, RotateCcw, MessageSquare, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { cn } from "@/lib/utils"
import type { ProposalSectionStatus } from "@/data/types"

const STATUS_META: Record<ProposalSectionStatus, { label: string; badge: string }> = {
  draft: { label: "Luonnos", badge: "bg-gray-100 text-gray-600" },
  sent: { label: "Odottaa vastausta", badge: "bg-amber-100 text-amber-700" },
  approved: { label: "Hyväksytty", badge: "bg-emerald-100 text-emerald-700" },
  changes_requested: { label: "Muutoksia pyydetty", badge: "bg-red-100 text-red-700" },
  expired: { label: "Vanhentunut", badge: "bg-gray-100 text-gray-500" },
}

const SECTION_LABELS: Record<string, string> = {
  tilat: "Tilat",
  aikataulu: "Aikataulu",
  catering: "Catering",
  av: "AV / tekniikka",
  lisapalvelut: "Lisäpalvelut",
}

export default function ProposalView({ workOrderId }: { workOrderId: string }) {
  const { getWorkOrder, updateWorkOrder, getCateringPlan, getAVPlan } = useWorkOrders()
  const workOrder = getWorkOrder(workOrderId)
  const [commentFor, setCommentFor] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")

  if (!workOrder) {
    return <div className="max-w-3xl mx-auto py-16 text-center"><p className="text-gray-500">Ei ehdotusta.</p></div>
  }

  const wo = workOrder!
  const proposals = (wo.proposalSections ?? []).filter((p) => p.status !== "draft")
  const cateringPlan = getCateringPlan(workOrderId)
  const avPlan = getAVPlan(workOrderId)
  const allSpaces = wo.eventDays.flatMap((d) => d.spaces)
  const allApproved = proposals.length > 0 && proposals.every((p) => p.status === "approved")

  function approve(sectionKey: string) {
    const updated = (wo.proposalSections ?? []).map((p) =>
      p.sectionKey === sectionKey ? { ...p, status: "approved" as const } : p
    )
    updateWorkOrder(workOrderId, { proposalSections: updated })
  }

  function requestChanges(sectionKey: string) {
    const updated = (wo.proposalSections ?? []).map((p) =>
      p.sectionKey === sectionKey ? { ...p, status: "changes_requested" as const, clientComment: commentText || undefined } : p
    )
    updateWorkOrder(workOrderId, { proposalSections: updated })
    setCommentFor(null)
    setCommentText("")
  }

  function getSectionSummary(key: string): string {
    switch (key) {
      case "tilat": return allSpaces.length > 0 ? allSpaces.map((s) => `${s.spaceName} — ${s.price?.toLocaleString("fi-FI")} €`).join(", ") : "Ei valittuja tiloja."
      case "catering": return cateringPlan.moments.length > 0 ? cateringPlan.moments.map((m) => `${m.title} (${m.startTime}–${m.endTime})`).join(", ") : "Ei catering-hetkiä."
      case "av": return [avPlan.microphones, avPlan.audio, avPlan.screens].filter(Boolean).join(" · ") || "Ei AV-valintoja."
      case "lisapalvelut": {
        const addOns = wo.selectedAddOns ?? []
        return addOns.length > 0 ? `${addOns.length} lisäpalvelua valittu` : "Ei lisäpalveluita."
      }
      case "aikataulu": {
        const items = wo.eventDays.flatMap((d) => d.scheduleItems)
        return items.length > 0 ? items.map((i) => `${i.startTime} ${i.title}`).slice(0, 3).join(", ") : "Ei aikataulunimikkeitä."
      }
      default: {
        if (key.startsWith("custom-")) {
          const cs = wo.customSections?.find((s) => `custom-${s.id}` === key)
          if (cs) {
            const parts: string[] = []
            if (cs.description) parts.push(cs.description)
            if (cs.price) parts.push(`${cs.price.toLocaleString("fi-FI")} €`)
            return parts.join(" · ") || cs.title
          }
        }
        return ""
      }
    }
  }

  function getSectionLabel(key: string): string {
    if (SECTION_LABELS[key]) return SECTION_LABELS[key]
    if (key.startsWith("custom-")) {
      const cs = wo.customSections?.find((s) => `custom-${s.id}` === key)
      return cs?.title ?? key
    }
    return key
  }

  if (proposals.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <p className="text-gray-500">Myyjä ei ole vielä lähettänyt ehdotusta.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div>
        <p className="text-[12px] text-gray-400 uppercase tracking-wider font-medium">Ehdotus</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{workOrder.customerCompany}</h1>
        <p className="text-[14px] text-gray-500 mt-1">{workOrder.eventType} · {workOrder.number}</p>
      </div>

      {allApproved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-[15px] font-semibold text-emerald-800">Kaikki osiot hyväksytty</p>
          <p className="text-[12px] text-emerald-600 mt-1">Ehdotus on nyt sitova. Olemme yhteydessä tapahtuman järjestelyistä.</p>
        </div>
      )}

      {proposals.map((p) => {
        const meta = STATUS_META[p.status]
        const label = getSectionLabel(p.sectionKey)

        return (
          <Card key={p.sectionKey}>
            <div className="flex items-center justify-between mb-3">
              <CardTitle className="text-base">{label}</CardTitle>
              <Badge className={cn("text-[10px]", meta.badge)}>{meta.label}</Badge>
            </div>

            <p className="text-[13px] text-gray-600 leading-relaxed mb-4">{getSectionSummary(p.sectionKey)}</p>

            {p.clientComment && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 mb-4">
                <p className="text-[12px] text-red-700"><span className="font-semibold">Sinun kommenttisi:</span> {p.clientComment}</p>
              </div>
            )}

            {p.status === "sent" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => approve(p.sectionKey)}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Hyväksy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setCommentFor(p.sectionKey); setCommentText("") }}
                  className="gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Pyydä muutoksia
                </Button>
              </div>
            )}

            {p.status === "approved" && (
              <div className="flex items-center gap-2 text-[13px] text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Hyväksytty
              </div>
            )}

            {p.status === "changes_requested" && (
              <div className="flex items-center gap-2 text-[13px] text-amber-600">
                <MessageSquare className="h-4 w-4" /> Muutospyyntö lähetetty myyjälle
              </div>
            )}

            {p.status === "expired" && (
              <div className="flex items-center gap-2 text-[13px] text-gray-500">
                <Clock className="h-4 w-4" /> Varaus on päättynyt
              </div>
            )}

            {p.status === "sent" && p.deadline && (
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-2">
                <Clock className="h-3 w-3" />
                Voimassa {new Date(p.deadline).toLocaleDateString("fi-FI")} asti
              </div>
            )}

            {commentFor === p.sectionKey && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Kerro mitä haluat muuttaa..."
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => requestChanges(p.sectionKey)} disabled={!commentText.trim()}>
                    Lähetä
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setCommentFor(null)}>
                    Peruuta
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
