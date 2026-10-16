import { useNavigate } from 'react-router-dom'
import {
  CirclePlus,
  SlidersHorizontal,
  User,
  MoreHorizontal,
  ChevronDown,
  Search,
  ArrowRight,
  UtensilsCrossed,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { useState } from 'react'
import { useMode } from '@/context/ModeContext'
import { useWorkOrders } from '@/context/WorkOrderContext'
import { useTeam } from '@/context/TeamContext'
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
    const isCatering = /kahvi|lounas|ruoka|illallinen|cocktail|catering|tarjoilu|aamiainen|buffet|dinner|lunch|breakfast/i.test(title)
    return {
      id: `si-client-${Date.now()}-${i}`,
      type: isCatering ? "catering" as const : "ohjelma" as const,
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

const STATUS_LABELS = {
  uusi: "Uusi liidi",
  tyonalla: "Työn alla",
  asiakkaalla: "Asiakkaalla",
  vahvistettu: "Vahvistettu",
  ei_toteudu: "Ei toteudu",
}

const SOURCE_LABELS = {
  web: "Web",
  sahkoposti: "Sähköposti",
  puhelin: "Puhelin",
}

const CATERING_STATUS_META: Record<string, { label: string; badge: string; dot: string }> = {
  kumppanilla: { label: "Odottaa vastaustasi", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-400" },
  luonnos:     { label: "Luonnos kesken",       badge: "bg-gray-100 text-gray-600",   dot: "bg-gray-400" },
  vastattu:    { label: "Lähetetty myyjälle",   badge: "bg-blue-100 text-blue-700",   dot: "bg-blue-400" },
  valmis:      { label: "Valittu",              badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
}

const STATUS_ORDER: Record<string, number> = { kumppanilla: 0, luonnos: 1, vastattu: 2, valmis: 3 }

export default function KanbanPage() {
  const navigate = useNavigate()
  const { mode } = useMode()
  const { addWorkOrder, workOrders, getCateringPlan } = useWorkOrders()
  const { members } = useTeam()

  const [clientSent, setClientSent] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sourceFilter, setSourceFilter] = useState<string | null>(null)
  const [searchText, setSearchText] = useState("")
  const [statusOpen, setStatusOpen] = useState(false)
  const [sourceOpen, setSourceOpen] = useState(false)

  // ── Kumppanin postilaatikko ──────────────────────────────────────
  if (mode.startsWith("partner-")) {
    const member = members.find((m) => m.id === mode)
    const isCatering = member?.role === "Catering"

    const myOrders = workOrders
      .map((wo) => ({ wo, plan: getCateringPlan(wo.id, mode) }))
      .filter(({ plan }) => plan.status !== "ei_aloitettu")
      .sort((a, b) => (STATUS_ORDER[a.plan.status] ?? 9) - (STATUS_ORDER[b.plan.status] ?? 9))

    return (
      <div className="p-6 lg:p-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <UtensilsCrossed className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{member?.name ?? mode}</h1>
            <p className="text-[13px] text-gray-500">Omat toimeksiannot</p>
          </div>
        </div>

        {myOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-[14px] font-medium text-gray-500">Ei avoimia toimeksiantoja</p>
            <p className="text-[12px] text-gray-400 mt-1">Uudet pyynnöt ilmestyvät tähän kun myyjä lähettää catering-briiffin.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myOrders.map(({ wo, plan }) => {
              const meta = CATERING_STATUS_META[plan.status] ?? CATERING_STATUS_META.luonnos
              const eventDate = wo.eventDays[0]?.date ?? "–"
              const route = isCatering ? "catering" : "av"
              return (
                <div
                  key={wo.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors cursor-pointer"
                  onClick={() => navigate(`/tyomarain/${wo.id}/${route}`)}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${meta.dot}`} />
                    <div>
                      <p className="text-[15px] font-semibold text-gray-900">{wo.eventName ?? wo.eventType}</p>
                      <p className="text-[12px] text-gray-500 mt-0.5">
                        {wo.customerCompany} · {eventDate} · {wo.participantEstimate} hlö
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`text-[11px] ${meta.badge}`}>{meta.label}</Badge>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

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

      {/* Toimintorivi */}
      <div className="mt-5 flex items-center gap-2">
        <Button className="rounded-lg" onClick={() => navigate('/uusi-liidi')}>
          <CirclePlus className="h-4 w-4" />
          Uusi työmääräin
        </Button>
      </div>

      {/* Filtteririvi — suoraan kanbantaulun yläpuolella */}
      <div className="mt-3 flex items-center gap-2">
        {/* Tila-filtteri */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className={`rounded-lg ${statusFilter ? "border-primary-400 text-primary-600 bg-primary-50" : "text-gray-600"}`}
            onClick={() => { setStatusOpen(!statusOpen); setSourceOpen(false) }}
          >
            {statusFilter ? STATUS_LABELS[statusFilter as keyof typeof STATUS_LABELS] : "Kaikki tilat"}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
          {statusOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 min-w-40 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
              <button className="block w-full px-3 py-1.5 text-left text-[13px] text-gray-600 hover:bg-gray-50" onClick={() => { setStatusFilter(null); setStatusOpen(false) }}>Kaikki tilat</button>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <button key={val} className={`block w-full px-3 py-1.5 text-left text-[13px] hover:bg-gray-50 ${statusFilter === val ? "text-primary-600 font-medium" : "text-gray-700"}`} onClick={() => { setStatusFilter(val); setStatusOpen(false) }}>{label}</button>
              ))}
            </div>
          )}
        </div>

        {/* Lähde-filtteri */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className={`rounded-lg ${sourceFilter ? "border-primary-400 text-primary-600 bg-primary-50" : "text-gray-600"}`}
            onClick={() => { setSourceOpen(!sourceOpen); setStatusOpen(false) }}
          >
            {sourceFilter ? SOURCE_LABELS[sourceFilter as keyof typeof SOURCE_LABELS] : "Kaikki lähteet"}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
          {sourceOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 min-w-36 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
              <button className="block w-full px-3 py-1.5 text-left text-[13px] text-gray-600 hover:bg-gray-50" onClick={() => { setSourceFilter(null); setSourceOpen(false) }}>Kaikki lähteet</button>
              {Object.entries(SOURCE_LABELS).map(([val, label]) => (
                <button key={val} className={`block w-full px-3 py-1.5 text-left text-[13px] hover:bg-gray-50 ${sourceFilter === val ? "text-primary-600 font-medium" : "text-gray-700"}`} onClick={() => { setSourceFilter(val); setSourceOpen(false) }}>{label}</button>
              ))}
            </div>
          )}
        </div>

        {/* Haku */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Etsi..."
            className="pl-9 w-48 rounded-lg"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* Nollaa filtterit */}
        {(statusFilter || sourceFilter || searchText) && (
          <button
            onClick={() => { setStatusFilter(null); setSourceFilter(null); setSearchText("") }}
            className="text-[12px] text-gray-400 hover:text-gray-600"
          >
            Tyhjennä
          </button>
        )}
      </div>

      <div className="mt-6">
        <KanbanBoard statusFilter={statusFilter} sourceFilter={sourceFilter} searchText={searchText} />
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
