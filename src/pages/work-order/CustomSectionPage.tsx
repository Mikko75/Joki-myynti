import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Trash2, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { WorkOrderHeader } from "@/components/layout/WorkOrderHeader"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import type { Attachment } from "@/data/types"

export default function CustomSectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>()
  const navigate = useNavigate()
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const { updateWorkOrder } = useWorkOrders()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!workOrder || !sectionId) return <p className="text-gray-500">Osiota ei löytynyt.</p>

  const sections = workOrder.customSections ?? []
  const section = sections.find((s) => s.id === sectionId)

  if (!section) return <p className="text-gray-500">Osiota ei löytynyt.</p>

  function update(field: string, value: unknown) {
    const updated = sections.map((s) =>
      s.id === sectionId ? { ...s, [field]: value } : s
    )
    updateWorkOrder(workOrderId, { customSections: updated })
  }

  function addAttachment() {
    const att: Attachment = {
      id: crypto.randomUUID(),
      name: `Liite-${(section!.attachments?.length ?? 0) + 1}.pdf`,
      type: "application/pdf",
      size: 1024,
      addedAt: new Date().toLocaleString("fi-FI"),
      addedBy: "Myyjä",
    }
    update("attachments", [...(section!.attachments ?? []), att])
  }

  function removeAttachment(attId: string) {
    update("attachments", (section!.attachments ?? []).filter((a: Attachment) => a.id !== attId))
  }

  function deleteSection() {
    const filtered = sections.filter((s) => s.id !== sectionId)
    const proposals = (workOrder!.proposalSections ?? []).filter(
      (p) => p.sectionKey !== `custom-${sectionId}`
    )
    updateWorkOrder(workOrderId, { customSections: filtered, proposalSections: proposals })
    navigate(`/tyomarain/${workOrderId}/yleiskuva`)
  }

  return (
    <div className="space-y-6">
      <WorkOrderHeader workOrder={workOrder} title={section.title} />

      <Card>
        <CardHeader>
          <CardTitle>Osion tiedot</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Kuvaus</label>
            <Textarea
              value={section.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Kirjoita osion kuvaus..."
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Hinta (€)</label>
            <Input
              type="number"
              value={section.price ?? ""}
              onChange={(e) => update("price", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Valinnainen"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Näytetäänkö asiakkaalle</label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={section.showToClient ? "default" : "outline"}
                onClick={() => update("showToClient", true)}
              >
                Kyllä
              </Button>
              <Button
                size="sm"
                variant={!section.showToClient ? "default" : "outline"}
                onClick={() => update("showToClient", false)}
              >
                Ei
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liitteet</CardTitle>
          <Button variant="outline" size="sm" onClick={addAttachment}>
            <Paperclip className="h-4 w-4" />
            Lisää liite
          </Button>
        </CardHeader>
        {(section.attachments ?? []).length > 0 ? (
          <div className="space-y-2">
            {(section.attachments ?? []).map((att) => (
              <div key={att.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-[13px] text-gray-700">{att.name}</span>
                </div>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-gray-400">Ei liitteitä.</p>
        )}
      </Card>

      <div className="pt-4 border-t border-gray-200">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-[13px] text-red-500 hover:text-red-700 underline-offset-2 hover:underline"
          >
            Poista osio
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-red-600">Poistetaanko osio pysyvästi?</span>
            <Button size="sm" variant="destructive" onClick={deleteSection}>Poista</Button>
            <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>Peruuta</Button>
          </div>
        )}
      </div>
    </div>
  )
}
