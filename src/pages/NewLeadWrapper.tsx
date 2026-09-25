import { useNavigate } from "react-router-dom"
import NewLeadPage from "./NewLeadPage"
import type { NewLeadFormData } from "./NewLeadPage"
import { useWorkOrders } from "@/context/WorkOrderContext"
import type { WorkOrder, EventSource } from "@/data/types"

const sourceMap: Record<string, EventSource> = {
  "web-lomake": "web",
  "sahkoposti": "sahkoposti",
  "puhelin": "puhelin",
  "chat": "web",
  "muu": "web",
}

export default function NewLeadWrapper() {
  const navigate = useNavigate()
  const { addWorkOrder } = useWorkOrders()

  function handleSubmit(data: NewLeadFormData) {
    const id = `wo-${Date.now()}`
    const initials = data.contactPerson
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2) || "XX"

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
        tila: "ei_aloitettu",
        catering: "ei_aloitettu",
        av: "ei_aloitettu",
      },
      participants: [
        {
          id: `p-${Date.now()}`,
          name: "Mikko Lesonen",
          role: "Myyjä",
          initials: "ML",
          color: "#3b82f6",
        },
      ],
      eventName: data.eventName || undefined,
      eventDescription: data.eventDescription || undefined,
      needsCatering: data.needsCatering || undefined,
      needsAV: data.needsAV || undefined,
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
          scheduleItems: [],
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
    navigate(`/tyomarain/${id}/yleiskuva`)
  }

  return <NewLeadPage onSubmit={handleSubmit} onCancel={() => navigate("/")} />
}
