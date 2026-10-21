import { createContext, useContext, useState, useCallback, useRef } from "react"
import type { ReactNode } from "react"
import type { WorkOrder, ScheduleItem, CateringMoment, CateringStatus, PostItNote, PostItColor, PostItSection } from "@/data/types"
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

  getNotes: (woId: string, sectionKey?: PostItSection) => PostItNote[]
  addNote: (woId: string, note: Omit<PostItNote, "id" | "createdAt">) => void
  updateNote: (woId: string, noteId: string, updates: Partial<PostItNote>) => void
  removeNote: (woId: string, noteId: string) => void

  getScheduleItems: (woId: string, dayId: string) => ScheduleItem[]
  addScheduleItem: (woId: string, dayId: string, item: ScheduleItem) => void
  updateScheduleItem: (woId: string, dayId: string, itemId: string, updates: Partial<ScheduleItem>) => void
  removeScheduleItem: (woId: string, dayId: string, itemId: string) => void

  getCateringPlan: (woId: string, partnerId?: string) => CateringPlanState
  getAllCateringPlans: (woId: string) => Record<string, CateringPlanState>
  updateCateringPlan: (woId: string, partnerId: string, updates: Partial<CateringPlanState>) => void
  addCateringMoment: (woId: string, partnerId: string, moment: CateringMoment) => void
  updateCateringMoment: (woId: string, partnerId: string, momentId: string, updates: Partial<CateringMoment>) => void
  removeCateringMoment: (woId: string, partnerId: string, momentId: string) => void

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
  const [cateringPlans, setCateringPlans] = useState<Record<string, Record<string, CateringPlanState>>>({})
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

  const getNotes = useCallback((woId: string, sectionKey?: PostItSection) => {
    const wo = workOrders.find(w => w.id === woId)
    const notes = wo?.notes ?? []
    return sectionKey ? notes.filter(n => n.sectionKey === sectionKey) : notes
  }, [workOrders])

  const addNote = useCallback((woId: string, note: Omit<PostItNote, "id" | "createdAt">) => {
    const newNote: PostItNote = { ...note, id: `note-${Date.now()}`, createdAt: new Date().toISOString() }
    setWorkOrders(prev => prev.map(wo => wo.id === woId ? { ...wo, notes: [...(wo.notes ?? []), newNote] } : wo))
  }, [])

  const updateNote = useCallback((woId: string, noteId: string, updates: Partial<PostItNote>) => {
    setWorkOrders(prev => prev.map(wo => wo.id === woId
      ? { ...wo, notes: (wo.notes ?? []).map(n => n.id === noteId ? { ...n, ...updates } : n) }
      : wo))
  }, [])

  const removeNote = useCallback((woId: string, noteId: string) => {
    setWorkOrders(prev => prev.map(wo => wo.id === woId
      ? { ...wo, notes: (wo.notes ?? []).filter(n => n.id !== noteId) }
      : wo))
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

  const DEFAULT_PARTNER = "_default"

  const getCateringPlan = useCallback(
    (woId: string, partnerId?: string): CateringPlanState => {
      const woPlans = cateringRef.current[woId]
      if (!woPlans) return { ...emptyCatering }
      if (partnerId) {
        return woPlans[partnerId] ?? { ...emptyCatering }
      }
      const keys = Object.keys(woPlans)
      if (keys.length === 0) return { ...emptyCatering }
      if (keys.length === 1) return woPlans[keys[0]]
      const allMoments = keys.flatMap((k) => woPlans[k].moments)
      return { ...woPlans[keys[0]], moments: allMoments }
    },
    [cateringPlans]
  )

  const getAllCateringPlans = useCallback(
    (woId: string): Record<string, CateringPlanState> => {
      return cateringRef.current[woId] ?? {}
    },
    [cateringPlans]
  )

  const updateCateringPlan = useCallback((woId: string, partnerId: string, updates: Partial<CateringPlanState>) => {
    setCateringPlans((prev) => ({
      ...prev,
      [woId]: {
        ...(prev[woId] ?? {}),
        [partnerId]: { ...(prev[woId]?.[partnerId] ?? { ...emptyCatering }), ...updates },
      },
    }))
  }, [])

  const addCateringMoment = useCallback((woId: string, partnerId: string, moment: CateringMoment) => {
    setCateringPlans((prev) => {
      const plan = prev[woId]?.[partnerId] ?? { ...emptyCatering }
      return {
        ...prev,
        [woId]: {
          ...(prev[woId] ?? {}),
          [partnerId]: {
            ...plan,
            status: plan.status === "ei_aloitettu" ? "luonnos" : plan.status,
            moments: [...plan.moments, moment].sort((a, b) =>
              a.startTime.localeCompare(b.startTime)
            ),
          },
        },
      }
    })
  }, [])

  const updateCateringMoment = useCallback(
    (woId: string, partnerId: string, momentId: string, updates: Partial<CateringMoment>) => {
      setCateringPlans((prev) => {
        const plan = prev[woId]?.[partnerId]
        if (!plan) return prev
        return {
          ...prev,
          [woId]: {
            ...(prev[woId] ?? {}),
            [partnerId]: {
              ...plan,
              moments: plan.moments.map((m) =>
                m.id === momentId ? { ...m, ...updates } : m
              ),
            },
          },
        }
      })
    },
    []
  )

  const removeCateringMoment = useCallback((woId: string, partnerId: string, momentId: string) => {
    setCateringPlans((prev) => {
      const plan = prev[woId]?.[partnerId]
      if (!plan) return prev
      return {
        ...prev,
        [woId]: {
          ...(prev[woId] ?? {}),
          [partnerId]: { ...plan, moments: plan.moments.filter((m) => m.id !== momentId) },
        },
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
        getNotes,
        addNote,
        updateNote,
        removeNote,
        getScheduleItems,
        addScheduleItem,
        updateScheduleItem,
        removeScheduleItem,
        getCateringPlan,
        getAllCateringPlans,
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
