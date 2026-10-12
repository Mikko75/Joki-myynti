import { useNavigate } from 'react-router-dom'
import {
  CirclePlus,
  SlidersHorizontal,
  User,
  MoreHorizontal,
  ChevronDown,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { useState } from 'react'
import { useMode } from '@/context/ModeContext'
import { useWorkOrders } from '@/context/WorkOrderContext'
import NewLeadPage from './NewLeadPage'
import type { NewLeadFormData } from './NewLeadPage'
import type { WorkOrder, EventSource, ScheduleItem } from '@/data/types'

function parseScheduleNotes(notes: string): ScheduleItem[] {
  if (!notes.trim()) return []
  return notes.split("\n").map((line, i) => {
    const match = line.trim().match(/^(\d{1,2}[:.]\d{2})\s*[-–]?\s*(.+)/)
    if (!match) return null
    const time = match[1].replace(".", ":")
    const title = match[2].trim()
    return {
      id: `si-client-${Date.now()}-${i}`,
      type: "ohjelma" as const,
      title,
      startTime: time,
      endTime: time,
      spaceName: "",
      status: "luonnos" as const,
      sourceLabel: "Asiakas",
    }
  }).filter(Boolean) as ScheduleItem[]
}
import { CheckCircle2 } from 'lucide-react'

const sourceMap: Record<string, EventSource> = {
  "web-lomake": "web",
  "sahkoposti": "sahkoposti",
  "puhelin": "puhelin",
  "chat": "web",
  "muu": "web",
}

export default function KanbanPage() {
  const navigate = useNavigate()
  const { mode } = useMode()
  const { addWorkOrder } = useWorkOrders()

  const [clientSent, setClientSent] = useState(false)

  if (mode === "client") {
    if (clientSent) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-md">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Kiitos yhteydenotostasi!</h1>
            <p className="text-gray-500 mt-2">Olemme vastaanottaneet tapahtumapyyntösi. Myyjämme on sinuun yhteydessä mahdollisimman pian.</p>
            <button
              onClick={() => setClientSent(false)}
              className="mt-6 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Lähetä uusi pyyntö
            </button>
          </div>
        </div>
      )
    }

    function handleClientSubmit(data: NewLeadFormData) {
      const id = `wo-${Date.now()}`
      const newWO: WorkOrder = {
        id,
        number: `WO-${1060 + Math.floor(Math.random() * 100)}`,
        customerName: data.contactPerson || "Uusi asiakas",
        customerCompany: data.company || "Uusi yritys",
        customerEmail: data.email || undefined,
        customerPhone: data.phone || undefined,
        eventType: data.eventType || data.eventName || "Tapahtuma",
        status: "uusi",
        participantEstimate: parseInt(data.participantEstimate) || 0,
        source: sourceMap[data.source] ?? "web",
        offerPhase: "optio",
        currentOfferVersion: 0,
        changeRound: 0,
        nextStep: "Tarvekartoitus",
        sectionStatuses: { tila: "ei_aloitettu", catering: "ei_aloitettu", av: "ei_aloitettu" },
        participants: [],
        eventName: data.eventName || undefined,
        eventDescription: data.eventDescription || undefined,
        needsCatering: data.needsCatering || undefined,
        needsAV: data.needsAV || undefined,
        accessibilityNeeds: data.dietaryNeeds || undefined,
        seatingStyle: (data.seatingStyle as WorkOrder["seatingStyle"]) || undefined,
        budgetRange: (data.budgetRange as WorkOrder["budgetRange"]) || undefined,
        vipGuests: data.vipGuests || undefined,
        eventDays: [
          ...(data.date ? [{
            id: `ed-${Date.now()}`,
            date: data.date,
            label: data.eventName || "Tapahtuma",
            eventType: data.eventType || "Tapahtuma",
            bookingStart: data.time || "09:00",
            bookingEnd: "17:00",
            programStart: data.time || "09:00",
            programEnd: "17:00",
            doorsOpen: data.time || "09:00",
            guestsLeave: "17:00",
            spaces: [],
            scheduleItems: parseScheduleNotes(data.scheduleNotes ?? ""),
          }] : []),
          ...(data.extraDates ?? []).filter(Boolean).map((d, i) => ({
            id: `ed-${Date.now()}-${i + 1}`,
            date: d,
            label: `Päivä ${i + 2}`,
            eventType: data.eventType || "Tapahtuma",
            bookingStart: data.time || "09:00",
            bookingEnd: "17:00",
            programStart: data.time || "09:00",
            programEnd: "17:00",
            doorsOpen: data.time || "09:00",
            guestsLeave: "17:00",
            spaces: [],
            scheduleItems: [],
          })),
        ],
      }
      addWorkOrder(newWO)
      setClientSent(true)
    }

    return <NewLeadPage onSubmit={handleClientSubmit} />
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900">Työmääräimet</h1>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button className="rounded-lg" onClick={() => navigate('/uusi-liidi')}>
          <CirclePlus className="h-4 w-4" />
          Uusi työmääräin
        </Button>
        <Button variant="outline" className="rounded-lg">
          <SlidersHorizontal className="h-4 w-4" />
          Suodattimet
        </Button>
        <Button variant="outline" className="rounded-lg">
          <User className="h-4 w-4" />
          Näytä omat
        </Button>
        <Button variant="outline" size="icon" className="rounded-lg">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="rounded-lg text-gray-600">
          Kaikki tilat
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
        <Button variant="outline" size="sm" className="rounded-lg text-gray-600">
          Kaikki myyjät
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
        <Button variant="outline" size="sm" className="rounded-lg text-gray-600">
          Kaikki lähteet
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
        <Button variant="outline" size="sm" className="rounded-lg text-gray-600">
          Kaikki päivämäärät
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>

        <div className="ml-auto relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Etsi työmääräimistä..."
            className="pl-9 w-64 rounded-lg"
          />
        </div>
      </div>

      <div className="mt-6">
        <KanbanBoard />
      </div>

      <div className="mt-4 flex items-center gap-5 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Valmis
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
          Käynnissä
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
          Ei aloitettu
        </span>
      </div>
    </div>
  )
}
