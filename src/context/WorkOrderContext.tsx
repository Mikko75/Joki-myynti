import { createContext, useContext, useState, useCallback, useRef } from "react"
import type { ReactNode } from "react"
import type { WorkOrder, ScheduleItem, CateringMoment, CateringStatus } from "@/data/types"
import { workOrders as initialWorkOrders } from "@/data/mock"

export interface CateringPlanState {
  status: CateringStatus
  participantCount: number
  dietaryNeeds: string
  servingArea: string
  servingPoints: number
  staffNeeded: string
  notes: string
  moments: CateringMoment[]
}

export interface AVPlanState {
  status: CateringStatus
  microphones: string
  audio: string
  screens: string
  streaming: string
  recording: string
  notes: string
  price: number
}

interface WorkOrderContextValue {
  workOrders: WorkOrder[]
  addWorkOrder: (wo: WorkOrder) => void
  getWorkOrder: (id: string) => WorkOrder | undefined
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void

  getScheduleItems: (woId: string, dayId: string) => ScheduleItem[]
  addScheduleItem: (woId: string, dayId: string, item: ScheduleItem) => void
  updateScheduleItem: (woId: string, dayId: string, itemId: string, updates: Partial<ScheduleItem>) => void
  removeScheduleItem: (woId: string, dayId: string, itemId: string) => void

  getCateringPlan: (woId: string) => CateringPlanState
  updateCateringPlan: (woId: string, updates: Partial<CateringPlanState>) => void
  addCateringMoment: (woId: string, moment: CateringMoment) => void
  updateCateringMoment: (woId: string, momentId: string, updates: Partial<CateringMoment>) => void
  removeCateringMoment: (woId: string, momentId: string) => void

  getAVPlan: (woId: string) => AVPlanState
  updateAVPlan: (woId: string, updates: Partial<AVPlanState>) => void
}

const emptyCatering: CateringPlanState = {
  status: "ei_aloitettu",
  participantCount: 0,
  dietaryNeeds: "",
  servingArea: "",
  servingPoints: 0,
  staffNeeded: "",
  notes: "",
  moments: [],
}

const emptyAV: AVPlanState = {
  status: "ei_aloitettu",
  microphones: "",
  audio: "",
  screens: "",
  streaming: "",
  recording: "",
  price: 0,
  notes: "",
}

const WorkOrderContext = createContext<WorkOrderContextValue | null>(null)

