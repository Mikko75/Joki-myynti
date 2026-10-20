import { useState } from "react"
import {
  GripVertical,
  Pencil,
  Trash2,
  Star,
  Plus,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { InfoBanner } from "@/components/common/InfoBanner"
import { SectionNotes } from "@/components/common/SectionNotes"
import { DayTabs } from "@/components/common/DayTabs"
import { WorkOrderHeader } from "@/components/layout/WorkOrderHeader"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { cn } from "@/lib/utils"
import type { ScheduleItem, ScheduleItemType } from "@/data/types"

/* ------------------------------------------------------------------ */
/*  Badge helper                                                       */
/* ------------------------------------------------------------------ */

function typeBadge(type: ScheduleItemType) {
  switch (type) {
    case "catering":
      return <Badge variant="blue">Catering</Badge>
    case "av":
      return <Badge variant="purple">AV</Badge>
    case "ohjelma":
      return <Badge variant="warning">Ohjelma</Badge>
    case "ajankohta":
      return <Badge variant="outline">Ajankohta</Badge>
    case "lisapalvelu":
      return <Badge variant="outline">Lisapalvelu</Badge>
    default:
      return <Badge variant="outline">Luonnos</Badge>
  }
}

/* ------------------------------------------------------------------ */
/*  Form state types                                                   */
/* ------------------------------------------------------------------ */

interface OhjelmaForm {
  title: string
  startTime: string
  endTime: string
  spaceName: string
}

interface AjankohtaForm {
  title: string
  startTime: string
  spaceName: string
}

const emptyOhjelmaForm: OhjelmaForm = {
  title: "",
  startTime: "",
  endTime: "",
  spaceName: "",
}

const emptyAjankohtaForm: AjankohtaForm = {
  title: "",
  startTime: "",
  spaceName: "",
}

/* ------------------------------------------------------------------ */
/*  Seller-owned item check                                            */
/* ------------------------------------------------------------------ */

function isSellerOwned(type: ScheduleItemType) {
  return type === "ajankohta" || type === "ohjelma"
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function SchedulePage() {
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const {
    getScheduleItems,
    addScheduleItem,
    updateScheduleItem,
    removeScheduleItem,
  } = useWorkOrders()

  const [activeDay, setActiveDay] = useState(
    workOrder?.eventDays[0]?.id ?? ""
  )
  const [showBanner, setShowBanner] = useState(true)

  // Dialog states
  const [ohjelmaOpen, setOhjelmaOpen] = useState(false)
  const [ajankohtaOpen, setAjankohtaOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  // Form states
  const [ohjelmaForm, setOhjelmaForm] = useState<OhjelmaForm>(emptyOhjelmaForm)
  const [ajankohtaForm, setAjankohtaForm] = useState<AjankohtaForm>(emptyAjankohtaForm)
  const [editItem, setEditItem] = useState<ScheduleItem | null>(null)
  const [editForm, setEditForm] = useState<OhjelmaForm>(emptyOhjelmaForm)

  if (!workOrder) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        Tyotilausta ei loydy.
      </div>
    )
  }

  const currentDay = workOrder.eventDays.find((d) => d.id === activeDay)
  const scheduleItems = currentDay
    ? getScheduleItems(workOrderId, currentDay.id)
    : []
  const selectedSpaceNames =
    currentDay?.spaces.map((s) => s.spaceName).join(", ") ?? "--"

  /* ---- Add ohjelma handler ---- */
  function handleAddOhjelma() {
    if (!currentDay || !ohjelmaForm.title || !ohjelmaForm.startTime) return
    const item: ScheduleItem = {
      id: `sched-${Date.now()}`,
      type: "ohjelma",
      title: ohjelmaForm.title,
      startTime: ohjelmaForm.startTime,
      endTime: ohjelmaForm.endTime,
      spaceName: ohjelmaForm.spaceName,
      status: "luonnos",
      sourceLabel: "",
    }
    addScheduleItem(workOrderId, currentDay.id, item)
    setOhjelmaForm(emptyOhjelmaForm)
    setOhjelmaOpen(false)
  }

  /* ---- Add ajankohta handler ---- */
  function handleAddAjankohta() {
    if (!currentDay || !ajankohtaForm.title || !ajankohtaForm.startTime) return
    const item: ScheduleItem = {
      id: `sched-${Date.now()}`,
      type: "ajankohta",
      title: ajankohtaForm.title,
      startTime: ajankohtaForm.startTime,
      endTime: "",
      spaceName: ajankohtaForm.spaceName,
      status: "luonnos",
      sourceLabel: "",
    }
    addScheduleItem(workOrderId, currentDay.id, item)
    setAjankohtaForm(emptyAjankohtaForm)
    setAjankohtaOpen(false)
  }

  /* ---- Edit handler ---- */
  function openEdit(item: ScheduleItem) {
    setEditItem(item)
    setEditForm({
      title: item.title,
      startTime: item.startTime,
      endTime: item.endTime,
      spaceName: item.spaceName,
    })
    setEditOpen(true)
  }

  function handleSaveEdit() {
    if (!currentDay || !editItem || !editForm.title || !editForm.startTime)
      return
    updateScheduleItem(workOrderId, currentDay.id, editItem.id, {
      title: editForm.title,
      startTime: editForm.startTime,
      endTime: editItem.type === "ajankohta" ? "" : editForm.endTime,
      spaceName: editForm.spaceName,
    })
    setEditOpen(false)
    setEditItem(null)
  }

  /* ---- Delete handler ---- */
  function handleDelete(itemId: string) {
    if (!currentDay) return
    removeScheduleItem(workOrderId, currentDay.id, itemId)
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  const aikatauluProposal = workOrder.proposalSections?.find(p => p.sectionKey === "aikataulu")
  const hasChangesRequested = aikatauluProposal?.status === "changes_requested"

  return (
    <div className="space-y-6">
      <WorkOrderHeader workOrder={workOrder} title="Aikataulu" />

      {hasChangesRequested && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 shrink-0">
            <span className="text-red-600 text-[13px] font-bold">!</span>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-red-900">Asiakas pyytää muutoksia aikatauluun</p>
            {aikatauluProposal?.clientComment && (
              <p className="text-[13px] text-red-700 mt-0.5">"{aikatauluProposal.clientComment}"</p>
            )}
          </div>
        </div>
      )}

      {showBanner && (
        <InfoBanner onDismiss={() => setShowBanner(false)}>
          Tama on jaettu aikataulu. Kaikki osallistujat nakevat koko
          tapahtuman aikataulun.
        </InfoBanner>
      )}

      {workOrder.eventDays.length > 0 && (
        <DayTabs
          days={workOrder.eventDays}
          activeDay={activeDay}
          onDayChange={setActiveDay}
        />
      )}

      {/* ---- Lahtotiedot ---- */}
      {currentDay && (
        <div className="relative rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Aikataulun lahtotiedot / Paivamaara {currentDay.date}
          </h2>

          <Button
            variant="outline"
            size="sm"
            className="absolute right-6 top-6"
          >
            <Pencil className="h-4 w-4" />
            Muokkaa lahtotietoja
          </Button>

          <div className="grid grid-cols-2 gap-x-16 gap-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Tilat</span>
              <span className="text-sm font-medium">{selectedSpaceNames}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Ohjelma paattyy</span>
              <span className="text-sm font-medium">
                {currentDay.programEnd}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Varausaika</span>
              <span className="text-sm font-medium">
                {currentDay.bookingStart}&ndash;{currentDay.bookingEnd}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Vieraat poistuvat</span>
              <span className="text-sm font-medium">
                {currentDay.guestsLeave}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Ovet avataan</span>
              <span className="text-sm font-medium">
                {currentDay.doorsOpen}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">
                Rakennusaikaikkuna
              </span>
              <span className="text-sm font-medium">
                lasketaan automaattisesti
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Ohjelma alkaa</span>
              <span className="text-sm font-medium">
                {currentDay.programStart}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Purkuaikaikkuna</span>
              <span className="text-sm font-medium">
                lasketaan automaattisesti
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ---- Add buttons ---- */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setOhjelmaOpen(true)}>
          <Star className="h-4 w-4" />
          Lisaa ohjelmavaihe
        </Button>
        <Button variant="outline" onClick={() => setAjankohtaOpen(true)}>
          <Plus className="h-4 w-4" />
          Lisaa Ajankohta
        </Button>
      </div>

      {/* ---- Info text ---- */}
      <p className="text-sm text-gray-500">
        Aikataulu muodostuu automaattisesti Catering- ja AV-osioiden
        sisallosta seka tahan lisatyista ohjelmavaiheista. Catering- ja
        AV-rivit tulevat automaattisesti omista osioistaan.
      </p>

      {/* ---- Empty state ---- */}
      {scheduleItems.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <Clock className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            Ei viela aikatauluriveja.
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Lisaa ohjelmavaiheita tai aloita Catering/AV-osioista.
          </p>
        </div>
      )}

      {/* ---- Timeline items ---- */}
      {scheduleItems.length > 0 && (
        <div className="space-y-0">
          {scheduleItems.map((item, index) => (
            <div key={item.id}>
              {/* Connector line between items */}
              {index > 0 && (
                <div className="ml-[142px] h-4 w-px bg-gray-200" />
              )}

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
                {/* Drag handle */}
                <GripVertical className="h-5 w-5 shrink-0 text-gray-300" />

                {/* Start time */}
                <div className="rounded border border-gray-300 px-3 py-1 font-mono text-sm font-medium">
                  {item.startTime}
                </div>

                <span className="text-gray-400">&ndash;</span>

                {/* End time */}
                <div className="rounded border border-gray-300 px-3 py-1 font-mono text-sm font-medium">
                  {item.endTime || "--:--"}
                </div>

                {/* Timeline dot */}
                <div className="h-3 w-3 shrink-0 rounded-full border-2 border-gray-300 bg-white" />

                {/* Title and subtitle */}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.title}</p>
                  {(item.spaceName || item.sourceLabel) && (
                    <p className="text-sm text-gray-500">
                      {item.spaceName}
                      {item.sourceLabel ? ` · ${item.sourceLabel}` : ""}
                    </p>
                  )}
                </div>

                {/* Type badge */}
                {typeBadge(item.type)}

                {/* Status badge for drafts */}
                {item.status === "luonnos" && isSellerOwned(item.type) && (
                  <Badge variant="outline">Luonnos</Badge>
                )}

                {/* Edit - only for seller-owned items */}
                {isSellerOwned(item.type) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}

                {/* Delete - only for seller-owned items */}
                {isSellerOwned(item.type) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================================================================ */}
      {/*  Lisaa ohjelmavaihe — Dialog                                     */}
      {/* ================================================================ */}
      <Dialog open={ohjelmaOpen} onOpenChange={setOhjelmaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lisaa ohjelmavaihe</DialogTitle>
            <DialogDescription>
              Lisaa uusi ohjelmavaihe aikatauluun.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Otsikko</label>
              <Input
                placeholder="esim. Keynote-puhe"
                value={ohjelmaForm.title}
                onChange={(e) =>
                  setOhjelmaForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Alkaa</label>
                <Input
                  type="time"
                  value={ohjelmaForm.startTime}
                  onChange={(e) =>
                    setOhjelmaForm((f) => ({
                      ...f,
                      startTime: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Paattyy</label>
                <Input
                  type="time"
                  value={ohjelmaForm.endTime}
                  onChange={(e) =>
                    setOhjelmaForm((f) => ({
                      ...f,
                      endTime: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tila</label>
              <Input
                placeholder="esim. Sali A"
                value={ohjelmaForm.spaceName}
                onChange={(e) =>
                  setOhjelmaForm((f) => ({
                    ...f,
                    spaceName: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOhjelmaForm(emptyOhjelmaForm)
                setOhjelmaOpen(false)
              }}
            >
              Peruuta
            </Button>
            <Button
              onClick={handleAddOhjelma}
              disabled={!ohjelmaForm.title || !ohjelmaForm.startTime}
            >
              Lisaa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/*  Lisaa Ajankohta — Dialog                                        */}
      {/* ================================================================ */}
      <Dialog open={ajankohtaOpen} onOpenChange={setAjankohtaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lisaa ajankohta</DialogTitle>
            <DialogDescription>
              Lisaa uusi ajankohta aikatauluun.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Otsikko</label>
              <Input
                placeholder="esim. Ovien avaus, Purku alkaa"
                value={ajankohtaForm.title}
                onChange={(e) =>
                  setAjankohtaForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Aika</label>
              <Input
                type="time"
                value={ajankohtaForm.startTime}
                onChange={(e) =>
                  setAjankohtaForm((f) => ({
                    ...f,
                    startTime: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tila</label>
              <Input
                placeholder="esim. Aula"
                value={ajankohtaForm.spaceName}
                onChange={(e) =>
                  setAjankohtaForm((f) => ({
                    ...f,
                    spaceName: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAjankohtaForm(emptyAjankohtaForm)
                setAjankohtaOpen(false)
              }}
            >
              Peruuta
            </Button>
            <Button
              onClick={handleAddAjankohta}
              disabled={!ajankohtaForm.title || !ajankohtaForm.startTime}
            >
              Lisaa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/*  Muokkaa — Edit Dialog                                           */}
      {/* ================================================================ */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Muokkaa {editItem?.type === "ajankohta" ? "ajankohtaa" : "ohjelmavaihetta"}
            </DialogTitle>
            <DialogDescription>
              Muokkaa aikataulurvin tietoja.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Otsikko</label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div
              className={cn(
                "grid gap-4",
                editItem?.type === "ajankohta" ? "grid-cols-1" : "grid-cols-2"
              )}
            >
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {editItem?.type === "ajankohta" ? "Aika" : "Alkaa"}
                </label>
                <Input
                  type="time"
                  value={editForm.startTime}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      startTime: e.target.value,
                    }))
                  }
                />
              </div>
              {editItem?.type !== "ajankohta" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Paattyy</label>
                  <Input
                    type="time"
                    value={editForm.endTime}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        endTime: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tila</label>
              <Input
                value={editForm.spaceName}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, spaceName: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditOpen(false)
                setEditItem(null)
              }}
            >
              Peruuta
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editForm.title || !editForm.startTime}
            >
              Tallenna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SectionNotes sectionKey="aikataulu" />
    </div>
  )
}
