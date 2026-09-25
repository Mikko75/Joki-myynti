import { createContext, useContext, useState, useCallback } from "react"
import type { ReactNode } from "react"

export type AppMode = "seller" | "client" | string

export interface ModeInfo {
  key: string
  label: string
  name: string
  role: string
  initials: string
  color: string
}

export const SELLER_MODE: ModeInfo = {
  key: "seller",
  label: "Myyjä",
  name: "Mikko Lesonen",
  role: "Myynti",
  initials: "ML",
  color: "#3b82f6",
}

export const CLIENT_MODE: ModeInfo = {
  key: "client",
  label: "Asiakas",
  name: "Asiakas",
  role: "Asiakas",
  initials: "AS",
  color: "#f59e0b",
}

interface ModeContextValue {
  mode: string
  setMode: (mode: string) => void
  modeInfo: ModeInfo
  setModeInfo: (info: ModeInfo) => void
}

const ModeContext = createContext<ModeContextValue | null>(null)

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<string>("seller")
  const [currentModeInfo, setCurrentModeInfo] = useState<ModeInfo>(SELLER_MODE)

  const setMode = useCallback((m: string) => {
    setModeState(m)
  }, [])

  const setModeInfo = useCallback((info: ModeInfo) => {
    setCurrentModeInfo(info)
  }, [])

  return (
    <ModeContext.Provider value={{ mode, setMode, modeInfo: currentModeInfo, setModeInfo }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  const ctx = useContext(ModeContext)
  if (!ctx) throw new Error("useMode must be used within ModeProvider")
  return ctx
}
