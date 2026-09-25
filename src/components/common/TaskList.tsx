import { useNavigate } from "react-router-dom"
import { Users, UtensilsCrossed, Info, CreditCard, Monitor, MapPin, ChevronRight, Calendar, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import type { LucideIcon } from "lucide-react"

interface Task {
  id: string
  icon: LucideIcon
  iconColor: string
  title: string
  description: string
  actionLabel: string
  actionVariant: "default" | "outline"
  navigateTo: string
  done: boolean
}

export function TaskList() {
  const navigate = useNavigate()
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const { getCateringPlan, getAVPlan } = useWorkOrders()

  if (!workOrder) return null

  const cateringPlan = getCateringPlan(workOrderId)
  const avPlan = getAVPlan(workOrderId)
  const allSpaces = workOrder.eventDays.flatMap((d) => d.spaces)
  const hasEventDays = workOrder.eventDays.length > 0

  const tasks: Task[] = [
    {
      id: "spaces",
      icon: MapPin,
      iconColor: "text-blue-600 bg-blue-50",
      title: "Valitse tilat",
      description: allSpaces.length > 0
        ? `${allSpaces.length} tilaa valittu — tarkista optiot`
        : "Valitse tapahtumatilat ja aseta optiot",
      actionLabel: allSpaces.length > 0 ? "Tarkista" : "Valitse",
      actionVariant: allSpaces.length > 0 ? "outline" : "default",
      navigateTo: `/tyomarain/${workOrderId}/tilat`,
      done: allSpaces.length > 0,
    },
    {
      id: "participants",
      icon: Users,
      iconColor: "text-blue-600 bg-blue-50",
      title: "Vahvista henkilömäärä",
      description: `Arvio nyt ${workOrder.participantEstimate} hlö`,
      actionLabel: "Täydennä",
      actionVariant: "default",
      navigateTo: `/tyomarain/${workOrderId}/yleiskuva`,
      done: false,
    },
    {
      id: "catering",
      icon: UtensilsCrossed,
      iconColor: "text-purple-600 bg-purple-50",
      title: "Valitse catering",
      description: cateringPlan.moments.length > 0
        ? `${cateringPlan.moments.length} tarjoiluhetkeä suunniteltu`
        : "Aamukahvi, lounas ja iltapäiväkahvi",
      actionLabel: cateringPlan.moments.length > 0 ? "Muokkaa" : "Valitse menu",
      actionVariant: cateringPlan.moments.length > 0 ? "outline" : "outline",
      navigateTo: `/tyomarain/${workOrderId}/catering`,
      done: cateringPlan.status === "valmis",
    },
    {
      id: "dietary",
      icon: Info,
      iconColor: "text-gray-500 bg-gray-100",
      title: "Ilmoita erityisruokavaliot",
      description: cateringPlan.dietaryNeeds
        ? cateringPlan.dietaryNeeds
        : "Ilmoita mahdolliset erityisruokavaliot ja allergiat",
      actionLabel: "Täydennä",
      actionVariant: "outline",
      navigateTo: `/tyomarain/${workOrderId}/catering`,
      done: !!cateringPlan.dietaryNeeds,
    },
    {
      id: "billing",
      icon: CreditCard,
      iconColor: "text-gray-500 bg-gray-100",
      title: "Täydennä laskutustiedot",
      description: "Yrityksen laskutusosoite ja viitetiedot",
      actionLabel: "Avaa",
      actionVariant: "outline",
      navigateTo: `/tyomarain/${workOrderId}/yleiskuva`,
      done: false,
    },
    {
      id: "av",
      icon: Monitor,
      iconColor: "text-gray-500 bg-gray-100",
      title: "AV / tekniikan lisätiedot",
      description: avPlan.microphones || avPlan.audio
        ? "AV-tiedot täytetty — tarkista"
        : "Mikrofonit, näyttö, striimaus",
      actionLabel: !!(avPlan.microphones || avPlan.audio) ? "Tarkista" : "Vastaa",
      actionVariant: "outline",
      navigateTo: `/tyomarain/${workOrderId}/av`,
      done: avPlan.status === "valmis",
    },
  ]

  if (!hasEventDays) {
    tasks.unshift({
      id: "eventday",
      icon: Calendar,
      iconColor: "text-red-600 bg-red-50",
      title: "Lisää tapahtumapäivä",
      description: "Tapahtumalle ei ole vielä päivämäärää",
      actionLabel: "Lisää",
      actionVariant: "default",
      navigateTo: `/tyomarain/${workOrderId}/yleiskuva`,
      done: false,
    })
  }

  const pendingTasks = tasks.filter((t) => !t.done)
  const doneTasks = tasks.filter((t) => t.done)

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
        <ClipboardList className="h-5 w-5 text-gray-700" />
        <h2 className="text-[15px] font-semibold text-gray-900">Sinulta tarvitaan</h2>
        {pendingTasks.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-[11px] font-bold text-white">
            {pendingTasks.length}
          </span>
        )}
      </div>

      {pendingTasks.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p className="text-[13px] text-gray-500">Kaikki tehtävät on tehty!</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {pendingTasks.map((task) => {
            const Icon = task.icon
            return (
              <div key={task.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${task.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-gray-900">{task.title}</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">{task.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-full px-5"
                  onClick={() => navigate(task.navigateTo)}
                >
                  {task.actionLabel}
                </Button>
                <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
              </div>
            )
          })}
        </div>
      )}

      {doneTasks.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-3">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            Tehty · {doneTasks.length}
          </p>
          {doneTasks.map((task) => {
            const Icon = task.icon
            return (
              <div key={task.id} className="flex items-center gap-3 py-2 opacity-60">
                <Icon className="h-4 w-4 text-emerald-500" />
                <span className="text-[12px] text-gray-500 line-through">{task.title}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
