import { useState } from "react"
import type { FormEvent } from "react"
import { UtensilsCrossed, Plus, Trash2, Clock, MapPin, Users, Calendar, ChevronDown, Sparkles } from "lucide-react"
import { useMenus } from "@/context/MenuContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog"
import { SectionChat } from "@/components/common/SectionChat"
import { useParams } from "react-router-dom"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { WorkOrderSectionCard } from "@/components/common/WorkOrderSectionCard"
import type { CateringMoment, ProposalSection } from "@/data/types"

export default function PartnerCateringPage() {
  const { id } = useParams<{ id: string }>()
  const woId = id ?? ""
  const { getWorkOrder, getCateringPlan, updateCateringPlan, updateCateringMoment, addCateringMoment, removeCateringMoment, addScheduleItem, updateWorkOrder } = useWorkOrders()
  const workOrder = getWorkOrder(woId)
  const plan = getCateringPlan(woId)
  const { menus } = useMenus()

  const [addOpen, setAddOpen] = useState(false)
  const [expandedMomentId, setExpandedMomentId] = useState<string | null>(null)
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<string | null>(null)

  const proposals = workOrder?.proposalSections ?? []
  const proposalKeys = new Set(proposals.map((p) => p.sectionKey))

  function addMomentToProposal(momentId: string) {
    if (!workOrder) return
    const key = `catering-${momentId}`
    if (proposalKeys.has(key)) return
    const entry: ProposalSection = { sectionKey: key, sentAt: null, status: "draft" }
    updateWorkOrder(woId, { proposalSections: [...proposals, entry] })
  }
  const [title, setTitle] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [space, setSpace] = useState("")

  const eventDay = workOrder?.eventDays[0]

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !start) return
    const moment: CateringMoment = {
      id: `cm-${Date.now()}`,
      title: title.trim(),
      startTime: start,
      endTime: end || start,
      spaceName: space,
      menuId: "",
      menuName: "",
      price: 0,
      status: "luonnos",
    }
    addCateringMoment(woId, moment)
    if (eventDay) {
      addScheduleItem(woId, eventDay.id, {
        id: moment.id,
        type: "catering",
        title: moment.title,
        startTime: moment.startTime,
        endTime: moment.endTime,
        spaceName: moment.spaceName,
        status: "luonnos",
        sourceLabel: "Catering",
      })
    }
    setTitle("")
    setStart("")
    setEnd("")
    setSpace("")
    setAddOpen(false)
  }

  if (!workOrder) return <p className="text-gray-500">Ei löytynyt.</p>

  const allSpaces = workOrder.eventDays.flatMap((d) => d.spaces)
  const kattaus = plan.notes.includes("kattaus:") ? plan.notes.split("kattaus:")[1]?.split("\n")[0] ?? "" : ""

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Ruoka & Juoma (Catering)</h1>
        <Badge variant={plan.moments.length > 0 ? "blue" : "outline"}>
          {plan.moments.length > 0 ? "Luonnos" : "Ei aloitettu"}
        </Badge>
      </div>

      {/* Myyjän täyttämät tiedot — read-only for partner */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h3 className="text-[14px] font-semibold text-gray-900">Tapahtuman tiedot</h3>
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[13px]">
          <div className="flex justify-between">
            <span className="text-gray-500">Asiakas</span>
            <span className="font-medium text-gray-900">{workOrder.customerCompany}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tapahtumatyyppi</span>
            <span className="font-medium text-gray-900">{workOrder.eventType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Päivämäärä</span>
            <span className="font-medium text-gray-900">{eventDay?.date ?? "–"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Aikataulu</span>
            <span className="font-medium text-gray-900">{eventDay ? `${eventDay.bookingStart}–${eventDay.bookingEnd}` : "–"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Henkilömäärä</span>
            <span className="font-medium text-gray-900">{plan.participantCount || workOrder.participantEstimate} hlö</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tilat</span>
            <span className="font-medium text-gray-900">{allSpaces.length > 0 ? allSpaces.map((s) => s.spaceName).join(", ") : "–"}</span>
          </div>
        </div>
      </div>

      {/* Mitä kumppanin pitää tietää — myyjän täyttämät, read-only */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-6 space-y-4">
        <h3 className="text-[14px] font-semibold text-gray-900">Mitä kumppanin pitää tietää</h3>
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[13px]">
          <div className="flex justify-between">
            <span className="text-gray-500">Erityisruokavaliot</span>
            <span className="font-medium text-gray-900">{plan.dietaryNeeds || "–"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tarjoilualue / sijainti</span>
            <span className="font-medium text-gray-900">{plan.servingArea || "–"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tarjoilupisteiden määrä</span>
            <span className="font-medium text-gray-900">{plan.servingPoints || "–"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Henkilökunta</span>
            <span className="font-medium text-gray-900">{plan.staffNeeded || "–"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Kattaus</span>
            <span className="font-medium text-gray-900">{kattaus || "–"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Catering-toimittaja</span>
            <span className="font-medium text-gray-900">{plan.servingArea || "–"}</span>
          </div>
        </div>
        {plan.notes && !plan.notes.startsWith("kattaus:") && (
          <div className="border-t border-gray-100 pt-3 mt-2">
            <p className="text-[12px] text-gray-500 mb-1">Lisätiedot myyjältä</p>
            <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{plan.notes.replace(/kattaus:.*(\n|$)/, "").trim()}</p>
          </div>
        )}
      </div>


      {/* Catering-kumppanin omat kentät */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-gray-700">Erityisruokavaliot</label>
          <Input
            placeholder="Esim. kasvis, gluteeniton"
            value={plan.dietaryNeeds}
            onChange={(e) => updateCateringPlan(woId, { dietaryNeeds: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-gray-700">Tarjoilualue</label>
          <Input
            placeholder="Esim. Päätalo, Aula"
            value={plan.servingArea}
            onChange={(e) => updateCateringPlan(woId, { servingArea: e.target.value })}
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <label className="text-[13px] font-medium text-gray-700">Lisätiedot</label>
          <Textarea
            placeholder="Huomioita tai muistiinpanoja..."
            value={plan.notes}
            onChange={(e) => updateCateringPlan(woId, { notes: e.target.value })}
          />
        </div>
      </div>

      {/* Moments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Tarjoiluhetket</h2>
        </div>

        {plan.moments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-[13px] text-gray-400">
            Myyjä ei ole vielä lähettänyt tarjoiluhetkiä.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.moments.map((m) => {
              const isOpen = expandedMomentId === m.id
              const selectedMenu = m.menuName ? menus.find((mn) => mn.name === m.menuName) : null
              const inProposal = proposalKeys.has(`catering-${m.id}`)

              return (
                <div key={m.id} className="relative">
                  <WorkOrderSectionCard
                    onClick={() => setExpandedMomentId(isOpen ? null : m.id)}
                    title={m.title}
                    subtitle={`${m.startTime || "–"}–${m.endTime && m.endTime !== m.startTime ? m.endTime : m.startTime || "–"}${m.spaceName ? ` · ${m.spaceName}` : ""}`}
                    badgeLabel={selectedMenu ? selectedMenu.name : "Ei menua"}
                    badgeClassName={selectedMenu ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}
                    progress={selectedMenu ? 100 : 0}
                    hideProgress
                    description={selectedMenu ? `${selectedMenu.products.length} tuotetta · ${selectedMenu.pricePerPerson.toFixed(2)} €/hlö` : "Valitse menu klikkaamalla korttia."}
                    note={m.notes || undefined}
                  />
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

                  {isOpen && (
                    <div className="rounded-b-xl border border-t-0 border-gray-200 bg-white p-4 -mt-1 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-gray-500">Nimi</label>
                          <Input value={m.title} onChange={(e) => updateCateringMoment(woId, m.id, { title: e.target.value })} placeholder="Esim. Aamukahvi" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-gray-500">Alkaa</label>
                          <Input type="time" value={m.startTime} onChange={(e) => updateCateringMoment(woId, m.id, { startTime: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-gray-500">Päättyy</label>
                          <Input type="time" value={m.endTime} onChange={(e) => updateCateringMoment(woId, m.id, { endTime: e.target.value })} />
                        </div>
                      </div>

                      {selectedMenu ? (() => {
                        const pp = m.proposalProducts ?? []
                        const ppIds = new Set(pp.map((p) => p.productId))
                        const allProducts = menus.flatMap((mn) => mn.products)
                        const availableProducts = allProducts.filter((p) => !ppIds.has(p.id))

                        function addProduct(product: { id: string; name: string; unitPrice: number; unit: string }) {
                          updateCateringMoment(woId, m.id, {
                            proposalProducts: [...pp, { productId: product.id, name: product.name, unitPrice: product.unitPrice, unit: product.unit, quantity: 1 }],
                          })
                        }

                        function removeProduct(productId: string) {
                          updateCateringMoment(woId, m.id, {
                            proposalProducts: pp.filter((p) => p.productId !== productId),
                          })
                        }

                        return (
                          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <UtensilsCrossed className="h-4 w-4 text-emerald-600" />
                                <span className="text-[13px] font-semibold text-gray-900">{selectedMenu.name}</span>
                                <Badge variant="success" className="text-[9px]">Valittu</Badge>
                              </div>
                              <button type="button" className="text-[11px] text-blue-600 hover:text-blue-800" onClick={() => updateCateringMoment(woId, m.id, { menuName: "", menuId: "", proposalProducts: undefined })}>Vaihda</button>
                            </div>

                            {/* Ehdotuksen tuotteet */}
                            <div className="space-y-1">
                              {pp.map((p) => (
                                <div key={p.productId} className="flex items-center justify-between text-[12px] py-1 rounded px-2 hover:bg-emerald-100/50">
                                  <span className="text-gray-700">{p.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500">{p.unitPrice.toLocaleString("fi-FI")} €/{p.unit}</span>
                                    <button type="button" onClick={() => removeProduct(p.productId)} className="text-gray-400 hover:text-red-500">
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Lisää tuote */}
                            {availableProducts.length > 0 && (
                              <div>
                                <p className="text-[11px] font-medium text-gray-500 mb-1">Lisää tuote</p>
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                  {availableProducts.map((p) => (
                                    <button
                                      key={p.id}
                                      type="button"
                                      onClick={() => addProduct(p)}
                                      className="flex w-full items-center justify-between rounded px-2 py-1 text-[12px] text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                      <span>{p.name}</span>
                                      <span className="flex items-center gap-1 text-gray-400">
                                        {p.unitPrice.toLocaleString("fi-FI")} €/{p.unit}
                                        <Plus className="h-3 w-3" />
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })() : (
                        <>
                          {(() => {
                            const categories = [...new Set(menus.map((mn) => mn.category).filter(Boolean))]
                            if (categories.length <= 1) return null
                            return (
                              <div className="flex flex-wrap gap-2">
                                <button type="button" className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${!menuCategoryFilter ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`} onClick={() => setMenuCategoryFilter(null)}>Kaikki</button>
                                {categories.map((cat) => (
                                  <button key={cat} type="button" className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${menuCategoryFilter === cat ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`} onClick={() => setMenuCategoryFilter(cat!)}>{cat}</button>
                                ))}
                              </div>
                            )
                          })()}
                          {menus.filter((mn) => !menuCategoryFilter || mn.category === menuCategoryFilter).map((menu) => (
                            <div key={menu.id} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300 cursor-pointer transition-colors" onClick={() => updateCateringMoment(woId, m.id, {
                              menuName: menu.name,
                              menuId: menu.id,
                              proposalProducts: menu.products.map((p) => ({
                                productId: p.id, name: p.name, unitPrice: p.unitPrice, unit: p.unit, quantity: 1,
                              })),
                            })}>
                              <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0"><UtensilsCrossed className="h-4 w-4 text-gray-400" /></div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[13px] font-semibold text-gray-900">{menu.name}</span>
                                {menu.description && <p className="text-[11px] text-gray-500 mt-0.5">{menu.description}</p>}
                                <span className="text-[11px] text-gray-500">{menu.products.length} tuotetta · {menu.pricePerPerson.toFixed(2)} €/hlö</span>
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      <div>
                        <label className="text-[11px] font-medium text-gray-500 mb-1 block">Lisätiedot</label>
                        <Textarea placeholder="Lisätiedot..." value={m.notes ?? ""} onChange={(e) => updateCateringMoment(woId, m.id, { notes: e.target.value })} className="min-h-12 text-[12px]" />
                      </div>

                      <button type="button" className="text-[11px] text-red-500 hover:text-red-700" onClick={() => removeCateringMoment(woId, m.id)}>Poista tarjoiluhetki</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Lisää tarjoilu — sama katkoviiva kuin myyjällä */}
      <button
        type="button"
        onClick={() => {
          const moment: CateringMoment = {
            id: `cm-${Date.now()}`,
            title: "Uusi tarjoiluhetki",
            startTime: "",
            endTime: "",
            spaceName: "",
            menuId: "",
            menuName: "",
            price: 0,
            status: "luonnos",
          }
          addCateringMoment(woId, moment)
          setExpandedMomentId(moment.id)
        }}
        className="flex w-full max-w-[calc(50%-0.5rem)] items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white py-4 text-[13px] font-medium text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Lisää tarjoilu
      </button>

      {/* Inline send poistettu — RightPanel hoitaa lähetyksen */}

      {plan.status === "vastattu" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-[14px] font-semibold text-gray-900">Ehdotus lähetetty</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Myyjä käsittelee ehdotustasi.</p>
        </div>
      )}

      <SectionChat sectionKey="catering" />
    </div>
  )
}
