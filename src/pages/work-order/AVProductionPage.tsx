import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Sparkles, Music, Users, Calendar, MapPin, Clock, Send, ShieldCheck, RotateCcw, CheckCircle2, Mic, Lightbulb, MonitorPlay, Construction, Radio, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { WorkOrderHeader } from "@/components/layout/WorkOrderHeader"
import { WorkOrderSectionCard } from "@/components/common/WorkOrderSectionCard"
import { SectionChat } from "@/components/common/SectionChat"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import type { AVProduction, ProposalSection, ScheduleItem } from "@/data/types"
import { cn } from "@/lib/utils"

const STATUS_META: Record<string, { label: string; badge: string }> = {
  ei_aloitettu: { label: "Ei aloitettu", badge: "bg-gray-100 text-gray-600" },
  kumppanilla: { label: "Kumppanilla", badge: "bg-amber-100 text-amber-700" },
  kumppanilla: { label: "Kumppanilla", badge: "bg-amber-100 text-amber-700" },
  vastattu: { label: "Kumppani vastannut", badge: "bg-emerald-100 text-emerald-700" },
  valmis: { label: "Hyväksytty", badge: "bg-emerald-100 text-emerald-700" },
}

const AV_PARTNERS = [
  { id: "rajupaja", name: "Rajupaja Oy" },
  { id: "soundlight", name: "Sound & Light Finland" },
  { id: "bright", name: "Bright Finland Oy" },
]

const AREA_ICONS: Record<string, typeof Mic> = {
  aani: Mic,
  valo: Lightbulb,
  video: MonitorPlay,
  lava: Construction,
  striimaus: Radio,
}

