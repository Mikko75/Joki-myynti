import { useState } from "react"
import { Calendar, Users, MapPin, Clock, UtensilsCrossed, Download, MessageSquare, CheckCircle2, Building2, Plus, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardTitle } from "@/components/ui/card"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { SectionChat } from "@/components/common/SectionChat"
import { spaces as spaceCatalog, additionalServices } from "@/data/mock"
import type { ScheduleItemType } from "@/data/types"

function typeBadge(type: ScheduleItemType) {
  switch (type) {
    case "catering": return <Badge variant="blue" className="text-[10px]">Catering</Badge>
    case "av": return <Badge variant="purple" className="text-[10px]">AV</Badge>
    case "ohjelma": return <Badge variant="warning" className="text-[10px]">Ohjelma</Badge>
    default: return null
  }
}

export default function ClientPortal({ workOrderId }: { workOrderId: string }) {
  const { getWorkOrder, getCateringPlan, getAVPlan, updateWorkOrder } = useWorkOrders()
  const workOrder = getWorkOrder(workOrderId)
  const catering = getCateringPlan(workOrderId)
  const avPlan = getAVPlan(workOrderId)
  const [showConfirmReject, setShowConfirmReject] = useState(false)

  if (!workOrder) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <p className="text-gray-500">Valitse ensin työmääräin myyjänäkymästä.</p>
      </div>
    )
  }

  const day = workOrder.eventDays[0]
  const scheduleItems = day?.scheduleItems ?? []
  const spaces = day?.spaces ?? []
  const allSpaces = workOrder.eventDays.flatMap((d) => d.spaces)

  const tilaTotal = allSpaces.reduce((s, sp) => s + (sp.price ?? 0), 0)
  const cateringTotal = catering.moments.reduce((s, m) => s + (m.price ?? 0), 0)

  const selectedAddOns = workOrder.selectedAddOns ?? []
  const selectedAddOnProducts = selectedAddOns
    .map((sel) => {
      const service = additionalServices.find((s) => s.id === sel.productId)
      return service ? { ...service, quantity: sel.quantity ?? 1 } : undefined
    })
    .filter((s): s is NonNullable<typeof s> => s !== undefined)
  const addOnsTotal = selectedAddOnProducts.reduce((s, p) => s + p.price * p.quantity, 0)

  const selectedServiceIds = new Set(selectedAddOns.map((s) => s.productId))
  const recommendedAddOns = additionalServices.filter((s) => !selectedServiceIds.has(s.id))

  function toggleAddOn(productId: string) {
    const isSelected = selectedAddOns.some((s) => s.productId === productId)
    const next = isSelected
      ? selectedAddOns.filter((s) => s.productId !== productId)
      : [...selectedAddOns, { productId }]
    updateWorkOrder(workOrderId, { selectedAddOns: next })
  }

  const veroton = tilaTotal + cateringTotal + (avPlan.price ?? 0) + addOnsTotal
  const alv = veroton * 0.255
  const verollinen = veroton + alv
  const hasPriceBreakdown = tilaTotal > 0 || cateringTotal > 0 || avPlan.price > 0 || addOnsTotal > 0

  const isOptio = workOrder.offerPhase === "optio"
  const isConfirmed = workOrder.status === "vahvistettu"

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div>
        <p className="text-[12px] text-gray-400 uppercase tracking-wider font-medium">
          {isOptio ? "Tilaoptio" : "Tapahtumatarjous"}
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{workOrder.customerCompany}</h1>
        <p className="text-[14px] text-gray-500 mt-1">{workOrder.eventType} • {workOrder.number}</p>
      </div>

      {/* Status banner */}
      {isConfirmed && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-[15px] font-semibold text-emerald-800">Tarjous hyväksytty</p>
          <p className="text-[12px] text-emerald-600 mt-1">Kiitos! Olemme yhteydessä tapahtuman järjestelyistä.</p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Left column */}
        <div className="min-w-0 space-y-6">
          {/* Event info card */}
          {day && (
            <Card>
              <CardTitle className="mb-4">Tapahtuman tiedot</CardTitle>
              <div className="grid grid-cols-2 gap-4 text-[13px]">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Päivämäärä</p>
                    <p className="font-medium text-gray-900">{day.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Aika</p>
                    <p className="font-medium text-gray-900">{day.bookingStart}–{day.bookingEnd}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Osallistujat</p>
                    <p className="font-medium text-gray-900">{workOrder.participantEstimate} hlö</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Tilat</p>
                    <p className="font-medium text-gray-900">
                      {spaces.length > 0 ? spaces.map((s) => s.spaceName).join(", ") : "–"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Space cards — read-only */}
          {allSpaces.length > 0 && (
            <Card>
              <CardTitle className="mb-4">Valitut tilat</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allSpaces.map((es) => {
                  const detail = spaceCatalog.find((s) => s.id === es.spaceId)
                  return (
                    <div key={es.spaceId} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-gray-200 shrink-0">
                          <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-gray-900">{es.spaceName}</p>
                          {detail && (
                            <p className="text-[12px] text-gray-500 mt-0.5">{detail.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-[12px] text-gray-500">
                            {detail && (
                              <span>{detail.capacity} hlö · {detail.type}</span>
                            )}
                          </div>
                          {detail && detail.features.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {detail.features.map((f) => (
                                <span key={f} className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-500">{f}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Schedule — only for full tarjous */}
          {!isOptio && scheduleItems.length > 0 && (
            <Card>
              <CardTitle className="mb-4">Aikataulu</CardTitle>
              <div className="space-y-2">
                {scheduleItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <span className="text-[13px] font-mono text-gray-500 w-24 shrink-0">
                      {item.startTime}{item.endTime && item.endTime !== item.startTime ? `–${item.endTime}` : ""}
                    </span>
                    <span className="text-[13px] font-medium text-gray-900 flex-1">{item.title}</span>
                    {typeBadge(item.type)}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Catering — only for full tarjous */}
          {!isOptio && (catering.moments.length > 0 || catering.servingArea) && (
            <Card className="space-y-4">
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-4.5 w-4.5 text-gray-400" />
                Catering
              </CardTitle>

              {/* Catering info */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-[13px]">
                {catering.servingArea && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Toimittaja</span>
                    <span className="font-medium text-gray-900">{catering.servingArea}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Henkilömäärä</span>
                  <span className="font-medium text-gray-900">{catering.participantCount || workOrder.participantEstimate} hlö</span>
                </div>
                {catering.dietaryNeeds && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Erityisruokavaliot</span>
                    <span className="font-medium text-gray-900">{catering.dietaryNeeds}</span>
                  </div>
                )}
              </div>

              {/* Tarjoiluhetket */}
              {catering.moments.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <h3 className="text-[13px] font-semibold text-gray-700">Tarjoiluhetket</h3>
                  {catering.moments.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 text-[13px] rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                      <span className="font-mono text-gray-500 w-24 shrink-0">{m.startTime}–{m.endTime}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-900">{m.title}</span>
                        {m.menuName && <span className="text-gray-400 ml-2">• {m.menuName}</span>}
                      </div>
                      {m.spaceName && <span className="text-[12px] text-gray-400">{m.spaceName}</span>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Suositellut lisäpalvelut */}
          {!isConfirmed && recommendedAddOns.length > 0 && (
            <Card>
              <CardTitle className="mb-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gray-400" />
                Sinua saattaa kiinnostaa
              </CardTitle>
              <p className="text-[12px] text-gray-500 mb-4">
                Täydennä tapahtumaasi näillä lisäpalveluilla.
              </p>
              <div className="space-y-2">
                {recommendedAddOns.map((service) => {
                  const isSelected = selectedAddOns.some((s) => s.productId === service.id)
                  return (
                    <div
                      key={service.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 shrink-0">
                          <Sparkles className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-gray-900">{service.name}</p>
                          <p className="text-[12px] text-gray-500">
                            {service.price.toLocaleString("fi-FI")} €
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        className="shrink-0 gap-1"
                        onClick={() => toggleAddOn(service.id)}
                      >
                        {isSelected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        {isSelected ? "Lisätty" : "Lisää"}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Action required */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-3">Sinulta tarvitaan</h2>
            <ul className="space-y-2 text-[13px] text-gray-700">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                Vahvista lopullinen osallistujamäärä
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                Ilmoita erityisruokavaliot
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                Tarkista laskutustiedot
              </li>
            </ul>
          </div>

          {/* Chat with seller */}
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-gray-400" />
              Keskustelu myyjän kanssa
            </h2>
            <SectionChat sectionKey="asiakas" />
          </div>
        </div>

        {/* Right column — summary + actions */}
        <div className="space-y-4 lg:sticky lg:top-6">
          {/* Tarjouksen osa-alueet — sama kuin myyjän yhteenvedossa */}
          <Card>
            <CardTitle className="mb-3">Tarjouksen osa-alueet</CardTitle>
            <div className="space-y-1.5 text-[12px]">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
                <span className="font-medium text-gray-700">Tilat</span>
                {allSpaces.length > 0 ? (
                  <span className="font-medium text-gray-900">{allSpaces.length} tilaa · {tilaTotal.toLocaleString("fi-FI")} €</span>
                ) : (
                  <span className="text-gray-400">Ei aloitettu</span>
                )}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
                <span className="font-medium text-gray-700">Aikataulu</span>
                {scheduleItems.length > 0 ? (
                  <span className="font-medium text-gray-900">{scheduleItems.length} ohjelmakohtaa</span>
                ) : (
                  <span className="text-gray-400">Ei aloitettu</span>
                )}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
                <span className="font-medium text-gray-700">Catering</span>
                {catering.moments.length > 0 ? (
                  <span className="font-medium text-gray-900">{catering.moments.length} tarjoiluhetkeä · {cateringTotal.toLocaleString("fi-FI")} €</span>
                ) : (
                  <span className="text-gray-400">Ei aloitettu</span>
                )}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
                <span className="font-medium text-gray-700">AV / tekniikka</span>
                {(avPlan.price ?? 0) > 0 ? (
                  <span className="font-medium text-gray-900">{(avPlan.price ?? 0).toLocaleString("fi-FI")} €</span>
                ) : (
                  <span className="text-gray-400">Ei aloitettu</span>
                )}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
                <span className="font-medium text-gray-700">Lisäpalvelut</span>
                {addOnsTotal > 0 ? (
                  <span className="font-medium text-gray-900">{addOnsTotal.toLocaleString("fi-FI")} €</span>
                ) : (
                  <span className="text-gray-400">Ei aloitettu</span>
                )}
              </div>
            </div>
          </Card>

          {hasPriceBreakdown && (
            <Card>
              <CardTitle className="mb-4">Hintaerittely</CardTitle>
              <div className="space-y-2 text-[13px]">
                {allSpaces.length > 0 && (
                  <div>
                    <div className="flex justify-between text-gray-500 mb-1">
                      <span className="font-medium text-gray-700">Tilat</span>
                      <span className="font-medium text-gray-900">{tilaTotal.toLocaleString("fi-FI")} €</span>
                    </div>
                    <div className="ml-4 space-y-1">
                      {allSpaces.map((s) => (
                        <div key={s.spaceId} className="flex justify-between">
                          <span className="text-gray-500">{s.spaceName}</span>
                          <span className="text-gray-600">{(s.price ?? 0).toLocaleString("fi-FI")} €</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {cateringTotal > 0 && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-700">Catering</span>
                      <span className="font-medium text-gray-900">{cateringTotal.toLocaleString("fi-FI")} €</span>
                    </div>
                    <div className="ml-4 space-y-1">
                      {catering.moments.filter((m) => m.price > 0).map((m) => (
                        <div key={m.id} className="flex justify-between">
                          <span className="text-gray-500">{m.title}</span>
                          <span className="text-gray-600">{m.price.toLocaleString("fi-FI")} €</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {avPlan.price > 0 && (
                  <div className="flex justify-between"><span className="font-medium text-gray-700">AV / tekniikka</span><span className="font-medium text-gray-900">{avPlan.price.toLocaleString("fi-FI")} €</span></div>
                )}
                {addOnsTotal > 0 && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-700">Lisäpalvelut</span>
                      <span className="font-medium text-gray-900">{addOnsTotal.toLocaleString("fi-FI")} €</span>
                    </div>
                    <div className="ml-4 space-y-1">
                      {selectedAddOnProducts.map((p) => (
                        <div key={p.id} className="flex justify-between">
                          <span className="text-gray-500">{p.name}{p.quantity > 1 ? ` (×${p.quantity})` : ""}</span>
                          <span className="text-gray-600">{(p.price * p.quantity).toLocaleString("fi-FI")} €</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between"><span className="text-gray-500">Veroton</span><span className="font-medium">{veroton.toLocaleString("fi-FI")} €</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">ALV 25.5%</span><span className="font-medium">{alv.toLocaleString("fi-FI", { maximumFractionDigits: 0 })} €</span></div>
                  <div className="flex justify-between text-[15px] font-bold mt-1"><span>Yhteensä</span><span>{verollinen.toLocaleString("fi-FI", { maximumFractionDigits: 0 })} €</span></div>
                </div>
              </div>

              {/* Action buttons */}
              {!isConfirmed && (
                <div className="mt-5 pt-4 border-t border-gray-200">
                  {/* Primary action — dominant, matches "Pay Now" weight */}
                  {isOptio ? (
                    <Button
                      size="lg"
                      className="w-full justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-base"
                      onClick={() => {
                        const updatedDays = workOrder.eventDays.map((d) => ({
                          ...d,
                          spaces: d.spaces.map((s) => ({ ...s, optionStatus: "vahvistettu" })),
                        }))
                        updateWorkOrder(workOrderId, { status: "tyonalla", eventDays: updatedDays })
                      }}
                    >
                      <CheckCircle2 className="h-4.5 w-4.5" />
                      Vahvista optio
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-base"
                      onClick={() => updateWorkOrder(workOrderId, { status: "vahvistettu" })}
                    >
                      <CheckCircle2 className="h-4.5 w-4.5" />
                      Hyväksy tarjous
                    </Button>
                  )}

                  {/* Secondary actions — lower visual weight */}
                  <div className="mt-3 flex items-center justify-center gap-4 text-[12px]">
                    <button
                      className="text-gray-500 hover:text-gray-700 underline-offset-2 hover:underline cursor-pointer"
                      onClick={() => updateWorkOrder(workOrderId, { status: "tyonalla" })}
                    >
                      Pyydä muutoksia
                    </button>
                    <span className="text-gray-300">·</span>
                    <button
                      className="text-gray-500 hover:text-gray-700 underline-offset-2 hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Lataa PDF
                    </button>
                    <span className="text-gray-300">·</span>
                    <button
                      className="text-red-500 hover:text-red-700 underline-offset-2 hover:underline cursor-pointer"
                      onClick={() => setShowConfirmReject(true)}
                    >
                      Hylkää tarjous
                    </button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Reject confirmation */}
          {showConfirmReject && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="text-[14px] font-semibold text-red-800">Haluatko varmasti hylätä tarjouksen?</p>
              <p className="text-[12px] text-red-600 mt-1">Tämä toiminto on lopullinen.</p>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => setShowConfirmReject(false)}>Peruuta</Button>
                <Button variant="destructive" size="sm" onClick={() => {
                  updateWorkOrder(workOrderId, { status: "ei_toteudu" })
                  setShowConfirmReject(false)
                }}>
                  Hylkää
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
