import { useState } from "react"
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
import { SectionNotes } from "@/components/common/SectionNotes"
import { SectionChat } from "@/components/common/SectionChat"
import { WorkOrderHeader } from "@/components/layout/WorkOrderHeader"
import { WorkOrderSectionCard } from "@/components/common/WorkOrderSectionCard"
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
import { useNavigate } from "react-router-dom"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { useMenus } from "@/context/MenuContext"
import { cateringProviders } from "@/data/mock"
import type { CateringMoment, ProposalSection } from "@/data/types"
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
    updateScheduleItem,
    updateWorkOrder,
  } = useWorkOrders()
  const { menus } = useMenus()
  const navigate = useNavigate()

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
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null)
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<string | null>(null)

  if (!workOrder) return <p className="text-gray-500">Työmääräintä ei löytynyt.</p>

  const plan = getCateringPlan(workOrderId)
  const allProposals = workOrder.proposalSections ?? []
  const proposals = allProposals
  const proposalKeys = new Set(proposals.map((p) => p.sectionKey))

  function addMomentToProposal(momentId: string) {
    const key = `catering-${momentId}`
    if (proposalKeys.has(key)) return
    const entry: ProposalSection = { sectionKey: key, sentAt: null, status: "draft" }
    updateWorkOrder(workOrderId, { proposalSections: [...proposals, entry] })
  }

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

  function addEmptyMoment() {
    const moment: CateringMoment = {
      id: generateId(),
      title: "Uusi tarjoiluhetki",
      startTime: "",
      endTime: "",
      spaceName: "",
      menuId: "",
      menuName: "",
      price: 0,
      status: "luonnos",
    }
    addMomentAndSchedule(moment)
    setExpandedMenuId(moment.id)
  }

  function updateMomentField(momentId: string, updates: Partial<CateringMoment>) {
    updateCateringMoment(workOrderId, momentId, updates)
    if (eventDay) {
      const scheduleUpdates: Record<string, string> = {}
      if (updates.title !== undefined) scheduleUpdates.title = updates.title
      if (updates.startTime !== undefined) scheduleUpdates.startTime = updates.startTime
      if (updates.endTime !== undefined) scheduleUpdates.endTime = updates.endTime
      if (updates.spaceName !== undefined) scheduleUpdates.spaceName = updates.spaceName
      if (Object.keys(scheduleUpdates).length > 0) {
        updateScheduleItem(workOrderId, eventDay.id, momentId, scheduleUpdates)
      }
    }
  }

  function startEditing(m: CateringMoment) {
    setEditingId(m.id)
    setEditSpace(m.spaceName)
    // Parse products from menuName (comma-separated)
    setEditProducts(
      m.menuName ? m.menuName.split(",").map((s) => s.trim()).filter(Boolean) : []
    )
    setEditNotes("")
  }

  function cancelEditing() {
    setEditingId(null)
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

      {(
      <>
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
                value={plan.dietaryNeeds || workOrder?.accessibilityNeeds || ""}
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
                value={plan.servingArea || (spaces.length > 0 ? spaces.map((s) => s.spaceName).join(", ") : "")}
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
                value={plan.notes.includes("kattaus:") ? plan.notes.split("kattaus:")[1]?.split("\n")[0] ?? "" : (workOrder?.seatingStyle ? { teatteri: "Teatteri", luokkahuone: "Luokkahuone", u_muoto: "U-muoto", banketti: "Banketti", cocktail: "Cocktail", muu: "Muu" }[workOrder.seatingStyle] ?? "" : "")}
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

      {/* Tarjoiluhetket heading */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Tarjoiluhetket</h2>
      </div>

      {/* Catering-hetket — WorkOrderSectionCard + menu-valinta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plan.moments.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-8 py-10 text-center">
            <UtensilsCrossed className="h-8 w-8 text-gray-300" />
            <p className="text-[13px] text-gray-500">Ei vielä tarjoiluhetkiä. Luo luonnos tai lisää tarjoiluhetki.</p>
          </div>
        )}
        {plan.moments.map((m) => {
          const isOpen = expandedMenuId === m.id
          const selectedMenu = m.menuName ? menus.find((mn) => mn.name === m.menuName) : null
          const inProposal = proposalKeys.has(`catering-${m.id}`)

          return (
            <div key={m.id} className="relative">
              <WorkOrderSectionCard
                onClick={() => setExpandedMenuId(isOpen ? null : m.id)}
                title={m.title}
                subtitle={`${m.startTime}–${m.endTime && m.endTime !== m.startTime ? m.endTime : m.startTime}${m.spaceName ? ` · ${m.spaceName}` : ""}`}
                badgeLabel={selectedMenu ? selectedMenu.name : "Ei menua"}
                badgeClassName={selectedMenu ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}
                progress={selectedMenu ? 100 : 0}
                hideProgress
                description={selectedMenu ? `${selectedMenu.products.length} tuotetta · ${selectedMenu.pricePerPerson.toFixed(2)} €/hlö` : "Valitse menu klikkaamalla korttia."}
                note={m.notes || undefined}
              />
              {/* + nappi — sama positio kuin yleiskuvalla */}
              {!inProposal ? (
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => addMomentToProposal(m.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-primary-600 hover:border-primary-300 transition-colors"
                    title="Lisää ehdotukseen"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="absolute top-4 right-4 z-10">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600" title="Ehdotuksessa">
                    <Sparkles className="h-3 w-3" />
                  </span>
                </div>
              )}

              {/* Muokkaus — avautuu kortin alle kun klikattu */}
              {isOpen && (
                <div className="rounded-b-xl border border-t-0 border-gray-200 bg-white p-4 -mt-1 space-y-3">
                  {/* Nimi + aika */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-500">Nimi</label>
                      <Input
                        value={m.title}
                        onChange={(e) => updateMomentField(m.id, { title: e.target.value })}
                        placeholder="Esim. Aamukahvi"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-500">Alkaa</label>
                      <Input
                        type="time"
                        value={m.startTime}
                        onChange={(e) => updateMomentField(m.id, { startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-500">Päättyy</label>
                      <Input
                        type="time"
                        value={m.endTime}
                        onChange={(e) => updateMomentField(m.id, { endTime: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Valittu menu */}
                  {selectedMenu && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed className="h-4 w-4 text-emerald-600" />
                          <span className="text-[13px] font-semibold text-gray-900">{selectedMenu.name}</span>
                          <Badge variant="success" className="text-[9px]">Valittu</Badge>
                        </div>
                        <button
                          type="button"
                          className="text-[11px] text-blue-600 hover:text-blue-800"
                          onClick={() => updateCateringMoment(workOrderId, m.id, { menuName: "", menuId: "" })}
                        >
                          Vaihda
                        </button>
                      </div>
                      <div className="space-y-1">
                        {(m.proposalProducts ?? selectedMenu.products.map((p) => ({ productId: p.id, name: p.name, unitPrice: p.unitPrice, unit: p.unit, quantity: 1 }))).map((p) => (
                          <div key={p.productId} className="flex items-center justify-between text-[12px] py-0.5">
                            <span className="text-gray-700">{p.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">{p.unitPrice.toLocaleString("fi-FI")} €/{p.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Menu-lista — kun ei valittu */}
                  {!selectedMenu && (
                    <>
                      {(() => {
                        const categories = [...new Set(menus.map((mn) => mn.category).filter(Boolean))]
                        if (categories.length <= 1) return null
                        return (
                          <div className="flex flex-wrap gap-2">
                            <button type="button" className={cn("rounded-full px-3 py-1 text-[12px] font-medium transition-colors", !menuCategoryFilter ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")} onClick={() => setMenuCategoryFilter(null)}>Kaikki</button>
                            {categories.map((cat) => (
                              <button key={cat} type="button" className={cn("rounded-full px-3 py-1 text-[12px] font-medium transition-colors", menuCategoryFilter === cat ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")} onClick={() => setMenuCategoryFilter(cat!)}>{cat}</button>
                            ))}
                          </div>
                        )
                      })()}
                      {menus.filter((mn) => !menuCategoryFilter || mn.category === menuCategoryFilter).map((menu) => (
                        <div
                          key={menu.id}
                          className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300 cursor-pointer transition-colors"
                          onClick={() => {
                            updateCateringMoment(workOrderId, m.id, {
                              menuName: menu.name,
                              menuId: menu.id,
                              proposalProducts: menu.products.map((p) => ({
                                productId: p.id, name: p.name, unitPrice: p.unitPrice, unit: p.unit, quantity: 1,
                              })),
                            })
                          }}
                        >
                          <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                            <UtensilsCrossed className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[13px] font-semibold text-gray-900">{menu.name}</span>
                            {menu.description && <p className="text-[11px] text-gray-500 mt-0.5">{menu.description}</p>}
                            <span className="text-[11px] text-gray-500">{menu.products.length} tuotetta · {menu.pricePerPerson.toFixed(2)} €/hlö</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Lisätiedot */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 mb-1 block">Lisätiedot</label>
                    <Textarea
                      placeholder="Lisätiedot tähän tarjoiluhetkeen..."
                      value={m.notes ?? ""}
                      onChange={(e) => updateCateringMoment(workOrderId, m.id, { notes: e.target.value })}
                      className="min-h-12 text-[12px]"
                    />
                  </div>

                  {/* Poista */}
                  <button
                    type="button"
                    className="text-[11px] text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteMoment(m.id)}
                  >
                    Poista tarjoiluhetki
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lisää tarjoilu — katkoviiva-nappi kuten yleiskuvan "Lisää uusi" */}
      <button
        type="button"
        onClick={addEmptyMoment}
        className="flex w-full max-w-[calc(50%-0.5rem)] items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white py-4 text-[13px] font-medium text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Lisää tarjoilu
      </button>

      {/* Send directly to client proposal */}
      {plan.moments.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 p-5">
          <div>
            <p className="text-[14px] font-semibold text-gray-900">
              Lähetä suoraan asiakkaalle
            </p>
            <p className="mt-0.5 text-[12px] text-gray-500">
              Lisää catering-osio suoraan asiakkaan ehdotukseen.
            </p>
          </div>
          <Button
            onClick={() => {
              const key = "catering"
              if (!proposalKeys.has(key)) {
                const entry: ProposalSection = { sectionKey: key, sentAt: null, status: "draft" }
                updateWorkOrder(workOrderId, { proposalSections: [...allProposals, entry] })
              }
              navigate(`/tyomarain/${workOrderId}/yleiskuva`)
            }}
          >
            Asiakkaalle
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

      <SectionNotes sectionKey="catering" />
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
              className="flex h-9 w-full appearance-none rounded-lg border border-gray-200 bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat px-3 pr-9 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
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
