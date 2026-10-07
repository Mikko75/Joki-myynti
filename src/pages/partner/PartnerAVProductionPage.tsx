import { useState } from "react"
import { Send, Plus, X, Mic, Lightbulb, MonitorPlay, Construction, Radio, Users, Calendar, MapPin, Music, Clock, Truck, ShieldCheck, Zap, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionChat } from "@/components/common/SectionChat"
import { useParams } from "react-router-dom"
import { useWorkOrders } from "@/context/WorkOrderContext"
import type { AVProduction, AVProductionArea, AVScheduleItem } from "@/data/types"
import { cn } from "@/lib/utils"

const DEFAULT_AREAS: AVProductionArea[] = [
  { key: "aani", label: "Ääni", status: "ei_tarvita" },
  { key: "valo", label: "Valo", status: "ei_tarvita" },
  { key: "video", label: "Video / kuva", status: "ei_tarvita" },
  { key: "lava", label: "Lava / rakenteet", status: "ei_tarvita" },
  { key: "striimaus", label: "Striimaus", status: "ei_tarvita" },
]

const AREA_ICONS: Record<string, typeof Mic> = {
  aani: Mic,
  valo: Lightbulb,
  video: MonitorPlay,
  lava: Construction,
  striimaus: Radio,
}

export default function PartnerAVProductionPage() {
  const { id } = useParams<{ id: string }>()
  const woId = id ?? ""
  const { getWorkOrder, updateWorkOrder } = useWorkOrders()
  const workOrder = getWorkOrder(woId)
  const [newRunItem, setNewRunItem] = useState({ time: "", title: "" })

  if (!workOrder) return <p className="text-gray-500">Ei löytynyt.</p>

  const wo = workOrder
  const av: AVProduction = wo.avProduction ?? {
    status: "ei_aloitettu",
    needs: [],
    productionAreas: DEFAULT_AREAS.map((a) => ({ ...a })),
    totalPrice: 0,
    notes: "",
  }

  if (av.productionAreas.length === 0) {
    av.productionAreas = DEFAULT_AREAS.map((a) => ({ ...a }))
  }

  function updateAV(updates: Partial<AVProduction>) {
    updateWorkOrder(woId, { avProduction: { ...av, ...updates } })
  }

  function updateArea(key: string, updates: Partial<AVProductionArea>) {
    updateAV({
      productionAreas: av.productionAreas.map((a) => a.key === key ? { ...a, ...updates } : a),
    })
  }

  function addRunOfShowItem() {
    if (!newRunItem.time || !newRunItem.title) return
    const item: AVScheduleItem = { id: crypto.randomUUID(), time: newRunItem.time, title: newRunItem.title }
    updateAV({ runOfShow: [...(av.runOfShow ?? []), item].sort((a, b) => a.time.localeCompare(b.time)) })
    setNewRunItem({ time: "", title: "" })
  }

  function removeRunItem(itemId: string) {
    updateAV({ runOfShow: (av.runOfShow ?? []).filter((i) => i.id !== itemId) })
  }

  function sendPlan() {
    const total = av.productionAreas
      .filter((a) => a.status !== "ei_tarvita")
      .reduce((s, a) => s + (a.price ?? 0), 0)
    updateAV({
      status: "vastattu",
      totalPrice: total,
      productionAreas: av.productionAreas.map((a) =>
        a.status === "tarvitaan" ? { ...a, status: "luonnos" as const } : a
      ),
    })
  }

  const day = wo.eventDays[0]
  const allSpaces = wo.eventDays.flatMap((d) => d.spaces)
  const scheduleItems = wo.eventDays.flatMap((d) => d.scheduleItems)

  if (av.status === "ei_aloitettu" || av.status === "tarve_kuvattu") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">AV-tuotanto</h1>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-[14px] text-gray-500">Myyjä ei ole vielä lähettänyt AV-pyyntöä.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AV-tuotanto</h1>
        <Badge className={cn("text-[10px]", av.status === "vastattu" || av.status === "valmis" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
          {av.status === "vastattu" || av.status === "valmis" ? "Suunnitelma lähetetty" : "Odottaa suunnitelmaa"}
        </Badge>
      </div>

      {/* 1. Tapahtuman tiedot + myyjän kuvaus (read-only) */}
      <Card>
        <CardHeader><CardTitle>Tapahtuman tiedot</CardTitle></CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
        {av.notes && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-[11px] font-medium text-blue-600 mb-1">Myyjän kuvaus</p>
            <p className="text-[13px] text-gray-800 whitespace-pre-wrap">{av.notes}</p>
          </div>
        )}
      </Card>

      {/* 2. Ohjelmarunko (read-only from schedule) */}
      {scheduleItems.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Ohjelmarunko</CardTitle></CardHeader>
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
        </Card>
      )}

      {/* 3. Tuotantoalueet — kumppani valitsee ja täyttää */}
      <Card>
        <CardHeader><CardTitle>Tuotantoalueet</CardTitle></CardHeader>
        <div className="space-y-4">
          {av.productionAreas.map((area) => {
            const Icon = AREA_ICONS[area.key] ?? Mic
            const isActive = area.status !== "ei_tarvita"
            return (
              <div key={area.key} className={cn(
                "rounded-lg border p-4 transition-all",
                isActive ? "border-blue-200 bg-blue-50/30" : "border-gray-200 bg-gray-50"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-full shrink-0", isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400")}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[14px] font-semibold text-gray-900">{area.label}</span>
                  </div>
                  <Button
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => updateArea(area.key, { status: isActive ? "ei_tarvita" : "tarvitaan" })}
                  >
                    {isActive ? "Tarvitaan" : "Ei tarvita"}
                  </Button>
                </div>
                {isActive && (
                  <div className="space-y-3 mt-3">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-gray-600">Suunnitelma</label>
                      <Textarea
                        placeholder={`Kuvaa ${area.label.toLowerCase()}-toteutus: kalusto, sijoittelu, tekniset vaatimukset...`}
                        value={area.description ?? ""}
                        onChange={(e) => updateArea(area.key, { description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-gray-600">Hinta (€)</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={area.price ?? ""}
                        onChange={(e) => updateArea(area.key, { price: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* 4. Tekninen käsikirjoitus / Run of Show */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-gray-400" />
            Tekninen aikataulu
          </CardTitle>
        </CardHeader>
        {(av.runOfShow ?? []).length > 0 && (
          <div className="space-y-1 mb-3">
            {(av.runOfShow ?? []).map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className="text-[13px] font-mono text-gray-500 w-20 shrink-0">{item.time}</span>
                <span className="text-[13px] font-medium text-gray-900 flex-1">{item.title}</span>
                {item.avNotes && <span className="text-[11px] text-gray-500 truncate max-w-48">{item.avNotes}</span>}
                <button onClick={() => removeRunItem(item.id)} className="text-gray-300 hover:text-gray-500">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Aika"
            value={newRunItem.time}
            onChange={(e) => setNewRunItem((p) => ({ ...p, time: e.target.value }))}
            className="w-24 text-[13px]"
          />
          <Input
            placeholder="Esim. Rakennus alkaa, Tekniikka valmis, Ovet..."
            value={newRunItem.title}
            onChange={(e) => setNewRunItem((p) => ({ ...p, title: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && addRunOfShowItem()}
            className="flex-1 text-[13px]"
          />
          <Button variant="outline" size="sm" onClick={addRunOfShowItem} disabled={!newRunItem.time || !newRunItem.title}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* 5. Henkilöstö */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            Henkilöstö
          </CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-gray-600">Henkilöstömäärä</label>
            <Input
              type="number"
              placeholder="0"
              value={av.crewCount ?? ""}
              onChange={(e) => updateAV({ crewCount: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-gray-600">Roolit ja vastuut</label>
            <Textarea
              placeholder="Esim. 1 PM, 2 ääniteknikkoa, 1 valoteknikko, 1 kuvaustiimi..."
              value={av.crewNotes ?? ""}
              onChange={(e) => updateAV({ crewNotes: e.target.value })}
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* 6. Logistiikka, sähkö, turvallisuus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-gray-400" />
            Logistiikka ja tekniset vaatimukset
          </CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-gray-600 flex items-center gap-1.5">
              <Truck className="h-3 w-3" /> Logistiikka
            </label>
            <Textarea
              placeholder="Lastauslaituri, kaluston kuljetus, varastointi tapahtumapaikalla..."
              value={av.logisticsNotes ?? ""}
              onChange={(e) => updateAV({ logisticsNotes: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-gray-600 flex items-center gap-1.5">
              <Zap className="h-3 w-3" /> Sähkövaatimukset
            </label>
            <Textarea
              placeholder="Tehontarve, pistoketyypit, sähköjakelun sijainti..."
              value={av.powerRequirements ?? ""}
              onChange={(e) => updateAV({ powerRequirements: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-gray-600 flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" /> Turvallisuus
            </label>
            <Textarea
              placeholder="Ripustuskuormat, kantavuudet, hätäpoistumistiet..."
              value={av.safetyNotes ?? ""}
              onChange={(e) => updateAV({ safetyNotes: e.target.value })}
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* 7. Tekninen kokonaissuunnitelma */}
      <Card>
        <CardHeader><CardTitle>Tekninen kokonaissuunnitelma</CardTitle></CardHeader>
        <Textarea
          placeholder="Vapaamuotoinen tekninen suunnitelma: signaalireitit, ripustukset, sisältöjen vaatimukset, erityishuomiot..."
          value={av.technicalPlan ?? ""}
          onChange={(e) => updateAV({ technicalPlan: e.target.value })}
          rows={5}
        />
      </Card>

      {/* Lähetä */}
      {av.status === "kumppanilla" && (
        <Button className="w-full gap-2" size="lg" onClick={sendPlan}>
          <Send className="h-4 w-4" />
          Lähetä suunnitelma myyjälle
        </Button>
      )}

      {(av.status === "vastattu" || av.status === "valmis") && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <p className="text-[13px] font-semibold text-emerald-800">Suunnitelma lähetetty myyjälle</p>
        </div>
      )}

      <SectionChat sectionKey="av" />
    </div>
  )
}
