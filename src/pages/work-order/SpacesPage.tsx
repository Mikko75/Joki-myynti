import { useState } from "react"
import { Search, Building2, X, Check, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { InfoBanner } from "@/components/common/InfoBanner"
import { DayTabs } from "@/components/common/DayTabs"
import { PostItBoard } from "@/components/common/PostItBoard"
import { SectionChat } from "@/components/common/SectionChat"
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
  const selectedIds = new Set(selectedSpaces.map((s) => s.spaceId))

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
      optionStatus: "optio",
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

  return (
    <div className="space-y-6">
      <WorkOrderHeader workOrder={workOrder} title="Tilat ja optiot" />

      {hasChangesRequested && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 shrink-0">
            <span className="text-red-600 text-[13px] font-bold">!</span>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-red-900">Asiakas pyytää muutoksia tiloihin</p>
            {tilatProposal?.clientComment && (
              <p className="text-[13px] text-red-700 mt-0.5">"{tilatProposal.clientComment}"</p>
            )}
          </div>
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
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-[14px] font-semibold text-gray-900 mb-3">
                Valitut tilat · {selectedSpaces.length}
              </h2>
              <div className="flex flex-wrap gap-2">
                {selectedSpaces.map((es) => (
                  <div
                    key={es.spaceId}
                    className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2"
                  >
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[13px] font-medium text-emerald-800">{es.spaceName}</span>
                    <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700">Optio</Badge>
                    <span className="text-[12px] text-emerald-600 font-medium">{es.price.toLocaleString("fi-FI")} €</span>
                    <button
                      className="ml-1 p-0.5 text-emerald-400 hover:text-red-500 transition-colors"
                      onClick={() => removeSpace(es.spaceId)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="text-[13px] font-semibold text-gray-900">
                    Yhteensä: {selectedSpaces.reduce((sum, s) => sum + s.price, 0).toLocaleString("fi-FI")} €
                  </p>
                  <p className="text-[11px] text-gray-500">{selectedSpaces.length} tilaa valittu</p>
                </div>
                {workOrder.sectionStatuses.tila === "valmis" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-[13px] font-medium text-emerald-700">
                    <Check className="h-3.5 w-3.5" />
                    Vahvistettu
                  </span>
                ) : (
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      updateWorkOrder(workOrderId, {
                        sectionStatuses: { ...workOrder!.sectionStatuses, tila: "valmis" },
                      })
                      setShowSuccess("Tilavalinta vahvistettu")
                      setTimeout(() => setShowSuccess(""), 3000)
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Vahvista tilavalinta
                  </Button>
                )}
              </div>
            </div>
          )}


          <PostItBoard sectionKey="tilat" />
          <SectionChat sectionKey="tilat" />
        </>
      )}
    </div>
  )
}