export function WorkOrderProvider({ children }: { children: ReactNode }) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders)
  const [cateringPlans, setCateringPlans] = useState<Record<string, CateringPlanState>>({})
  const [avPlans, setAVPlans] = useState<Record<string, AVPlanState>>({})

  const cateringRef = useRef(cateringPlans)
  cateringRef.current = cateringPlans
  const avRef = useRef(avPlans)
  avRef.current = avPlans

  const addWorkOrder = useCallback((wo: WorkOrder) => {
    setWorkOrders((prev) => [wo, ...prev])
  }, [])

  const getWorkOrder = useCallback(
    (id: string) => workOrders.find((wo) => wo.id === id),
    [workOrders]
  )

  const updateWorkOrder = useCallback((id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders((prev) =>
      prev.map((wo) => (wo.id === id ? { ...wo, ...updates } : wo))
    )
  }, [])

  const getScheduleItems = useCallback(
    (woId: string, dayId: string) => {
      const wo = workOrders.find((w) => w.id === woId)
      const day = wo?.eventDays.find((d) => d.id === dayId)
      return day?.scheduleItems ?? []
    },
    [workOrders]
  )

  const addScheduleItem = useCallback((woId: string, dayId: string, item: ScheduleItem) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== woId) return wo
        return {
          ...wo,
          eventDays: wo.eventDays.map((d) => {
            if (d.id !== dayId) return d
            const items = [...d.scheduleItems, item].sort((a, b) =>
              a.startTime.localeCompare(b.startTime)
            )
            return { ...d, scheduleItems: items }
          }),
        }
      })
    )
  }, [])

  const updateScheduleItem = useCallback(
    (woId: string, dayId: string, itemId: string, updates: Partial<ScheduleItem>) => {
      setWorkOrders((prev) =>
        prev.map((wo) => {
          if (wo.id !== woId) return wo
          return {
            ...wo,
            eventDays: wo.eventDays.map((d) => {
              if (d.id !== dayId) return d
              return {
                ...d,
                scheduleItems: d.scheduleItems
                  .map((si) => (si.id === itemId ? { ...si, ...updates } : si))
                  .sort((a, b) => a.startTime.localeCompare(b.startTime)),
              }
            }),
          }
        })
      )
    },
    []
  )

  const removeScheduleItem = useCallback((woId: string, dayId: string, itemId: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== woId) return wo
        return {
          ...wo,
          eventDays: wo.eventDays.map((d) => {
            if (d.id !== dayId) return d
            return { ...d, scheduleItems: d.scheduleItems.filter((si) => si.id !== itemId) }
          }),
        }
      })
    )
  }, [])

  const getCateringPlan = useCallback(
    (woId: string): CateringPlanState => {
      const stored = cateringRef.current[woId]
      if (stored) return stored
      return { ...emptyCatering }
    },
    [cateringPlans]
  )

  const updateCateringPlan = useCallback((woId: string, updates: Partial<CateringPlanState>) => {
    setCateringPlans((prev) => ({
      ...prev,
      [woId]: { ...(prev[woId] ?? { ...emptyCatering }), ...updates },
    }))
  }, [])

  const addCateringMoment = useCallback((woId: string, moment: CateringMoment) => {
    setCateringPlans((prev) => {
      const plan = prev[woId] ?? { ...emptyCatering }
      return {
        ...prev,
        [woId]: {
          ...plan,
          status: plan.status === "ei_aloitettu" ? "luonnos" : plan.status,
          moments: [...plan.moments, moment].sort((a, b) =>
            a.startTime.localeCompare(b.startTime)
          ),
        },
      }
    })
  }, [])

  const updateCateringMoment = useCallback(
    (woId: string, momentId: string, updates: Partial<CateringMoment>) => {
      setCateringPlans((prev) => {
        const plan = prev[woId]
        if (!plan) return prev
        return {
          ...prev,
          [woId]: {
            ...plan,
            moments: plan.moments.map((m) =>
              m.id === momentId ? { ...m, ...updates } : m
            ),
          },
        }
      })
    },
    []
  )

  const removeCateringMoment = useCallback((woId: string, momentId: string) => {
    setCateringPlans((prev) => {
      const plan = prev[woId]
      if (!plan) return prev
      return {
        ...prev,
        [woId]: { ...plan, moments: plan.moments.filter((m) => m.id !== momentId) },
      }
    })
  }, [])

  const getAVPlan = useCallback(
    (woId: string): AVPlanState => {
      const stored = avRef.current[woId]
      if (stored) return stored
      return { ...emptyAV }
    },
    [avPlans]
  )

  const updateAVPlan = useCallback((woId: string, updates: Partial<AVPlanState>) => {
    setAVPlans((prev) => ({
      ...prev,
      [woId]: { ...(prev[woId] ?? { ...emptyAV }), ...updates },
    }))
  }, [])

  return (
    <WorkOrderContext.Provider
      value={{
        workOrders,
        addWorkOrder,
        getWorkOrder,
        updateWorkOrder,
        getScheduleItems,
        addScheduleItem,
        updateScheduleItem,
        removeScheduleItem,
        getCateringPlan,
        updateCateringPlan,
        addCateringMoment,
        updateCateringMoment,
        removeCateringMoment,
        getAVPlan,
        updateAVPlan,
      }}
    >
      {children}
    </WorkOrderContext.Provider>
  )
}

export function useWorkOrders() {
  const ctx = useContext(WorkOrderContext)
  if (!ctx) throw new Error("useWorkOrders must be used within WorkOrderProvider")
  return ctx
}
