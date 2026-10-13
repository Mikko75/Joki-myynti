import { useState } from "react"
import { Plus, Sparkles, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SectionNotes } from "@/components/common/SectionNotes"
import { SectionChat } from "@/components/common/SectionChat"
import { WorkOrderHeader } from "@/components/layout/WorkOrderHeader"
import { WorkOrderSectionCard } from "@/components/common/WorkOrderSectionCard"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { useTeam } from "@/context/TeamContext"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ProposalSection } from "@/data/types"
import type { CateringPlanState } from "@/context/WorkOrderContext"

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function CateringPage() {
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const {
    getCateringPlan,
    getAllCateringPlans,
    updateCateringPlan,
    updateWorkOrder,
  } = useWorkOrders()

  const { members } = useTeam()
  const [scheduleText, setScheduleText] = useState<string | null>(null)
  const [cateringSaved, setCateringSaved] = useState(false)
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null)

  if (!workOrder) return <p className="text-gray-500">Työmääräintä ei löytynyt.</p>

  const plan = getCateringPlan(workOrderId)
  const partnerPlans = getAllCateringPlans(workOrderId)
  const respondedPartners = Object.entries(partnerPlans).filter(([, p]) => p.status === "vastattu" || p.status === "valmis")
  const displayPartnerId = activePartnerId ?? respondedPartners[0]?.[0] ?? null
  const displayPlan = displayPartnerId ? partnerPlans[displayPartnerId] : null
  const allProposals = workOrder.proposalSections ?? []
  const proposals = allProposals
  const proposalKeys = new Set(proposals.map((p) => p.sectionKey))

  function addCateringToProposal() {
    if (proposalKeys.has("catering")) return
    const entry: ProposalSection = { sectionKey: "catering", sentAt: null, status: "draft" }
    updateWorkOrder(workOrderId, { proposalSections: [...allProposals, entry] })
  }



  // ===================================================================
  // MAIN RENDER — always shows info fields, timeline below
  // ===================================================================
  return (
    <div className="space-y-6">
      {/* Catering header */}
      <WorkOrderHeader
        workOrder={workOrder}
        title="Ruoka & Juoma (Catering)"
      />

      {/* Kumppanin ehdotus saapunut */}
      {respondedPartners.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 shrink-0">
            <span className="text-emerald-600 text-[14px] font-bold">{respondedPartners.length}</span>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-gray-900">
              {respondedPartners.length === 1 ? "Kumppani on lähettänyt ehdotuksen" : `${respondedPartners.length} kumppania on lähettänyt ehdotuksen`}
            </p>
            <p className="mt-0.5 text-[12px] text-gray-600">
              {respondedPartners.map(([pid]) => members.find((m) => m.id === pid)?.name ?? pid).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Kumppanien ehdotukset — tabit + sisältö KESKELLÄ */}
      {respondedPartners.length > 0 && (
        <div className="space-y-4">
          {respondedPartners.length > 1 && (
            <div className="flex border-b border-gray-200">
              {respondedPartners.map(([pid, p]) => {
                const name = members.find((m) => m.id === pid)?.name ?? pid
                return (
                  <button
                    key={pid}
                    type="button"
                    className={cn(
                      "px-4 pb-2.5 text-[13px] font-medium border-b-2 transition-colors",
                      displayPartnerId === pid
                        ? "border-primary-600 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                    onClick={() => setActivePartnerId(pid)}
                  >
                    {name}
                    {p.status === "valmis" && <span className="ml-1.5 text-emerald-500">✓</span>}
                  </button>
                )
              })}
            </div>
          )}

          {displayPlan && displayPartnerId && (
            <PartnerProposalView
              plan={displayPlan}
              partnerName={members.find((m) => m.id === displayPartnerId)?.name ?? displayPartnerId}
              onSelect={() => updateCateringPlan(workOrderId, displayPartnerId, { status: "valmis" })}
              onRequestChanges={() => updateCateringPlan(workOrderId, displayPartnerId, { status: "kumppanilla" })}
            />
          )}
        </div>
      )}

      {(
      <>

      {/* Tallennettu catering-pyyntö — kortti + +-nappi */}
      {cateringSaved && !proposalKeys.has("catering") && (
        <div className="relative">
          <WorkOrderSectionCard
            onClick={() => setCateringSaved(false)}
            title="Catering-pyyntö"
            subtitle={`${workOrder.participantEstimate} hlö · ${workOrder.eventDays[0]?.date ?? ""}`}
            badgeLabel="Tallennettu"
            badgeClassName="bg-emerald-100 text-emerald-700"
            progress={0}
            hideProgress
            description={workOrder.eventDescription?.slice(0, 80) ?? "Catering-tiedot tallennettu."}
          />
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); addCateringToProposal() }}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-primary-600 hover:border-primary-300 transition-colors"
              title="Lisää ehdotukseen"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {cateringSaved && proposalKeys.has("catering") && (
        <div className="relative">
          <WorkOrderSectionCard
            onClick={() => setCateringSaved(false)}
            title="Catering-pyyntö"
            subtitle={`${workOrder.participantEstimate} hlö · ${workOrder.eventDays[0]?.date ?? ""}`}
            badgeLabel="Ehdotuksessa"
            badgeClassName="bg-emerald-100 text-emerald-700"
            progress={0}
            hideProgress
            description={workOrder.eventDescription?.slice(0, 80) ?? "Catering-tiedot tallennettu."}
          />
          <div className="absolute top-4 right-4 z-10">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600" title="Ehdotuksessa">
              <Sparkles className="h-3 w-3" />
            </span>
          </div>
        </div>
      )}

      {/* Muokkausnäkymä — näkyy kun ei tallennettu tai klikattu korttia */}
      {!cateringSaved && (
      <>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-gray-700">Tapahtumapyyntö</label>
        <Textarea
          value={workOrder.eventDescription ?? ""}
          onChange={(e) => updateWorkOrder(workOrderId, { eventDescription: e.target.value })}
          placeholder="Asiakkaan tapahtumapyyntö, toiveet, erityistiedot, henkilömäärä, ruokavaliot..."
          rows={6}
        />
      </div>

      {/* Tapahtuman aikataulu — yksi tekstikenttä */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-gray-700">Tapahtuman aikataulu</label>
        <Textarea
          value={scheduleText ?? workOrder.eventDays.flatMap((d) => d.scheduleItems).map((si) => `${si.startTime} ${si.title}`).join("\n")}
          onChange={(e) => setScheduleText(e.target.value)}
          onBlur={() => {
            if (scheduleText === null) return
            const dayId = workOrder.eventDays[0]?.id
            if (!dayId) return
            const lines = scheduleText.split("\n")
            const items = lines.map((line, i) => {
              const match = line.trim().match(/^(\d{1,2}[:.]\d{2})\s*[-–]?\s*(.+)/)
              if (!match) return null
              const time = match[1].replace(".", ":")
              const title = match[2].trim()
              const isCatering = /kahvi|lounas|ruoka|illallinen|cocktail|catering|tarjoilu|aamiainen|buffet|dinner|lunch|breakfast/i.test(title)
              return {
                id: `si-edit-${i}`,
                type: isCatering ? "catering" as const : "ohjelma" as const,
                title,
                startTime: time,
                endTime: time,
                spaceName: "",
                status: "luonnos" as const,
                sourceLabel: "Myyjä",
              }
            }).filter(Boolean) as typeof workOrder.eventDays[0]["scheduleItems"]
            updateWorkOrder(workOrderId, {
              eventDays: workOrder.eventDays.map((d) => d.id === dayId ? { ...d, scheduleItems: items } : d),
            })
            setScheduleText(null)
          }}
          placeholder={"Kirjoita yksi ohjelmahetki per rivi:\n08:00 Rakennus alkaa\n12:00 Ovet avautuvat\n12:30 Tervetulokahvi"}
          rows={8}
        />
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-gray-400">Muoto: kellonaika + kuvaus. Catering-hetket tunnistetaan automaattisesti.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (scheduleText !== null) {
                const dayId = workOrder.eventDays[0]?.id
                if (!dayId) return
                const lines = scheduleText.split("\n")
                const items = lines.map((line, i) => {
                  const match = line.trim().match(/^(\d{1,2}[:.]\d{2})\s*[-–]?\s*(.+)/)
                  if (!match) return null
                  const time = match[1].replace(".", ":")
                  const title = match[2].trim()
                  const isCatering = /kahvi|lounas|ruoka|illallinen|cocktail|catering|tarjoilu|aamiainen|buffet|dinner|lunch|breakfast/i.test(title)
                  return {
                    id: `si-edit-${i}`,
                    type: isCatering ? "catering" as const : "ohjelma" as const,
                    title, startTime: time, endTime: time, spaceName: "",
                    status: "luonnos" as const, sourceLabel: "Myyjä",
                  }
                }).filter(Boolean) as typeof workOrder.eventDays[0]["scheduleItems"]
                updateWorkOrder(workOrderId, {
                  eventDays: workOrder.eventDays.map((d) => d.id === dayId ? { ...d, scheduleItems: items } : d),
                })
                setScheduleText(null)
              }
              setCateringSaved(true)
            }}
          >
            Tallenna
          </Button>
        </div>
      </div>

      {/* Myyjän huomiot cateringille */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-gray-700">Myyjän huomiot cateringille</label>
        <Textarea
          value={workOrder.sectionNotes?.["catering-seller"] ?? ""}
          onChange={(e) => updateWorkOrder(workOrderId, { sectionNotes: { ...(workOrder.sectionNotes ?? {}), "catering-seller": e.target.value } })}
          placeholder="Kirjoita kumppanille lähetettävät huomiot, toiveet ja tarkennukset..."
          rows={4}
        />
      </div>

      </>
      )}


      {plan.status === "kumppanilla" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-[14px] font-semibold text-gray-900">
            Odottaa catering-kumppanin vastausta
          </p>
          <p className="mt-0.5 text-[12px] text-gray-500">
            Luonnos on lähetetty kumppanille. Saat ilmoituksen kun kumppani
            vastaa.
          </p>
        </div>
      )}

      {plan.status === "vastattu" && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div>
            <p className="text-[14px] font-semibold text-gray-900">
              Kumppani on vastannut
            </p>
            <p className="mt-0.5 text-[12px] text-gray-500">
              Tarkista ehdotus ja hyväksy se osaksi tarjousta.
            </p>
          </div>
          <Button
            onClick={() =>
              updateCateringPlan(workOrderId, "_default", { status: "valmis" })
            }
          >
            Hyväksy ehdotus
          </Button>
        </div>
      )}

      <SectionNotes sectionKey="catering" />
      <SectionChat sectionKey="catering" />
      </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Kumppanin ehdotuksen tarkastelu — read-only, keskisisältö
// ---------------------------------------------------------------------------
function PartnerProposalView({ plan, partnerName, onSelect, onRequestChanges }: {
  plan: CateringPlanState
  partnerName: string
  onSelect: () => void
  onRequestChanges: () => void
}) {
  const overallTotal = plan.moments.reduce((sum, m) => {
    return sum + (m.proposalProducts ?? []).reduce((s, p) => s + p.unitPrice * p.quantity, 0)
  }, 0)

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900">{partnerName}</h3>
          <p className="text-[12px] text-gray-500 mt-0.5">
            {plan.moments.length} tarjoiluhetkeä
            {plan.status === "valmis" && <Badge className="ml-2 text-[9px] bg-emerald-100 text-emerald-700">Valittu</Badge>}
          </p>
        </div>
        <span className="text-[18px] font-bold text-gray-900">
          {overallTotal.toLocaleString("fi-FI")} €
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {plan.moments.map((moment) => {
          const momentTotal = (moment.proposalProducts ?? []).reduce((s, p) => s + p.unitPrice * p.quantity, 0)
          return (
            <div key={moment.id} className="px-6 py-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-gray-900">{moment.title}</span>
                  <span className="text-[12px] text-gray-500">
                    {moment.startTime}{moment.endTime && moment.endTime !== moment.startTime ? `–${moment.endTime}` : ""}
                  </span>
                </div>
                <span className="text-[13px] font-semibold text-gray-900">
                  {momentTotal.toLocaleString("fi-FI")} €
                </span>
              </div>

              {moment.menuName && (
                <div className="flex items-center gap-1.5">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-emerald-600" />
                  <Badge className="text-[10px] bg-emerald-100 text-emerald-700">{moment.menuName}</Badge>
                </div>
              )}

              {(moment.proposalProducts ?? []).length > 0 && (
                <div className="space-y-1 ml-5">
                  {(moment.proposalProducts ?? []).map((p) => (
                    <div key={p.productId} className="flex items-center justify-between text-[12px] py-0.5">
                      <span className="text-gray-600">{p.name}</span>
                      <span className="text-gray-700 font-medium">
                        {p.unitPrice.toLocaleString("fi-FI")} €/{p.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {moment.notes && (
                <p className="text-[11px] text-gray-500 italic ml-5">{moment.notes}</p>
              )}
            </div>
          )
        })}
      </div>

      {plan.status !== "valmis" && (
        <div className="border-t border-gray-100 px-6 py-4 flex items-center gap-3">
          <Button onClick={onSelect}>Valitse tämä ehdotus</Button>
          <Button variant="outline" onClick={onRequestChanges}>Pyydä muutoksia</Button>
        </div>
      )}
    </div>
  )
}

