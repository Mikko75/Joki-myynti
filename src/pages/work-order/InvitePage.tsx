import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ReactNode } from "react"
import { ArrowLeft, Plus, Mail, Users, Send, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useTeam } from "@/context/TeamContext"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { cn } from "@/lib/utils"

interface InvitePerson {
  name: string
  email: string
  role: string
  initials: string
  color: string
}

const SUGGESTED_PEOPLE: (InvitePerson & { id: string })[] = [
  { id: "s1", name: "Anna Korhonen", role: "Catering", email: "anna@catering.fi", initials: "AK", color: "#22c55e" },
  { id: "s2", name: "Petri Hämäläinen", role: "AV kumppani", email: "petri@av.fi", initials: "PH", color: "#8b5cf6" },
  { id: "s3", name: "Matti Virtanen", role: "Tapahtuma koordinaattori", email: "matti@events.fi", initials: "MV", color: "#3b82f6" },
]

const SECTION_OPTIONS = [
  { key: "catering", label: "Catering", defaultChecked: false },
  { key: "av", label: "AV / tekniikka", defaultChecked: false },
  { key: "aikataulu", label: "Aikataulut", defaultChecked: false },
  { key: "keskustelut", label: "Kaikki keskustelut", defaultChecked: false },
  { key: "lisapalvelut", label: "Lisäpalvelut", defaultChecked: false },
  { key: "tilat", label: "Tila & optioasetukset", defaultChecked: false },
]

