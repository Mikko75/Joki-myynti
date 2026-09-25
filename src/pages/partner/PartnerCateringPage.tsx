import { useState } from "react"
import type { FormEvent } from "react"
import { UtensilsCrossed, Plus, Trash2, Clock, MapPin, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog"
import { SectionChat } from "@/components/common/SectionChat"
import { useParams } from "react-router-dom"
import { useWorkOrders } from "@/context/WorkOrderContext"
import type { CateringMoment } from "@/data/types"

export default function PartnerCateringPage() {
  const { id } = useParams<{ id: string }>()
  const woId = id ?? ""
  const { getWorkOrder, getCateringPlan, updateCateringPlan, addCateringMoment, removeCateringMoment, addScheduleItem } = useWorkOrders()
  const workOrder = getWorkOrder(woId)
  const plan = getCateringPlan(woId)

  const [addOpen, setAddOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [space, setSpace] = useState("")

  const eventDay = workOrder?.eventDays[0]

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !start) return
    const moment: CateringMoment = {
      id: `cm-${Date.now()}`,
      title: title.trim(),
      startTime: start,
      endTime: end || start,
      spaceName: space,
      menuId: "",
      menuName: "",
      price: 0,
      status: "luonnos",
    }
    addCateringMoment(woId, moment)
    if (eventDay) {
      addScheduleItem(woId, eventDay.id, {
        id: moment.id,
        type: "catering",
        title: moment.title,
        startTime: moment.startTime,
        endTime: moment.endTime,
        spaceName: moment.spaceName,
        status: "luonnos",
        sourceLabel: "Catering",
      })
    }
    setTitle("")
    setStart("")
    setEnd("")
    setSpace("")
    setAddOpen(false)
  }

  if (!workOrder) return <p className="text-gray-500">Ei löytynyt.</p>

  const allSpaces = workOrder.eventDays.flatMap((d) => d.spaces)
  const kattaus = plan.notes.includes("kattaus:") ? plan.notes.split("kattaus:")[1]?.split("\n")[0] ?? "" : ""

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Ruoka & Juoma (Catering)</h1>
        <Badge variant={plan.moments.length > 0 ? "blue" : "outline"}>
          {plan.moments.length > 0 ? "Luonnos" : "Ei aloitettu"}
        </Badge>
      </div>

      {/* Myyjän täyttämät tiedot — read-only for partner */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h3 className="text-[14px] font-semibold text-gray-900">Tapahtuman tiedot</h3>
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[13px]">
          <div className="flex justify-between">
            <span className="text-gray-500">Asiakas</span>
            <span className="font-medium text-gray-900">{workOrder.customerCompany}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tapahtumatyyppi</span>
            <span className="font-medium text-gray-900">{workOrder.eventType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Päivämäärä</span>
            <span className="font-medium text-gray-900">{eventDay?.date ?? "–"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Aikataulu</span>
            <span className="font-medium text-gray-900">{eventDay ? `${eventDay.bookingStart}–${eventDay.bookingEnd}` : "–"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Henkilömäärä</span>
            <span className="font-medium text-gray-900">{plan.participantCount || workOrder.participantEstimate} hlö</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tilat</span>
            <span className="font-medium text-gray-900">{allSpaces.length > 0 ? allSpaces.map((s) => s.spaceName).join(", ") : "–"}</span>
          </div>
        </div>
      </div>

      {/* Mitä kumppanin pitää tietää — myyjän täyttämät, read-only */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-6 space-y-4">
        <h3 className="text-[14px] font-semibold text-gray-900">Mitä kumppanin pitää tietää</h3>
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[13px]">
          <div className="flex justify-between">
            <span className="text-gray-500">Erityisruokavaliot</span>
            <span className="font-medium text-gray-900">{plan.dietaryNeeds || "–"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tarjoilualue / sijainti</span>
            <span className="font-medium text-gray-900">{plan.servingArea || "–"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tarjoilupisteiden määrä</span>
            <span className="font-medium text-gray-900">{plan.servingPoints || "–"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Henkilökunta</span>
            <span className="font-medium text-gray-900">{plan.staffNeeded || "–"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Kattaus</span>
            <span className="font-medium text-gray-900">{kattaus || "–"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Catering-toimittaja</span>
            <span className="font-medium text-gray-900">{plan.servingArea || "–"}</span>
          </div>
        </div>
        {plan.notes && !plan.notes.startsWith("kattaus:") && (
          <div className="border-t border-gray-100 pt-3 mt-2">
            <p className="text-[12px] text-gray-500 mb-1">Lisätiedot myyjältä</p>
            <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{plan.notes.replace(/kattaus:.*(\n|$)/, "").trim()}</p>
          </div>
        )}
      </div>

      {/* Catering-kumppanin omat kentät */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-gray-700">Erityisruokavaliot</label>
          <Input
            placeholder="Esim. kasvis, gluteeniton"
            value={plan.dietaryNeeds}
            onChange={(e) => updateCateringPlan(woId, { dietaryNeeds: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-gray-700">Tarjoilualue</label>
          <Input
            placeholder="Esim. Päätalo, Aula"
            value={plan.servingArea}
            onChange={(e) => updateCateringPlan(woId, { servingArea: e.target.value })}
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <label className="text-[13px] font-medium text-gray-700">Lisätiedot</label>
          <Textarea
            placeholder="Huomioita tai muistiinpanoja..."
            value={plan.notes}
            onChange={(e) => updateCateringPlan(woId, { notes: e.target.value })}
          />
        </div>
      </div>

      {/* Moments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-gray-900">Tarjoiluhetket</h2>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Lisää tarjoilu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <form onSubmit={handleAdd}>
                <DialogHeader>
                  <DialogTitle>Lisää tarjoilu</DialogTitle>
                  <DialogDescription>Lisää uusi tarjoiluhetki aikatauluun.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-gray-700">Otsikko</label>
                    <Input placeholder="Esim. Lounas" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-gray-700">Alkaa</label>
                      <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-gray-700">Päättyy</label>
                      <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-gray-700">Tila</label>
                    <Input placeholder="Esim. Aula" value={space} onChange={(e) => setSpace(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">Peruuta</Button>
                  </DialogClose>
                  <Button type="submit">Lisää</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {plan.moments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-[13px] text-gray-400">
            Ei vielä tarjoiluhetkiä.
          </div>
        ) : (
          <div className="space-y-2.5">
            {plan.moments.map((m) => (
              <div key={m.id} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 text-[13px] font-mono text-gray-600 shrink-0">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  {m.startTime}–{m.endTime}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900">{m.title}</p>
                  {m.spaceName && (
                    <p className="text-[12px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {m.spaceName}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="shrink-0">Luonnos</Badge>
                <button
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => removeCateringMoment(woId, m.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send proposal to seller */}
      {plan.moments.length > 0 && plan.status !== "vastattu" && plan.status !== "valmis" && (
        <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 p-5">
          <div>
            <p className="text-[14px] font-semibold text-gray-900">Lähetä ehdotus myyjälle</p>
            <p className="text-[12px] text-gray-500 mt-0.5">Myyjä tarkistaa ehdotuksen ja lisää sen tarjoukseen.</p>
          </div>
          <Button onClick={() => updateCateringPlan(woId, { status: "vastattu" })}>
            Lähetä ehdotus
          </Button>
        </div>
      )}

      {plan.status === "vastattu" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-[14px] font-semibold text-gray-900">Ehdotus lähetetty</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Myyjä käsittelee ehdotustasi.</p>
        </div>
      )}

      <SectionChat sectionKey="catering" />
    </div>
  )
}
