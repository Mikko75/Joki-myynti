import { useState } from "react"
import { Plus, X, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog"
import { useTeam } from "@/context/TeamContext"
import { cn } from "@/lib/utils"
import type { Participant } from "@/data/types"

const SECTION_OPTIONS = [
  { key: "catering", label: "Catering" },
  { key: "av", label: "AV / tekniikka" },
  { key: "aikataulut", label: "Aikataulut" },
  { key: "keskustelut", label: "Kaikki keskustelut" },
  { key: "lisata", label: "Lisätä" },
]

interface ParticipantBarProps {
  participants: Participant[]
}

export function ParticipantBar({ participants }: ParticipantBarProps) {
  const { members, updateMember, removeMember } = useTeam()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSections, setEditSections] = useState<string[]>([])
  const [editPermission, setEditPermission] = useState<"view" | "edit">("edit")
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)

  if (participants.length === 0) return null

  function openEdit(memberId: string) {
    const member = members.find((m) => m.id === memberId)
    if (!member) return
    setEditSections([...member.sections])
    setEditPermission(member.permission)
    setEditingId(memberId)
  }

  function saveEdit() {
    if (!editingId) return
    updateMember(editingId, { sections: editSections, permission: editPermission })
    setEditingId(null)
  }

  function toggleSection(label: string) {
    setEditSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    )
  }

  function handleRemove(id: string) {
    removeMember(id)
    setConfirmRemoveId(null)
  }

  const editingMember = members.find((m) => m.id === editingId)

  return (
    <>
      <div className="flex items-center gap-2 border-b border-gray-100 bg-white px-6 py-2.5 shrink-0 overflow-x-auto">
        {participants.map((p) => {
          const isMember = members.some((m) => m.id === p.id)
          return (
            <div
              key={p.id}
              className={cn(
                "flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-2 shadow-sm shrink-0",
                isMember && "cursor-pointer hover:border-gray-300"
              )}
              onClick={() => isMember && openEdit(p.id)}
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0"
                style={{ backgroundColor: p.color }}
              >
                {p.initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-medium leading-tight text-gray-900 truncate">{p.name}</span>
                <span className="text-[11px] text-gray-400 truncate">{p.role}</span>
              </div>
              {isMember && (
                <Pencil className="h-3 w-3 text-gray-300 shrink-0" />
              )}
            </div>
          )
        })}
        <button className="ml-auto flex items-center gap-1 text-[12px] text-gray-400 hover:text-primary-600 transition-colors shrink-0">
          <Plus className="h-3.5 w-3.5" />
          Lisää
        </button>
      </div>

      {/* Edit member dialog */}
      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Muokkaa oikeuksia</DialogTitle>
            <DialogDescription>{editingMember?.name}</DialogDescription>
          </DialogHeader>

          {editingMember && (
            <div className="space-y-5 py-2">
              {/* Person */}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold text-white"
                  style={{ backgroundColor: editingMember.color }}
                >
                  {editingMember.initials}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-900">{editingMember.name}</p>
                  <p className="text-[12px] text-gray-500">{editingMember.email}</p>
                </div>
              </div>

              {/* Permission */}
              <div className="space-y-2">
                <p className="text-[13px] font-medium text-gray-700">Oikeudet</p>
                <div className="flex gap-2">
                  <button
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2.5 text-[13px] font-medium text-left transition-all",
                      editPermission === "view" ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-700 hover:border-gray-300"
                    )}
                    onClick={() => setEditPermission("view")}
                  >
                    Voi katsella
                  </button>
                  <button
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2.5 text-[13px] font-medium text-left transition-all",
                      editPermission === "edit" ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-700 hover:border-gray-300"
                    )}
                    onClick={() => setEditPermission("edit")}
                  >
                    Voi muokata
                  </button>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-2">
                <p className="text-[13px] font-medium text-gray-700">Pääsy osioihin</p>
                <div className="space-y-2">
                  {SECTION_OPTIONS.map((opt) => (
                    <label key={opt.key} className="flex items-center gap-2.5 cursor-pointer">
                      <Checkbox
                        checked={editSections.includes(opt.label)}
                        onCheckedChange={() => toggleSection(opt.label)}
                      />
                      <span className="text-[13px] text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={() => { setEditingId(null); setConfirmRemoveId(editingMember?.id ?? null) }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Poista tiimistä
            </Button>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline">Peruuta</Button>
              </DialogClose>
              <Button onClick={saveEdit}>Tallenna</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <Dialog open={!!confirmRemoveId} onOpenChange={(open) => !open && setConfirmRemoveId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Poista tiimistä</DialogTitle>
            <DialogDescription>Haluatko varmasti poistaa henkilön tiimistä?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Peruuta</Button>
            </DialogClose>
            <Button variant="destructive" onClick={() => confirmRemoveId && handleRemove(confirmRemoveId)}>
              Poista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
