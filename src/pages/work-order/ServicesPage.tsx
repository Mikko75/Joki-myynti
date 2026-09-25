import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { WorkOrderHeader } from "@/components/layout/WorkOrderHeader"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { additionalServices as services } from "@/data/mock"

export default function ServicesPage() {
  const { workOrder } = useCurrentWorkOrder()

  if (!workOrder) return <p className="text-gray-500">Työmääräintä ei löytynyt.</p>

  return (
    <div className="space-y-6">
      <WorkOrderHeader
        workOrder={workOrder}
        title="Lisäpalvelut"
        right={
          <Button variant="outline">
            <Plus className="h-4 w-4" />
            Lisää palvelu
          </Button>
        }
      />

      <div className="space-y-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex items-center justify-between rounded-lg border bg-white p-4"
          >
            <div>
              <h3 className="font-semibold">{service.name}</h3>
              <p className="text-sm text-gray-500">{service.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold">
                {service.price.toLocaleString("fi-FI")} &euro;
              </span>
              <Badge variant="outline">Saatavilla</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
