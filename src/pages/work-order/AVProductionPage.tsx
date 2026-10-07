import { Send, Music, ShieldCheck, Mic, Lightbulb, MonitorPlay, Construction, Radio, Users, Calendar, MapPin, Clock, RotateCcw, CheckCircle2, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { WorkOrderHeader } from "@/components/layout/WorkOrderHeader"
import { SectionChat } from "@/components/common/SectionChat"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import type { AVProduction, ScheduleItem } from "@/data/types"
import { cn } from "@/lib/utils"

const STATUS_META: Record<string, { label: string; badge: string }> = {
  ei_aloitettu: { label: "Ei aloitettu", badge: "bg-gray-100 text-gray-600" },
  tarve_kuvattu: { label: "Tarve kuvattu", badge: "bg-blue-100 text-blue-700" },
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

  if (!workOrder) return <p className="text-gray-500">Työmääräintä ei löytynyt.</p>

  const wo = workOrder
  const av: AVProduction = wo.avProduction ?? {
    status: "ei_aloitettu",
    needs: [],
    productionAreas: [],
    totalPrice: 0,
    notes: "",
  }

  function updateAV(updates: Partial<AVProduction>) {
    updateWorkOrder(workOrderId, { avProduction: { ...av, ...updates } })
  }

  function sendToPartner() {
    updateAV({
      status: "kumppanilla",
      sentToPartnerAt: new Date().toLocaleString("fi-FI"),
    })
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

  function requestChanges() {
    updateAV({ status: "kumppanilla" })
  }

  const day = wo.eventDays[0]
  const allSpaces = wo.eventDays.flatMap((d) => d.spaces)
  const meta = STATUS_META[av.status] ?? STATUS_META.ei_aloitettu
  const activeAreas = av.productionAreas.filter((a) => a.status !== "ei_tarvita")

  return (
    <div className="space-y-6">
      <WorkOrderHeader workOrder={wo} title="AV-tuotanto" />

      {/* Tapahtuman tiedot */}
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
              <p className="text-[13px] font-medium text-gray-900">
                {day ? `${day.date} · ${day.bookingStart}–${day.bookingEnd}` : "–"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* --- ENNEN LÄHETYSTÄ --- */}
      {(av.status === "ei_aloitettu" || av.status === "tarve_kuvattu") && (
        <>
          <Card>
            <CardHeader><CardTitle>Kuvaa AV-tarve</CardTitle></CardHeader>
            <Textarea
              placeholder="Kerro vapaasti tapahtuman AV-tarpeista. Esim. tarvitaanko äänentoistoa, näyttöjä, striimausta, live-musiikkia, valaistusta..."
              value={av.notes}
              onChange={(e) => updateAV({ notes: e.target.value, status: av.status === "ei_aloitettu" ? "tarve_kuvattu" : av.status })}
              rows={6}
            />
          </Card>

          <Card>
            <CardHeader><CardTitle>AV-kumppani</CardTitle></CardHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-gray-700">Kumppani</label>
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
                <label className="text-[13px] font-medium text-gray-700">Projektipäällikkö</label>
                <Input
                  placeholder="Nimi (täytetään myöhemmin)"
                  value={av.partnerContact ?? ""}
                  onChange={(e) => updateAV({ partnerContact: e.target.value })}
                  className="text-[13px]"
                />
              </div>
              {av.partnerId && (
                <Button className="w-full gap-2" onClick={sendToPartner}>
                  <Send className="h-4 w-4" />
                  Lähetä kumppanille suunniteltavaksi
                </Button>
              )}
            </div>
          </Card>
        </>
      )}

      {/* --- KUMPPANILLA --- */}
      {av.status === "kumppanilla" && (
        <>
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-semibold text-amber-800">Odottaa AV-kumppanin suunnitelmaa</p>
              <p className="text-[12px] text-amber-700 mt-0.5">
                Lähetetty {av.partnerName ?? "kumppanille"} {av.sentToPartnerAt}
              </p>
            </div>
          </div>
          {av.notes && (
            <Card>
              <CardHeader><CardTitle>Lähetetty kuvaus</CardTitle></CardHeader>
              <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{av.notes}</p>
            </Card>
          )}
        </>
      )}

      {/* --- KUMPPANI VASTANNUT --- */}
      {av.status === "vastattu" && (
        <>
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-semibold text-emerald-800">AV-kumppani on vastannut</p>
              <p className="text-[12px] text-emerald-700 mt-0.5">Tarkista suunnitelma ja hyväksy tai pyydä muutoksia.</p>
            </div>
          </div>

          {/* Kumppanin suunnitelma read-only */}
          {activeAreas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tuotantoalueet</CardTitle>
                {av.totalPrice > 0 && (
                  <span className="text-[14px] font-bold text-gray-900">{av.totalPrice.toLocaleString("fi-FI")} €</span>
                )}
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
                          {area.price != null && area.price > 0 && (
                            <span className="text-[13px] font-bold text-gray-900">{area.price.toLocaleString("fi-FI")} €</span>
                          )}
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-gray-400" />
                  Tekninen aikataulu
                </CardTitle>
              </CardHeader>
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

          {(av.crewCount || av.crewNotes) && (
            <Card>
              <CardHeader><CardTitle>Henkilöstö</CardTitle></CardHeader>
              <div className="text-[13px] text-gray-700">
                {av.crewCount && <p><span className="font-medium">Henkilöstömäärä:</span> {av.crewCount}</p>}
                {av.crewNotes && <p className="mt-1">{av.crewNotes}</p>}
              </div>
            </Card>
          )}

          {av.technicalPlan && (
            <Card>
              <CardHeader><CardTitle>Tekninen suunnitelma</CardTitle></CardHeader>
              <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{av.technicalPlan}</p>
            </Card>
          )}

          <div className="flex gap-3">
            <Button className="flex-1 gap-2" size="lg" onClick={acceptPlan}>
              <CheckCircle2 className="h-4.5 w-4.5" />
              Hyväksy suunnitelma
            </Button>
            <Button variant="outline" className="flex-1 gap-2" size="lg" onClick={requestChanges}>
              <RotateCcw className="h-4.5 w-4.5" />
              Pyydä muutoksia
            </Button>
          </div>
        </>
      )}

      {/* --- HYVÄKSYTTY --- */}
      {av.status === "valmis" && (
        <>
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-semibold text-emerald-800">AV-suunnitelma hyväksytty</p>
              <p className="text-[12px] text-emerald-700 mt-0.5">{av.partnerName ?? "Kumppanin"} suunnitelma on valmis.</p>
            </div>
          </div>

          {activeAreas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tuotantoalueet</CardTitle>
                {av.totalPrice > 0 && (
                  <span className="text-[14px] font-bold text-gray-900">{av.totalPrice.toLocaleString("fi-FI")} €</span>
                )}
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
                          {area.price != null && area.price > 0 && (
                            <span className="text-[13px] font-bold text-gray-900">{area.price.toLocaleString("fi-FI")} €</span>
                          )}
                        </div>
                        {area.description && <p className="mt-1 text-[12px] text-gray-600">{area.description}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </>
      )}

      <SectionChat sectionKey="av" />
    </div>
  )
}
