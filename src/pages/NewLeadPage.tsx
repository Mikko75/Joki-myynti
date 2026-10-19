import { useState } from "react"
import type { ReactNode } from "react"
import {
  Plus,
  Save,
  X,
  Calendar,
  Search,
  HelpCircle,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Combobox } from "@/components/ui/combobox"
import type { ComboboxOption } from "@/components/ui/combobox"
import { InfoBanner } from "@/components/common/InfoBanner"
import { useTemplates } from "@/context/TemplateContext"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { useMode } from "@/context/ModeContext"
import { companyDirectory } from "@/data/mock"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────────────────

export interface NewLeadFormData {
  source: string
  selectedSpace?: string
  company: string
  contactPerson: string
  email: string
  phone: string
  eventName: string
  eventDescription: string
  date: string
  extraDates: string[]
  dateOpen: boolean
  time: string
  participantEstimate: string
  eventType: string
  duration: "single" | "multi"
  needsCatering: "yes" | "no" | "unknown"
  needsAV: "yes" | "no"
  responsible: string
  dietaryNeeds?: string
  seatingStyle?: string
  budgetRange?: string
  vipGuests?: string
  scheduleNotes?: string
  avDescription?: string
}

interface NewLeadPageProps {
  onSubmit?: (data: NewLeadFormData) => void
  onCancel?: () => void
  initialData?: Partial<NewLeadFormData>
  isLomake?: boolean
}

// ── Toggle group helper ────────────────────────────────────────────────────

interface ToggleOption<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

interface ToggleGroupProps<T extends string> {
  options: ToggleOption<T>[]
  value: T
  onChange: (value: T) => void
}

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
}: ToggleGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              isSelected
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Field label helper ─────────────────────────────────────────────────────

function FieldLabel({
  number,
  label,
  required = false,
}: {
  number: number
  label: string
  required?: boolean
}) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
      {number}. {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  )
}

// ── Source options ──────────────────────────────────────────────────────────

const DURATION_OPTIONS: ToggleOption<"single" | "multi">[] = [
  { value: "single", label: "Ei, yksi päivä" },
  { value: "multi", label: "Kyllä, useita päiviä" },
]

const CATERING_OPTIONS: ToggleOption<"yes" | "no" | "unknown">[] = [
  { value: "yes", label: "Kyllä" },
  { value: "no", label: "Ei" },
]

const AV_OPTIONS: ToggleOption<"yes" | "no">[] = [
  { value: "yes", label: "Kyllä" },
  { value: "no", label: "Ei" },
]

// ── Page component ─────────────────────────────────────────────────────────

