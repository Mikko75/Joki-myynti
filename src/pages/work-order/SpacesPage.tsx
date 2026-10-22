import { useState } from "react"
import { Search, Building2, X, Check, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { InfoBanner } from "@/components/common/InfoBanner"
import { DayTabs } from "@/components/common/DayTabs"
import { PostItBoard } from "@/components/common/PostItBoard"
import { WorkOrderHeader } from "@/components/layout/WorkOrderHeader"
import { spaces as allSpaces } from "@/data/mock"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import type { EventSpace } from "@/data/types"

export default function SpacesPage() {
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const { updateWorkOrder } = useWorkOrders()
  const [activeDay, setActiveDay] = useState("")
  const [showBanner, setShowBanner] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuccess, setShowSuccess] = useState("")

  if (!workOrder) return <p className="text-gray-500">Työmääräintä ei löytynyt.</p>

  const currentDayId = activeDay || workOrder.eventDays[0]?.id || ""
  const currentDay = workOrder.eventDays.find((d) => d.id === currentDayId)
  const selectedSpaces = currentDay?.spaces ?? []
  const selectedIds = new Set(selectedSpaces.filter(s => s.status !== "vapautettu").map((s) => s.spaceId))

  const filtered = allSpaces.filter((s) => {
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  function selectSpace(spaceId: string) {
    if (!currentDay) return
    const space = allSpaces.find((s) => s.id === spaceId)
    if (!space) return

    const newEventSpace: EventSpace = {
      spaceId: space.id,
      spaceName: space.name,
      role: "",
      status: "optio" as const,
      price: space.pricePerDay,
    }

    const updatedDays = workOrder!.eventDays.map((d) =>
      d.id === currentDay.id
        ? { ...d, spaces: [...d.spaces, newEventSpace] }
        : d
    )
    updateWorkOrder(workOrderId, {
      eventDays: updatedDays,
      sectionStatuses: { ...workOrder!.sectionStatuses, tila: "kaynnissa" },
    })
    setShowSuccess(space.name)
    setTimeout(() => setShowSuccess(""), 3000)
  }

  function removeSpace(spaceId: string) {
    if (!currentDay) return
    const updatedDays = workOrder!.eventDays.map((d) =>
      d.id === currentDay.id
        ? { ...d, spaces: d.spaces.filter((s) => s.spaceId !== spaceId) }
        : d
    )
    const remainingSpaces = updatedDays.flatMap((d) => d.spaces)
    updateWorkOrder(workOrderId, {
      eventDays: updatedDays,
      sectionStatuses: {
        ...workOrder!.sectionStatuses,
        tila: remainingSpaces.length > 0 ? "kaynnissa" : "ei_aloitettu",
      },
    })
  }

  const hasEventDays = workOrder.eventDays.length > 0

  const tilatProposal = workOrder.proposalSections?.find(p => p.sectionKey === "tilat")
  const hasChangesRequested = tilatProposal?.status === "changes_requested"
  const hasSentProposal = tilatProposal?.status === "sent"

  return (
    <div className="space-y-6">
      <WorkOrderHeader workOrder={workOrder} title="Tilat ja optiot" />

      {hasSentProposal && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="text-amber-600 text-[13px]">⚠️</span>
          <p className="text-[13px] text-amber-800 flex-1">Tilaehdotus odottaa asiakkaan hyväksyntää. Muutokset tähän osioon palauttavat sen tilaksi "Odottaa myyjää".</p>
        </div>
      )}

      {hasChangesRequested && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 shrink-0">
            <span className="text-red-600 text-[13px] font-bold">!</span>
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-red-900">Asiakas pyytää muutoksia tiloihin</p>
            {tilatProposal?.clientComment && (
              <p className="text-[13px] text-red-700 mt-0.5">"{tilatProposal.clientComment}"</p>
            )}
          </div>
          <button
            onClick={() => updateWorkOrder(workOrderId, {
              proposalSections: (workOrder.proposalSections ?? []).map(p =>
                p.sectionKey === "tilat" ? { ...p, status: "sent" as const, clientComment: undefined } : p
              )
            })}
            className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1.5 text-[12px] font-medium hover:bg-emerald-100 transition-colors shrink-0"
          >
            ✓ Merkitse käsitellyksi
          </button>
        </div>
      )}

      {showBanner && (
        <InfoBanner onDismiss={() => setShowBanner(false)}>
          Valitse tapahtumaasi sopivat tilat. Kun tila on valittu, se siirtyy optio-tilaan.
        </InfoBanner>
      )}

      {!hasEventDays ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-[14px] text-gray-500">Lisää ensin tapahtumapäivä Yleiskuva-sivulta.</p>
        </div>
      ) : (
        <>
          <DayTabs days={workOrder.eventDays} activeDay={currentDayId} onDayChange={setActiveDay} />

          {/* Success banner */}
          {showSuccess && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 animate-in">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-emerald-800">Tila valittu onnistuneesti</p>
                <p className="text-[12px] text-emerald-600">{showSuccess} — Optio asetettu</p>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="space-y-3">
            <h2 className="text-[15px] font-semibold text-gray-900">Hae sopivia tiloja</h2>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Hae tilaa nimellä..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Space cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map((space) => {
              const isSelected = selectedIds.has(space.id)

              return (
                <div
                  key={space.id}
                  className="relative rounded-xl border border-gray-200 bg-white overflow-hidden transition-all hover:border-gray-300 hover:shadow-sm"
                >
                  {space.image && (
                    <div className="h-36 w-full overflow-hidden">
                      <img src={space.image} alt={space.name} className="h-full w-full object-cover" />
                    </div>
                  )}

                  <div className="p-5">
                  <Badge
                    variant={space.available ? "success" : "warning"}
                    className="absolute right-4 top-4"
                  >
                    {space.available ? "Vapaa" : "Varattu"}
                  </Badge>

                  {isSelected && (
                    <div className={`absolute left-4 ${space.image ? "top-[calc(9rem+1rem)]" : "top-4"}`}>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  )}

                  <h3 className="text-[15px] font-bold text-gray-900 mt-1">{space.name}</h3>
                  <p className="mt-1 text-[12px] text-gray-500">{space.description}</p>

                  <div className="mt-3 flex items-center gap-1.5 text-[13px] text-gray-600">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span>{space.capacity} hlö · {space.type}</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[13px]">
                    <span className="text-gray-500">
                      {space.available ? "Vapaa" : "Varattu"} {space.availableStart}–{space.availableEnd}
                    </span>
                    <span className="font-bold text-gray-900">
                      {space.pricePerDay.toLocaleString("fi-FI")} €
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {space.features.map((f) => (
                      <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>
                    ))}
                  </div>

                  <div className="mt-4">
                    {isSelected ? (
                      <Button variant="outline" size="sm" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => removeSpace(space.id)}>
                        <X className="h-3.5 w-3.5" />
                        Poista valinta
                      </Button>
                    ) : (
                      <Button size="sm" className="gap-1.5" onClick={() => selectSpace(space.id)} disabled={!space.available}>
                        <Check className="h-3.5 w-3.5" />
                        Valitse
                      </Button>
                    )}
                  </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Selected spaces — ALAPUOLELLA */}
          {selectedSpaces.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
              <h2 className="text-[14px] font-semibold text-gray-900">Varaukset · {selectedSpaces.length} tilaa</h2>

              {selectedSpaces.map((es) => {
                const statusConfig = {
                  optio:       { label: "Alustavasti varattu", badge: "bg-amber-100 text-amber-700", border: "border-amber-200 bg-amber-50/30" },
                  vahvistettu: { label: "Vahvistettu",         badge: "bg-emerald-100 text-emerald-700", border: "border-emerald-200 bg-emerald-50/30" },
                  vapautettu:  { label: "Vapautettu",          badge: "bg-red-100 text-red-700", border: "border-red-200 bg-red-50/30" },
                }[es.status] ?? { label: es.status, badge: "bg-gray-100 text-gray-600", border: "border-gray-200" }

                return (
                  <div key={es.spaceId} className={`rounded-xl border p-4 ${statusConfig.border}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[14px] font-semibold text-gray-900">{es.spaceName}</p>
                          <p className="text-[12px] text-gray-500">{es.role} · {es.price.toLocaleString("fi-FI")} €</p>
                          {es.optionDeadline && es.status === "optio" && (
                            <p className="text-[11px] text-amber-600 mt-0.5">
                              Optio voimassa: {new Date(es.optionDeadline).toLocaleDateString("fi-FI")}
                            </p>
                          )}
                          {es.releaseReason && (
                            <p className="text-[11px] text-red-600 mt-0.5">Syy: {es.releaseReason}</p>
                          )}
                        </div>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusConfig.badge}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Toimintopainikkeet */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {es.status === "optio" && (
                        <Button size="sm" variant="outline" className="text-[12px] gap-1 h-7"
                          onClick={() => {
                            const updated = currentDay!.spaces.map(s => s.spaceId === es.spaceId ? { ...s, status: "vahvistettu" as const } : s)
                            updateWorkOrder(workOrderId, { eventDays: workOrder!.eventDays.map(d => d.id === currentDay!.id ? { ...d, spaces: updated } : d) })
                          }}>
                          <Check className="h-3 w-3" /> Vahvista
                        </Button>
                      )}
                      {es.status === "vahvistettu" && (
                        <Button size="sm" variant="outline" className="text-[12px] gap-1 h-7"
                          onClick={() => {
                            const updated = currentDay!.spaces.map(s => s.spaceId === es.spaceId ? { ...s, status: "optio" as const } : s)
                            updateWorkOrder(workOrderId, { eventDays: workOrder!.eventDays.map(d => d.id === currentDay!.id ? { ...d, spaces: updated } : d) })
                          }}>
                          Palauta optioon
                        </Button>
                      )}
                      {es.status !== "vapautettu" && (
                        <Button size="sm" variant="outline"
                          className="text-[12px] gap-1 h-7 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => {
                            const reason = window.prompt("Syy vapautukselle?\n\n1. Isompi tapahtuma\n2. Asiakas perui\n3. Muu\n\nKirjoita syy:")
                            if (reason === null) return
                            const updated = currentDay!.spaces.map(s => s.spaceId === es.spaceId ? { ...s, status: "vapautettu" as const, releaseReason: reason || "Ei syytä" } : s)
                            updateWorkOrder(workOrderId, { eventDays: workOrder!.eventDays.map(d => d.id === currentDay!.id ? { ...d, spaces: updated } : d) })
                          }}>
                          Vapauta tila
                        </Button>
                      )}
                      {es.status === "vapautettu" && (
                        <Button size="sm" variant="outline" className="text-[12px] gap-1 h-7"
                          onClick={() => {
                            const updated = currentDay!.spaces.map(s => s.spaceId === es.spaceId ? { ...s, status: "optio" as const, releaseReason: undefined } : s)
                            updateWorkOrder(workOrderId, { eventDays: workOrder!.eventDays.map(d => d.id === currentDay!.id ? { ...d, spaces: updated } : d) })
                          }}>
                          Palauta optioon
                        </Button>
                      )}
                      <button
                        className="text-[11px] text-gray-400 hover:text-red-500 transition-colors ml-auto"
                        onClick={() => removeSpace(es.spaceId)}
                      >
                        Poista
                      </button>
                    </div>
                  </div>
                )
              })}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <p className="text-[13px] font-semibold text-gray-900">
                  Yhteensä: {selectedSpaces.reduce((sum, s) => sum + s.price, 0).toLocaleString("fi-FI")} €
                </p>
                <p className="text-[11px] text-gray-500">
                  {selectedSpaces.filter(s => s.status === "vahvistettu").length} vahvistettu /
                  {selectedSpaces.filter(s => s.status === "optio").length} optio
                </p>
              </div>
            </div>
          )}


          <PostItBoard sectionKey="tilat" />
        </>
      )}
    </div>
  )
}
