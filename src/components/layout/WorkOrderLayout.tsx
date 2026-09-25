import { Outlet, useParams, useLocation } from "react-router-dom"
import { TopBar } from "./TopBar"
import { WorkOrderSidebar } from "./WorkOrderSidebar"
import { RightPanel } from "./RightPanel"
import { ParticipantBar } from "./ParticipantBar"
import { useTeam } from "@/context/TeamContext"
import { useWorkOrders } from "@/context/WorkOrderContext"

const pathToNav: Record<string, string> = {
  yleiskuva: "yleiskuva",
  tilat: "tilat",
  aikataulu: "aikataulu",
  lisapalvelut: "lisapalvelut",
  catering: "catering",
  av: "av",
  keskustelut: "keskustelut",
  tarjous: "tarjous",
}

export function WorkOrderLayout() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const { members } = useTeam()
  const { workOrders } = useWorkOrders()
  const workOrder = workOrders.find((wo) => wo.id === id)

  if (!workOrder) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Työmääräintä ei löytynyt.</p>
      </div>
    )
  }

  const lastSegment = location.pathname.split("/").pop() ?? "yleiskuva"
  const activeItem = pathToNav[lastSegment] ?? "yleiskuva"

  const allParticipants = [
    ...workOrder.participants,
    ...members.map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      initials: m.initials,
      color: m.color,
    })),
  ]

  const uniqueParticipants = allParticipants.filter(
    (p, i, arr) => arr.findIndex((x) => x.name === p.name) === i
  )

  return (
    <div className="flex h-full overflow-hidden">
      <WorkOrderSidebar activeItem={activeItem} />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar
          breadcrumbs={[
            "rautalankamalli",
            `${workOrder.number} • ${workOrder.customerCompany}`,
          ]}
        />
        <ParticipantBar participants={uniqueParticipants} />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-auto p-6 lg:p-8 bg-white">
            <Outlet />
          </main>
          <RightPanel />
        </div>
      </div>
    </div>
  )
}
