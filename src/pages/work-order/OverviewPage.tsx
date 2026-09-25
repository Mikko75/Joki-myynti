import { WorkOrderHeader } from "@/components/layout/WorkOrderHeader"
import { WorkOrderSectionCard } from "@/components/common/WorkOrderSectionCard"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { useTeam } from "@/context/TeamContext"
import type { SectionStatus } from "@/data/types"
import { Plus } from "lucide-react"
import { Link } from "react-router-dom"

const SECTION_STATUS_META: Record<SectionStatus, { label: string; progress: number; dot: string; badge: string }> = {
  ei_aloitettu: { label: "Ei aloitettu", progress: 0, dot: "bg-gray-300", badge: "bg-gray-100 text-gray-600" },
  kaynnissa: { label: "Kesken", progress: 50, dot: "bg-amber-400", badge: "bg-amber-100 text-amber-700" },
  valmis: { label: "Valmis", progress: 100, dot: "bg-emerald-400", badge: "bg-emerald-100 text-emerald-700" },
}

export default function OverviewPage() {
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const { getCateringPlan, getAVPlan } = useWorkOrders()
  const { getMembersForSection } = useTeam()

  if (!workOrder) return <p className="text-gray-500">Työmääräintä ei löytynyt.</p>

  const wo = workOrder
  const base = `/tyomarain/${workOrderId}`

  const allSpaces = wo.eventDays.flatMap((d) => d.spaces)
  const allScheduleItems = wo.eventDays.flatMap((d) => d.scheduleItems)
  const cateringPlan = getCateringPlan(workOrderId)
  const avPlan = getAVPlan(workOrderId)
  const eventDate = wo.eventDays[0]?.date

  const scheduleStatus: SectionStatus =
    allScheduleItems.length === 0
      ? "ei_aloitettu"
      : allScheduleItems.every((i) => i.status === "valmis")
        ? "valmis"
        : "kaynnissa"

  const tila = SECTION_STATUS_META[wo.sectionStatuses.tila]
  const cateringMeta = SECTION_STATUS_META[wo.sectionStatuses.catering]
  const av = SECTION_STATUS_META[wo.sectionStatuses.av]
  const aikataulu = SECTION_STATUS_META[scheduleStatus]

  const hasBasicInfo = Boolean(wo.customerName && wo.eventType && wo.eventDays.length > 0)
  const perustiedotStatus = hasBasicInfo
    ? SECTION_STATUS_META["valmis"]
    : wo.customerCompany
      ? SECTION_STATUS_META["kaynnissa"]
      : SECTION_STATUS_META["ei_aloitettu"]

  return (
    <div>
      <WorkOrderHeader workOrder={wo} title="Yleiskuva" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <WorkOrderSectionCard
          to={`${base}/perustiedot`}
          title="Perustiedot"
          subtitle={`${wo.customerCompany} · ${wo.eventType}`}
          badgeLabel={perustiedotStatus.label}
          badgeClassName={perustiedotStatus.badge}
          progress={perustiedotStatus.progress}
          description={`Yhteyshenkilö: ${wo.customerName || "–"} · Osallistujat: ${wo.participantEstimate} hlö · Päivämäärä: ${eventDate || "–"}`}
          dateLabel={eventDate}
        />

        <WorkOrderSectionCard
          to={`${base}/tilat`}
          title="Tilat & optio"
          subtitle={`${allSpaces.length} tilaa valittu`}
          badgeLabel={tila.label}
          badgeClassName={tila.badge}
          progress={tila.progress}
          description={
            allSpaces.length > 0
              ? allSpaces.map((s) => s.spaceName).join(", ")
              : "Ei aloitettu."
          }
          members={getMembersForSection("tilat")}
          dateLabel={eventDate}
        />

        <WorkOrderSectionCard
          to={`${base}/aikataulu`}
          title="Aikataulu"
          subtitle={`${allScheduleItems.length} ohjelmakohtaa`}
          badgeLabel={aikataulu.label}
          badgeClassName={aikataulu.badge}
          progress={aikataulu.progress}
          description={
            allScheduleItems.length > 0
              ? allScheduleItems.map((i) => i.title).slice(0, 3).join(", ")
              : "Ei aloitettu."
          }
          members={getMembersForSection("aikataulu")}
          dateLabel={eventDate}
        />

        <WorkOrderSectionCard
          to={`${base}/catering`}
          title="Catering"
          subtitle={`${cateringPlan.moments.length} tarjoiluhetkeä`}
          badgeLabel={cateringMeta.label}
          badgeClassName={cateringMeta.badge}
          progress={cateringMeta.progress}
          description={
            cateringPlan.servingArea
              ? `Toimittaja: ${cateringPlan.servingArea}`
              : "Ei aloitettu."
          }
          members={getMembersForSection("catering")}
          dateLabel={eventDate}
        />

        <WorkOrderSectionCard
          to={`${base}/lisapalvelut`}
          title="Lisäpalvelut"
          subtitle="5 palvelua saatavilla"
          badgeLabel="Ei aloitettu"
          badgeClassName="bg-gray-100 text-gray-600"
          progress={0}
          description="Ei aloitettu."
          members={getMembersForSection("lisapalvelut")}
          dateLabel={eventDate}
        />

        <WorkOrderSectionCard
          to={`${base}/av`}
          title="AV / tekniikka"
          subtitle={avPlan.microphones || avPlan.audio || avPlan.screens ? "AV-tarpeet määritelty" : "Ei AV-valintoja"}
          badgeLabel={av.label}
          badgeClassName={av.badge}
          progress={av.progress}
          description={
            [avPlan.microphones, avPlan.audio, avPlan.screens].filter(Boolean).join(" · ") ||
            "Ei aloitettu."
          }
          members={getMembersForSection("av")}
          dateLabel={eventDate}
        />

        <Link
          to={`${base}/yleiskuva`}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-5 text-gray-400 no-underline hover:border-gray-300 hover:text-gray-500 transition-colors min-h-50"
        >
          <Plus className="h-6 w-6" />
          <span className="text-sm font-medium">Lisää uusi</span>
        </Link>
      </div>
    </div>
  )
}
