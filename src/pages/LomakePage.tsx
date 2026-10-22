import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"
import NewLeadPage from "./NewLeadPage"
import type { NewLeadFormData } from "./NewLeadPage"
import { useWorkOrders } from "@/context/WorkOrderContext"
import type { WorkOrder, EventSource, ScheduleItem, EventSpace } from "@/data/types"
import { spaces as spaceCatalog } from "@/data/mock"

function parseScheduleNotes(notes: string): ScheduleItem[] {
  if (!notes.trim()) return []
  return notes.split("\n").map((line, i) => {
    const match = line.trim().match(/^(\d{1,2}[:.]\d{2})\s*[-–]?\s*(.+)/)
    if (!match) return null
    const time = match[1].replace(".", ":")
    const title = match[2].trim()
    const isCatering = /kahvi|lounas|ruoka|illallinen|cocktail|catering|tarjoilu|aamiainen|buffet/i.test(title)
    return {
      id: `si-client-${Date.now()}-${i}`,
      type: isCatering ? "catering" as const : "ohjelma" as const,
      title, startTime: time, endTime: time, spaceName: "",
      status: "luonnos" as const, sourceLabel: "Asiakas",
    }
  }).filter(Boolean) as ScheduleItem[]
}

const sourceMap: Record<string, EventSource> = {
  "web": "web", "web-lomake": "web", "sahkoposti": "sahkoposti",
  "puhelin": "puhelin", "chat": "web", "muu": "web",
  "varausjarjestelma": "varausjarjestelma",
}

export default function LomakePage() {
  const { addWorkOrder } = useWorkOrders()
  const [sent, setSent] = useState(false)
  const [createdWO, setCreatedWO] = useState<{ number: string } | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const initialSpace = searchParams.get("tila") ?? ""
  const initialSource = searchParams.get("source") === "varaus" ? "varausjarjestelma" : "web"
  const initialCompany = searchParams.get("yritys") ?? ""
  const initialPerson = searchParams.get("henkilo") ?? ""

  const isFromBooking = initialSource === "varausjarjestelma"

  function handleSubmit(data: NewLeadFormData) {
    // Luetaan tila suoraan URL-parametreista koska useState ei päivity kun demo-nappi muuttaa URL:n
    const selectedSpaceFromUrl = searchParams.get("tila") ?? data.selectedSpace ?? ""
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
      sectionStatuses: {
        tila: selectedSpaceFromUrl ? "kaynnissa" : "ei_aloitettu",
        catering: "ei_aloitettu",
        av: "ei_aloitettu",
      },
      participants: [],
      eventName: data.eventName || undefined,
      eventDescription: data.eventDescription || undefined,
      needsCatering: data.needsCatering || undefined,
      needsAV: data.needsAV || undefined,
      additionalNotes: data.avDescription || undefined,
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
          bookingStart: "09:00", bookingEnd: "17:00",
          programStart: "09:00", programEnd: "17:00",
          doorsOpen: "09:00", guestsLeave: "17:00",
          spaces: selectedSpaceFromUrl ? (() => {
            const found = spaceCatalog.find((s) => s.name === selectedSpaceFromUrl)
            if (!found) return []
            const es: EventSpace = {
              spaceId: found.id,
              spaceName: found.name,
              role: "Pääsali",
              status: "optio" as const,
              price: found.pricePerDay,
            }
            return [es]
          })() : [],
          scheduleItems: parseScheduleNotes(data.scheduleNotes ?? ""),
        }] : []),
      ],
    }
    addWorkOrder(newWO)
    setCreatedWO({ number: newWO.number })
    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Kiitos yhteydenotostasi!</h1>
          <p className="text-gray-500 mt-3 leading-relaxed">
            Olemme vastaanottaneet tapahtumapyyntösi. Myyjämme ottaa sinuun yhteyttä mahdollisimman pian.
          </p>
          {createdWO && (
            <p className="mt-4 text-[12px] text-gray-400">
              Viitenumero: <span className="font-mono font-medium text-gray-600">{createdWO.number}</span>
            </p>
          )}
          <button
            onClick={() => setSent(false)}
            className="mt-8 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Lähetä uusi pyyntö
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="JOKI" className="h-12 w-auto mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900">
            {isFromBooking ? "Vahvista tilavaraus" : "Tapahtumapyyntö"}
          </h1>
          <p className="text-gray-500 mt-2">
            {isFromBooking
              ? "Täydennä tapahtumasi tiedot ja lähetä pyyntö. Palaamme sinulle pian."
              : "Täytä lomake ja me olemme sinuun yhteydessä."}
          </p>
        </div>

        {/* Demo-napit — vain kehityskäytössä */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setSearchParams({ tila: "Cave-teatteri", source: "varaus", yritys: "Nordic Digital Oy", henkilo: "Mikko Lesonen" })}
            className="text-[11px] rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            Demo: Varausjärjestelmä (Cave-teatteri)
          </button>
          <button
            onClick={() => setSearchParams({})}
            className="text-[11px] rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Demo: Tyhjä lomake (web)
          </button>
        </div>

        <NewLeadPage
          onSubmit={handleSubmit}
          isLomake={true}
          initialData={{
            source: initialSource,
            selectedSpace: initialSpace,
            company: initialCompany,
            contactPerson: initialPerson,
          }}
        />
      </div>
    </div>
  )
}
