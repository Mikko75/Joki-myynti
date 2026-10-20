import { createContext, useContext, useState, useCallback } from "react"
import type { ReactNode } from "react"

export interface ChatMessage {
  id: string
  sectionKey: string
  partnerId?: string
  senderName: string
  senderInitials: string
  senderColor: string
  senderRole: string
  senderRoleLabel: string
  content: string
  timestamp: string
}

interface ChatContextValue {
  getMessages: (sectionKey: string, partnerId?: string) => ChatMessage[]
  sendMessage: (sectionKey: string, content: string, sender: {
    name: string
    initials: string
    color: string
    role: string
    roleLabel: string
  }, partnerId?: string) => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const getMessages = useCallback(
    (sectionKey: string, partnerId?: string) =>
      messages.filter((m) =>
        m.sectionKey === sectionKey &&
        (!partnerId || m.partnerId === partnerId)
      ),
    [messages]
  )

  const sendMessage = useCallback(
    (sectionKey: string, content: string, sender: {
      name: string
      initials: string
      color: string
      role: string
      roleLabel: string
    }, partnerId?: string) => {
      const msg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        sectionKey,
        partnerId,
        senderName: sender.name,
        senderInitials: sender.initials,
        senderColor: sender.color,
        senderRole: sender.role,
        senderRoleLabel: sender.roleLabel,
        content,
        timestamp: new Date().toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, msg])
    },
    []
  )

  return (
    <ChatContext.Provider value={{ getMessages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChat must be used within ChatProvider")
  return ctx
}
