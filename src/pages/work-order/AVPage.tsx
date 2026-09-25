import { Mic, Speaker, MonitorPlay, Projector, Radio, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SectionChat } from "@/components/common/SectionChat"
import { WorkOrderHeader } from "@/components/layout/WorkOrderHeader"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"

export default function AVPage() {
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const { getAVPlan, updateAVPlan } = useWorkOrders()
  const plan = getAVPlan(workOrderId)

  if (!workOrder) return <p className="text-gray-500">Työmääräintä ei löytynyt.</p>

  function update(field: string, value: string) {
    updateAVPlan(workOrderId, { [field]: value, status: "luonnos" })
  }

  const statusLabel = plan.status === "ei_aloitettu" ? "Ei aloitettu" : plan.status === "luonnos" ? "Luonnos" : "Valmis"
  const statusVariant = plan.status === "ei_aloitettu" ? "outline" as const : plan.status === "valmis" ? "success" as const : "blue" as const

  return (
    <div className="space-y-6">
      <WorkOrderHeader
        workOrder={workOrder}
        title="AV / tekniikka"
        right={<Badge variant={statusVariant}>{statusLabel}</Badge>}
      />

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Tekniset tarpeet</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Mikrofonit</label>
            <div className="relative">
              <Mic className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input className="pl-9" placeholder="Esim. 2 langatonta, 1 puhujanpönttö" value={plan.microphones} onChange={(e) => update("microphones", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Äänentoisto</label>
            <div className="relative">
              <Speaker className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input className="pl-9" placeholder="Esim. täysi PA-järjestelmä" value={plan.audio} onChange={(e) => update("audio", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Näytöt</label>
            <div className="relative">
              <MonitorPlay className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input className="pl-9" placeholder='Esim. 2 x 85" LED-näyttöä' value={plan.screens} onChange={(e) => update("screens", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Projektori</label>
            <div className="relative">
              <Projector className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input className="pl-9" placeholder="Esim. 1 x laserprojektori" value={plan.streaming} onChange={(e) => update("streaming", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Striimaus</label>
            <div className="relative">
              <Radio className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input className="pl-9" placeholder="Esim. YouTube/Teams-striimaus" value={plan.streaming} onChange={(e) => update("streaming", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Tallennus</label>
            <div className="relative">
              <Video className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input className="pl-9" placeholder="Esim. monikameratallenne" value={plan.recording} onChange={(e) => update("recording", e.target.value)} />
            </div>
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Lisätiedot / huomioita</label>
            <Textarea placeholder="Muita teknisiä tarpeita tai huomioita..." value={plan.notes} onChange={(e) => update("notes", e.target.value)} />
          </div>
        </div>
      </div>

      <SectionChat sectionKey="av" />
    </div>
  )
}
