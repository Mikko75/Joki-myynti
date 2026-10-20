import { useState } from "react"
import { CheckCircle2, RotateCcw, MessageSquare, Clock, Calendar, Users, MapPin, UtensilsCrossed, Mic, Lightbulb, MonitorPlay, Construction, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { useMenus } from "@/context/MenuContext"
import { SectionChat } from "@/components/common/SectionChat"
import { spaces as spaceCatalog } from "@/data/mock"
import { cn } from "@/lib/utils"
import type { ProposalSectionStatus } from "@/data/types"

const STATUS_META: Record<ProposalSectionStatus, { label: string; badge: string }> = {
  draft: { label: "Luonnos", badge: "bg-gray-100 text-gray-600" },
  sent: { label: "Odottaa vastausta", badge: "bg-amber-100 text-amber-700" },
  approved: { label: "Hyväksytty", badge: "bg-emerald-100 text-emerald-700" },
  changes_requested: { label: "Muutoksia pyydetty", badge: "bg-red-100 text-red-700" },
  expired: { label: "Vanhentunut", badge: "bg-gray-100 text-gray-500" },
}

const AREA_ICONS: Record<string, typeof Mic> = {
  aani: Mic, valo: Lightbulb, video: MonitorPlay, lava: Construction, striimaus: Radio,
}

export default function ProposalView({ workOrderId }: { workOrderId: string }) {
  const { getWorkOrder, updateWorkOrder, getAllCateringPlans, getAVPlan } = useWorkOrders()
  const [activeCateringTab, setActiveCateringTab] = useState<string | null>(null)
  const { menus } = useMenus()
  const workOrder = getWorkOrder(workOrderId)
  const [commentFor, setCommentFor] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")

  if (!workOrder) {
    return <div className="max-w-3xl mx-auto py-16 text-center"><p className="text-gray-500">Ei ehdotusta.</p></div>
  }

  const wo = workOrder
  const proposals = (wo.proposalSections ?? []).filter((p) =>
    p.status !== "draft"
    && !p.sectionKey.startsWith("catering-")
    && !p.sectionKey.startsWith("av-")
    && p.sectionKey !== "av"
  )
  const allCateringPlans = getAllCateringPlans(workOrderId)
  const cateringOptions = Object.entries(allCateringPlans).filter(([pid, p]) => pid !== "_default" && p.status === "valmis")
  const avPlan = getAVPlan(workOrderId)
  const allApproved = proposals.length > 0 && proposals.every((p) => p.status === "approved")

  const day = wo.eventDays[0]
  const allSpaces = wo.eventDays.flatMap((d) => d.spaces)
  const scheduleItems = wo.eventDays.flatMap((d) => d.scheduleItems)
  const avProduction = wo.avProduction
  const activeAreas = avProduction?.productionAreas.filter((a) => a.status !== "ei_tarvita") ?? []
  const customSections = wo.customSections ?? []

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

  function getProposal(key: string) {
    return proposals.find((p) => p.sectionKey === key)
  }

  function renderActions(sectionKey: string) {
    const p = getProposal(sectionKey)
    if (!p) return null

    return (
      <div className="mt-4 pt-3 border-t border-gray-100">
        {p.status === "sent" && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => approve(sectionKey)} className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Hyväksy
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setCommentFor(sectionKey); setCommentText("") }} className="gap-1.5">
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
            <MessageSquare className="h-4 w-4" /> Muutospyyntö lähetetty
          </div>
        )}
        {p.status === "expired" && (
          <div className="flex items-center gap-2 text-[13px] text-gray-500">
            <Clock className="h-4 w-4" /> Vanhentunut
          </div>
        )}
        {p.clientComment && (
          <div className="mt-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
            <p className="text-[12px] text-red-700"><span className="font-semibold">Kommenttisi:</span> {p.clientComment}</p>
          </div>
        )}
        {commentFor === sectionKey && (
          <div className="mt-3 space-y-2">
            <Textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Kerro mitä haluat muuttaa..." rows={2} autoFocus />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => requestChanges(sectionKey)} disabled={!commentText.trim()}>Lähetä</Button>
              <Button size="sm" variant="outline" onClick={() => setCommentFor(null)}>Peruuta</Button>
            </div>
          </div>
        )}
      </div>
    )
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
      {/* Tapahtuman otsikko */}
      <div>
        <p className="text-[12px] text-gray-400 uppercase tracking-wider font-medium">Tapahtumatarjous</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{wo.customerCompany}</h1>
        <p className="text-[14px] text-gray-500 mt-1">{wo.eventType} · {wo.number}</p>
        {wo.eventDescription && (
          <p className="text-[13px] text-gray-600 mt-2 leading-relaxed">{wo.eventDescription}</p>
        )}
      </div>

      {/* Perustiedot */}
      {day && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-[11px] text-gray-500">Päivämäärä</p>
              <p className="text-[13px] font-medium text-gray-900">{day.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-[11px] text-gray-500">Aika</p>
              <p className="text-[13px] font-medium text-gray-900">{day.bookingStart}–{day.bookingEnd}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Users className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-[11px] text-gray-500">Osallistujat</p>
              <p className="text-[13px] font-medium text-gray-900">{wo.participantEstimate} hlö</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-[11px] text-gray-500">Tilat</p>
              <p className="text-[13px] font-medium text-gray-900">{allSpaces.length > 0 ? allSpaces.map((s) => s.spaceName).join(", ") : "–"}</p>
            </div>
          </div>
        </div>
      )}

      {allApproved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-[15px] font-semibold text-emerald-800">Kaikki osiot hyväksytty</p>
          <p className="text-[12px] text-emerald-600 mt-1">Kiitos! Olemme yhteydessä tapahtuman järjestelyistä.</p>
        </div>
      )}

      {/* TILAT */}
      {getProposal("tilat") && allSpaces.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <CardTitle>Tilat</CardTitle>
            <Badge className={cn("text-[10px]", STATUS_META[getProposal("tilat")!.status].badge)}>
              {STATUS_META[getProposal("tilat")!.status].label}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allSpaces.map((es) => {
              const detail = spaceCatalog.find((s) => s.id === es.spaceId)
              return (
                <div key={es.spaceId} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  {detail?.image && (
                    <div className="h-28 w-full overflow-hidden rounded-lg mb-3">
                      <img src={detail.image} alt={es.spaceName} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <p className="text-[14px] font-semibold text-gray-900">{es.spaceName}</p>
                  {detail && <p className="text-[12px] text-gray-500 mt-0.5">{detail.capacity} hlö · {detail.type}</p>}
                  {es.price > 0 && <p className="text-[13px] font-bold text-gray-900 mt-1">{es.price.toLocaleString("fi-FI")} €</p>}
                </div>
              )
            })}
          </div>
          {renderActions("tilat")}
        </Card>
      )}

      {/* AIKATAULU */}
      {getProposal("aikataulu") && scheduleItems.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <CardTitle>Aikataulu</CardTitle>
            <Badge className={cn("text-[10px]", STATUS_META[getProposal("aikataulu")!.status].badge)}>
              {STATUS_META[getProposal("aikataulu")!.status].label}
            </Badge>
          </div>
          <div className="space-y-1">
            {scheduleItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className="text-[13px] font-mono text-gray-500 w-24 shrink-0">
                  {item.startTime}{item.endTime && item.endTime !== item.startTime ? `–${item.endTime}` : ""}
                </span>
                <span className="text-[13px] font-medium text-gray-900 flex-1">{item.title}</span>
                <Badge variant="outline" className="text-[9px]">{item.type}</Badge>
              </div>
            ))}
          </div>
          {renderActions("aikataulu")}
        </Card>
      )}

      {/* CATERING */}
      {getProposal("catering") && cateringOptions.length > 0 && (() => {
        const proposal = getProposal("catering")!
        const selectedTab = activeCateringTab ?? cateringOptions[0]?.[0] ?? null
        const activePlan = selectedTab ? allCateringPlans[selectedTab] : null
        const isApproved = proposal.status === "approved"
        const chosenPartnerId = proposal.clientComment?.startsWith("valittu:") ? proposal.clientComment.replace("valittu:", "") : null

        return (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Catering</CardTitle>
              <Badge className={cn("text-[10px]", STATUS_META[proposal.status].badge)}>
                {STATUS_META[proposal.status].label}
              </Badge>
            </div>

            {/* Tabit — näytetään vain jos useampi vaihtoehto */}
            {cateringOptions.length > 1 && (
              <div className="flex border-b border-gray-200 mb-4">
                {cateringOptions.map(([pid], i) => {
                  const isActive = selectedTab === pid
                  const isChosen = chosenPartnerId === pid
                  return (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => setActiveCateringTab(pid)}
                      className={cn(
                        "px-4 pb-2.5 text-[13px] font-medium border-b-2 transition-colors flex items-center gap-1.5",
                        isActive ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
                      )}
                    >
                      Vaihtoehto {String.fromCharCode(65 + i)}
                      {isChosen && <span className="text-emerald-500">✓</span>}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Aktiivisen vaihtoehdon sisältö */}
            {activePlan && (
              <div className="space-y-4">
                {activePlan.moments.map((m) => {
                  const products = m.proposalProducts ?? menus.find((mn) => mn.name === m.menuName)?.products.map((p) => ({ productId: p.id, name: p.name, unitPrice: p.unitPrice, unit: p.unit, quantity: 1 })) ?? []
                  return (
                    <div key={m.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[14px] font-semibold text-gray-900">{m.title}</p>
                        <span className="text-[12px] text-gray-500">{m.startTime}{m.endTime && m.endTime !== m.startTime ? `–${m.endTime}` : ""}</span>
                      </div>
                      {m.menuName && <p className="text-[12px] font-medium text-emerald-700 mb-2"><UtensilsCrossed className="h-3 w-3 inline mr-1" />{m.menuName}</p>}
                      {products.length > 0 && (
                        <div className="space-y-1">
                          {products.map((p) => (
                            <div key={p.productId} className="flex items-center justify-between text-[12px]">
                              <span className="text-gray-700">{p.name}</span>
                              {p.unitPrice > 0 && <span className="text-gray-500">{p.unitPrice.toLocaleString("fi-FI")} €/{p.unit}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Valitse tämä vaihtoehto — vain jos useampi ja ei vielä hyväksytty */}
                {cateringOptions.length > 1 && !isApproved && selectedTab && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      const updated = (wo.proposalSections ?? []).map((p) =>
                        p.sectionKey === "catering"
                          ? { ...p, status: "approved" as const, clientComment: `valittu:${selectedTab}` }
                          : p
                      )
                      updateWorkOrder(workOrderId, { proposalSections: updated })
                    }}
                  >
                    Valitse tämä vaihtoehto
                  </Button>
                )}
              </div>
            )}

            {/* Normaali hyväksy/muutoksia — vain yksi vaihtoehto tai jo valittu */}
            {(cateringOptions.length === 1 || isApproved) && renderActions("catering")}
          </Card>
        )
      })()}

      {/* LISÄPALVELUT & AV */}
      {getProposal("lisapalvelut") && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <CardTitle>Lisäpalvelut & AV</CardTitle>
            <Badge className={cn("text-[10px]", STATUS_META[getProposal("lisapalvelut")!.status].badge)}>
              {STATUS_META[getProposal("lisapalvelut")!.status].label}
            </Badge>
          </div>
          {activeAreas.length > 0 && (
            <div className="space-y-3">
              {activeAreas.map((area) => {
                const Icon = AREA_ICONS[area.key] ?? Mic
                return (
                  <div key={area.key} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 shrink-0">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-gray-900">{area.label}</span>
                        {area.price != null && area.price > 0 && (
                          <span className="text-[13px] font-bold text-gray-900">{area.price.toLocaleString("fi-FI")} €</span>
                        )}
                      </div>
                      {area.description && <p className="mt-1 text-[12px] text-gray-600">{area.description}</p>}
                    </div>
                  </div>
                )
              })}
              {avProduction && avProduction.totalPrice > 0 && (
                <div className="flex justify-between text-[14px] font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>AV yhteensä</span>
                  <span>{avProduction.totalPrice.toLocaleString("fi-FI")} €</span>
                </div>
              )}
            </div>
          )}
          {renderActions("lisapalvelut")}
        </Card>
      )}

      {/* CUSTOM-OSIOT */}
      {proposals.filter((p) => p.sectionKey.startsWith("custom-")).map((p) => {
        const cs = customSections.find((s) => `custom-${s.id}` === p.sectionKey)
        if (!cs) return null
        return (
          <Card key={p.sectionKey}>
            <div className="flex items-center justify-between mb-3">
              <CardTitle>{cs.title}</CardTitle>
              <Badge className={cn("text-[10px]", STATUS_META[p.status].badge)}>
                {STATUS_META[p.status].label}
              </Badge>
            </div>
            <p className="text-[13px] text-gray-600 leading-relaxed">{cs.description}</p>
            {cs.price != null && cs.price > 0 && (
              <p className="mt-2 text-[14px] font-bold text-gray-900">{cs.price.toLocaleString("fi-FI")} €</p>
            )}
            {renderActions(p.sectionKey)}
          </Card>
        )
      })}

      {/* Keskustelu myyjän kanssa */}
      <div className="mt-6">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-3">Keskustelu myyjän kanssa</h2>
        <SectionChat sectionKey="asiakas" />
      </div>
    </div>
  )
}
