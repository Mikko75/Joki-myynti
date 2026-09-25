import { useMemo, useCallback } from "react"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { useCustomerEnrichment } from "@/context/CustomerEnrichmentContext"
import type { EventSource } from "@/data/types"

export interface DerivedCustomer {
  company: string
  primaryContact: string
  email: string
  phone: string
  source: EventSource
  industry: string
  address: string
  yTunnus: string
  notes: string
  workOrderCount: number
  workOrderIds: string[]
}

export function useCustomers() {
  const { workOrders, updateWorkOrder } = useWorkOrders()
  const { enrichments, getEnrichment, updateEnrichment, renameCompany } = useCustomerEnrichment()

  const customers = useMemo<DerivedCustomer[]>(() => {
    const grouped = new Map<string, typeof workOrders>()
    for (const wo of workOrders) {
      const key = wo.customerCompany
      const list = grouped.get(key) ?? []
      list.push(wo)
      grouped.set(key, list)
    }

    const result: DerivedCustomer[] = []
    for (const [company, wos] of grouped) {
      const primary = wos[0]
      const enrichment = getEnrichment(company)
      const emailWo = wos.find((w) => w.customerEmail)
      const phoneWo = wos.find((w) => w.customerPhone)

      result.push({
        company,
        primaryContact: primary.customerName,
        email: emailWo?.customerEmail ?? "",
        phone: phoneWo?.customerPhone ?? "",
        source: primary.source,
        industry: enrichment.industry ?? "",
        address: enrichment.address ?? "",
        yTunnus: enrichment.yTunnus ?? "",
        notes: enrichment.notes ?? "",
        workOrderCount: wos.length,
        workOrderIds: wos.map((w) => w.id),
      })
    }

    return result.sort((a, b) => a.company.localeCompare(b.company, "fi"))
  }, [workOrders, enrichments, getEnrichment])

  const updateCustomer = useCallback(
    (
      originalCompany: string,
      updates: Partial<Omit<DerivedCustomer, "workOrderCount" | "workOrderIds">>
    ) => {
      const customer = customers.find((c) => c.company === originalCompany)
      if (!customer) return

      if (updates.company && updates.company !== originalCompany) {
        renameCompany(originalCompany, updates.company)
      }

      updateEnrichment(updates.company ?? originalCompany, {
        industry: updates.industry,
        address: updates.address,
        yTunnus: updates.yTunnus,
        notes: updates.notes,
      })

      for (const woId of customer.workOrderIds) {
        const woUpdates: Record<string, unknown> = {}
        if (updates.company !== undefined) woUpdates.customerCompany = updates.company
        if (updates.primaryContact !== undefined) woUpdates.customerName = updates.primaryContact
        if (updates.email !== undefined) woUpdates.customerEmail = updates.email
        if (updates.phone !== undefined) woUpdates.customerPhone = updates.phone
        if (updates.source !== undefined) woUpdates.source = updates.source
        if (Object.keys(woUpdates).length > 0) {
          updateWorkOrder(woId, woUpdates)
        }
      }
    },
    [customers, updateWorkOrder, updateEnrichment, renameCompany]
  )

  return { customers, updateCustomer }
}
