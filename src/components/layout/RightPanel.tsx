import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { X, Send, ChevronDown, ChevronUp, PanelRightClose, PanelRightOpen, CheckCircle2, Clock, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import type { AVProduction } from "@/data/types"
import { useMode } from "@/context/ModeContext"
import { useTeam } from "@/context/TeamContext"
import { cn } from "@/lib/utils"

const PROPOSAL_META: Record<string, { label: string; badge: string }> = {
  draft: { label: "Luonnos", badge: "bg-gray-100 text-gray-600" },
  sent: { label: "Asiakkaalla", badge: "bg-amber-100 text-amber-700" },
  approved: { label: "Hyväksytty", badge: "bg-emerald-100 text-emerald-700" },
  changes_requested: { label: "Muutoksia pyydetty", badge: "bg-red-100 text-red-700" },
  expired: { label: "Vanhentunut", badge: "bg-gray-100 text-gray-500" },
}

function calcDefaultDeadline(eventDate?: string): string {
  const now = new Date()
  const event = eventDate ? new Date(eventDate) : null
  let days = 14
  if (event) {
    const diff = (event.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    if (diff > 180) days = 30
    else if (diff >= 60) days = 14
    else days = 7
  }
  const d = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  return d.toISOString().split("T")[0]
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
  const { getCateringPlan, updateCateringPlan, getAVPlan, updateWorkOrder } = useWorkOrders()
  const location = useLocation()
  const lastSegment = location.pathname.split("/").pop() ?? ""
  const { mode } = useMode()
  const { members } = useTeam()
  const isSeller = mode === "seller"
  const isCatering = lastSegment === "catering"
  const isCateringSeller = isCatering && isSeller
  const isCateringPartner = isCatering && !isSeller
  const isAV = lastSegment === "av"
  const isAVSeller = isAV && isSeller
  const isAVPartner = isAV && !isSeller
  const isPartnerPage = isCateringPartner || isAVPartner
  const [isOpen, setIsOpen] = useState(true)
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  if (!workOrder) return null

  const wo = workOrder
  const eventDate = wo.eventDays[0]?.date

  // Check for expired proposals
  useEffect(() => {
    const rawProposals = wo.proposalSections ?? []
    const now = new Date()
    const hasExpired = rawProposals.some((p) => p.status === "sent" && p.deadline && now > new Date(p.deadline))
    if (hasExpired) {
      const fixed = rawProposals.map((p) =>
        p.status === "sent" && p.deadline && now > new Date(p.deadline) ? { ...p, status: "expired" as const } : p
      )
      updateWorkOrder(workOrderId, { proposalSections: fixed })
    }
  }, [wo.proposalSections, workOrderId, updateWorkOrder])

  const allProposals = wo.proposalSections ?? []
  const proposals = isCateringSeller
    ? allProposals.filter((p) => p.sectionKey === "catering")
    : isCateringPartner
    ? allProposals.filter((p) => p.sectionKey.startsWith("catering-") && (!p.partnerId || p.partnerId === mode))
    : isAV
    ? allProposals.filter((p) => p.sectionKey === "av" || p.sectionKey.startsWith("av-"))
    : allProposals.filter((p) => p.sectionKey !== "av" && !p.sectionKey.startsWith("av-") && !p.sectionKey.startsWith("catering-"))
  const hasDrafts = proposals.some((p) => p.status === "draft")

  const cateringPlan = isCateringPartner ? getCateringPlan(workOrderId, mode) : getCateringPlan(workOrderId)
  const avPlan = getAVPlan(workOrderId)
  const allSpaces = wo.eventDays.flatMap((d) => d.spaces)
  const allScheduleItems = wo.eventDays.flatMap((d) => d.scheduleItems)

  function removeFromProposal(key: string) {
    updateWorkOrder(workOrderId, { proposalSections: allProposals.filter((p) => p.sectionKey !== key) })
  }

  function sendProposal() {
    const nowStr = new Date().toLocaleString("fi-FI")
    const sentKeys = new Set(proposals.filter((p) => p.status === "draft").map((p) => p.sectionKey))
    const updated = allProposals.map((p) => {
      if (!sentKeys.has(p.sectionKey)) return p
      const deadline = p.deadline ?? (p.sectionKey === "tilat" ? calcDefaultDeadline(eventDate) : undefined)
      return { ...p, status: "sent" as const, sentAt: nowStr, deadline }
    })
    if (isCateringSeller) {
      const cateringItems = wo.eventDays.flatMap((d) => d.scheduleItems).filter((si) => si.type === "catering")
      const moments = cateringItems.map((si) => ({
        id: si.id, title: si.title, startTime: si.startTime, endTime: si.endTime,
        spaceName: si.spaceName, menuId: "", menuName: "", price: 0, status: "luonnos" as const,
      }))
      const sellerNotes = wo.sectionNotes?.["catering-seller"] ?? ""
      const cateringPartners = members.filter((m) => m.role === "Catering")
      for (const partner of cateringPartners) {
        updateCateringPlan(workOrderId, partner.id, {
          status: "kumppanilla", moments,
          participantCount: wo.participantEstimate,
          dietaryNeeds: wo.accessibilityNeeds ?? "",
          notes: `${wo.eventDescription ?? ""}\n\n${sellerNotes}`.trim(),
        })
      }
      updateWorkOrder(workOrderId, { proposalSections: updated })
    } else if (isCateringPartner) {
      updateWorkOrder(workOrderId, { proposalSections: updated })
      updateCateringPlan(workOrderId, mode, { status: "vastattu" })
    } else if (isAVSeller) {
      const avBase: AVProduction = wo.avProduction ?? { status: "ei_aloitettu", needs: [], productionAreas: [], totalPrice: 0, notes: "" }
      updateWorkOrder(workOrderId, { proposalSections: updated, avProduction: { ...avBase, status: "kumppanilla" } })
    } else if (isAVPartner) {
      const avBase: AVProduction = wo.avProduction ?? { status: "ei_aloitettu", needs: [], productionAreas: [], totalPrice: 0, notes: "" }
      const total = avBase.productionAreas.filter((a) => a.status !== "ei_tarvita").reduce((s, a) => s + (a.price ?? 0), 0)
      updateWorkOrder(workOrderId, { proposalSections: updated, avProduction: { ...avBase, status: "vastattu", totalPrice: total } })
    } else {
      updateWorkOrder(workOrderId, { proposalSections: updated, status: "asiakkaalla" })
    }
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
      case "catering": {
        if (isCateringSeller) {
          const cateringItems = allScheduleItems.filter((si) => si.type === "catering")
          const sellerNotes = wo.sectionNotes?.["catering-seller"]
          const lines = cateringItems.map((si) => ({ label: si.title, value: si.startTime }))
          if (sellerNotes) lines.push({ label: "Huomiot", value: "✓" })
          return { lines }
        }
        return {
          lines: cateringPlan.moments.map((m) => ({ label: m.title, value: formatPrice(m.price) })),
          total: cateringPlan.moments.reduce((sum, m) => sum + m.price, 0),
        }
      }
      case "lisapalvelut": {
        const avProd = wo.avProduction
        if (avProd && (avProd.status === "valmis" || avProd.status === "vastattu")) {
          const lines = avProd.productionAreas
            .filter((a) => a.status !== "ei_tarvita")
            .map((a) => ({ label: a.label, value: a.price ? `${a.price.toLocaleString("fi-FI")} €` : "–" }))
          return { lines, total: avProd.totalPrice }
        }
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
        if (key.startsWith("av-")) {
          const areaKey = key.replace("av-", "")
          const area = wo.avProduction?.productionAreas.find((a) => a.key === areaKey)
          if (area) {
            const lines: { label: string; value: string }[] = []
            if (area.description) lines.push({ label: "Suunnitelma", value: area.description.slice(0, 60) })
            return { lines, total: area.price }
          }
        }
        if (key.startsWith("catering-")) {
          const momentId = key.replace("catering-", "")
          const moment = cateringPlan.moments.find((m) => m.id === momentId)
          if (moment) {
            const lines: { label: string; value: string }[] = []
            if (moment.menuName) lines.push({ label: "Menu", value: moment.menuName })
            if (moment.spaceName) lines.push({ label: "Tila", value: moment.spaceName })
            return { lines, total: moment.price > 0 ? moment.price : undefined }
          }
        }
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
        <h3 className="text-[15px] font-semibold text-gray-900">
          {isCateringSeller || isAVSeller ? "Ehdotus kumppanille" : isPartnerPage ? "Ehdotus myyjälle" : "Ehdotus asiakkaalle"}
        </h3>
        <button onClick={() => setIsOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors" title="Sulje">
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      <p className="text-[11px] text-gray-400 mt-1 mb-4">
        {isCateringSeller ? "Lisää tarjoiluhetkiä (+) ja lähetä kumppanille."
          : isAVSeller ? "Lisää AV-osioita (+) ja lähetä kumppanille."
          : isPartnerPage ? "Lisää (+) ja lähetä ehdotus myyjälle."
          : "Lisää osioita kortteista (+) ja lähetä ehdotus."}
      </p>

      {(() => {
        const approvedSections = proposals.filter((p) => p.status === "approved")
        const expiredSections = proposals.filter((p) => p.status === "expired")
        return (
          <>
            {approvedSections.length > 0 && (
              <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 mb-4">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[12px] font-semibold text-emerald-800">
                  Asiakas on hyväksynyt ehdotuksen: {approvedSections.map((p) =>
                    SECTION_LABELS[p.sectionKey]
                    ?? (p.sectionKey.startsWith("catering-") ? cateringPlan.moments.find((m) => m.id === p.sectionKey.replace("catering-", ""))?.title ?? "Catering" : null)
                    ?? wo.customSections?.find((s) => `custom-${s.id}` === p.sectionKey)?.title
                    ?? p.sectionKey
                  ).join(", ")}
                </p>
              </div>
            )}
            {expiredSections.length > 0 && (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 mb-4">
                <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[12px] font-semibold text-amber-800">
                  Tilan optio on vanhentunut. Voit tehdä uuden ehdotuksen.
                </p>
              </div>
            )}
          </>
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
                      {SECTION_LABELS[p.sectionKey]
                        ?? (p.sectionKey.startsWith("av-") ? wo.avProduction?.productionAreas.find((a) => a.key === p.sectionKey.replace("av-", ""))?.label ?? "AV"
                        : p.sectionKey.startsWith("catering-") ? cateringPlan.moments.find((m) => m.id === p.sectionKey.replace("catering-", ""))?.title ?? "Catering"
                        : wo.customSections?.find((s) => `custom-${s.id}` === p.sectionKey)?.title ?? p.sectionKey)}
                    </span>
                    <Badge className={cn("text-[9px] px-1.5 py-0", meta.badge)}>
                      {(isCatering || isAV) && p.status === "sent" ? "Lähetetty" : meta.label}
                    </Badge>
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

                {/* Deadline — draft-tilassa muokattava */}
                {p.status === "draft" && p.sectionKey === "tilat" && (
                  <div className="px-3 pb-2 border-t border-gray-100 pt-2">
                    <label className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Option voimassaolo
                    </label>
                    <input
                      type="date"
                      value={p.deadline ?? calcDefaultDeadline(eventDate)}
                      onChange={(e) => {
                        const updated = proposals.map((pr) =>
                          pr.sectionKey === p.sectionKey ? { ...pr, deadline: e.target.value } : pr
                        )
                        updateWorkOrder(workOrderId, { proposalSections: updated })
                      }}
                      className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-700"
                    />
                  </div>
                )}

                {/* Deadline — sent-tilassa näytetään */}
                {p.status === "sent" && p.deadline && (
                  <div className="px-3 pb-2 flex items-center gap-1.5 text-[10px] text-amber-600">
                    <Clock className="h-3 w-3" />
                    Voimassa {new Date(p.deadline).toLocaleDateString("fi-FI")} asti
                  </div>
                )}

                {/* Expired — nappi uuteen ehdotukseen */}
                {p.status === "expired" && (
                  <div className="px-3 pb-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const updated = proposals.map((pr) =>
                          pr.sectionKey === p.sectionKey ? { ...pr, status: "draft" as const, deadline: undefined, sentAt: null, clientComment: undefined } : pr
                        )
                        updateWorkOrder(workOrderId, { proposalSections: updated })
                      }}
                      className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800"
                    >
                      <RotateCcw className="h-3 w-3" /> Tee uusi ehdotus
                    </button>
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
          {hasDrafts
            ? (isCateringSeller || isAVSeller ? "Lähetä kumppanille" : isPartnerPage ? "Lähetä myyjälle" : "Lähetä ehdotus")
            : (isCatering || isAV ? "Lähetetty" : "Ehdotus lähetetty")}
        </Button>
      )}

      <div className="mt-auto pt-5">
        <p className="text-[10px] text-gray-400 text-center">Varsinainen tarjous lähetetään Yhteenveto-sivulta.</p>
      </div>
    </aside>
  )
}
