import { useState } from "react"
import { UtensilsCrossed, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { useMenus } from "@/context/MenuContext"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { SectionChat } from "@/components/common/SectionChat"
import { useParams } from "react-router-dom"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { useMode } from "@/context/ModeContext"
import type { CateringMoment, ProposalSection } from "@/data/types"

export default function PartnerCateringPage() {
  const { id } = useParams<{ id: string }>()
  const woId = id ?? ""
  const { mode } = useMode()
  const partnerId = mode
  const { getWorkOrder, getCateringPlan, updateCateringPlan, updateCateringMoment, addCateringMoment, removeCateringMoment, updateWorkOrder } = useWorkOrders()
  const workOrder = getWorkOrder(woId)
  const plan = getCateringPlan(woId, partnerId)
  const { getMenusByPartner } = useMenus()
  const menus = getMenusByPartner(partnerId)

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

  if (!workOrder) return <p className="text-gray-500">Ei löytynyt.</p>

  const eventDay = workOrder.eventDays[0]
  const scheduleItems = workOrder.eventDays.flatMap((d) => d.scheduleItems)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Ruoka & Juoma (Catering)</h1>
        <Badge variant={plan.moments.length > 0 ? "blue" : "outline"}>
          {plan.moments.length > 0 ? "Luonnos" : "Ei aloitettu"}
        </Badge>
      </div>

      {/* Tapahtuman tiedot — read-only */}
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
            <span className="text-gray-500">Henkilömäärä</span>
            <span className="font-medium text-gray-900">{plan.participantCount || workOrder.participantEstimate} hlö</span>
          </div>
        </div>
      </div>

      {/* Tapahtuman aikataulu — read-only, sama teksti kuin myyjällä */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-2">
        <h3 className="text-[14px] font-semibold text-gray-900">Tapahtuman aikataulu</h3>
        {scheduleItems.length > 0 ? (
          <div className="space-y-1">
            {scheduleItems.map((si) => (
              <div key={si.id} className="flex items-center gap-3 text-[13px]">
                <span className="text-gray-500 font-mono w-12">{si.startTime}</span>
                <span className={si.type === "catering" ? "font-medium text-amber-700" : "text-gray-700"}>{si.title}</span>
                {si.type === "catering" && <Badge className="text-[9px] bg-amber-100 text-amber-700">Catering</Badge>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-gray-400">Myyjä ei ole vielä lisännyt aikataulua.</p>
        )}
      </div>

      {/* Myyjän huomiot — read-only */}
      {plan.notes && (
        <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-6 space-y-2">
          <h3 className="text-[14px] font-semibold text-gray-900">Myyjän huomiot cateringille</h3>
          <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{plan.notes}</p>
        </div>
      )}

      {/* Erityisruokavaliot — read-only */}
      {plan.dietaryNeeds && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">Erityisruokavaliot</h3>
          <p className="text-[13px] text-gray-700">{plan.dietaryNeeds}</p>
        </div>
      )}

      {/* Kumppanin oma työ — tarjoiluhetket */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">Tarjoiluhetket</h2>

        {plan.moments.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-[13px] text-gray-400">
            Aloita rakentamalla tarjoiluhetket aikataulun pohjalta.
          </div>
        )}

        {plan.moments.map((m) => {
          const isOpen = expandedMomentId === m.id
          const selectedMenu = m.menuName ? menus.find((mn) => mn.name === m.menuName) : null
          const inProposal = proposalKeys.has(`catering-${m.id}`)

          return (
            <div key={m.id} className="rounded-xl border border-gray-200 bg-white">
              {/* Otsikkorivi */}
              <button
                type="button"
                onClick={() => setExpandedMomentId(isOpen ? null : m.id)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  <div>
                    <span className="text-[14px] font-semibold text-gray-900">{m.title}</span>
                    <span className="text-[12px] text-gray-500 ml-2">{m.startTime || "–"}{m.endTime && m.endTime !== m.startTime ? `–${m.endTime}` : ""}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedMenu && <Badge className="text-[10px] bg-emerald-100 text-emerald-700">{selectedMenu.name}</Badge>}
                  {inProposal && <Badge className="text-[10px] bg-blue-100 text-blue-700">Ehdotuksessa</Badge>}
                  {!inProposal && selectedMenu && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); addMomentToProposal(m.id) }}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-primary-600 hover:border-primary-300 transition-colors"
                      title="Lisää ehdotukseen"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </button>

              {/* Sisältö */}
              {isOpen && (
                <div className="border-t border-gray-100 p-4 space-y-4">
                  {/* Perustiedot */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-500">Nimi</label>
                      <Input value={m.title} onChange={(e) => updateCateringMoment(woId, partnerId, m.id, { title: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-500">Alkaa</label>
                      <Input type="time" value={m.startTime} onChange={(e) => updateCateringMoment(woId, partnerId, m.id, { startTime: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-500">Päättyy</label>
                      <Input type="time" value={m.endTime} onChange={(e) => updateCateringMoment(woId, partnerId, m.id, { endTime: e.target.value })} />
                    </div>
                  </div>

                  {/* Menu valinta tai valittu menu */}
                  {selectedMenu ? (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed className="h-4 w-4 text-emerald-600" />
                          <span className="text-[13px] font-semibold text-gray-900">{selectedMenu.name}</span>
                        </div>
                        <button type="button" className="text-[11px] text-blue-600 hover:text-blue-800" onClick={() => updateCateringMoment(woId, partnerId, m.id, { menuName: "", menuId: "", proposalProducts: undefined })}>Vaihda</button>
                      </div>

                      {(m.proposalProducts ?? []).map((p) => (
                        <div key={p.productId} className="flex items-center justify-between text-[12px] py-1 px-2 hover:bg-emerald-100/50 rounded">
                          <span className="text-gray-700">{p.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">{p.unitPrice.toLocaleString("fi-FI")} €/{p.unit}</span>
                            <button type="button" onClick={() => updateCateringMoment(woId, partnerId, m.id, { proposalProducts: (m.proposalProducts ?? []).filter((pp) => pp.productId !== p.productId) })} className="text-gray-400 hover:text-red-500">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {(() => {
                        const ppIds = new Set((m.proposalProducts ?? []).map((p) => p.productId))
                        const available = menus.flatMap((mn) => mn.products).filter((p) => !ppIds.has(p.id))
                        if (available.length === 0) return null
                        return (
                          <div>
                            <p className="text-[11px] font-medium text-gray-500 mb-1">Lisää tuote</p>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {available.map((p) => (
                                <button key={p.id} type="button" onClick={() => updateCateringMoment(woId, partnerId, m.id, { proposalProducts: [...(m.proposalProducts ?? []), { productId: p.id, name: p.name, unitPrice: p.unitPrice, unit: p.unit, quantity: 1 }] })} className="flex w-full items-center justify-between rounded px-2 py-1 text-[12px] text-gray-600 hover:bg-gray-100 transition-colors">
                                  <span>{p.name}</span>
                                  <span className="text-gray-400">{p.unitPrice.toLocaleString("fi-FI")} €/{p.unit} <Plus className="h-3 w-3 inline" /></span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[12px] font-medium text-gray-500">Valitse menu</p>
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
                        <div key={menu.id} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300 cursor-pointer transition-colors" onClick={() => updateCateringMoment(woId, partnerId, m.id, { menuName: menu.name, menuId: menu.id, proposalProducts: menu.products.map((p) => ({ productId: p.id, name: p.name, unitPrice: p.unitPrice, unit: p.unit, quantity: 1 })) })}>
                          <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0"><UtensilsCrossed className="h-4 w-4 text-gray-400" /></div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[13px] font-semibold text-gray-900">{menu.name}</span>
                            {menu.description && <p className="text-[11px] text-gray-500 mt-0.5">{menu.description}</p>}
                            <span className="text-[11px] text-gray-500">{menu.products.length} tuotetta · {menu.pricePerPerson.toFixed(2)} €/hlö</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Lisätiedot */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 mb-1 block">Lisätiedot</label>
                    <Textarea placeholder="Lisätiedot tähän tarjoiluhetkeen..." value={m.notes ?? ""} onChange={(e) => updateCateringMoment(woId, partnerId, m.id, { notes: e.target.value })} className="min-h-12 text-[12px]" />
                  </div>

                  <button type="button" className="text-[11px] text-red-500 hover:text-red-700" onClick={() => { removeCateringMoment(woId, partnerId, m.id); if (expandedMomentId === m.id) setExpandedMomentId(null) }}>Poista tarjoiluhetki</button>
                </div>
              )}
            </div>
          )
        })}

        {/* Lisää tarjoilu */}
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
            addCateringMoment(woId, partnerId, moment)
            setExpandedMomentId(moment.id)
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white py-4 text-[13px] font-medium text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Lisää tarjoiluhetki
        </button>
      </div>

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
