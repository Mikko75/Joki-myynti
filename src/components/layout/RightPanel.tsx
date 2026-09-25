import { useState } from "react"
import { Building2, Calendar, Clock, Users, Minus, Plus, X, Send, Check, PanelRightClose, PanelRightOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { additionalServices } from "@/data/mock"
import { cn } from "@/lib/utils"
import type { SectionStatus } from "@/data/types"

function formatPrice(amount: number): string {
  return amount.toLocaleString("fi-FI", { maximumFractionDigits: 0 }) + " €"
}

const STATUS_DOT: Record<SectionStatus, string> = {
  ei_aloitettu: "bg-gray-300",
  kaynnissa: "bg-amber-400",
  valmis: "bg-emerald-400",
}

function SummaryRow({ dot, label, value, empty }: { dot: string; label: string; value?: string; empty: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px]">
      <span className={cn("h-2 w-2 rounded-full shrink-0", dot)} />
      <span className="font-medium text-gray-700">{label}</span>
      <span className="ml-auto text-right">
        {value ? (
          <span className="font-medium text-gray-900">{value}</span>
        ) : (
          <span className="text-gray-400">{empty}</span>
        )}
      </span>
    </div>
  )
}

export function RightPanel() {
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const { getCateringPlan, getAVPlan, updateWorkOrder } = useWorkOrders()
  const [isOpen, setIsOpen] = useState(true)

  if (!workOrder) return null

  const cateringPlan = getCateringPlan(workOrderId)
  const avPlan = getAVPlan(workOrderId)
  const day = workOrder.eventDays[0]
  const allSpaces = workOrder.eventDays.flatMap((d) => d.spaces)
  const allScheduleItems = workOrder.eventDays.flatMap((d) => d.scheduleItems)

  const tilaTotal = allSpaces.reduce((sum, s) => sum + (s.price ?? 0), 0)
  const cateringTotal = cateringPlan.moments.reduce((sum, m) => sum + (m.price ?? 0), 0)
  const avTotal = avPlan.price ?? 0
  const hasAV = avTotal > 0 || Boolean(avPlan.microphones || avPlan.audio || avPlan.screens)

  const selectedAddOns = workOrder.selectedAddOns ?? []
  const selectedAddOnProducts = selectedAddOns
    .map((sel) => {
      const service = additionalServices.find((s) => s.id === sel.productId)
      return service ? { ...service, quantity: sel.quantity ?? 1 } : undefined
    })
    .filter((s): s is NonNullable<typeof s> => s !== undefined)
  const addOnsTotal = selectedAddOnProducts.reduce((s, p) => s + p.price * p.quantity, 0)

  const veroton = tilaTotal + cateringTotal + avTotal + addOnsTotal
  const alv = veroton * 0.255
  const maksettava = veroton + alv

  const isSent = workOrder.status === "asiakkaalla" || workOrder.status === "vahvistettu"

  const tilaStatusDot = STATUS_DOT[workOrder.sectionStatuses.tila]
  const cateringStatusDot = STATUS_DOT[workOrder.sectionStatuses.catering]
  const avStatusDot = STATUS_DOT[workOrder.sectionStatuses.av]
  const scheduleStatus: SectionStatus = allScheduleItems.length === 0 ? "ei_aloitettu" : allScheduleItems.every((i) => i.status === "valmis") ? "valmis" : "kaynnissa"
  const aikatauluDot = STATUS_DOT[scheduleStatus]

  function setQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      updateWorkOrder(workOrderId, { selectedAddOns: selectedAddOns.filter((s) => s.productId !== productId) })
      return
    }
    const exists = selectedAddOns.some((s) => s.productId === productId)
    const next = exists
      ? selectedAddOns.map((s) => (s.productId === productId ? { ...s, quantity } : s))
      : [...selectedAddOns, { productId, quantity }]
    updateWorkOrder(workOrderId, { selectedAddOns: next })
  }

  // Collapsed state — just a toggle button
  if (!isOpen) {
    return (
      <div className="hidden lg:flex shrink-0 border-l border-gray-200" style={{ backgroundColor: "#F8FAFC" }}>
        <button
          onClick={() => setIsOpen(true)}
          className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
          title="Avaa yhteenveto"
        >
          <PanelRightOpen className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <aside className="hidden lg:flex w-80 shrink-0 flex-col overflow-y-auto border-l border-gray-200 p-5" style={{ backgroundColor: "#F8FAFC" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-gray-900">Yhteenveto</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          title="Sulje yhteenveto"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      {/* Varaus */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 shrink-0">
            <Building2 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 truncate">{workOrder.eventType}</p>
            <div className="mt-1 space-y-0.5 text-[11px] text-gray-500">
              {day && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 shrink-0" />
                  {day.date}
                </div>
              )}
              {day && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 shrink-0" />
                  {day.bookingStart}–{day.bookingEnd}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Users className="h-3 w-3 shrink-0" />
                {workOrder.participantEstimate} hlö
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lisäpalvelut — piilotettu kokonaan kun tyhjä, ks. "Tarjouksen osa-alueet" alla */}
      {selectedAddOnProducts.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-2">Lisäpalvelut</p>
          <div className="space-y-2">
            {selectedAddOnProducts.map((p) => (
              <div key={p.id} className="rounded-lg border border-gray-200 bg-white p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-medium text-gray-900 truncate">{p.name}</p>
                  <button
                    onClick={() => setQuantity(p.id, 0)}
                    className="text-gray-300 hover:text-gray-500 shrink-0"
                    title="Poista"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">{formatPrice(p.price)} / kpl</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-full border border-gray-200 px-1">
                    <button
                      onClick={() => setQuantity(p.id, p.quantity - 1)}
                      className="flex h-5 w-5 items-center justify-center text-gray-500 hover:text-gray-900"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-[12px] font-medium">{p.quantity}</span>
                    <button
                      onClick={() => setQuantity(p.id, p.quantity + 1)}
                      className="flex h-5 w-5 items-center justify-center text-gray-500 hover:text-gray-900"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-[12px] font-semibold text-gray-900">{formatPrice(p.price * p.quantity)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator className="my-4" />

      {/* Tarjouksen osa-alueet */}
      <div>
        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">Tarjouksen osa-alueet</p>
        <div className="mt-2 space-y-1.5">
          <SummaryRow
            dot={tilaStatusDot}
            label="Tilat"
            value={allSpaces.length > 0 ? `${allSpaces.length} tilaa · ${formatPrice(tilaTotal)}` : undefined}
            empty="Ei aloitettu"
          />
          <SummaryRow
            dot={aikatauluDot}
            label="Aikataulu"
            value={allScheduleItems.length > 0 ? `${allScheduleItems.length} ohjelmakohtaa` : undefined}
            empty="Ei aloitettu"
          />
          <SummaryRow
            dot={cateringStatusDot}
            label="Catering"
            value={cateringPlan.moments.length > 0 ? `${cateringPlan.moments.length} tarjoiluhetkeä · ${formatPrice(cateringTotal)}` : undefined}
            empty="Ei aloitettu"
          />
          <SummaryRow
            dot={avStatusDot}
            label="AV / tekniikka"
            value={hasAV ? formatPrice(avTotal) : undefined}
            empty="Ei aloitettu"
          />
          <SummaryRow
            dot={addOnsTotal > 0 ? "bg-emerald-400" : "bg-gray-300"}
            label="Lisäpalvelut"
            value={addOnsTotal > 0 ? formatPrice(addOnsTotal) : undefined}
            empty="Ei aloitettu"
          />
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
          <div className="flex items-center justify-between text-[12px] text-gray-500">
            <span>Veroton</span><span>{formatPrice(veroton)}</span>
          </div>
          <div className="flex items-center justify-between text-[12px] text-gray-500">
            <span>ALV 25,5 %</span><span>{formatPrice(alv)}</span>
          </div>
          <div className="flex items-center justify-between text-[15px] font-bold text-gray-900 mt-1">
            <span>Maksettava</span><span>{formatPrice(maksettava)}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-5">
        <Button
          size="lg"
          disabled={isSent}
          className="w-full justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-[13px] disabled:opacity-60"
          onClick={() => updateWorkOrder(workOrderId, { status: "asiakkaalla", offerPhase: "tarjous" })}
        >
          {isSent ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          {isSent ? "Tarjous lähetetty" : "Lähetä tarjous asiakkaalle"}
        </Button>
      </div>
    </aside>
  )
}
