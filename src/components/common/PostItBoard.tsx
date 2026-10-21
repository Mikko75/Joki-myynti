import { useState } from "react"
import { Plus } from "lucide-react"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { useMode } from "@/context/ModeContext"
import type { PostItColor, PostItSection } from "@/data/types"
import { PostItNoteCard, POST_IT_COLORS } from "./PostItNote"

const COLOR_ORDER: PostItColor[] = ["yellow", "green", "blue", "pink", "purple"]

interface PostItBoardProps {
  sectionKey: PostItSection
  showFilter?: boolean
}

export function PostItBoard({ sectionKey, showFilter }: PostItBoardProps) {
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const { getNotes, addNote, updateNote, removeNote } = useWorkOrders()
  const { mode } = useMode()
  const isSeller = mode === "seller"

  const [activeFilter, setActiveFilter] = useState<PostItSection | "kaikki">("kaikki")
  const [addingColor, setAddingColor] = useState<PostItColor | null>(null)

  if (!workOrder || !isSeller) return null

  const allNotes = getNotes(workOrderId)
  const filteredNotes = showFilter
    ? (activeFilter === "kaikki" ? allNotes : allNotes.filter(n => n.sectionKey === activeFilter))
    : getNotes(workOrderId, sectionKey)

  function handleAdd(color: PostItColor) {
    addNote(workOrderId, {
      text: "",
      color,
      sectionKey: showFilter ? (activeFilter === "kaikki" ? "yleinen" : activeFilter) : sectionKey,
      author: "ML",
    })
    setAddingColor(null)
  }

  const FILTER_OPTIONS: { key: PostItSection | "kaikki"; label: string }[] = [
    { key: "kaikki", label: "Kaikki" },
    { key: "yleinen", label: "Yleinen" },
    { key: "tilat", label: "Tilat" },
    { key: "aikataulu", label: "Aikataulu" },
    { key: "catering", label: "Catering" },
    { key: "lisapalvelut", label: "AV" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-gray-900">
          {showFilter ? "Muistiinpanot" : "Muistiinpanot"}
        </h3>
        <div className="flex items-center gap-1.5">
          {/* Värivalikoima lisäämiseen */}
          {addingColor === null ? (
            <button
              onClick={() => setAddingColor("yellow")}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-medium text-gray-600 hover:border-gray-300 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Lisää lappu
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
              <span className="text-[11px] text-gray-500 mr-1">Väri:</span>
              {COLOR_ORDER.map((c) => (
                <button
                  key={c}
                  onClick={() => handleAdd(c)}
                  className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${POST_IT_COLORS[c].dot}`}
                  style={{ borderColor: POST_IT_COLORS[c].border }}
                  title={c}
                />
              ))}
              <button onClick={() => setAddingColor(null)} className="text-[11px] text-gray-400 ml-1 hover:text-gray-600">✕</button>
            </div>
          )}
        </div>
      </div>

      {/* Filtterit (vain yleiskuvalla) */}
      {showFilter && (
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                activeFilter === f.key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
              {f.key !== "kaikki" && (
                <span className="ml-1 opacity-60">
                  ({allNotes.filter(n => n.sectionKey === f.key).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Laput */}
      {filteredNotes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
          <p className="text-[13px] text-gray-400">Ei muistiinpanoja. Lisää lappu +</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-5 py-2">
          {filteredNotes.map((note, i) => (
            <PostItNoteCard
              key={note.id}
              note={note}
              index={i}
              onUpdate={(updates) => updateNote(workOrderId, note.id, updates)}
              onDelete={() => removeNote(workOrderId, note.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