export default function NewLeadPage({ onSubmit, onCancel, initialData, isLomake }: NewLeadPageProps) {
  const { templates } = useTemplates()
  const { workOrders } = useWorkOrders()
  const { mode } = useMode()
  const isClient = mode === "client"
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)

  const existingCompanies = new Set(workOrders.map((wo) => wo.customerCompany))
  const companyOptions: ComboboxOption[] = companyDirectory.map((c) => ({
    label: c.name,
    sublabel: c.yTunnus,
    detail: `${c.industry} · ${c.city}`,
    isExisting: existingCompanies.has(c.name),
  }))

  const [formData, setFormData] = useState<NewLeadFormData>({
    source: initialData?.source ?? "web",
    selectedSpace: initialData?.selectedSpace ?? "",
    company: initialData?.company ?? "",
    contactPerson: initialData?.contactPerson ?? "",
    email: "",
    phone: "",
    eventName: "",
    eventDescription: "",
    date: "",
    extraDates: [],
    dateOpen: false,
    time: "",
    participantEstimate: "300",
    eventType: "",
    duration: "single",
    needsCatering: "yes",
    needsAV: "yes",
    responsible: "mikko-lesonen",
    dietaryNeeds: "",
    seatingStyle: "",
    budgetRange: "",
    vipGuests: "",
    scheduleNotes: "",
  })

  function update<K extends keyof NewLeadFormData>(
    key: K,
    value: NewLeadFormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  function applyTemplate(templateId: string) {
    const tpl = templates.find((t) => t.id === templateId)
    if (!tpl) {
      setSelectedTemplate(null)
      return
    }
    setSelectedTemplate(templateId)
    setFormData((prev) => ({
      ...prev,
      eventType: tpl.eventType || prev.eventType,
      participantEstimate: String(tpl.participantEstimate) || prev.participantEstimate,
      needsCatering: tpl.needsCatering ?? prev.needsCatering,
      needsAV: tpl.needsAV ?? prev.needsAV,
      eventName: tpl.name || prev.eventName,
      eventDescription: tpl.description || prev.eventDescription,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit?.(formData)
  }

  return (
    <div className={isLomake ? "" : "h-full overflow-auto bg-gray-50"}>
      {/* ── Header bar — piilotetaan lomakesivulla ─────────────────── */}
      <header className={isLomake ? "hidden" : "border-b border-gray-200 bg-white px-6 py-3"}>
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm text-gray-500">
            <span>Myynti</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Työmääräimet</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-gray-900">Uusi työmääräin</span>
          </nav>

          {/* Right side: icons + avatar */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <div className="ml-1 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
                ML
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium leading-tight text-gray-900">
                  Mikko Lesonen
                </p>
                <p className="text-xs leading-tight text-gray-500">Myynti</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────── */}
      <main className="mx-auto max-w-4xl px-6 py-8 pb-16">
        {/* Page title */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{isClient ? "Lähetä tapahtumapyyntö" : "Uusi liidi"}</h1>
          <button
            type="button"
            onClick={() => setFormData({
              source: "web",
              company: "Nordic Digital Oy",
              contactPerson: "Mikko Lesonen",
              email: "mikko@nordicdigital.fi",
              phone: "+358 40 123 4567",
              eventName: "TechVision Summit 2027",
              eventDescription: "Vuotuinen teknologiakonferenssi. Päivällä seminaari ja workshopit, illalla gaala live-musiikilla. Striimataan etäosallistujille.",
              date: "2027-11-13",
              extraDates: [],
              dateOpen: false,
              time: "09:00",
              participantEstimate: "450",
              eventType: "conference",
              duration: "single",
              needsCatering: "yes",
              needsAV: "yes",
              responsible: "mikko-lesonen",
              dietaryNeeds: "Vegaanit ~30 hlö, gluteenittomat ~15 hlö, laktoosittomat ~20 hlö",
              seatingStyle: "banketti",
              budgetRange: "15000_50000",
              vipGuests: "Hallituksen jäsenet 15 hlö",
              scheduleNotes: "08:00 Rakennus alkaa\n12:00 Ovet avautuvat\n12:30 Tervetulokahvi\n13:00 CEO keynote\n13:45 Paneelikeskustelu\n14:30 Kahvitauko\n15:00 Workshop\n16:30 Yhteenveto\n18:30 Cocktail-vastaanotto\n19:00 Gaala-illallinen\n21:00 Live-bändi\n23:30 Tapahtuma päättyy",
            })}
            className="text-[11px] text-gray-400 hover:text-gray-600 border border-dashed border-gray-300 rounded px-2 py-1 hover:border-gray-400 transition-colors"
          >
            Esitäytä (demo)
          </button>
        </div>

        {/* Pohjavalinta — vain myyjälle */}
        {!isClient && !isLomake && (
        <div className="mb-6">
          <p className="text-[13px] font-medium text-gray-700 mb-2">Valitse pohja tai aloita tyhjästä</p>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => { setSelectedTemplate(null); setFormData((prev) => ({ ...prev, eventType: "", participantEstimate: "300", needsCatering: "yes", needsAV: "yes", eventName: "", eventDescription: "" })) }}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-medium transition-all ${!selectedTemplate ? "border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"}`}
            >
              <Plus className="h-3.5 w-3.5" />
              Tyhjä
            </button>
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => applyTemplate(tpl.id)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-medium transition-all ${selectedTemplate === tpl.id ? "border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"}`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white" style={{ backgroundColor: tpl.color }}>{tpl.name.charAt(0)}</span>
                {tpl.name}
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Info banner — vain myyjälle */}
        {!isClient && !isLomake && (
          <div className="mb-6">
            <InfoBanner>
              Kun tallennat lomakkeen, liidi luodaan kanban-näkymän sarakkeeseen
              &lsquo;Uudet liidit&rsquo;.
            </InfoBanner>
          </div>
        )}

        {/* ── Form card ──────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          {/* Varausjärjestelmästä esitäytetty tila */}
          {formData.selectedSpace && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 shrink-0">
                <span className="text-blue-600 text-[13px]">🏛</span>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-blue-900">Varausjärjestelmästä: {formData.selectedSpace}</p>
                <p className="text-[12px] text-blue-700">Asiakas on valinnut tämän tilan varausjärjestelmässä. Tieto siirtyy automaattisesti työmääräimeen.</p>
              </div>
            </div>
          )}
          <div className="rounded-xl border border-gray-200 bg-white p-8">
            <div className="space-y-6">
              {/* 1. Asiakas + Yhteyshenkilö ────────────────────── */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <FieldLabel number={1} label="Asiakas / yritys" required />
                  <Combobox
                    value={formData.company}
                    onChange={(v) => update("company", v)}
                    options={companyOptions}
                    placeholder="Hae yritystä nimellä tai y-tunnuksella..."
                  />
                </div>
                <div>
                  <FieldLabel number={2} label="Yhteyshenkilö" required />
                  <Input
                    value={formData.contactPerson}
                    onChange={(e) => update("contactPerson", e.target.value)}
                    placeholder="Hae tai lisää yhteyshenkilö..."
                  />
                </div>
              </div>

              {/* 4–5. Sähköposti + Puhelin ───────────────────────── */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <FieldLabel number={3} label="Sähköposti" required />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="etunimi.sukunimi@yritys.fi"
                  />
                </div>
                <div>
                  <FieldLabel number={4} label="Puhelin" required />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+358 40 123 4567"
                  />
                </div>
              </div>

              {/* 6. Tapahtuman nimi ───────────────────────────────── */}
              <div>
                <FieldLabel number={5} label="Tapahtuman nimi" required />
                <Input
                  value={formData.eventName}
                  onChange={(e) => update("eventName", e.target.value)}
                  placeholder="Esim. Kesäjuhlat 2025"
                />
              </div>

              {/* 7. Tapahtuman kuvaus ─────────────────────────────── */}
              <div>
                <FieldLabel number={6} label="Tapahtuman kuvaus" required />
                <Textarea
                  value={formData.eventDescription}
                  onChange={(e) =>
                    update(
                      "eventDescription",
                      e.target.value.slice(0, 1000)
                    )
                  }
                  placeholder="Kuvaile tapahtuman tavoitteet, ohjelma, erityistoiveet ja muut tärkeät tiedot..."
                  rows={4}
                />
                <p className="mt-1 text-right text-xs text-gray-400">
                  {formData.eventDescription.length} / 1000
                </p>
              </div>

              {/* Alustava ohjelma / aikataulu */}
              <div>
                <FieldLabel number={7} label="Alustava ohjelma / aikataulu" />
                {isLomake ? (
                  <>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setShowSchedule(true)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                          showSchedule ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        Kyllä
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowSchedule(false); update("scheduleNotes", "") }}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                          !showSchedule ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        Ei
                      </button>
                    </div>
                    {showSchedule && (
                      <div className="mt-3">
                        <Textarea
                          value={formData.scheduleNotes ?? ""}
                          onChange={(e) => update("scheduleNotes", e.target.value)}
                          placeholder={"Esim.\n09:00 Ovet avautuvat\n10:00 Keynote-puhe\n12:00 Lounas\n13:00 Paneelikeskustelu\n15:00 Kahvitauko\n18:00 Illallinen\n21:00 Live-musiikki"}
                          rows={5}
                          autoFocus
                        />
                        <p className="mt-1 text-[11px] text-gray-400">Kirjoita yksi ohjelmahetki per rivi. Muoto: kellonaika + kuvaus.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Textarea
                      value={formData.scheduleNotes ?? ""}
                      onChange={(e) => update("scheduleNotes", e.target.value)}
                      placeholder={"Esim.\n09:00 Ovet avautuvat\n10:00 Keynote-puhe\n12:00 Lounas\n13:00 Paneelikeskustelu\n15:00 Kahvitauko\n18:00 Illallinen\n21:00 Live-musiikki"}
                      rows={5}
                    />
                    <p className="mt-1 text-[11px] text-gray-400">Kirjoita yksi ohjelmahetki per rivi. Muoto: kellonaika + kuvaus.</p>
                  </>
                )}
              </div>

              {/* Catering + AV — heti aikataulun jälkeen lomakkeella */}
              {isLomake && (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <FieldLabel number={8} label="Tarvitaanko catering?" required />
                      <ToggleGroup
                        options={CATERING_OPTIONS}
                        value={formData.needsCatering}
                        onChange={(v) => update("needsCatering", v)}
                      />
                    </div>
                    <div>
                      <FieldLabel number={9} label="Tarvitaanko AV / tekniikka?" required />
                      <ToggleGroup
                        options={AV_OPTIONS}
                        value={formData.needsAV}
                        onChange={(v) => update("needsAV", v)}
                      />
                    </div>
                  </div>

                  {/* Erikoisruokavaliot + kattaustoive — heti catering-togglen alla */}
                  {formData.needsCatering === "yes" && (
                    <div>
                      <FieldLabel number={10} label="Erikoisruokavaliot" />
                      <Input
                        value={formData.dietaryNeeds ?? ""}
                        onChange={(e) => update("dietaryNeeds", e.target.value)}
                        placeholder="Esim. vegaani 10 hlö, gluteeniton 5 hlö"
                      />
                    </div>
                  )}
                  {formData.needsAV === "yes" && (
                    <div>
                      <FieldLabel number={11} label="Minkälaista tekniikkaa tarvitaan?" />
                      <Textarea
                        value={formData.avDescription ?? ""}
                        onChange={(e) => update("avDescription", e.target.value)}
                        placeholder="Esim. äänentoisto, videotykki, mikrofonit, striimaus, valaistus..."
                        rows={3}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Tapahtuman tyyppi + Osallistujat ── */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <FieldLabel number={7} label="Tapahtuman tyyppi" required />
                  <Select value={formData.eventType} onValueChange={(v) => update("eventType", v)}>
                    <SelectTrigger><SelectValue placeholder="Valitse tapahtuman tyyppi..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corporate">Yritystilaisuus</SelectItem>
                      <SelectItem value="wedding">Häät</SelectItem>
                      <SelectItem value="birthday">Syntymäpäivä</SelectItem>
                      <SelectItem value="conference">Konferenssi</SelectItem>
                      <SelectItem value="seminar">Seminaari</SelectItem>
                      <SelectItem value="party">Juhlat</SelectItem>
                      <SelectItem value="other">Muu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <FieldLabel number={8} label="Arvioitu osallistujamäärä" required />
                  <Input
                    type="number" min={1}
                    value={formData.participantEstimate}
                    onChange={(e) => update("participantEstimate", e.target.value)}
                    placeholder="Esim. 120"
                  />
                </div>
              </div>

              {/* Monipäiväinen + Päivämäärä(t) — yhtenä kokonaisuutena */}
              <div className="space-y-3">
                <div>
                  <FieldLabel number={9} label="Onko tapahtuma monipäiväinen?" required />
                  <ToggleGroup
                    options={DURATION_OPTIONS}
                    value={formData.duration}
                    onChange={(v) => update("duration", v)}
                  />
                </div>

                {/* Ensimmäinen päivä */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">
                    {formData.duration === "multi" ? "Ensimmäinen päivä" : "Päivämäärä"}
                  </label>
                  <div className="relative max-w-xs">
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => update("date", e.target.value)}
                      disabled={formData.dateOpen}
                      className="pr-9"
                    />
                    <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Checkbox id="dateOpen" checked={formData.dateOpen} onCheckedChange={(c) => update("dateOpen", c === true)} />
                    <label htmlFor="dateOpen" className="text-sm text-gray-600">Ajankohta avoin</label>
                  </div>
                </div>

                {/* Lisäpäivät kun "Useita päiviä" valittu */}
                {formData.duration === "multi" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">Muut päivät</label>
                    {formData.extraDates.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 max-w-xs">
                        <Input
                          type="date"
                          value={d}
                          onChange={(e) => { const next = [...formData.extraDates]; next[i] = e.target.value; update("extraDates", next) }}
                          className="flex-1"
                        />
                        <Button type="button" variant="ghost" size="sm" onClick={() => update("extraDates", formData.extraDates.filter((_, j) => j !== i))}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => update("extraDates", [...formData.extraDates, ""])}>
                      <Plus className="h-3.5 w-3.5" /> Lisää päivä
                    </Button>
                  </div>
                )}
              </div>

              {/* Asiakkaan lisäkysymykset — vain myyjän versiossa (lomakkeella näytetään aiemmin) */}
              {!isLomake && (
              <><div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <FieldLabel number={11} label="Erikoisruokavaliot" />
                  <Input
                    value={formData.dietaryNeeds ?? ""}
                    onChange={(e) => update("dietaryNeeds", e.target.value)}
                    placeholder="Esim. vegaani 10 hlö, gluteeniton 5 hlö, laktoositon 8 hlö"
                  />
                </div>
                <div>
                  <FieldLabel number={12} label="Toivottu kattaustyyli" />
                  <Select
                    value={formData.seatingStyle ?? ""}
                    onValueChange={(v) => update("seatingStyle", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Valitse kattaustyyli..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cocktail">Cocktail</SelectItem>
                      <SelectItem value="banketti">Banketti (pyöreät pöydät)</SelectItem>
                      <SelectItem value="buffet">Buffet</SelectItem>
                      <SelectItem value="teatteri">Teatteri (ei ruokailua)</SelectItem>
                      <SelectItem value="luokkahuone">Luokkahuone</SelectItem>
                      <SelectItem value="u_muoto">U-muoto</SelectItem>
                      <SelectItem value="muu">Muu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <FieldLabel number={13} label="Budjettihaarukka" />
                  <Select
                    value={formData.budgetRange ?? ""}
                    onValueChange={(v) => update("budgetRange", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Valitse budjetti..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alle_5000">Alle 5 000 €</SelectItem>
                      <SelectItem value="5000_15000">5 000 – 15 000 €</SelectItem>
                      <SelectItem value="15000_50000">15 000 – 50 000 €</SelectItem>
                      <SelectItem value="yli_50000">Yli 50 000 €</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <FieldLabel number={14} label="VIP-vieraat" />
                  <Input
                    value={formData.vipGuests ?? ""}
                    onChange={(e) => update("vipGuests", e.target.value)}
                    placeholder="Esim. hallituksen jäsenet 15 hlö"
                  />
                </div>
              </div>
              </>
              )}

              {/* Catering + AV — vain myyjän versiossa (lomakkeella ne näkyvät aiemmin) */}
              {!isLomake && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <FieldLabel number={15} label="Tarvitaanko catering?" required />
                  <ToggleGroup
                    options={CATERING_OPTIONS}
                    value={formData.needsCatering}
                    onChange={(v) => update("needsCatering", v)}
                  />
                </div>
                <div>
                  <FieldLabel number={16} label="Tarvitaanko AV / tekniikka?" required />
                  <ToggleGroup
                    options={AV_OPTIONS}
                    value={formData.needsAV}
                    onChange={(v) => update("needsAV", v)}
                  />
                </div>
              </div>
              )}

              {/* Vastuuhenkilö — vain myyjälle */}
              {!isClient && !isLomake && (
                <div>
                  <FieldLabel number={11} label="Vastuuhenkilö" required />
                  <Select
                    value={formData.responsible}
                    onValueChange={(v) => update("responsible", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Valitse vastuuhenkilö..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mikko-lesonen">
                        Mikko Lesonen
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* ── Action bar ─────────────────────────────────────── */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button type="submit" size="lg">
              {isLomake ? "Lähetä tapahtumapyyntö" : isClient ? "Lähetä pyyntö" : <><Plus className="h-4 w-4" /> Luo työmääräin</>}
            </Button>
            {!isClient && !isLomake && (
              <Button type="button" variant="outline" size="lg">
                <Save className="h-4 w-4" />
                Tallenna luonnos
              </Button>
            )}
            {!isLomake && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
              Peruuta
            </Button>
            )}
          </div>
        </form>
      </main>
    </div>
  )
}
