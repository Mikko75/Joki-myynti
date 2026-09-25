import { useState } from "react"
import { Pencil, Check, X, Plus, Paperclip, FileText, Image, File, Trash2, StickyNote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { WorkOrderHeader } from "@/components/layout/WorkOrderHeader"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { cn } from "@/lib/utils"
import type { Attachment } from "@/data/types"

type EditSection = "asiakas" | "tapahtuma" | "tarpeet" | "kuvaus" | null

export default function PerustiedotPage() {
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const { updateWorkOrder } = useWorkOrders()
  const [editSection, setEditSection] = useState<EditSection>(null)
  const [newNote, setNewNote] = useState("")
  const [showNoteInput, setShowNoteInput] = useState(false)

  if (!workOrder) return <p className="text-gray-500">Työmääräintä ei löytynyt.</p>

  const wo = workOrder
  const eventDate = wo.eventDays[0]?.date || ""
  const eventTime = wo.eventDays[0]?.bookingStart || ""
  const notes = wo.notes ?? []
  const attachments = wo.attachments ?? []

  function addNote() {
    if (!newNote.trim()) return
    const note = {
      id: `note-${Date.now()}`,
      text: newNote.trim(),
      createdAt: new Date().toLocaleString("fi-FI"),
    }
    updateWorkOrder(workOrderId, { notes: [...notes, note] })
    setNewNote("")
    setShowNoteInput(false)
  }

  function removeNote(noteId: string) {
    updateWorkOrder(workOrderId, { notes: notes.filter((n) => n.id !== noteId) })
  }

  function handleFileSelect() {
    const input = document.createElement("input")
    input.type = "file"
    input.multiple = true
    input.accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files) return
      const newAttachments: Attachment[] = Array.from(files).map((file) => ({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        addedAt: new Date().toLocaleString("fi-FI"),
        addedBy: "Mikko Lesonen",
      }))
      updateWorkOrder(workOrderId, { attachments: [...attachments, ...newAttachments] })
    }
    input.click()
  }

  function removeAttachment(attId: string) {
    updateWorkOrder(workOrderId, { attachments: attachments.filter((a) => a.id !== attId) })
  }

  function fileIcon(type: string) {
    if (type.startsWith("image/")) return <Image className="h-4 w-4 text-blue-500" />
    if (type === "application/pdf") return <FileText className="h-4 w-4 text-red-500" />
    return <File className="h-4 w-4 text-gray-500" />
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <WorkOrderHeader workOrder={wo} title="Perustiedot" />

      {/* Asiakas */}
      <Card>
        <CardHeader>
          <CardTitle>Asiakas</CardTitle>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditSection("asiakas")}>
            <Pencil className="h-3.5 w-3.5" /> Muokkaa
          </Button>
        </CardHeader>
        <div className="grid grid-cols-2 gap-x-12 gap-y-3">
          <InfoRow label="Yritys" value={wo.customerCompany} />
          <InfoRow label="Yhteyshenkilö" value={wo.customerName} />
          <InfoRow label="Sähköposti" value={wo.customerEmail || "–"} />
          <InfoRow label="Puhelin" value={wo.customerPhone || "–"} />
        </div>
      </Card>

      {/* Tapahtuma */}
      <Card>
        <CardHeader>
          <CardTitle>Tapahtuma</CardTitle>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditSection("tapahtuma")}>
            <Pencil className="h-3.5 w-3.5" /> Muokkaa
          </Button>
        </CardHeader>
        <div className="grid grid-cols-2 gap-x-12 gap-y-3">
          <InfoRow label="Tapahtuman nimi" value={wo.eventName || "–"} />
          <InfoRow label="Tapahtumatyyppi" value={wo.eventType} />
          <InfoRow label="Osallistujamäärä" value={`${wo.participantEstimate} hlö`} />
          <InfoRow label="Päivämäärä" value={eventDate || "–"} />
          <InfoRow label="Kellonaika" value={eventTime || "–"} />
          <InfoRow label="Tapahtumapäiviä" value={`${wo.eventDays.length} päivää`} />
        </div>
      </Card>

      {/* Tarpeet */}
      <Card>
        <CardHeader>
          <CardTitle>Tarpeet</CardTitle>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditSection("tarpeet")}>
            <Pencil className="h-3.5 w-3.5" /> Muokkaa
          </Button>
        </CardHeader>
        <div className="grid grid-cols-2 gap-x-12 gap-y-3">
          <InfoRow label="Catering" value={wo.needsCatering === "yes" ? "Kyllä" : wo.needsCatering === "no" ? "Ei" : wo.needsCatering || "–"} />
          <InfoRow label="AV / tekniikka" value={wo.needsAV === "yes" ? "Kyllä" : wo.needsAV === "no" ? "Ei" : wo.needsAV || "–"} />
        </div>
      </Card>

      {/* Kuvaus */}
      <Card>
        <CardHeader>
          <CardTitle>Kuvaus</CardTitle>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditSection("kuvaus")}>
            <Pencil className="h-3.5 w-3.5" /> Muokkaa
          </Button>
        </CardHeader>
        <p className="text-[13px] text-gray-600 leading-relaxed">{wo.eventDescription || "–"}</p>
      </Card>

      {/* Muistiinpanot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-gray-400" />
            Muistiinpanot
          </CardTitle>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowNoteInput(true)}>
            <Plus className="h-3.5 w-3.5" /> Lisää muistiinpano
          </Button>
        </CardHeader>

        {showNoteInput && (
          <div className="mb-4 space-y-2">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Kirjoita muistiinpano..."
              rows={2}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={addNote} disabled={!newNote.trim()} className="gap-1.5">
                <Check className="h-3.5 w-3.5" /> Tallenna
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setShowNoteInput(false); setNewNote("") }} className="gap-1.5">
                <X className="h-3.5 w-3.5" /> Peruuta
              </Button>
            </div>
          </div>
        )}

        {notes.length > 0 ? (
          <div className="space-y-2">
            {notes.map((note) => (
              <div key={note.id} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-gray-700 leading-relaxed">{note.text}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{note.createdAt}</p>
                </div>
                <button onClick={() => removeNote(note.id)} className="text-gray-300 hover:text-red-500 shrink-0 mt-0.5">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          !showNoteInput && <p className="text-[13px] text-gray-400">Ei muistiinpanoja.</p>
        )}

        {wo.additionalNotes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 mb-1">Alkuperäinen muistiinpano</p>
            <p className="text-[13px] text-gray-600 leading-relaxed">{wo.additionalNotes}</p>
          </div>
        )}
      </Card>

      {/* Liitteet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-gray-400" />
            Liitteet {attachments.length > 0 && `· ${attachments.length}`}
          </CardTitle>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleFileSelect}>
            <Plus className="h-3.5 w-3.5" /> Lisää liite
          </Button>
        </CardHeader>

        {attachments.length > 0 ? (
          <div className="space-y-2">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  {fileIcon(att.type)}
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-gray-900 truncate">{att.name}</p>
                    <p className="text-[11px] text-gray-500">{formatFileSize(att.size)} · {att.addedBy} · {att.addedAt}</p>
                  </div>
                </div>
                <button onClick={() => removeAttachment(att.id)} className="text-gray-300 hover:text-red-500 shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <Paperclip className="h-5 w-5 text-gray-400 mx-auto mb-2" />
            <p className="text-[13px] text-gray-500">Ei vielä liitteitä</p>
            <Button variant="outline" size="sm" className="mt-2 gap-1.5" onClick={handleFileSelect}>
              <Plus className="h-3.5 w-3.5" /> Lisää ensimmäinen liite
            </Button>
          </div>
        )}
      </Card>

      {/* Edit modals */}
      {editSection === "asiakas" && (
        <EditModal
          title="Muokkaa asiakastietoja"
          onClose={() => setEditSection(null)}
          onSave={(vals) => { updateWorkOrder(workOrderId, vals); setEditSection(null) }}
          fields={[
            { key: "customerCompany", label: "Yritys", initial: wo.customerCompany },
            { key: "customerName", label: "Yhteyshenkilö", initial: wo.customerName },
            { key: "customerEmail", label: "Sähköposti", initial: wo.customerEmail || "", type: "email" },
            { key: "customerPhone", label: "Puhelin", initial: wo.customerPhone || "", type: "tel" },
          ]}
        />
      )}
      {editSection === "tapahtuma" && (
        <TapahtumaEditModal
          wo={wo}
          onClose={() => setEditSection(null)}
          onSave={(vals) => { updateWorkOrder(workOrderId, vals); setEditSection(null) }}
        />
      )}
      {editSection === "tarpeet" && (
        <TarpeetEditModal
          wo={wo}
          onClose={() => setEditSection(null)}
          onSave={(vals) => { updateWorkOrder(workOrderId, vals); setEditSection(null) }}
        />
      )}
      {editSection === "kuvaus" && (
        <EditTextareaModal
          title="Muokkaa kuvausta"
          initial={wo.eventDescription || ""}
          onClose={() => setEditSection(null)}
          onSave={(val) => { updateWorkOrder(workOrderId, { eventDescription: val || undefined }); setEditSection(null) }}
        />
      )}
    </div>
  )
}

