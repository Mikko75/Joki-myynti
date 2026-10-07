import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { WorkOrderHeader } from "@/components/layout/WorkOrderHeader"
import { SectionNotes } from "@/components/common/SectionNotes"
import { SectionChat } from "@/components/common/SectionChat"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { additionalServices as services } from "@/data/mock"
import type { AVProductionStatus } from "@/data/types"

const AV_STATUS_LABELS: Record<AVProductionStatus, string> = {
  ei_aloitettu: "Ei aloitettu",
  tarve_kuvattu: "Tarve kuvattu",
  kumppanilla: "Kumppanilla",
  vastattu: "Kumppani vastannut",
  valmis: "Hyväksytty",
}

export default function ServicesPage() {
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const { } = useWorkOrders()

  if (!workOrder) return <p className="text-gray-500">Työmääräintä ei löytynyt.</p>

  const avStatus = workOrder.avProduction?.status ?? "ei_aloitettu"
  const avNeeds = workOrder.avProduction?.needs ?? []

  return (
    <div className="space-y-6">
      <WorkOrderHeader
        workOrder={workOrder}
        title="Lisäpalvelut & AV"
      />

      {/* AV-tuotanto — linkki omalle sivulle */}
      <Link
        to={`/tyomarain/${workOrderId}/av`}
        className="block rounded-xl border border-gray-200 bg-white p-5 no-underline hover:shadow-md hover:border-gray-300 transition-all"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-gray-900">AV-tuotanto</h3>
            <p className="text-[12px] text-gray-500 mt-0.5">
              {avNeeds.length > 0
                ? `${avNeeds.length} tunnistettua tarvetta`
                : "Kuvaa tapahtuman AV-tarpeet"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{AV_STATUS_LABELS[avStatus]}</Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </Link>

      {/* Lisäpalvelut */}
      <Card>
        <CardHeader>
          <CardTitle>Lisäpalvelut</CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
            Lisää palvelu
          </Button>
        </CardHeader>
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4"
            >
              <div>
                <h3 className="text-[13px] font-semibold text-gray-900">{service.name}</h3>
                <p className="text-[12px] text-gray-500">{service.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[13px] font-bold text-gray-900">
                  {service.price.toLocaleString("fi-FI")} €
                </span>
                <Badge variant="outline">Saatavilla</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <SectionNotes sectionKey="lisapalvelut" />
      <SectionChat sectionKey="av" />
    </div>
  )
}