export default function AVProductionPage() {
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const { updateWorkOrder, addScheduleItem } = useWorkOrders()
  const navigate = useNavigate()
  const [expandedCard, setExpandedCard] = useState(false)

  if (!workOrder) return <p className="text-gray-500">Työmääräintä ei löytynyt.</p>

  const wo = workOrder
  const av: AVProduction = wo.avProduction ?? {
    status: "ei_aloitettu",
    needs: [],
    productionAreas: [],
    totalPrice: 0,
    notes: "",
  }

  const proposals = wo.proposalSections ?? []
  const proposalKeys = new Set(proposals.map((p) => p.sectionKey))
  const avInProposal = proposalKeys.has("av")

  function updateAV(updates: Partial<AVProduction>) {
    updateWorkOrder(workOrderId, { avProduction: { ...av, ...updates } })
  }

  function addAVToProposal() {
    if (avInProposal) return
    const entry: ProposalSection = { sectionKey: "av", sentAt: null, status: "draft" }
    updateWorkOrder(workOrderId, { proposalSections: [...proposals, entry] })
  }

  function acceptPlan() {
    updateAV({ status: "valmis" })
    const dayId = wo.eventDays[0]?.id
    if (dayId && av.runOfShow) {
      for (const item of av.runOfShow) {
        const si: ScheduleItem = {
          id: `av-${item.id}`,
          type: "av",
          title: item.title,
          startTime: item.time,
          endTime: item.time,
          spaceName: "",
          status: "valmis",
          sourceLabel: av.partnerName ?? "AV-kumppani",
        }
        addScheduleItem(workOrderId, dayId, si)
      }
    }
  }

  const day = wo.eventDays[0]
  const allSpaces = wo.eventDays.flatMap((d) => d.spaces)
  const meta = STATUS_META[av.status] ?? STATUS_META.ei_aloitettu
  const activeAreas = av.productionAreas.filter((a) => a.status !== "ei_tarvita")

  return (
    <div className="space-y-6">
      <WorkOrderHeader workOrder={wo} title="AV-tuotanto" />

      {/* Perustiedot */}
      <Card>
        <CardHeader>
          <CardTitle>Tapahtuman tiedot</CardTitle>
          <Badge className={cn("text-[10px]", meta.badge)}>{meta.label}</Badge>
        </CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2.5">
            <Music className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-[11px] text-gray-500">Tyyppi</p>
              <p className="text-[13px] font-medium text-gray-900">{wo.eventType || "–"}</p>
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
              <p className="text-[11px] text-gray-500">Tila</p>
              <p className="text-[13px] font-medium text-gray-900">{allSpaces.length > 0 ? allSpaces.map((s) => s.spaceName).join(", ") : "–"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-[11px] text-gray-500">Ajankohta</p>
              <p className="text-[13px] font-medium text-gray-900">{day ? `${day.date} · ${day.bookingStart}–${day.bookingEnd}` : "–"}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* AV-kortti — sama malli kuin CateringPage */}
      <h2 className="text-lg font-bold text-gray-900">AV-pyyntö</h2>

      <div className="relative">
        <WorkOrderSectionCard
          onClick={() => setExpandedCard(!expandedCard)}
          title="AV-tuotanto"
          subtitle={av.partnerName || "Ei kumppania valittu"}
          badgeLabel={meta.label}
          badgeClassName={meta.badge}
          progress={0}
          hideProgress
          description={av.notes || "Klikkaa muokataksesi AV-kuvausta."}
        />
        {!avInProposal ? (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={addAVToProposal}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-primary-600 hover:border-primary-300 transition-colors"
              title="Lisää ehdotukseen"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="absolute top-4 right-4 z-10">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600" title="Ehdotuksessa">
              <Sparkles className="h-3 w-3" />
            </span>
          </div>
        )}

        {/* Muokkaus — avautuu kortin alle */}
        {expandedCard && (
          <div className="rounded-b-xl border border-t-0 border-gray-200 bg-white p-4 -mt-1 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-gray-600">Kuvaa AV-tarve</label>
              <Textarea
                placeholder="Kerro vapaasti tapahtuman AV-tarpeista..."
                value={av.notes}
                onChange={(e) => updateAV({ notes: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-gray-600">Kumppani</label>
                <select
                  value={av.partnerId ?? ""}
                  onChange={(e) => {
                    const p = AV_PARTNERS.find((p) => p.id === e.target.value)
                    updateAV({ partnerId: e.target.value || undefined, partnerName: p?.name })
                  }}
                  className="w-full appearance-none rounded-md border border-gray-200 bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat px-3 pr-9 py-2 text-[13px] text-gray-900"
                >
                  <option value="">Valitse kumppani...</option>
                  {AV_PARTNERS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-gray-600">Projektipäällikkö</label>
                <Input
                  placeholder="Nimi"
                  value={av.partnerContact ?? ""}
                  onChange={(e) => updateAV({ partnerContact: e.target.value })}
                  className="text-[13px]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status-bannerit */}
      {av.status === "kumppanilla" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[14px] font-semibold text-amber-800">Odottaa AV-kumppanin suunnitelmaa</p>
            <p className="text-[12px] text-amber-700 mt-0.5">Lähetetty {av.partnerName ?? "kumppanille"} {av.sentToPartnerAt}</p>
          </div>
        </div>
      )}

      {av.status === "vastattu" && (
        <>
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-semibold text-emerald-800">AV-kumppani on vastannut</p>
              <p className="text-[12px] text-emerald-700 mt-0.5">Tarkista suunnitelma ja hyväksy tai pyydä muutoksia.</p>
            </div>
          </div>

          {activeAreas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tuotantoalueet</CardTitle>
                {av.totalPrice > 0 && <span className="text-[14px] font-bold text-gray-900">{av.totalPrice.toLocaleString("fi-FI")} €</span>}
              </CardHeader>
              <div className="space-y-3">
                {activeAreas.map((area) => {
                  const Icon = AREA_ICONS[area.key] ?? Mic
                  return (
                    <div key={area.key} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 shrink-0">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-semibold text-gray-900">{area.label}</span>
                          {area.price != null && area.price > 0 && <span className="text-[13px] font-bold text-gray-900">{area.price.toLocaleString("fi-FI")} €</span>}
                        </div>
                        {area.description && <p className="mt-1 text-[12px] text-gray-600">{area.description}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {(av.runOfShow ?? []).length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-gray-400" />Tekninen aikataulu</CardTitle></CardHeader>
              <div className="space-y-1">
                {(av.runOfShow ?? []).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <span className="text-[13px] font-mono text-gray-500 w-20 shrink-0">{item.time}</span>
                    <span className="text-[13px] font-medium text-gray-900 flex-1">{item.title}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="flex gap-3">
            <Button className="flex-1 gap-2" size="lg" onClick={acceptPlan}>
              <CheckCircle2 className="h-4.5 w-4.5" />Hyväksy suunnitelma
            </Button>
            <Button variant="outline" className="flex-1 gap-2" size="lg" onClick={() => updateAV({ status: "kumppanilla" })}>
              <RotateCcw className="h-4.5 w-4.5" />Pyydä muutoksia
            </Button>
          </div>
        </>
      )}

      {av.status === "valmis" && activeAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tuotantoalueet</CardTitle>
            {av.totalPrice > 0 && <span className="text-[14px] font-bold text-gray-900">{av.totalPrice.toLocaleString("fi-FI")} €</span>}
          </CardHeader>
          <div className="space-y-3">
            {activeAreas.map((area) => {
              const Icon = AREA_ICONS[area.key] ?? Mic
              return (
                <div key={area.key} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 shrink-0"><Icon className="h-4.5 w-4.5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-gray-900">{area.label}</span>
                      {area.price != null && area.price > 0 && <span className="text-[13px] font-bold text-gray-900">{area.price.toLocaleString("fi-FI")} €</span>}
                    </div>
                    {area.description && <p className="mt-1 text-[12px] text-gray-600">{area.description}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Lähetä suoraan asiakkaalle */}
      {av.notes && (
        <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 p-5">
          <div>
            <p className="text-[14px] font-semibold text-gray-900">Lähetä suoraan asiakkaalle</p>
            <p className="text-[12px] text-gray-500 mt-0.5">Lisää AV-osio suoraan asiakkaan ehdotukseen.</p>
          </div>
          <Button onClick={() => {
            if (!proposalKeys.has("lisapalvelut")) {
              const entry: ProposalSection = { sectionKey: "lisapalvelut", sentAt: null, status: "draft" }
              updateWorkOrder(workOrderId, { proposalSections: [...proposals, entry] })
            }
            navigate(`/tyomarain/${workOrderId}/yleiskuva`)
          }}>
            Asiakkaalle
          </Button>
        </div>
      )}

      <SectionChat sectionKey="av" />
    </div>
  )
}
