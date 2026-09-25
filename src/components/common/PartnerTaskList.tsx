import { useNavigate } from "react-router-dom"
import { UtensilsCrossed, ClipboardList, ChevronRight, ShoppingBag, MessageSquare, FileText, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { useMenus } from "@/context/MenuContext"
import { useChat } from "@/context/ChatContext"
import type { LucideIcon } from "lucide-react"

interface Task {
  id: string
  icon: LucideIcon
  iconColor: string
  title: string
  description: string
  actionLabel: string
  navigateTo: string
  done: boolean
}

export function PartnerTaskList() {
  const navigate = useNavigate()
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const { getCateringPlan } = useWorkOrders()
  const { menus } = useMenus()
  const { getMessages } = useChat()

  if (!workOrder) return null

  const plan = getCateringPlan(workOrderId)
  const generalMessages = getMessages("general")
  const cateringMessages = getMessages("catering")
  const hasMenus = menus.length > 0
  const hasProducts = menus.some((m) => m.products.length > 0)

  const tasks: Task[] = [
    {
      id: "read-brief",
      icon: FileText,
      iconColor: "text-blue-600 bg-blue-50",
      title: "Lue myyjän brief",
      description: "Tutustu tapahtuman tietoihin ja myyjän toiveisiin",
      actionLabel: "Avaa",
      navigateTo: `/tyomarain/${workOrderId}/catering`,
      done: cateringMessages.length > 0 || plan.moments.length > 0,
    },
    {
      id: "reply-seller",
      icon: MessageSquare,
      iconColor: "text-blue-600 bg-blue-50",
      title: "Vastaa myyjälle",
      description: generalMessages.length > 0 ? `${generalMessages.length} viestiä keskustelussa` : "Aloita keskustelu myyjän kanssa",
      actionLabel: generalMessages.length > 0 ? "Vastaa" : "Aloita",
      navigateTo: `/tyomarain/${workOrderId}/yleiskuva`,
      done: cateringMessages.length > 0,
    },
    {
      id: "create-menu",
      icon: ShoppingBag,
      iconColor: "text-purple-600 bg-purple-50",
      title: "Luo menu tapahtumalle",
      description: hasMenus ? `${menus.length} menua luotu` : "Rakenna menu tapahtuman tarjoiluille",
      actionLabel: hasMenus ? "Muokkaa" : "Luo menu",
      navigateTo: `/tyomarain/${workOrderId}/tuotteet`,
      done: hasMenus && hasProducts,
    },
    {
      id: "add-products",
      icon: UtensilsCrossed,
      iconColor: "text-purple-600 bg-purple-50",
      title: "Lisää tuotteet menuihin",
      description: hasProducts ? "Tuotteet lisätty — tarkista" : "Valitse tuotteet ja hinnoittele ne",
      actionLabel: hasProducts ? "Tarkista" : "Lisää",
      navigateTo: `/tyomarain/${workOrderId}/tuotteet`,
      done: hasProducts,
    },
    {
      id: "plan-moments",
      icon: Calendar,
      iconColor: "text-amber-600 bg-amber-50",
      title: "Suunnittele tarjoiluhetket",
      description: plan.moments.length > 0 ? `${plan.moments.length} tarjoiluhetkeä` : "Aamukahvi, lounas, iltapäiväkahvi",
      actionLabel: plan.moments.length > 0 ? "Muokkaa" : "Suunnittele",
      navigateTo: `/tyomarain/${workOrderId}/catering`,
      done: plan.moments.length > 0,
    },
    {
      id: "staff",
      icon: Users,
      iconColor: "text-gray-500 bg-gray-100",
      title: "Arvioi henkilökunnan tarve",
      description: plan.staffNeeded ? plan.staffNeeded : "Tarjoilijat, kokit, kattaushenkilökunta",
      actionLabel: "Täydennä",
      navigateTo: `/tyomarain/${workOrderId}/catering`,
      done: !!plan.staffNeeded,
    },
    {
      id: "send-proposal",
      icon: FileText,
      iconColor: "text-emerald-600 bg-emerald-50",
      title: "Lähetä ehdotus myyjälle",
      description: plan.status === "vastattu" ? "Ehdotus lähetetty" : "Kun kaikki on valmista, lähetä ehdotus",
      actionLabel: plan.status === "vastattu" ? "Lähetetty" : "Lähetä",
      navigateTo: `/tyomarain/${workOrderId}/catering`,
      done: plan.status === "vastattu" || plan.status === "valmis",
    },
  ]

  const pendingTasks = tasks.filter((t) => !t.done)
  const doneTasks = tasks.filter((t) => t.done)

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
        <ClipboardList className="h-5 w-5 text-gray-700" />
        <h2 className="text-[15px] font-semibold text-gray-900">Tehtävät</h2>
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