function EditModal({ title, fields, onClose, onSave }: {
  title: string
  fields: { key: string; label: string; initial: string; type?: string }[]
  onClose: () => void
  onSave: (values: Record<string, string>) => void
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.key, f.initial]))
  )

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="sr-only">{title}</DialogDescription>
        <div className="space-y-3 mt-2">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-700">{f.label}</label>
              <Input
                type={f.type || "text"}
                value={values[f.key]}
                onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="gap-1.5">
            <X className="h-3.5 w-3.5" /> Peruuta
          </Button>
          <Button onClick={() => onSave(values)} className="gap-1.5">
            <Check className="h-3.5 w-3.5" /> Tallenna
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EditTextareaModal({ title, initial, onClose, onSave }: {
  title: string
  initial: string
  onClose: () => void
  onSave: (value: string) => void
}) {
  const [value, setValue] = useState(initial)

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="sr-only">{title}</DialogDescription>
        <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={4} className="mt-2" />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="gap-1.5">
            <X className="h-3.5 w-3.5" /> Peruuta
          </Button>
          <Button onClick={() => onSave(value)} className="gap-1.5">
            <Check className="h-3.5 w-3.5" /> Tallenna
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TapahtumaEditModal({ wo, onClose, onSave }: {
  wo: import("@/data/types").WorkOrder
  onClose: () => void
  onSave: (vals: Record<string, any>) => void
}) {
  const day = wo.eventDays[0]
  const [eventName, setEventName] = useState(wo.eventName || "")
  const [eventType, setEventType] = useState(wo.eventType)
  const [participants, setParticipants] = useState(String(wo.participantEstimate))
  const [date, setDate] = useState(day?.date || "")
  const [bookingStart, setBookingStart] = useState(day?.bookingStart || "09:00")
  const [bookingEnd, setBookingEnd] = useState(day?.bookingEnd || "17:00")
  const [doorsOpen, setDoorsOpen] = useState(day?.doorsOpen || "")
  const [programStart, setProgramStart] = useState(day?.programStart || "")
  const [programEnd, setProgramEnd] = useState(day?.programEnd || "")

  function handleSave() {
    const updates: Record<string, any> = {
      eventName: eventName || undefined,
      eventType,
      participantEstimate: parseInt(participants) || wo.participantEstimate,
    }
    if (day) {
      updates.eventDays = wo.eventDays.map((d, i) =>
        i === 0 ? { ...d, date, bookingStart, bookingEnd, doorsOpen, programStart, programEnd } : d
      )
    }
    onSave(updates)
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogTitle>Muokkaa tapahtuman tietoja</DialogTitle>
        <DialogDescription className="sr-only">Muokkaa tapahtuman tietoja</DialogDescription>
        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Tapahtuman nimi</label>
            <Input value={eventName} onChange={(e) => setEventName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Tapahtumatyyppi</label>
            <Input value={eventType} onChange={(e) => setEventType(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Osallistujamäärä</label>
            <Input type="number" value={participants} onChange={(e) => setParticipants(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Päivämäärä</label>
            <Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="pp.kk.vvvv" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-700">Varaus alkaa</label>
              <Input type="time" value={bookingStart} onChange={(e) => setBookingStart(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-700">Varaus päättyy</label>
              <Input type="time" value={bookingEnd} onChange={(e) => setBookingEnd(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-700">Ovet avataan</label>
              <Input type="time" value={doorsOpen} onChange={(e) => setDoorsOpen(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-700">Ohjelma alkaa</label>
              <Input type="time" value={programStart} onChange={(e) => setProgramStart(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Ohjelma päättyy</label>
            <Input type="time" value={programEnd} onChange={(e) => setProgramEnd(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="gap-1.5"><X className="h-3.5 w-3.5" /> Peruuta</Button>
          <Button onClick={handleSave} className="gap-1.5"><Check className="h-3.5 w-3.5" /> Tallenna</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TarpeetEditModal({ wo, onClose, onSave }: {
  wo: import("@/data/types").WorkOrder
  onClose: () => void
  onSave: (vals: Record<string, any>) => void
}) {
  const [catering, setCatering] = useState<string>(wo.needsCatering || "unknown")
  const [av, setAv] = useState<string>(wo.needsAV || "no")

  const options = (current: string, setter: (v: string) => void, choices: { value: string; label: string }[]) => (
    <div className="flex gap-2">
      {choices.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => setter(c.value)}
          className={cn(
            "px-4 py-2 rounded-lg border text-[13px] font-medium transition-colors",
            current === c.value
              ? "border-primary-500 bg-primary-50 text-primary-700"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  )

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogTitle>Muokkaa tarpeita</DialogTitle>
        <DialogDescription className="sr-only">Muokkaa tarpeita</DialogDescription>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-gray-700">Tarvitaanko catering?</label>
            {options(catering, setCatering, [
              { value: "yes", label: "Kyllä" },
              { value: "no", label: "Ei" },
              { value: "unknown", label: "En tiedä" },
            ])}
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-gray-700">Tarvitaanko AV / tekniikka?</label>
            {options(av, setAv, [
              { value: "yes", label: "Kyllä" },
              { value: "no", label: "Ei" },
            ])}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="gap-1.5"><X className="h-3.5 w-3.5" /> Peruuta</Button>
          <Button onClick={() => onSave({ needsCatering: catering, needsAV: av })} className="gap-1.5"><Check className="h-3.5 w-3.5" /> Tallenna</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] text-gray-500 mb-0.5">{label}</p>
      <p className="text-[13px] font-medium text-gray-900 break-words">{value}</p>
    </div>
  )
}