function Avatar({ initials, color, size = 40 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-semibold shrink-0"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  )
}

export default function InvitePage() {
  const navigate = useNavigate()
  const { addMember } = useTeam()
  const { workOrder } = useCurrentWorkOrder()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [tab, setTab] = useState<"email" | "list">("email")
  const [emailInput, setEmailInput] = useState("")
  const [selectedPerson, setSelectedPerson] = useState<InvitePerson | null>(null)
  const [permission, setPermission] = useState<"view" | "edit">("edit")
  const [sections, setSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SECTION_OPTIONS.map((s) => [s.key, s.defaultChecked]))
  )
  const [seeSchedule, setSeeSchedule] = useState(true)

  if (!workOrder) return <p className="text-gray-500">Työmääräintä ei löytynyt.</p>

  function selectFromList(person: InvitePerson) {
    setSelectedPerson(person)
    setStep(2)
  }

  function addByEmail() {
    const email = emailInput.trim()
    if (!email) return
    const namePart = email.split("@")[0] ?? ""
    const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1)
    const initials = capitalized.slice(0, 2).toUpperCase()
    setSelectedPerson({ name: capitalized, email, role: "", initials, color: "#6b7280" })
    setStep(2)
  }

  function toggleSection(key: string) {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleSendInvite() {
    if (!selectedPerson) return
    const selectedSections = SECTION_OPTIONS.filter((s) => sections[s.key]).map((s) => s.label)
    addMember({
      ...selectedPerson,
      permission,
      sections: selectedSections,
      seeSchedule,
    })
    navigate(-1)
  }

  const firstName = selectedPerson?.name.split(" ")[0] ?? ""
  const selectedSectionLabels = SECTION_OPTIONS.filter((s) => sections[s.key]).map((s) => s.label)

  return (
    <div className="max-w-md">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Takaisin
      </button>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {step === 1 && (
          <div className="flex flex-col">
            <div className="px-6 pt-6 pb-0">
              <h1 className="text-base font-semibold text-gray-900">Lisää osallistuja</h1>
              <p className="text-[13px] text-gray-500 mt-1">Kutsu uusi henkilö tiimiin sähköpostilla tai valitse listalta.</p>
            </div>

            <div className="flex border-b border-gray-200 mx-6 mt-4">
              <button type="button" className={cn("flex items-center gap-1.5 px-3 pb-2.5 text-[13px] font-medium border-b-2 transition-colors", tab === "email" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700")} onClick={() => setTab("email")}>
                <Mail className="h-3.5 w-3.5" /> Kutsu sähköpostilla
              </button>
              <button type="button" className={cn("flex items-center gap-1.5 px-3 pb-2.5 text-[13px] font-medium border-b-2 transition-colors", tab === "list" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700")} onClick={() => setTab("list")}>
                <Users className="h-3.5 w-3.5" /> Valitse listalta
              </button>
            </div>

            <div className="px-6 py-5">
              {tab === "email" ? (
                <div className="flex flex-col gap-3">
                  <label className="text-[13px] font-medium text-gray-700">Sähköposti</label>
                  <div className="flex gap-2">
                    <Input type="email" placeholder="nimi@yritys.fi" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addByEmail() }} className="flex-1" />
                    <Button size="sm" onClick={addByEmail} disabled={!emailInput.trim()}>Lisää</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-[13px] font-medium text-gray-700">Suositellut henkilöt</p>
                  <div className="flex flex-col gap-1">
                    {SUGGESTED_PEOPLE.map((person) => (
                      <div key={person.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 transition-colors">
                        <Avatar initials={person.initials} color={person.color} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-gray-900 truncate">{person.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{person.role}</p>
                        </div>
                        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => selectFromList(person)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 pb-5">
              <Button variant="outline" onClick={() => navigate(-1)}>Peruuta</Button>
            </div>
          </div>
        )}

        {step === 2 && selectedPerson && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-6 pt-5">
              <button type="button" className="flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-700" onClick={() => setStep(1)}>
                <ArrowLeft className="h-3.5 w-3.5" /> Takaisin
              </button>
            </div>

            <div className="flex items-center gap-3 px-6 pt-4 pb-5">
              <Avatar initials={selectedPerson.initials} color={selectedPerson.color} />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 truncate">{selectedPerson.name}</p>
                <p className="text-[12px] text-gray-500 truncate">{selectedPerson.email}</p>
              </div>
            </div>

            <div className="px-6 pb-5 flex flex-col gap-5">
              <div className="flex flex-col gap-2.5">
                <p className="text-[13px] font-medium text-gray-700">Mitä {firstName} voi tehdä?</p>
                <PermissionCard selected={permission === "view"} onClick={() => setPermission("view")} title="Voi katsella" description="Näkee tiedot, mutta ei voi muokata." />
                <PermissionCard selected={permission === "edit"} onClick={() => setPermission("edit")} title="Voi muokata" description="Voi muokata sallittuja osioita ja tietoja." />
              </div>

              <div className="flex flex-col gap-2.5">
                <p className="text-[13px] font-medium text-gray-700">Mihin {firstName} pääsee?</p>
                <div className="flex flex-col gap-2">
                  {SECTION_OPTIONS.map((option) => (
                    <label key={option.key} className="flex items-center gap-2.5 cursor-pointer group">
                      <Checkbox checked={sections[option.key]} onCheckedChange={() => toggleSection(option.key)} />
                      <span className="text-[13px] text-gray-700 group-hover:text-gray-900">{option.label}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2.5 cursor-pointer group mt-1 pt-2 border-t border-gray-100">
                    <Checkbox checked={seeSchedule} onCheckedChange={() => setSeeSchedule(!seeSchedule)} />
                    <span className="text-[13px] text-gray-700 group-hover:text-gray-900">Näkee yhteisen aikataulun</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end px-6 pb-5">
              <Button onClick={() => setStep(3)}>Jatka</Button>
            </div>
          </div>
        )}

        {step === 3 && selectedPerson && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-6 pt-5">
              <button type="button" className="flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-700" onClick={() => setStep(2)}>
                <ArrowLeft className="h-3.5 w-3.5" /> Takaisin
              </button>
            </div>

            <div className="px-6 pt-4 pb-4">
              <h2 className="text-base font-semibold text-gray-900">Tarkista kutsu</h2>
            </div>

            <div className="mx-6 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <Avatar initials={selectedPerson.initials} color={selectedPerson.color} />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 truncate">{selectedPerson.name}</p>
                <p className="text-[12px] text-gray-500 truncate">{selectedPerson.email}</p>
              </div>
            </div>

            <div className="mx-6 mt-4 flex flex-col gap-3">
              <SummaryRow label="Oikeus" value={permission === "edit" ? "Voi muokata" : "Voi katsella"} />
              <SummaryRow label="Pääsy" value={selectedSectionLabels.join(", ") || "Ei valittuja"} />
              {seeSchedule && <SummaryRow label="Lisäksi" value="Näkee yhteisen aikataulun" />}
            </div>

            <div className="mx-6 mt-5 flex gap-2.5 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[12px] text-blue-700 leading-relaxed">
                {selectedPerson.name} saa sähköpostitse kutsun ja voi liittyä tiimiin.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-5">
              <Button variant="outline" onClick={() => navigate(-1)}>Peruuta</Button>
              <Button onClick={handleSendInvite} className="gap-1.5">
                <Send className="h-3.5 w-3.5" /> Lähetä kutsu
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PermissionCard({ selected, onClick, title, description }: { selected: boolean; onClick: () => void; title: string; description: string }): ReactNode {
  return (
    <button type="button" className={cn("flex flex-col gap-0.5 rounded-lg border px-4 py-3 text-left transition-all", selected ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500" : "border-gray-200 bg-white hover:border-gray-300")} onClick={onClick}>
      <span className={cn("text-[13px] font-medium", selected ? "text-primary-700" : "text-gray-900")}>{title}</span>
      <span className={cn("text-[11px]", selected ? "text-primary-600" : "text-gray-500")}>{description}</span>
    </button>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }): ReactNode {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[12px] text-gray-500 w-16 shrink-0 pt-px">{label}</span>
      <span className="text-[13px] text-gray-900 font-medium">{value}</span>
    </div>
  )
}
