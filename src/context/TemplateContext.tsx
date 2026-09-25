import { createContext, useContext, useState, useCallback } from "react"
import type { ReactNode } from "react"
import type { EventTemplate } from "@/data/types"

const defaultTemplates: EventTemplate[] = [
  {
    id: "tpl-seminaari",
    name: "Seminaaripäivä",
    description: "Koko päivän seminaari keynote-puhujilla, workshopeilla ja verkostoitumisella",
    color: "#3b82f6",
    eventType: "Seminaaripäivä",
    eventNature: "yritys_sisainen",
    seatingStyle: "teatteri",
    participantEstimate: 200,
    needsBreakoutRooms: true,
    breakoutRoomCount: 2,
    needsCatering: "yes",
    needsAV: "yes",
    budgetRange: "15000_50000",
    scheduleTemplate: [
      { title: "Ovien avaus ja aamukahvi", startTime: "08:00", endTime: "09:00", type: "catering" },
      { title: "Avaus ja keynote", startTime: "09:00", endTime: "10:30", type: "ohjelma" },
      { title: "Tauko", startTime: "10:30", endTime: "11:00", type: "ajankohta" },
      { title: "Workshop-sessiot", startTime: "11:00", endTime: "12:30", type: "ohjelma" },
      { title: "Lounas", startTime: "12:30", endTime: "13:30", type: "catering" },
      { title: "Iltapäivän ohjelma", startTime: "13:30", endTime: "15:30", type: "ohjelma" },
      { title: "Iltapäiväkahvi ja yhteenveto", startTime: "15:30", endTime: "16:30", type: "catering" },
    ],
    suggestedSpaces: ["Cave-teatteri", "Aula", "Neuvotteluhuone 2.krs"],
  },
  {
    id: "tpl-henkilosto",
    name: "Henkilöstötilaisuus",
    description: "Iltatilaisuus tai virkistyspäivä henkilöstölle, vapaamuotoinen ohjelma",
    color: "#22c55e",
    eventType: "Henkilöstötilaisuus",
    eventNature: "yritys_sisainen",
    seatingStyle: "cocktail",
    participantEstimate: 100,
    needsBreakoutRooms: false,
    needsCatering: "yes",
    needsAV: "no",
    budgetRange: "5000_15000",
    scheduleTemplate: [
      { title: "Vastaanotto ja cocktail", startTime: "17:00", endTime: "18:00", type: "catering" },
      { title: "Puheet ja ohjelma", startTime: "18:00", endTime: "19:00", type: "ohjelma" },
      { title: "Illallinen", startTime: "19:00", endTime: "21:00", type: "catering" },
      { title: "Vapaa seurustelu", startTime: "21:00", endTime: "23:00", type: "ajankohta" },
    ],
    suggestedSpaces: ["Aula"],
  },
  {
    id: "tpl-kokous",
    name: "Johtoryhmän kokous",
    description: "Puolen päivän tai koko päivän kokous pienelle ryhmälle",
    color: "#8b5cf6",
    eventType: "Johtoryhmän kokous",
    eventNature: "yritys_sisainen",
    seatingStyle: "u_muoto",
    participantEstimate: 20,
    needsBreakoutRooms: false,
    needsCatering: "yes",
    needsAV: "yes",
    budgetRange: "alle_5000",
    scheduleTemplate: [
      { title: "Aamukahvi", startTime: "08:30", endTime: "09:00", type: "catering" },
      { title: "Kokous osa 1", startTime: "09:00", endTime: "11:00", type: "ohjelma" },
      { title: "Tauko", startTime: "11:00", endTime: "11:15", type: "ajankohta" },
      { title: "Kokous osa 2", startTime: "11:15", endTime: "12:30", type: "ohjelma" },
      { title: "Lounas", startTime: "12:30", endTime: "13:30", type: "catering" },
    ],
    suggestedSpaces: ["Neuvotteluhuone 2.krs"],
  },
  {
    id: "tpl-juhla",
    name: "Juhlatilaisuus",
    description: "Gaalaillallinen, palkintojuhla tai muu juhlatilaisuus istuvalla illallisella",
    color: "#f59e0b",
    eventType: "Juhlatilaisuus",
    eventNature: "yksityinen",
    seatingStyle: "banketti",
    participantEstimate: 150,
    needsBreakoutRooms: false,
    needsCatering: "yes",
    needsAV: "yes",
    budgetRange: "15000_50000",
    scheduleTemplate: [
      { title: "Vastaanotto", startTime: "17:00", endTime: "18:00", type: "catering" },
      { title: "Tervetulosanat", startTime: "18:00", endTime: "18:15", type: "ohjelma" },
      { title: "Illallinen", startTime: "18:15", endTime: "20:30", type: "catering" },
      { title: "Ohjelma ja palkinnot", startTime: "20:30", endTime: "21:30", type: "ohjelma" },
      { title: "Jatkot ja musiikki", startTime: "21:30", endTime: "00:00", type: "ajankohta" },
    ],
    suggestedSpaces: ["Cave-teatteri", "Aula"],
  },
]

interface TemplateContextValue {
  templates: EventTemplate[]
  addTemplate: (template: EventTemplate) => void
  removeTemplate: (id: string) => void
}

const TemplateContext = createContext<TemplateContextValue | null>(null)

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<EventTemplate[]>(defaultTemplates)

  const addTemplate = useCallback((template: EventTemplate) => {
    setTemplates((prev) => [...prev, template])
  }, [])

  const removeTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <TemplateContext.Provider value={{ templates, addTemplate, removeTemplate }}>
      {children}
    </TemplateContext.Provider>
  )
}

export function useTemplates() {
  const ctx = useContext(TemplateContext)
  if (!ctx) throw new Error("useTemplates must be used within TemplateProvider")
  return ctx
}
