import { createContext, useContext, useState, useCallback } from "react"
import type { ReactNode } from "react"

export interface CustomerEnrichment {
  industry?: string
  address?: string
  yTunnus?: string
  notes?: string
}

interface CustomerEnrichmentContextValue {
  enrichments: Record<string, CustomerEnrichment>
  getEnrichment: (company: string) => CustomerEnrichment
  updateEnrichment: (company: string, updates: Partial<CustomerEnrichment>) => void
  renameCompany: (oldName: string, newName: string) => void
}

const initialEnrichments: Record<string, CustomerEnrichment> = {
  "Esimerkkiyritys Oy": { industry: "Teknologia", yTunnus: "1234567-8", address: "Mannerheimintie 10, 00100 Helsinki" },
  "Nordic Tech Oy": { industry: "IT-palvelut", yTunnus: "2345678-9", address: "Itämerenkatu 5, 00180 Helsinki" },
  "FinData Oy": { industry: "Data-analytiikka", yTunnus: "3456789-0" },
  "Global Solutions Oy": { industry: "Konsultointi", yTunnus: "4567890-1" },
  "Design Studio Oy": { industry: "Muotoilu", yTunnus: "5678901-2" },
  "Kasvu Partners Oy": { industry: "Sijoitus", yTunnus: "6789012-3" },
  "Green Future Oy": { industry: "Ympäristöteknologia", yTunnus: "7890123-4" },
  "TechCom Oy": { industry: "Viestintäteknologia", yTunnus: "8901234-5" },
  "FinanssiTalo Oy": { industry: "Rahoitus", yTunnus: "9012345-6" },
}

const CustomerEnrichmentContext = createContext<CustomerEnrichmentContextValue | null>(null)

export function CustomerEnrichmentProvider({ children }: { children: ReactNode }) {
  const [enrichments, setEnrichments] = useState<Record<string, CustomerEnrichment>>(initialEnrichments)

  const getEnrichment = useCallback(
    (company: string): CustomerEnrichment => enrichments[company] ?? {},
    [enrichments]
  )

  const updateEnrichment = useCallback((company: string, updates: Partial<CustomerEnrichment>) => {
    setEnrichments((prev) => ({
      ...prev,
      [company]: { ...(prev[company] ?? {}), ...updates },
    }))
  }, [])

  const renameCompany = useCallback((oldName: string, newName: string) => {
    if (oldName === newName) return
    setEnrichments((prev) => {
      const { [oldName]: data, ...rest } = prev
      if (!data) return prev
      return { ...rest, [newName]: data }
    })
  }, [])

  return (
    <CustomerEnrichmentContext.Provider value={{ enrichments, getEnrichment, updateEnrichment, renameCompany }}>
      {children}
    </CustomerEnrichmentContext.Provider>
  )
}

export function useCustomerEnrichment() {
  const ctx = useContext(CustomerEnrichmentContext)
  if (!ctx) throw new Error("useCustomerEnrichment must be used within CustomerEnrichmentProvider")
  return ctx
}
