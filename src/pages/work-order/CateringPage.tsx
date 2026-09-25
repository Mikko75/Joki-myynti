import { useState, useMemo } from "react"
import type { FormEvent } from "react"
import {
  GripVertical,
  Pencil,
  Trash2,
  UtensilsCrossed,
  Plus,
  Clock,
  MapPin,
  Sparkles,
  FileText,
  X,
  ChevronDown,
  Users,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { SectionChat } from "@/components/common/SectionChat"
import { WorkOrderHeader } from "@/components/layout/WorkOrderHeader"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import PartnerProductsPage from "@/pages/partner/PartnerProductsPage"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { useMenus } from "@/context/MenuContext"
import { cateringProviders } from "@/data/mock"
import type { CateringMoment, Product } from "@/data/types"
import { cn } from "@/lib/utils"

function generateId() {
  return `cm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ---------------------------------------------------------------------------
// Draft text parser
// ---------------------------------------------------------------------------
function parseDraftLines(text: string): Omit<CateringMoment, "id" | "menuId" | "menuName" | "price" | "status">[] {
  const results: Omit<CateringMoment, "id" | "menuId" | "menuName" | "price" | "status">[] = []
  const lines = text.split("\n").filter((l) => l.trim())

  for (const line of lines) {
    const trimmed = line.trim()

    // HH:MM-HH:MM Title Space  (space is last word if >2 words after time range)
    const rangeMatch = trimmed.match(
      /^(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})\s+(.+)$/
    )
    // HH:MM Title Space
    const singleMatch = trimmed.match(/^(\d{1,2}:\d{2})\s+(.+)$/)

    let startTime = ""
    let endTime = ""
    let rest = ""

    if (rangeMatch) {
      startTime = rangeMatch[1]
      endTime = rangeMatch[2]
      rest = rangeMatch[3]
    } else if (singleMatch) {
      startTime = singleMatch[1]
      rest = singleMatch[2]
    } else {
      continue
    }

    // Pad hours
    if (startTime.length === 4) startTime = `0${startTime}`
    if (endTime && endTime.length === 4) endTime = `0${endTime}`

    // Try to extract space name from last word (if rest has >=2 words)
    const words = rest.split(/\s+/)
    let title = rest
    let spaceName = ""
    if (words.length >= 2) {
      // Last word could be a space name (single capitalized word)
      const lastWord = words[words.length - 1]
      if (/^[A-ZÄÖÅ]/.test(lastWord) && words.length >= 2) {
        spaceName = lastWord
        title = words.slice(0, -1).join(" ")
      }
    }

    results.push({
      title,
      startTime,
      endTime: endTime || startTime,
      spaceName,
    })
  }

  return results
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function CateringPage() {
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const {
    getCateringPlan,
    updateCateringPlan,
    addCateringMoment,
    updateCateringMoment,
    removeCateringMoment,
    addScheduleItem,
  } = useWorkOrders()
  const { menus } = useMenus()
  const [cateringTab, setCateringTab] = useState<"tarjoilu" | "tuotteet">("tarjoilu")

  // All products from all menus flattened
  const allProducts = useMemo<Product[]>(() => {
    const seen = new Set<string>()
    const out: Product[] = []
    for (const menu of menus) {
      for (const p of menu.products) {
        if (!seen.has(p.id)) {
          seen.add(p.id)
          out.push(p)
        }
      }
    }
    return out
  }, [menus])

  // Draft dialog
  const [draftOpen, setDraftOpen] = useState(false)
  const [draftContent, setDraftContent] = useState("")

  // Add single moment dialog
  const [addOpen, setAddOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newStart, setNewStart] = useState("")
  const [newEnd, setNewEnd] = useState("")
  const [newSpace, setNewSpace] = useState("")

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSpace, setEditSpace] = useState("")
  const [editProducts, setEditProducts] = useState<string[]>([])
  const [editNotes, setEditNotes] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [showProductDropdown, setShowProductDropdown] = useState(false)

  if (!workOrder) return <p className="text-gray-500">Työmääräintä ei löytynyt.</p>

  const plan = getCateringPlan(workOrderId)

  const eventDay = workOrder.eventDays[0]
  const spaces = eventDay?.spaces ?? []
  const spaceNames = spaces.map((s) => s.spaceName)

  // ---- Helpers ----

  function addMomentAndSchedule(m: CateringMoment) {
    addCateringMoment(workOrderId, m)
    if (eventDay) {
      addScheduleItem(workOrderId, eventDay.id, {
        id: m.id,
        type: "catering",
        title: m.title,
        startTime: m.startTime,
        endTime: m.endTime,
        spaceName: m.spaceName,
        status: "luonnos",
        sourceLabel: "Catering",
      })
    }
  }

  function handleSaveDraft() {
    const parsed = parseDraftLines(draftContent)
    for (const p of parsed) {
      const moment: CateringMoment = {
        id: generateId(),
        ...p,
        menuId: "",
        menuName: "",
        price: 0,
        status: "luonnos",
      }
      addMomentAndSchedule(moment)
    }
    setDraftContent("")
    setDraftOpen(false)
  }

  function handleAddSingle(e: FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !newStart) return
    const moment: CateringMoment = {
      id: generateId(),
      title: newTitle.trim(),
      startTime: newStart,
      endTime: newEnd || newStart,
      spaceName: newSpace,
      menuId: "",
      menuName: "",
      price: 0,
      status: "luonnos",
    }
    addMomentAndSchedule(moment)
    setNewTitle("")
    setNewStart("")
    setNewEnd("")
    setNewSpace("")
    setAddOpen(false)
  }

  function startEditing(m: CateringMoment) {
    setEditingId(m.id)
    setEditSpace(m.spaceName)
    // Parse products from menuName (comma-separated)
    setEditProducts(
      m.menuName ? m.menuName.split(",").map((s) => s.trim()).filter(Boolean) : []
    )
    setEditNotes("")
    setProductSearch("")
    setShowProductDropdown(false)
  }

  function cancelEditing() {
    setEditingId(null)
    setProductSearch("")
    setShowProductDropdown(false)
  }

  function saveEditing(momentId: string) {
    updateCateringMoment(workOrderId, momentId, {
      spaceName: editSpace,
      menuName: editProducts.join(", "),
    })
    setEditingId(null)
  }

  function handleDeleteMoment(momentId: string) {
    removeCateringMoment(workOrderId, momentId)
    if (editingId === momentId) setEditingId(null)
  }

  function addProduct(name: string) {
    if (!editProducts.includes(name)) {
      setEditProducts([...editProducts, name])
    }
    setProductSearch("")
    setShowProductDropdown(false)
  }

  function removeProduct(name: string) {
    setEditProducts(editProducts.filter((p) => p !== name))
  }

  const filteredProducts = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
      !editProducts.includes(p.name)
  )

  // ===================================================================
  // MAIN RENDER — always shows info fields, timeline below
  // ===================================================================
  return (
    <div className="space-y-6">
      {/* Catering header */}
      <WorkOrderHeader
        workOrder={workOrder}
        title="Ruoka & Juoma (Catering)"
      />

      {/* Välilehdet */}
      <div className="flex gap-6 border-b border-gray-200">
        <button
          type="button"
          className={cn(
            "pb-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
            cateringTab === "tarjoilu" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
          )}
          onClick={() => setCateringTab("tarjoilu")}
        >
          Tarjoiluhetket
        </button>
        <button
          type="button"
          className={cn(
            "pb-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
            cateringTab === "tuotteet" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
          )}
          onClick={() => setCateringTab("tuotteet")}
        >
          Tuotehallinta
        </button>
      </div>

      {cateringTab === "tuotteet" ? (
        <PartnerProductsPage />
      ) : (
      <>
      {/* Catering-toimittaja */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <h3 className="text-[14px] font-semibold text-gray-900">Catering-toimittaja</h3>
        <div className="flex flex-wrap gap-3">
          {cateringProviders.map((p) => (
            <button
              key={p.id}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border px-4 py-3 text-[13px] font-medium transition-all",
                plan.servingArea === p.name
                  ? "border-primary-500 ring-1 ring-primary-500 text-primary-700"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
              )}
              onClick={() => updateCateringPlan(workOrderId, { servingArea: p.name })}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: p.color }}
              >
                {p.initials}
              </span>
              {p.name}
            </button>
          ))}
          <button
            key="muu"
            className={cn(
              "flex items-center gap-2.5 rounded-lg border px-4 py-3 text-[13px] font-medium transition-all",
              plan.servingArea === "Joku muu"
                ? "border-primary-500 ring-1 ring-primary-500 text-primary-700"
                : "border-gray-200 text-gray-700 hover:border-gray-300"
            )}
            onClick={() => updateCateringPlan(workOrderId, { servingArea: "Joku muu" })}
          >
            Joku muu
          </button>
          <Button variant="outline" size="sm" className="gap-1.5 ml-auto">
            <Upload className="h-3.5 w-3.5" />
            Tuo Excelistä
          </Button>
        </div>
      </div>

      {/* Mitä kumppanin pitää tietää — pre-filled from lead + editable */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <h3 className="text-[14px] font-semibold text-gray-900">Mitä kumppanin pitää tietää</h3>
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-gray-500">Arvioitu henkilömäärä *</label>
            <div className="relative">
              <Input
                value={String(plan.participantCount || workOrder?.participantEstimate || "")}
                onChange={(e) => updateCateringPlan(workOrderId, { participantCount: parseInt(e.target.value) || 0 })}
                className="pr-9"
              />
              <Users className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-gray-500">Erikoisruokavaliot</label>
            <div className="relative">
              <Input
                placeholder="Esim. kasvis, gluteeniton"
                value={plan.dietaryNeeds}
                onChange={(e) => updateCateringPlan(workOrderId, { dietaryNeeds: e.target.value })}
                className="pr-9"
              />
              <Pencil className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-gray-500">Tarjoilualue / sijainti</label>
            <div className="relative">
              <Input
                placeholder="Päätalo, Aula"
                value={plan.servingArea}
                onChange={(e) => updateCateringPlan(workOrderId, { servingArea: e.target.value })}
                className="pr-9"
              />
              <MapPin className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-gray-500">Tarjoilupisteiden määrä</label>
            <div className="relative">
              <Input
                type="number"
                value={String(plan.servingPoints || "")}
                onChange={(e) => updateCateringPlan(workOrderId, { servingPoints: parseInt(e.target.value) || 0 })}
                className="pr-9"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 17h20M2 12h20M2 7h20"/></svg>
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-gray-500">Tarvitaanko henkilökuntaa</label>
            <div className="relative">
              <Input
                placeholder="Esim. 4 tarjoilijaa"
                value={plan.staffNeeded}
                onChange={(e) => updateCateringPlan(workOrderId, { staffNeeded: e.target.value })}
                className="pr-9"
              />
              <Users className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-gray-500">Aikataulu</label>
            <div className="relative">
              <Input
                value={eventDay ? `${eventDay.bookingStart} - ${eventDay.bookingEnd}` : ""}
                readOnly
                className="pr-9 bg-gray-50"
              />
              <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-gray-500">Kattaus</label>
            <div className="relative">
              <Input
                placeholder="Esim. banketti, cocktail, buffet"
                value={plan.notes.includes("kattaus:") ? plan.notes.split("kattaus:")[1]?.split("\n")[0] ?? "" : ""}
                onChange={(e) => {
                  const rest = plan.notes.replace(/kattaus:.*(\n|$)/, "")
                  updateCateringPlan(workOrderId, { notes: `${rest}kattaus:${e.target.value}` })
                }}
                className="pr-9"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-gray-500">Liitteet</label>
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 cursor-pointer hover:border-gray-400 transition-colors">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-[13px] text-gray-500">Lisää liite...</span>
              <Plus className="h-3.5 w-3.5 text-gray-400 ml-auto" />
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-gray-500">Lisätiedot / huomioitavaa</label>
          <Textarea
            placeholder="Kirjoita mahdolliset toiveet tai lisätiedot kumppanille..."
            value={plan.notes.replace(/kattaus:.*(\n|$)/, "").trim()}
            onChange={(e) => {
              const kattaus = plan.notes.includes("kattaus:") ? plan.notes.match(/kattaus:.*/)?.[0] ?? "" : ""
              updateCateringPlan(workOrderId, { notes: `${e.target.value}\n${kattaus}`.trim() })
            }}
          />
        </div>
      </div>

      {/* Timeline blocks heading */}
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-gray-900">Tarjoiluhetket</h2>
        <div className="flex gap-2">
          <Dialog open={draftOpen} onOpenChange={setDraftOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText className="h-3.5 w-3.5" />
                Catering luonnos
              </Button>
            </DialogTrigger>
            <DraftDialog
              draftContent={draftContent}
              setDraftContent={setDraftContent}
              onSave={handleSaveDraft}
              onClose={() => setDraftOpen(false)}
            />
          </Dialog>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-3.5 w-3.5" />
                Lisää tarjoilu
              </Button>
            </DialogTrigger>
            <AddMomentDialog
              spaceNames={spaceNames}
              title={newTitle}
              setTitle={setNewTitle}
              start={newStart}
              setStart={setNewStart}
              end={newEnd}
              setEnd={setNewEnd}
              space={newSpace}
              setSpace={setNewSpace}
              onSubmit={handleAddSingle}
            />
          </Dialog>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {plan.moments.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-8 py-10 text-center">
            <UtensilsCrossed className="h-8 w-8 text-gray-300" />
            <p className="text-[13px] text-gray-500">Ei vielä tarjoiluhetkiä. Luo luonnos tai lisää tarjoiluhetki.</p>
          </div>
        )}
        {plan.moments.map((m, idx) => {
          const isEditing = editingId === m.id
          const isLast = idx === plan.moments.length - 1

          return (
            <div key={m.id} className="relative">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className="absolute left-46.5 top-10 bottom-0 w-px bg-gray-200"
                  style={{ zIndex: 0 }}
                />
              )}

              {/* Collapsed row */}
              <div
                className={cn(
                  "relative flex items-center gap-3 rounded-lg border bg-white px-4 py-3",
                  isEditing
                    ? "border-blue-300 border-b-0 rounded-b-none"
                    : "border-gray-200"
                )}
              >
                {/* Drag handle */}
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-gray-300" />

                {/* Times */}
                <span className="inline-flex items-center gap-1.5 shrink-0">
                  <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-sm text-gray-700">
                    {m.startTime}
                  </span>
                  <span className="text-gray-400">–</span>
                  <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-sm text-gray-700">
                    {m.endTime && m.endTime !== m.startTime ? m.endTime : m.startTime}
                  </span>
                </span>

                {/* Dot connector */}
                <div className="relative z-10 h-3 w-3 shrink-0 rounded-full border-2 border-gray-300 bg-white" />

                {/* Title + subtitle */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">{m.title}</p>
                  <p className="truncate text-sm text-gray-500">
                    {m.spaceName ? `${m.spaceName} · ` : ""}Tarjoilu
                  </p>
                </div>

                {/* Badge */}
                <Badge variant="blue" className="shrink-0">
                  Catering
                </Badge>

                {/* Actions */}
                <button
                  type="button"
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
                    isEditing
                      ? "border-blue-300 bg-blue-50 text-blue-600"
                      : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                  )}
                  onClick={() => (isEditing ? cancelEditing() : startEditing(m))}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDeleteMoment(m.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Expanded edit form (inline below the row) */}
              {isEditing && (
                <div className="rounded-b-lg border border-t-0 border-blue-300 border-dashed bg-white px-6 py-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {/* Sijainti */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Sijainti
                      </label>
                      {spaceNames.length > 0 ? (
                        <select
                          className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                          value={editSpace}
                          onChange={(e) => setEditSpace(e.target.value)}
                        >
                          <option value="">Valitse tila...</option>
                          {spaceNames.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          placeholder="Esim. Aula"
                          value={editSpace}
                          onChange={(e) => setEditSpace(e.target.value)}
                        />
                      )}
                    </div>

                    {/* Menu / Tuotteet */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Menu / Tuotteet
                      </label>
                      <div className="relative">
                        <div className="flex">
                          <Input
                            placeholder="Lisää tuote"
                            value={productSearch}
                            onChange={(e) => {
                              setProductSearch(e.target.value)
                              setShowProductDropdown(true)
                            }}
                            onFocus={() => setShowProductDropdown(true)}
                            className="rounded-r-none"
                          />
                          <button
                            type="button"
                            className="flex h-9 items-center justify-center rounded-r-lg border border-l-0 border-gray-200 bg-gray-50 px-3 text-gray-500 hover:bg-gray-100"
                            onClick={() => {
                              if (productSearch.trim()) {
                                addProduct(productSearch.trim())
                              }
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Product dropdown */}
                        {showProductDropdown &&
                          productSearch.length > 0 &&
                          filteredProducts.length > 0 && (
                            <div className="absolute z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                              {filteredProducts.slice(0, 10).map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
                                  onClick={() => addProduct(p.name)}
                                >
                                  <span>{p.name}</span>
                                  {p.dietaryTags.length > 0 && (
                                    <span className="text-xs text-gray-400">
                                      {p.dietaryTags.join(", ")}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Selected products */}
                  {editProducts.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-sm text-gray-500">
                        Valitut tuotteet:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {editProducts.map((name) => (
                          <span
                            key={name}
                            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-sm text-gray-700"
                          >
                            {name}
                            <button
                              type="button"
                              className="text-gray-400 hover:text-gray-600"
                              onClick={() => removeProduct(name)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lisätiedot */}
                  <div className="mt-4 space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Lisätiedot
                    </label>
                    <Textarea
                      placeholder="Kirjoita lisätietoja..."
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="min-h-15"
                    />
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button onClick={() => saveEditing(m.id)}>Tallenna</Button>
                      <Button variant="outline" onClick={cancelEditing}>
                        Peruuta
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDeleteMoment(m.id)}
                    >
                      <Trash2 className="mr-1.5 h-4 w-4" />
                      Poista vaihe
                    </Button>
                  </div>
                </div>
              )}

              {/* Spacer between rows */}
              {!isLast && <div className="h-2" />}
            </div>
          )
        })}
      </div>

      {/* Send to partner */}
      {plan.status !== "kumppanilla" && plan.status !== "vastattu" && plan.status !== "valmis" && (
        <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 p-5">
          <div>
            <p className="text-[14px] font-semibold text-gray-900">
              Lähetä luonnos kumppanille
            </p>
            <p className="mt-0.5 text-[12px] text-gray-500">
              Catering-kumppani näkee luonnoksen ja voi täydentää sen.
            </p>
          </div>
          <Button
            onClick={() =>
              updateCateringPlan(workOrderId, { status: "kumppanilla" })
            }
          >
            Lähetä kumppanille
          </Button>
        </div>
      )}

      {plan.status === "kumppanilla" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-[14px] font-semibold text-gray-900">
            Odottaa catering-kumppanin vastausta
          </p>
          <p className="mt-0.5 text-[12px] text-gray-500">
            Luonnos on lähetetty kumppanille. Saat ilmoituksen kun kumppani
            vastaa.
          </p>
        </div>
      )}

      {plan.status === "vastattu" && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div>
            <p className="text-[14px] font-semibold text-gray-900">
              Kumppani on vastannut
            </p>
            <p className="mt-0.5 text-[12px] text-gray-500">
              Tarkista ehdotus ja hyväksy se osaksi tarjousta.
            </p>
          </div>
          <Button
            onClick={() =>
              updateCateringPlan(workOrderId, { status: "valmis" })
            }
          >
            Hyväksy ehdotus
          </Button>
        </div>
      )}

      <SectionChat sectionKey="catering" />
      </>
      )}
    </div>
  )
}

// ===========================================================================
// Draft Dialog
// ===========================================================================
function DraftDialog({
  draftContent,
  setDraftContent,
  onSave,
  onClose,
}: {
  draftContent: string
  setDraftContent: (v: string) => void
  onSave: () => void
  onClose: () => void
}) {
  function handleSave() {
    onSave()
    onClose()
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Catering luonnos</DialogTitle>
        <DialogDescription>Luonnostele catering</DialogDescription>
      </DialogHeader>

      <p className="text-sm text-gray-600">
        Voit kirjoittaa tai liittää tähän koko päivän rungon vapaasti.
      </p>

      <Textarea
        className="min-h-50 font-mono text-sm"
        placeholder={`09:00-10:00 Aamukahvi Aula\n12:00-13:00 Lounas Ravintolasali\n14:30 Iltapäiväkahvit Aula`}
        value={draftContent}
        onChange={(e) => setDraftContent(e.target.value)}
      />

      <div className="flex items-start gap-3 rounded-lg bg-blue-50 border border-blue-100 p-4">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
        <p className="text-sm text-blue-800">
          Voimme muodostaa aikatauluehdotuksen yllä olevasta tekstistä.
          Tapahtumat, kestot ja siirtymät tunnistetaan automaattisesti.
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Peruuta</Button>
        <Button onClick={handleSave} disabled={!draftContent.trim()}>
          Tallenna
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

// ===========================================================================
// Add Moment Dialog
// ===========================================================================
function AddMomentDialog({
  spaceNames,
  title,
  setTitle,
  start,
  setStart,
  end,
  setEnd,
  space,
  setSpace,
  onSubmit,
}: {
  spaceNames: string[]
  title: string
  setTitle: (v: string) => void
  start: string
  setStart: (v: string) => void
  end: string
  setEnd: (v: string) => void
  space: string
  setSpace: (v: string) => void
  onSubmit: (e: FormEvent) => void
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Lisää tarjoiluhetki</DialogTitle>
        <DialogDescription>
          Lisää uusi tarjoiluhetki tapahtuman aikatauluun.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Nimi</label>
          <Input
            placeholder="Esim. Aamukahvi, Lounas, Iltapäiväkahvit"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Alkaa</label>
            <Input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Päättyy
            </label>
            <Input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Tila</label>
          {spaceNames.length > 0 ? (
            <select
              className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              value={space}
              onChange={(e) => setSpace(e.target.value)}
            >
              <option value="">Valitse tila...</option>
              {spaceNames.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ) : (
            <Input
              placeholder="Esim. Aula"
              value={space}
              onChange={(e) => setSpace(e.target.value)}
            />
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Peruuta
            </Button>
          </DialogClose>
          <Button type="submit" disabled={!title.trim() || !start}>
            Lisää
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
