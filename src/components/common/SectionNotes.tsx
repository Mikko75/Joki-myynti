import { useState } from "react"
import { Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"

interface SectionNotesProps {
  sectionKey: string
}

export function SectionNotes({ sectionKey }: SectionNotesProps) {
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const { updateWorkOrder } = useWorkOrders()
  const [editing, setEditing] = useState(false)

  if (!workOrder) return null

  const currentNotes = workOrder.sectionNotes ?? {}
  const value = currentNotes[sectionKey] ?? ""
  const [draft, setDraft] = useState(value)

  function save() {
    updateWorkOrder(workOrderId, {
      sectionNotes: { ...currentNotes, [sectionKey]: draft },
    })
    setEditing(false)
  }

  function cancel() {
    setDraft(value)
    setEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Muistiinpanot</CardTitle>
        {!editing && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setDraft(value); setEditing(true) }}>
            <Pencil className="h-3.5 w-3.5" /> {value ? "Muokkaa" : "Lisää"}
          </Button>
        )}
      </CardHeader>
      {editing ? (
        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Vapaamuotoiset muistiinpanot tästä osiosta..."
            rows={3}
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={save} className="gap-1.5">
              <Check className="h-3.5 w-3.5" /> Tallenna
            </Button>
            <Button size="sm" variant="outline" onClick={cancel} className="gap-1.5">
              <X className="h-3.5 w-3.5" /> Peruuta
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-[13px] text-gray-600 leading-relaxed">{value || "Ei muistiinpanoja."}</p>
      )}
    </Card>
  )
}
