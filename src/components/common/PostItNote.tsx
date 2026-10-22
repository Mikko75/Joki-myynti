import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import type { PostItNote as PostItNoteType, PostItColor } from "@/data/types"

export const POST_IT_COLORS: Record<PostItColor, { bg: string; text: string; border: string; dot: string }> = {
  yellow: { bg: "#FEF08A", text: "#713F12", border: "#FDE047", dot: "bg-yellow-300" },
  green:  { bg: "#BBF7D0", text: "#14532D", border: "#86EFAC", dot: "bg-green-300" },
  blue:   { bg: "#BAE6FD", text: "#0C4A6E", border: "#7DD3FC", dot: "bg-blue-300" },
  pink:   { bg: "#FBCFE8", text: "#831843", border: "#F9A8D4", dot: "bg-pink-300" },
  purple: { bg: "#E9D5FF", text: "#581C87", border: "#C4B5FD", dot: "bg-purple-300" },
}

interface PostItNoteProps {
  note: PostItNoteType
  index: number
  onUpdate: (updates: Partial<PostItNoteType>) => void
  onDelete: () => void
  readOnly?: boolean
}

export function PostItNoteCard({ note, index: _index, onUpdate, onDelete, readOnly }: PostItNoteProps) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(note.text)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const colors = POST_IT_COLORS[note.color]

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [editing])

  function handleBlur() {
    setEditing(false)
    if (text.trim() !== note.text) {
      onUpdate({ text: text.trim() || note.text })
    }
  }

  return (
    <div
      className="relative group shrink-0"
      style={{
        width: 180,
        minHeight: 160,
      }}
    >
      <div
        className="relative rounded-sm"
        style={{
          backgroundColor: colors.bg,
          boxShadow: "3px 5px 12px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.08)",
          width: 180,
          minHeight: 160,
          padding: "12px 12px 20px 12px",
        }}
      >
        {/* Taitettu kulma */}
        <div
          className="absolute bottom-0 right-0"
          style={{
            width: 0, height: 0,
            borderStyle: "solid",
            borderWidth: "0 0 18px 18px",
            borderColor: `transparent transparent rgba(0,0,0,0.12) transparent`,
          }}
        />

        {/* Poistonappi */}
        {!readOnly && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-0.5 hover:bg-black/10"
          >
            <X className="h-3.5 w-3.5" style={{ color: colors.text }} />
          </button>
        )}

        {/* Teksti */}
        {editing && !readOnly ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => { if (e.key === "Escape") { setText(note.text); setEditing(false) } }}
            className="w-full resize-none bg-transparent outline-none text-[13px] leading-relaxed"
            style={{ color: colors.text, fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive", minHeight: 100 }}
            rows={5}
          />
        ) : (
          <p
            onClick={() => !readOnly && setEditing(true)}
            className="text-[13px] leading-relaxed whitespace-pre-wrap break-words cursor-text min-h-[80px]"
            style={{ color: colors.text, fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive" }}
          >
            {note.text || <span className="opacity-40">Klikkaa muokataksesi...</span>}
          </p>
        )}

        {/* Värinvaihto-pistelst */}
        {!readOnly && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {(Object.keys(POST_IT_COLORS) as PostItColor[]).map((c) => (
              <button
                key={c}
                onClick={() => onUpdate({ color: c })}
                className={`h-3.5 w-3.5 rounded-full border transition-transform hover:scale-125 ${POST_IT_COLORS[c].dot}`}
                style={{ borderColor: note.color === c ? colors.text : "transparent", borderWidth: note.color === c ? 2 : 1 }}
                title={c}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
