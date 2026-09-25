import { Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { InfoBanner } from "@/components/common/InfoBanner"
import { useParams } from "react-router-dom"
import { useWorkOrders } from "@/context/WorkOrderContext"
import type { ScheduleItemType } from "@/data/types"

function typeBadge(type: ScheduleItemType) {
  switch (type) {
    case "catering": return <Badge variant="blue">Catering</Badge>
    case "av": return <Badge variant="purple">AV</Badge>
    case "ohjelma": return <Badge variant="warning">Ohjelma</Badge>
    case "ajankohta": return <Badge variant="outline">Ajankohta</Badge>
    default: return <Badge variant="outline">{type}</Badge>
  }
}

export default function PartnerSchedulePage() {
  const { id } = useParams<{ id: string }>()
  const { getWorkOrder } = useWorkOrders()
  const workOrder = getWorkOrder(id ?? "")

  if (!workOrder) return <p className="text-gray-500">Ei löytynyt.</p>

  const day = workOrder.eventDays[0]
  const items = day?.scheduleItems ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Aikataulu</h1>

      <InfoBanner>
        Tämä on jaettu aikataulu. Näet koko tapahtuman aikataulun, mutta voit muokata vain omia rivejäsi omassa osiossasi.
      </InfoBanner>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-[13px] text-gray-400">
          Ei vielä aikataulurivejä. Myyjä tai kumppanit lisäävät rivejä omista osioistaan.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-[13px] font-mono text-gray-600 shrink-0">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                {item.startTime}
                {item.endTime && item.endTime !== item.startTime && `–${item.endTime}`}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-900">{item.title}</p>
                {item.spaceName && (
                  <p className="text-[12px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {item.spaceName}
                  </p>
                )}
              </div>
              {typeBadge(item.type)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
