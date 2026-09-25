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
}

interface NewLeadPageProps {
  onSubmit?: (data: NewLeadFormData) => void
  onCancel?: () => void
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
                ? "border-blue-500 bg-blue-50 text-blue-700"
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
  { value: "single", label: "Yksi tapahtumapäivä" },
  { value: "multi", label: "Useita päiviä" },
]

const CATERING_OPTIONS: ToggleOption<"yes" | "no" | "unknown">[] = [
  { value: "yes", label: "Kyllä" },
  { value: "no", label: "Ei" },
  { value: "unknown", label: "En tiedä" },
]

const AV_OPTIONS: ToggleOption<"yes" | "no">[] = [
  { value: "yes", label: "Kyllä" },
  { value: "no", label: "Ei" },
]

// ── Page component ─────────────────────────────────────────────────────────

export default function NewLeadPage({ onSubmit, onCancel }: NewLeadPageProps) {
  const { templates } = useTemplates()
  const { workOrders } = useWorkOrders()
  const { mode } = useMode()
  const isClient = mode === "client"
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const existingCompanies = new Set(workOrders.map((wo) => wo.customerCompany))
  const companyOptions: ComboboxOption[] = companyDirectory.map((c) => ({
    label: c.name,
    sublabel: c.yTunnus,
    detail: `${c.industry} · ${c.city}`,
    isExisting: existingCompanies.has(c.name),
  }))

  const [formData, setFormData] = useState<NewLeadFormData>({
    source: "web",
    company: "",
    contactPerson: "",
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
    <div className="h-full overflow-auto bg-gray-50">
      {/* ── Header bar ─────────────────────────────────────────────── */}
      <header className="border-b border-gray-200 bg-white px-6 py-3">
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
        <h1 className="mb-4 text-2xl font-bold text-gray-900">{isClient ? "Lähetä tapahtumapyyntö" : "Uusi liidi"}</h1>

        {/* Pohjavalinta — vain myyjälle */}
        {!isClient && (
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
        {!isClient && (
          <div className="mb-6">
            <InfoBanner>
              Kun tallennat lomakkeen, liidi luodaan kanban-näkymän sarakkeeseen
              &lsquo;Uudet liidit&rsquo;.
            </InfoBanner>
          </div>
        )}

        {/* ── Form card ──────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
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

              {/* 8–9–10. Päivämäärä + Kellonaika + Osallistujat ── */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* 8. Päivämäärä */}
                <div>
                  <FieldLabel number={7} label="Päivämäärä" required />
                  <div className="relative">
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => update("date", e.target.value)}
                      disabled={formData.dateOpen}
                      placeholder="Valitse päivämäärä"
                      className="pr-9"
                    />
                    <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Checkbox
                      id="dateOpen"
                      checked={formData.dateOpen}
                      onCheckedChange={(checked) =>
                        update("dateOpen", checked === true)
                      }
                    />
                    <label
                      htmlFor="dateOpen"
                      className="text-sm text-gray-600"
                    >
                      Ajankohta avoin
                    </label>
                  </div>
                </div>

                {/* 9. Kellonaika */}
                <div>
                  <FieldLabel number={8} label="Kellonaika" required />
                  <Select
                    value={formData.time}
                    onValueChange={(v) => update("time", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Alkaen" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, h) => {
                        const hour = h.toString().padStart(2, "0")
                        return [`${hour}:00`, `${hour}:30`]
                      })
                        .flat()
                        .map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 10. Osallistujamäärä */}
                <div>
                  <FieldLabel
                    number={10}
                    label="Arvioitu osallistujamäärä"
                    required
                  />
                  <Input
                    type="number"
                    min={1}
                    value={formData.participantEstimate}
                    onChange={(e) =>
                      update("participantEstimate", e.target.value)
                    }
                    placeholder="Esim. 120"
                  />
                </div>
              </div>

              {/* 11–12. Tapahtuman tyyppi + Kesto ────────────────── */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* 11. Tapahtuman tyyppi */}
                <div>
                  <FieldLabel number={9} label="Tapahtuman tyyppi" required />
                  <Select
                    value={formData.eventType}
                    onValueChange={(v) => update("eventType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Valitse tapahtuman tyyppi..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corporate">
                        Yritystilaisuus
                      </SelectItem>
                      <SelectItem value="wedding">Häät</SelectItem>
                      <SelectItem value="birthday">Syntymäpäivä</SelectItem>
                      <SelectItem value="conference">Konferenssi</SelectItem>
                      <SelectItem value="seminar">Seminaari</SelectItem>
                      <SelectItem value="party">Juhlat</SelectItem>
                      <SelectItem value="other">Muu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 12. Tapahtuman kesto */}
                <div>
                  <FieldLabel number={10} label="Tapahtuman kesto" required />
                  <ToggleGroup
                    options={DURATION_OPTIONS}
                    value={formData.duration}
                    onChange={(v) => update("duration", v)}
                  />
                </div>
              </div>

              {/* Lisäpäivät kun "Useita päiviä" valittu */}
              {formData.duration === "multi" && (
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">Lisäpäivät</p>
                  <div className="space-y-2">
                    {formData.extraDates.map((d, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          value={d}
                          onChange={(e) => {
                            const next = [...formData.extraDates]
                            next[i] = e.target.value
                            update("extraDates", next)
                          }}
                          placeholder="pp.kk.vvvv"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => update("extraDates", formData.extraDates.filter((_, j) => j !== i))}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => update("extraDates", [...formData.extraDates, ""])}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Lisää päivä
                    </Button>
                  </div>
                </div>
              )}

              {/* 13–14. Catering + AV — vain myyjälle */}
              {!isClient && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <FieldLabel
                      number={13}
                      label="Tarvitaanko catering?"
                      required
                    />
                    <ToggleGroup
                      options={CATERING_OPTIONS}
                      value={formData.needsCatering}
                      onChange={(v) => update("needsCatering", v)}
                    />
                  </div>
                  <div>
                    <FieldLabel
                      number={14}
                      label="Tarvitaanko AV / tekniikka?"
                      required
                    />
                    <ToggleGroup
                      options={AV_OPTIONS}
                      value={formData.needsAV}
                      onChange={(v) => update("needsAV", v)}
                    />
                  </div>
                </div>
              )}

              {/* 15. Vastuuhenkilö — vain myyjälle */}
              {!isClient && (
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
              <Plus className="h-4 w-4" />
              {isClient ? "Lähetä pyyntö" : "Luo työmääräin"}
            </Button>
            {!isClient && (
              <Button type="button" variant="outline" size="lg">
                <Save className="h-4 w-4" />
                Tallenna luonnos
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
              Peruuta
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
