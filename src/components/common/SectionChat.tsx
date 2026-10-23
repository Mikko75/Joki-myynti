import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Mic } from "lucide-react"
import { useChat } from "@/context/ChatContext"
import { useMode } from "@/context/ModeContext"
import { cn } from "@/lib/utils"

interface SectionChatProps {
  sectionKey: string
  partnerId?: string
}

export function SectionChat({ sectionKey, partnerId }: SectionChatProps) {
  const { getMessages, sendMessage } = useChat()
  const { modeInfo, mode } = useMode()
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messages = getMessages(sectionKey, partnerId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  function handleSend() {
    const text = input.trim()
    if (!text) return
    sendMessage(sectionKey, text, {
      name: modeInfo.name,
      initials: modeInfo.initials,
      color: modeInfo.color,
      role: mode,
      roleLabel: modeInfo.label,
    }, partnerId)
    setInput("")
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <h3 className="text-[14px] font-semibold text-gray-900">Keskustelu</h3>
        <span className="text-[11px] text-gray-400">
          {messages.length > 0 ? `${messages.length} viestiä` : ""}
        </span>
      </div>

      <div className="px-5 py-4 min-h-25 max-h-100 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <p className="text-[12px] text-gray-400 text-center py-6">
            Ei vielä viestejä. Aloita keskustelu.
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderRole === mode

            return (
              <div key={msg.id} className="flex gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: msg.senderColor }}
                >
                  {msg.senderInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-gray-900">
                      {msg.senderName}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                      )}
                      style={{
                        backgroundColor: `${msg.senderColor}18`,
                        color: msg.senderColor,
                      }}
                    >
                      {msg.senderRoleLabel}
                    </span>
                    <span className="text-[11px] text-gray-400">{msg.timestamp}</span>
                    {isMe && (
                      <span className="text-[10px] text-gray-300">sinä</span>
                    )}
                  </div>
                  <p className="text-[13px] mt-1 leading-relaxed text-gray-700">
                    {msg.content}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Lähetä viesti..."
            className="flex-1 text-[14px] outline-none placeholder:text-gray-400 bg-transparent border-b border-gray-200 pb-1 min-w-0"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors shrink-0"
            onClick={handleSend}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
