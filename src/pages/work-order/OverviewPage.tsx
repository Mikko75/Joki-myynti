import { Link } from "react-router-dom"
import { WorkOrderHeader } from "@/components/layout/WorkOrderHeader"
import { WorkOrderSectionCard } from "@/components/common/WorkOrderSectionCard"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { useTeam } from "@/context/TeamContext"
import { InfoBanner } from "@/components/common/InfoBanner"
import { SectionChat } from "@/components/common/SectionChat"
import { useState, useRef, useEffect } from "react"
import { Plus, Info, CheckCircle2, Music, ShieldCheck, Signpost, Armchair, Truck, Users, CarFront, Hotel, FileCheck, Handshake, Star, MoreHorizontal, User, Calendar, Clock, Utensils, Volume2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { SectionStatus, ProposalSection, CustomSection } from "@/data/types"

const CUSTOM_SECTION_TYPES: { value: string; label: string; description: string; icon: LucideIcon; color: string }[] = [
  { value: "esiintyjat", label: "Esiintyjät ja ohjelma", description: "Artistit, puhujat ja ohjelma", icon: Music, color: "bg-purple-100 text-purple-600" },
  { value: "turvallisuus", label: "Turvallisuus", description: "Järjestyksenvalvonta ja pelastus", icon: ShieldCheck, color: "bg-red-100 text-red-600" },
  { value: "opasteet", label: "Opasteet ja brändäys", description: "Kyltit, bannerit ja visuaalinen ilme", icon: Signpost, color: "bg-blue-100 text-blue-600" },
  { value: "kalustus", label: "Kalustus ja somistus", description: "Huonekalut, koristelu ja rekvisiitta", icon: Armchair, color: "bg-amber-100 text-amber-600" },
  { value: "logistiikka", label: "Logistiikka", description: "Kuljetukset ja tavarantoimitukset", icon: Truck, color: "bg-emerald-100 text-emerald-600" },
  { value: "henkilosto", label: "Henkilöstö", description: "Lisähenkilöstö ja vapaaehtoiset", icon: Users, color: "bg-sky-100 text-sky-600" },
  { value: "saapuminen", label: "Saapuminen ja pysäköinti", description: "Ohjaus, liput ja pysäköinti", icon: CarFront, color: "bg-gray-100 text-gray-600" },
  { value: "majoitus", label: "Majoitus ja kuljetukset", description: "Hotellit ja ryhmäkuljetukset", icon: Hotel, color: "bg-indigo-100 text-indigo-600" },
  { value: "luvat", label: "Luvat ja viranomaisasiat", description: "Ilmoitukset ja lupahakemukset", icon: FileCheck, color: "bg-orange-100 text-orange-600" },
  { value: "sponsorit", label: "Sponsorit ja kumppanit", description: "Yhteistyökumppanit ja näkyvyys", icon: Handshake, color: "bg-teal-100 text-teal-600" },
  { value: "erityisjarjestelyt", label: "Erityisjärjestelyt", description: "Esteettömyys ja erikoistoiveet", icon: Star, color: "bg-pink-100 text-pink-600" },
  { value: "muu", label: "Muu", description: "Vapaamuotoinen lisäosio", icon: MoreHorizontal, color: "bg-gray-100 text-gray-500" },
]

const SECTION_STATUS_META: Record<SectionStatus, { label: string; progress: number; dot: string; badge: string }> = {
  ei_aloitettu: { label: "Ei aloitettu", progress: 0, dot: "bg-gray-300", badge: "bg-gray-100 text-gray-600" },
  kaynnissa: { label: "Kesken", progress: 50, dot: "bg-amber-400", badge: "bg-amber-100 text-amber-700" },
  valmis: { label: "Valmis", progress: 100, dot: "bg-emerald-400", badge: "bg-emerald-100 text-emerald-700" },
}

const PROPOSAL_STATUS_META: Record<string, { label: string; badge: string }> = {
  draft: { label: "Luonnos", badge: "bg-gray-100 text-gray-600" },
  sent: { label: "Asiakkaalla", badge: "bg-amber-100 text-amber-700" },
  approved: { label: "Hyväksytty", badge: "bg-emerald-100 text-emerald-700" },
  changes_requested: { label: "Muutoksia pyydetty", badge: "bg-red-100 text-red-700" },
  expired: { label: "Vanhentunut", badge: "bg-gray-100 text-gray-500" },
}

export default function OverviewPage() {
  const { workOrder, workOrderId } = useCurrentWorkOrder()
  const { getCateringPlan, getAllCateringPlans, getAVPlan, updateWorkOrder } = useWorkOrders()
  const { getMembersForSection } = useTeam()

  const [emptyWarning, setEmptyWarning] = useState<string | null>(null)
  const [addNewOpen, setAddNewOpen] = useState(false)
  const addNewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!addNewOpen) return
    function handleClick(e: MouseEvent) {
      if (addNewRef.current && !addNewRef.current.contains(e.target as Node)) {
        setAddNewOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [addNewOpen])

  if (!workOrder) return <p className="text-gray-500">Työmääräintä ei löytynyt.</p>

  const wo = workOrder
  const base = `/tyomarain/${workOrderId}`
  const proposals = wo.proposalSections ?? []
  const proposalKeys = new Set(proposals.map((p) => p.sectionKey))

  const allSpaces = wo.eventDays.flatMap((d) => d.spaces)
  const allScheduleItems = wo.eventDays.flatMap((d) => d.scheduleItems)
  const cateringPlan = getCateringPlan(workOrderId)
  const allCateringPlans = getAllCateringPlans(workOrderId)
  const hasCateringData = cateringPlan.moments.length > 0 || Object.values(allCateringPlans).some((p) => p.status === "valmis" || p.status === "vastattu" || p.moments.length > 0)
  const avPlan = getAVPlan(workOrderId)
  const eventDate = wo.eventDays[0]?.date
  const customSections = wo.customSections ?? []

  const scheduleStatus: SectionStatus = allScheduleItems.length === 0 ? "ei_aloitettu" : allScheduleItems.every((i) => i.status === "valmis") ? "valmis" : "kaynnissa"
  const tila = SECTION_STATUS_META[wo.sectionStatuses.tila]
  const cateringPartnerSelected = Object.values(allCateringPlans).some((p) => p.status === "valmis")
  const cateringPartnerResponded = Object.values(allCateringPlans).some((p) => p.status === "vastattu" || p.status === "valmis")
  const cateringMeta = cateringPartnerSelected
    ? { label: "Valmis", badge: "bg-emerald-100 text-emerald-700", progress: 100 }
    : cateringPartnerResponded
    ? { label: "Tarkistettavana", badge: "bg-blue-100 text-blue-700", progress: 70 }
    : SECTION_STATUS_META[wo.sectionStatuses.catering]
  const av = SECTION_STATUS_META[wo.sectionStatuses.av]
  const aikataulu = SECTION_STATUS_META[scheduleStatus]
  const avNeeds = wo.avProduction?.needs ?? []

  const sectionHasData: Record<string, boolean> = {
    tilat: allSpaces.length > 0,
    aikataulu: allScheduleItems.length > 0,
    catering: hasCateringData,
    lisapalvelut: wo.avProduction?.status === "valmis" || avNeeds.length > 0 || Boolean(avPlan.microphones || avPlan.audio || avPlan.screens || (avPlan.price ?? 0) > 0),
    ...Object.fromEntries(customSections.map((cs) => [`custom-${cs.id}`, cs.description.length > 0])),
  }

  function addToProposal(key: string) {
    if (!sectionHasData[key]) {
      setEmptyWarning(key)
      setTimeout(() => setEmptyWarning(null), 3000)
      return
    }
    const existing = proposals.find((p) => p.sectionKey === key)
    if (existing) {
      // Resetoi draft-tilaan uudelleenlähetystä varten
      updateWorkOrder(workOrderId, { proposalSections: proposals.map((p) => p.sectionKey === key ? { ...p, status: "draft" as const, sentAt: null } : p) })
    } else {
      const entry: ProposalSection = { sectionKey: key, sentAt: null, status: "draft" }
      updateWorkOrder(workOrderId, { proposalSections: [...proposals, entry] })
    }
  }

  function addCustomSection(type: string, label: string) {
    const newSection: CustomSection = {
      id: crypto.randomUUID(),
      type,
      title: label,
      description: "",
      showToClient: true,
    }
    updateWorkOrder(workOrderId, { customSections: [...customSections, newSection] })
    setAddNewOpen(false)
  }

  const sections = [
    { key: "tilat", title: "Tilat", subtitle: `${allSpaces.length} tilaa valittu`, description: allSpaces.length > 0 ? allSpaces.map((s) => s.spaceName).join(", ") : "Ei aloitettu.", badgeLabel: tila.label, badgeClass: tila.badge, progress: tila.progress },
    { key: "aikataulu", title: "Aikataulu", subtitle: `${allScheduleItems.length} ohjelmakohtaa`, description: allScheduleItems.length > 0 ? allScheduleItems.map((i) => i.title).slice(0, 3).join(", ") : "Ei aloitettu.", badgeLabel: aikataulu.label, badgeClass: aikataulu.badge, progress: aikataulu.progress },
    { key: "catering", title: "Catering", subtitle: `${cateringPlan.moments.length} tarjoiluhetkeä`, description: cateringPlan.servingArea ? `Toimittaja: ${cateringPlan.servingArea}` : "Ei aloitettu.", badgeLabel: cateringMeta.label, badgeClass: cateringMeta.badge, progress: cateringMeta.progress },
    { key: "lisapalvelut", title: "Lisäpalvelut & AV", subtitle: avNeeds.length > 0 ? `${avNeeds.length} AV-tarvetta tunnistettu` : "AV-tekniikka ja lisäpalvelut", description: avNeeds.length > 0 ? avNeeds.map((n) => n.label).join(", ") : "Ei aloitettu.", badgeLabel: av.label, badgeClass: av.badge, progress: av.progress },
  ]

  return (
    <div>
      <WorkOrderHeader workOrder={wo} title="Yleiskuva" />

      {/* Info / status notice */}
      <div className="mb-5">
        {(() => {
          const approvedSections = proposals.filter((p) => p.status === "approved")
          if (approvedSections.length > 0) {
            const names = approvedSections.map((p) => {
              const sec = sections.find((s) => s.key === p.sectionKey)
              return sec?.title ?? p.sectionKey
            }).join(", ")
            return (
              <div className="flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span className="text-sm text-emerald-800">
                  <span className="font-semibold">Asiakas on hyväksynyt ehdotuksen:</span> {names}
                </span>
              </div>
            )
          }
          return (
            <InfoBanner>
              <span className="font-semibold">Näin ehdotus rakentuu:</span> Täytä osiot vasemmalla → lisää ne ehdotukseen oikeasta sivupalkista (+) → lähetä ehdotus asiakkaalle. Varsinainen sitova tarjous lähetetään Yhteenveto-sivulta kun asiakas on hyväksynyt osiot.
            </InfoBanner>
          )
        })()}
      </div>

      <div className="space-y-5">
        {/* Perustiedot — ikonillinen grid */}
        {(() => {
          const day = wo.eventDays[0]
          const infoItems = [
            { icon: User, label: "Yhteyshenkilö", value: wo.customerName || "–" },
            { icon: Users, label: "Osallistujat", value: `${wo.participantEstimate} hlö` },
            { icon: Calendar, label: "Päivämäärä", value: eventDate || "–" },
            { icon: Clock, label: "Kellonaika", value: day ? `${day.bookingStart} – ${day.bookingEnd}` : "–" },
            { icon: Star, label: "Tapahtumatyyppi", value: wo.eventType || "–" },
            { icon: Utensils, label: "Tarvitaanko catering", value: wo.needsCatering === "yes" ? "Kyllä" : wo.needsCatering === "no" ? "Ei" : "–" },
            { icon: Volume2, label: "Tarvitaanko AV", value: wo.needsAV === "yes" ? "Kyllä" : wo.needsAV === "no" ? "Ei" : "–" },
          ]
          return (
            <Link
              to={`${base}/perustiedot`}
              className="block rounded-xl border border-gray-200 bg-white p-5 no-underline hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">{wo.customerCompany}</h3>
                {wo.eventDescription && (
                  <p className="mt-1 text-[13px] text-gray-600 leading-relaxed">{wo.eventDescription}</p>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {infoItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-500">{item.label}</p>
                        <p className="text-[13px] font-semibold text-gray-900 truncate">{item.value}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Link>
          )
        })()}

        <h2 className="text-lg font-bold text-gray-900">Osiot</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((s) => {
            const proposal = proposals.find((p) => p.sectionKey === s.key)
            const proposalMeta = proposal ? PROPOSAL_STATUS_META[proposal.status] : null

            const inProposal = proposalKeys.has(s.key)
            const hasDraft = proposal?.status === "draft"

            return (
              <div key={s.key} className="relative">
                <WorkOrderSectionCard
                  to={`${base}/${s.key}`}
                  title={s.title}
                  subtitle={s.subtitle}
                  badgeLabel={proposalMeta ? proposalMeta.label : s.badgeLabel}
                  badgeClassName={proposalMeta ? proposalMeta.badge : s.badgeClass}
                  badgeIcon={proposal?.status === "approved" ? <CheckCircle2 className="h-3 w-3" /> : undefined}
                  progress={s.progress}
                  description={s.description}
                  members={getMembersForSection(s.key)}
                  dateLabel={eventDate}
                />
                {!hasDraft && (
                  <div className="absolute top-4 right-4 z-10">
                    {emptyWarning === s.key && (
                      <div className="absolute bottom-full right-0 mb-1.5 w-56 flex items-start gap-3 rounded-md border-l-4 border-amber-500 bg-amber-50 p-4 shadow-sm">
                        <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                        <span className="text-sm text-amber-800">Lisää osioon tiedot ennen kuin lähetät sen asiakkaalle.</span>
                      </div>
                    )}
                    <button
                      onClick={() => addToProposal(s.key)}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-primary-600 hover:border-primary-300 transition-colors"
                      title="Lisää ehdotukseen"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {/* Custom sections */}
          {customSections.map((cs) => {
            const csKey = `custom-${cs.id}`
            const proposal = proposals.find((p) => p.sectionKey === csKey)
            const proposalMeta = proposal ? PROPOSAL_STATUS_META[proposal.status] : null
            const inProposal = proposalKeys.has(csKey)
            const hasDesc = cs.description.length > 0
            const badgeMeta = hasDesc ? SECTION_STATUS_META["valmis"] : SECTION_STATUS_META["ei_aloitettu"]

            return (
              <div key={cs.id} className="relative">
                <WorkOrderSectionCard
                  to={`${base}/osio/${cs.id}`}
                  title={cs.title}
                  subtitle={cs.price ? `${cs.price.toLocaleString("fi-FI")} €` : undefined}
                  badgeLabel={proposalMeta ? proposalMeta.label : badgeMeta.label}
                  badgeClassName={proposalMeta ? proposalMeta.badge : badgeMeta.badge}
                  badgeIcon={proposal?.status === "approved" ? <CheckCircle2 className="h-3 w-3" /> : undefined}
                  progress={hasDesc ? 100 : 0}
                  hideProgress
                  description={cs.description || "Ei aloitettu."}
                  dateLabel={eventDate}
                />
                {!inProposal && (
                  <div className="absolute top-4 right-4 z-10">
                    {emptyWarning === csKey && (
                      <div className="absolute bottom-full right-0 mb-1.5 w-56 flex items-start gap-3 rounded-md border-l-4 border-amber-500 bg-amber-50 p-4 shadow-sm">
                        <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                        <span className="text-sm text-amber-800">Lisää osioon tiedot ennen kuin lähetät sen asiakkaalle.</span>
                      </div>
                    )}
                    <button
                      onClick={() => addToProposal(csKey)}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-primary-600 hover:border-primary-300 transition-colors"
                      title="Lisää ehdotukseen"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Lisää uusi osio */}
        <div className="relative max-w-[calc(50%-0.5rem)]" ref={addNewRef}>
          <button
            type="button"
            onClick={() => setAddNewOpen((v) => !v)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white py-4 text-[13px] font-medium text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Lisää uusi
          </button>
          {addNewOpen && (
            <div className="absolute left-0 bottom-full z-50 mb-2 w-80 rounded-xl border border-gray-200 bg-white py-3 shadow-xl">
              <p className="px-4 pb-2 text-[15px] font-semibold text-gray-900">Lisää osio</p>
              <div className="max-h-[400px] overflow-y-auto">
                {CUSTOM_SECTION_TYPES.map((t) => {
                  const Icon = t.icon
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => addCustomSection(t.value, t.label)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${t.color}`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-[13px] font-medium text-gray-900">{t.label}</p>
                        <p className="text-[11px] text-gray-500">{t.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-2">Keskustelu asiakkaan kanssa</h2>
        <SectionChat sectionKey="asiakas" />
      </div>
    </div>
  )
}
