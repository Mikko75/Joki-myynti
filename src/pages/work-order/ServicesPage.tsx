import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Mic, Speaker, MonitorPlay } from "lucide-react"
import { WorkOrderHeader } from "@/components/layout/WorkOrderHeader"
import { SectionNotes } from "@/components/common/SectionNotes"
import { SectionChat } from "@/components/common/SectionChat"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { additionalServices as services } from "@/data/mock"

export default function ServicesPage() {
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const { getAVPlan, updateAVPlan } = useWorkOrders()

  if (!workOrder) return <p className="text-gray-500">Työmääräintä ei löytynyt.</p>

  const avPlan = getAVPlan(workOrderId)

  function updateAV(field: string, value: string) {
    updateAVPlan(workOrderId, { [field]: value, status: "luonnos" })
  }

  return (
    <div className="space-y-6">
      <WorkOrderHeader
        workOrder={workOrder}
        title="Lisäpalvelut & AV"
      />

      {/* AV / tekniikka */}
      <Card>
        <CardHeader>
          <CardTitle>AV / tekniikka</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700 flex items-center gap-1.5">
              <Mic className="h-3.5 w-3.5 text-gray-400" /> Mikrofonit
            </label>
            <Input value={avPlan.microphones} onChange={(e) => updateAV("microphones", e.target.value)} placeholder="Esim. 2 kpl langatonta" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700 flex items-center gap-1.5">
              <Speaker className="h-3.5 w-3.5 text-gray-400" /> Äänentoisto
            </label>
            <Input value={avPlan.audio} onChange={(e) => updateAV("audio", e.target.value)} placeholder="Esim. PA-järjestelmä" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700 flex items-center gap-1.5">
              <MonitorPlay className="h-3.5 w-3.5 text-gray-400" /> Näytöt / esitystekniikka
            </label>
            <Input value={avPlan.screens} onChange={(e) => updateAV("screens", e.target.value)} placeholder="Esim. 86&quot; näyttö + HDMI" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Striimaus</label>
            <Input value={avPlan.streaming} onChange={(e) => updateAV("streaming", e.target.value)} placeholder="Esim. YouTube Live" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Tallennus</label>
            <Input value={avPlan.recording} onChange={(e) => updateAV("recording", e.target.value)} placeholder="Esim. tallennus palvelimelle" />
          </div>
        </div>
      </Card>

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
