import { createContext, useContext, useState, useCallback } from "react"
import type { ReactNode } from "react"

export interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  initials: string
  color: string
  permission: "view" | "edit"
  sections: string[]
  seeSchedule: boolean
}

export const SECTION_LABEL_TO_KEY: Record<string, string> = {
  "Catering": "catering",
  "Tila & optioasetukset": "tilat",
  "AV / tekniikka": "av",
  "Aikataulut": "aikataulu",
  "Kaikki keskustelut": "keskustelut",
  "Lisäpalvelut": "lisapalvelut",
}

export const SECTION_KEY_TO_LABEL: Record<string, string> = {
  catering: "Catering",
  tilat: "Tila & optioasetukset",
  av: "AV / tekniikka",
  aikataulu: "Aikataulut",
  keskustelut: "Kaikki keskustelut",
  lisapalvelut: "Lisäpalvelut",
}

interface TeamContextValue {
  members: TeamMember[]
  addMember: (member: Omit<TeamMember, "id">) => void
  updateMember: (id: string, updates: Partial<TeamMember>) => void
  removeMember: (id: string) => void
  getMembersForSection: (sectionKey: string) => TeamMember[]
  getMemberSectionKeys: (memberId: string) => string[]
}

const TeamContext = createContext<TeamContextValue | null>(null)

export function TeamProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "partner-catering",
      name: "Mauno Catering",
      email: "info@maunocatering.fi",
      role: "Catering",
      initials: "MC",
      color: "#22c55e",
      permission: "edit",
      sections: ["Catering"],
      seeSchedule: true,
    },
    {
      id: "partner-av",
      name: "Rajupaja Oy",
      email: "info@rajupaja.fi",
      role: "AV-tuotanto",
      initials: "RP",
      color: "#8b5cf6",
      permission: "edit",
      sections: ["AV / tekniikka"],
      seeSchedule: true,
    },
  ])

  const addMember = useCallback((member: Omit<TeamMember, "id">) => {
    const id = `tm-${Date.now()}`
    setMembers((prev) => [...prev, { ...member, id }])
  }, [])

  const updateMember = useCallback((id: string, updates: Partial<TeamMember>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)))
  }, [])

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const getMembersForSection = useCallback(
    (sectionKey: string) => {
      return members.filter((m) =>
        m.sections.some((s) => SECTION_LABEL_TO_KEY[s] === sectionKey)
      )
    },
    [members]
  )

  const getMemberSectionKeys = useCallback(
    (memberId: string) => {
      const member = members.find((m) => m.id === memberId)
      if (!member) return []
      return member.sections
        .map((s) => SECTION_LABEL_TO_KEY[s])
        .filter(Boolean)
    },
    [members]
  )

  return (
    <TeamContext.Provider value={{ members, addMember, updateMember, removeMember, getMembersForSection, getMemberSectionKeys }}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const ctx = useContext(TeamContext)
  if (!ctx) throw new Error("useTeam must be used within TeamProvider")
  return ctx
}
