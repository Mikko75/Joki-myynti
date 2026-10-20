import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Send, Eye, MapPin, UtensilsCrossed, Monitor, FileText,
  Check, Plus, ChevronDown, ChevronUp, Pencil, ExternalLink, Paperclip,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardTitle } from "@/components/ui/card"
import { WorkOrderHeader } from "@/components/layout/WorkOrderHeader"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { additionalServices } from "@/data/mock"
import { cn } from "@/lib/utils"
import type { CateringStatus } from "@/data/types"

function formatPrice(value: number): string {
  return value.toLocaleString("fi-FI") + " €"
}

const cateringStatusLabels: Record<CateringStatus, string> = {
  ei_aloitettu: "Ei aloitettu",
  luonnos: "Luonnos",
  kumppanilla: "Kumppanilla",
  vastattu: "Odottaa hyväksyntää",
  valmis: "Valmis",
}

const cateringStatusBadge: Record<CateringStatus, string> = {
  ei_aloitettu: "bg-gray-100 text-gray-600",
  luonnos: "bg-amber-100 text-amber-700",
  kumppanilla: "bg-blue-100 text-blue-700",
  vastattu: "bg-purple-100 text-purple-700",
  valmis: "bg-emerald-100 text-emerald-700",
}

export default function OfferPage() {
  const navigate = useNavigate()
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const { getCateringPlan, getAVPlan, updateWorkOrder } = useWorkOrders()
  const [sent, setSent] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ tilat: true, catering: true, av: true, lisapalvelut: true })

  if (!workOrder) {
    return <div className="flex items-center justify-center py-20 text-gray-500">Työtilausta ei löydy.</div>
  }

  const wo = workOrder
  const base = `/tyomarain/${workOrderId}`
  const cateringPlan = getCateringPlan(workOrderId)
  const avPlan = getAVPlan(workOrderId)
  const offerVersion = wo.currentOfferVersion || 1
  const isAsiakkaalla = wo.status === "asiakkaalla"

  const allSpaces = wo.eventDays.flatMap((day) => day.spaces)
  const spacesTotal = allSpaces.reduce((sum, s) => sum + (s.price ?? 0), 0)
  const cateringMoments = cateringPlan.moments
  const cateringTotal = cateringMoments.reduce((sum, m) => sum + m.price, 0)
  const avProduction = wo.avProduction
  const avProductionAreas = avProduction?.productionAreas.filter(a => a.status !== "ei_tarvita") ?? []
  const avTotal = avProduction?.totalPrice ?? avPlan.price
  const selectedAddOns = wo.selectedAddOns ?? []
  const selectedServices = selectedAddOns
    .map((sel) => {
      const svc = additionalServices.find((s) => s.id === sel.productId)
      return svc ? { ...svc, quantity: sel.quantity ?? 1 } : null
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)
  const addOnsTotal = selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0)

  const totalExVat = spacesTotal + cateringTotal + avTotal + addOnsTotal
  const vatRate = 0.255
  const vatAmount = Math.round(totalExVat * vatRate)
  const totalIncVat = totalExVat + vatAmount

  const firstDay = wo.eventDays[0]

  function toggle(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleSend() {
    updateWorkOrder(workOrderId, { status: "asiakkaalla", offerPhase: "tarjous" })
    setSent(true)
  }

  const tilaStatus = wo.sectionStatuses.tila
  const cateringStatus = cateringPlan.status
  const avStatus = avPlan.status
  const attachments = wo.attachments ?? []

  return (
    <div className="space-y-6">
      <WorkOrderHeader
        workOrder={wo}
        title="Tarjous / Yhteenveto"
        right={
          <Badge variant="outline">
            <FileText className="mr-1 h-3 w-3" />
            Tarjous v{offerVersion}
          </Badge>
        }
      />

      {(isAsiakkaalla || sent) && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <Check className="h-4 w-4 shrink-0" />
          Tarjous on lähetetty asiakkaalle. Odottaa vastausta.
        </div>
      )}

      {/* Aikataulun lähtötiedot */}
      {firstDay && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-base">Aikataulun lähtötiedot / Päivämäärä {firstDay.date}</CardTitle>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`${base}/aikataulu`)}>
              <Pencil className="h-3.5 w-3.5" /> Muokkaa lähtötietoja
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 text-[13px]">
            <div><span className="text-gray-500">Tila</span><p className="font-medium text-gray-900">{allSpaces[0]?.spaceName || "–"}</p></div>
            <div><span className="text-gray-500">Ohjelma päättyy</span><p className="font-medium text-gray-900">{firstDay.programEnd || "–"}</p></div>
            <div><span className="text-gray-500">Varausaika</span><p className="font-medium text-gray-900">{firstDay.bookingStart}–{firstDay.bookingEnd}</p></div>
            <div><span className="text-gray-500">Vieraat poistuvat</span><p className="font-medium text-gray-900">{firstDay.guestsLeave || "–"}</p></div>
            <div><span className="text-gray-500">Ovet avataan</span><p className="font-medium text-gray-900">{firstDay.doorsOpen || "–"}</p></div>
            <div><span className="text-gray-500">Ohjelma alkaa</span><p className="font-medium text-gray-900">{firstDay.programStart || "–"}</p></div>
          </div>
        </Card>
      )}

      {/* Tilat */}
      <OfferSection
        icon={<MapPin className="h-4 w-4 text-gray-500" />}
        title="Tilat"
        status={tilaStatus === "valmis" ? "Valmis" : tilaStatus === "kaynnissa" ? "Kesken" : "Ei aloitettu"}
        statusClass={tilaStatus === "valmis" ? "bg-emerald-100 text-emerald-700" : tilaStatus === "kaynnissa" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}
        subtotal={spacesTotal}
        open={openSections.tilat}
        onToggle={() => toggle("tilat")}
        onEdit={() => navigate(`${base}/tilat`)}
        onOpen={() => navigate(`${base}/tilat`)}
      >
        {allSpaces.length > 0 ? (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="text-left py-2 font-medium">Tuote</th>
                <th className="text-right py-2 font-medium">Määrä</th>
                <th className="text-right py-2 font-medium">A-hinta</th>
                <th className="text-right py-2 font-medium">Summa</th>
              </tr>
            </thead>
            <tbody>
              {allSpaces.map((s, i) => (
                <tr key={`${s.spaceId}-${i}`} className="border-b border-gray-50">
                  <td className="py-2 text-gray-900">{s.spaceName}</td>
                  <td className="py-2 text-right text-gray-600">1</td>
                  <td className="py-2 text-right text-gray-600">{formatPrice(s.price)}</td>
                  <td className="py-2 text-right font-semibold text-gray-900">{formatPrice(s.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-[13px] text-gray-400">Ei valittuja tiloja.</p>
        )}
      </OfferSection>

      {/* Catering */}
      <OfferSection
        icon={<UtensilsCrossed className="h-4 w-4 text-gray-500" />}
        title="Catering"
        status={cateringStatusLabels[cateringStatus]}
        statusClass={cateringStatusBadge[cateringStatus]}
        subtotal={cateringTotal}
        open={openSections.catering}
        onToggle={() => toggle("catering")}
        onEdit={() => navigate(`${base}/catering`)}
        onOpen={() => navigate(`${base}/catering`)}
      >
        {cateringMoments.length > 0 ? (
          <>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="text-left py-2 font-medium">Tuote</th>
                  <th className="text-right py-2 font-medium">Määrä</th>
                  <th className="text-right py-2 font-medium">A-hinta</th>
                  <th className="text-right py-2 font-medium">Summa</th>
                </tr>
              </thead>
              <tbody>
                {cateringMoments.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50">
                    <td className="py-2 text-gray-900">{m.title} {wo.participantEstimate} hlö</td>
                    <td className="py-2 text-right text-gray-600">{wo.participantEstimate}</td>
                    <td className="py-2 text-right text-gray-600">{wo.participantEstimate > 0 ? formatPrice(Math.round(m.price / wo.participantEstimate * 100) / 100) : "–"}</td>
                    <td className="py-2 text-right font-semibold text-gray-900">{formatPrice(m.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cateringPlan.notes && (
              <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                <p className="text-[12px] text-amber-800"><span className="font-semibold">Lisätieto:</span> {cateringPlan.notes}</p>
              </div>
            )}
          </>
        ) : (
          <p className="text-[13px] text-gray-400">Ei catering-hetkiä.</p>
        )}
      </OfferSection>

      {/* AV / tuotanto */}
      <OfferSection
        icon={<Monitor className="h-4 w-4 text-gray-500" />}
        title="AV / tuotanto"
        status={cateringStatusLabels[avStatus]}
        statusClass={cateringStatusBadge[avStatus]}
        subtotal={avTotal}
        open={openSections.av}
        onToggle={() => toggle("av")}
        onEdit={() => navigate(`${base}/av`)}
        onOpen={() => navigate(`${base}/av`)}
      >
        {avProductionAreas.length > 0 ? (
          <>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="text-left py-2 font-medium">Tuotantoalue</th>
                  <th className="text-right py-2 font-medium">Summa</th>
                </tr>
              </thead>
              <tbody>
                {avProductionAreas.map((area) => (
                  <tr key={area.key} className="border-b border-gray-50">
                    <td className="py-2 text-gray-900">{area.label}</td>
                    <td className="py-2 text-right font-semibold text-gray-900">
                      {area.price ? `${area.price.toLocaleString("fi-FI")} €` : "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {avProduction?.notes && (
              <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
                <p className="text-[12px] text-blue-800">
                  <span className="font-semibold">Tekninen kuvaus: </span>
                  {avProduction.notes}
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-[13px] text-gray-400">Ei AV-valintoja.</p>
        )}
      </OfferSection>

      {/* Lisäpalvelut */}
      <OfferSection
        icon={<Plus className="h-4 w-4 text-gray-500" />}
        title="Lisäpalvelut"
        status={selectedServices.length > 0 ? "Valmis" : "Ei aloitettu"}
        statusClass={selectedServices.length > 0 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}
        subtotal={addOnsTotal}
        open={openSections.lisapalvelut}
        onToggle={() => toggle("lisapalvelut")}
        onEdit={() => navigate(`${base}/lisapalvelut`)}
        onOpen={() => navigate(`${base}/lisapalvelut`)}
      >
        {selectedServices.length > 0 ? (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="text-left py-2 font-medium">Tuote</th>
                <th className="text-right py-2 font-medium">Määrä</th>
                <th className="text-right py-2 font-medium">A-hinta</th>
                <th className="text-right py-2 font-medium">Summa</th>
              </tr>
            </thead>
            <tbody>
              {selectedServices.map((s) => (
                <tr key={s.id} className="border-b border-gray-50">
                  <td className="py-2 text-gray-900">{s.name}</td>
                  <td className="py-2 text-right text-gray-600">{s.quantity}</td>
                  <td className="py-2 text-right text-gray-600">{formatPrice(s.price)}</td>
                  <td className="py-2 text-right font-semibold text-gray-900">{formatPrice(s.price * s.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-[13px] text-gray-400">Ei lisäpalveluita.</p>
        )}
      </OfferSection>

      {/* Liitteet */}
      {attachments.length > 0 && (
        <Card>
          <CardTitle className="mb-3 text-base flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-gray-400" />
            Liitteet
          </CardTitle>
          <div className="flex flex-wrap gap-3">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-gray-900 truncate">{att.name}</p>
                  <p className="text-[10px] text-gray-500">{Math.round(att.size / 1024)} KB</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Hinnan erittely */}
      <Card className="border-2 border-gray-900">
        <CardTitle className="mb-4 text-base">Hinnan erittely</CardTitle>
        <div className="space-y-2">
          <PriceRow label="Tilat" value={spacesTotal} />
          <PriceRow label="Catering" value={cateringTotal} />
          <PriceRow label="AV / tekniikka" value={avTotal} />
          {addOnsTotal > 0 && <PriceRow label="Lisäpalvelut" value={addOnsTotal} />}
          <Separator />
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Veroton yhteensä</span>
            <span>{formatPrice(totalExVat)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>ALV 25,5 %</span>
            <span>{formatPrice(vatAmount)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Verollinen yhteensä</span>
            <span>{formatPrice(totalIncVat)}</span>
          </div>
        </div>
      </Card>

      {/* CTA */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => window.print()}><Eye className="h-4 w-4" /> Esikatsele / Tulosta</Button>
        {isAsiakkaalla || sent ? (
          <Button disabled><Check className="h-4 w-4" /> Tarjous lähetetty</Button>
        ) : (
          <Button onClick={handleSend}><Send className="h-4 w-4" /> Lähetä asiakkaalle</Button>
        )}
      </div>
    </div>
  )
}

function OfferSection({ icon, title, status, statusClass, subtotal, open, onToggle, onEdit, onOpen, children }: {
  icon: React.ReactNode
  title: string
  status: string
  statusClass: string
  subtotal: number
  open: boolean
  onToggle: () => void
  onEdit: () => void
  onOpen: () => void
  children: React.ReactNode
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        {open ? <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronUp className="h-4 w-4 text-gray-400 shrink-0 rotate-180" />}
        {icon}
        <span className="text-[15px] font-semibold text-gray-900">{title}</span>
        <Badge className={cn("text-[10px] ml-1", statusClass)}>{status}</Badge>
        <span className="ml-auto text-[13px] text-gray-500">Välisumma:</span>
        <span className="text-[15px] font-bold text-gray-900 ml-1">{formatPrice(subtotal)}</span>
        <Button variant="outline" size="sm" className="ml-3 gap-1 shrink-0" onClick={(e) => { e.stopPropagation(); onEdit() }}>
          <Pencil className="h-3 w-3" /> Muokkaa
        </Button>
        <Button variant="outline" size="sm" className="gap-1 shrink-0" onClick={(e) => { e.stopPropagation(); onOpen() }}>
          <ExternalLink className="h-3 w-3" /> Avaa osio
        </Button>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <div className="mt-4">{children}</div>
        </div>
      )}
    </Card>
  )
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span>{formatPrice(value)}</span>
    </div>
  )
}
