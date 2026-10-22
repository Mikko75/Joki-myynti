import { Link } from "react-router-dom"
import { spaces as spaceCatalog } from "@/data/mock"
import { WorkOrderHeader } from "@/components/layout/WorkOrderHeader"
import { WorkOrderSectionCard } from "@/components/common/WorkOrderSectionCard"
import { useCurrentWorkOrder } from "@/hooks/useCurrentWorkOrder"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { useTeam } from "@/context/TeamContext"
import { InfoBanner } from "@/components/common/InfoBanner"
import { SectionChat } from "@/components/common/SectionChat"
import { useChat } from "@/context/ChatContext"
import { PostItBoard } from "@/components/common/PostItBoard"
import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Info, CheckCircle2, Music, ShieldCheck, Signpost, Armchair, Truck, Users, CarFront, Hotel, FileCheck, Handshake, Star, MoreHorizontal, User, Calendar, Clock, Utensils, Volume2, Link2, RotateCcw, MapPin, Send, X } from "lucide-react"
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
  const { getMessages } = useChat()

  const [emptyWarning, setEmptyWarning] = useState<string | null>(null)
  const [addNewOpen, setAddNewOpen] = useState(false)
  const addNewRef = useRef<HTMLDivElement>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeMessage, setComposeMessage] = useState("")

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
    perustiedot: true,
    tilat: allSpaces.length > 0,
    aikataulu: allScheduleItems.length > 0,
    catering: hasCateringData,
    lisapalvelut: wo.avProduction?.status === "valmis" || avNeeds.length > 0 || Boolean(avPlan.microphones || avPlan.audio || avPlan.screens || (avPlan.price ?? 0) > 0),
    ...Object.fromEntries(customSections.map((cs) => [`custom-${cs.id}`, cs.description.length > 0])),
  }

  const partnerPlansAll = getAllCateringPlans(workOrderId)
  const respondedPartners = Object.entries(partnerPlansAll).filter(([pid, p]) => pid !== "_default" && (p.status === "vastattu" || p.status === "valmis"))

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

  function proposalProgress(proposal?: ProposalSection): { pct: number; color: string } {
    if (!proposal) return { pct: 0, color: "bg-gray-300" }
    switch (proposal.status) {
      case "draft":             return { pct: 20, color: "bg-gray-400" }
      case "sent":              return { pct: 60, color: "bg-amber-400" }
      case "changes_requested": return { pct: 75, color: "bg-amber-400" }
      case "approved":          return { pct: 100, color: "bg-emerald-500" }
      case "expired":           return { pct: 10, color: "bg-gray-300" }
      default:                  return { pct: 0, color: "bg-gray-300" }
    }
  }

  const tilaProposal = proposals.find(p => p.sectionKey === "tilat")
  const tilaP = tilaProposal
    ? proposalProgress(tilaProposal)
    : allSpaces.length > 0
      ? { pct: 30, color: "bg-amber-400" }
      : { pct: 0, color: "bg-gray-300" }

  const aikatauluProposal = proposals.find(p => p.sectionKey === "aikataulu")
  const aikatauluP = aikatauluProposal
    ? proposalProgress(aikatauluProposal)
    : allScheduleItems.length > 0
      ? { pct: 30, color: "bg-amber-400" }
      : { pct: 0, color: "bg-gray-300" }

  const cateringProposal = proposals.find(p => p.sectionKey === "catering")
  const cateringP = proposalProgress(cateringProposal)

  const lisapalvelutProposal = proposals.find(p => p.sectionKey === "lisapalvelut")
  const lisapalvelutP = proposalProgress(lisapalvelutProposal)

  const tilaThumbails = allSpaces
    .slice(0, 3)
    .map(s => ({ url: spaceCatalog.find(sc => sc.id === s.spaceId)?.image ?? "", label: s.spaceName }))
    .filter(t => t.url)

  const sections = [
    { key: "tilat", title: "Tilat", subtitle: `${allSpaces.length} tilaa valittu`, description: allSpaces.length > 0 ? allSpaces.map((s) => s.spaceName).join(", ") : "Ei aloitettu.", badgeLabel: tila.label, badgeClass: tila.badge, progress: tilaP.pct, progressColor: tilaP.color },
    { key: "aikataulu", title: "Aikataulu", subtitle: `${allScheduleItems.length} ohjelmakohtaa`, description: allScheduleItems.length > 0 ? allScheduleItems.map((i) => i.title).slice(0, 3).join(", ") : "Ei aloitettu.", badgeLabel: aikataulu.label, badgeClass: aikataulu.badge, progress: aikatauluP.pct, progressColor: aikatauluP.color },
    { key: "catering", title: "Catering", subtitle: `${cateringPlan.moments.length} tarjoiluhetkeä`, description: cateringPlan.servingArea ? `Toimittaja: ${cateringPlan.servingArea}` : "Ei aloitettu.", badgeLabel: cateringMeta.label, badgeClass: cateringMeta.badge, progress: cateringP.pct, progressColor: cateringP.color },
    { key: "lisapalvelut", title: "Lisäpalvelut & AV", subtitle: avNeeds.length > 0 ? `${avNeeds.length} AV-tarvetta tunnistettu` : "AV-tekniikka ja lisäpalvelut", description: avNeeds.length > 0 ? avNeeds.map((n) => n.label).join(", ") : "Ei aloitettu.", badgeLabel: av.label, badgeClass: av.badge, progress: lisapalvelutP.pct, progressColor: lisapalvelutP.color },
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
            // Kaikki hyväksytty vain kun KAIKKI pääosiot on lähetetty JA hyväksytty
            const mainSectionKeys = ["tilat", "aikataulu", "catering", "lisapalvelut"]
            const allApproved = mainSectionKeys.every(key =>
              proposals.find(p => p.sectionKey === key)?.status === "approved"
            )
            if (allApproved) {
              return (
                <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 p-5">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-[15px] font-semibold text-emerald-900">Kaikki osiot hyväksytty!</p>
                      <p className="text-[13px] text-emerald-700 mt-0.5">Asiakas on hyväksynyt kaiken. Tee nyt lopullinen tarjous.</p>
                    </div>
                  </div>
                  <Link to={`${base}/tarjous`} className="flex items-center gap-2 rounded-lg bg-gray-900 text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-gray-800 transition-colors shrink-0">
                    Luo lopullinen tarjous →
                  </Link>
                </div>
              )
            }
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
          const perustiedotProposal = proposals.find(p => p.sectionKey === "perustiedot")
          const infoItems = [
            { icon: User, label: "Yhteyshenkilö", value: wo.customerName || "–" },
            { icon: Users, label: "Osallistujat", value: `${wo.participantEstimate} hlö` },
            { icon: Calendar, label: "Päivämäärä", value: eventDate || "–" },
            { icon: Clock, label: "Kellonaika", value: day ? `${day.bookingStart} – ${day.bookingEnd}` : "–" },
            { icon: Star, label: "Tapahtumatyyppi", value: wo.eventType || "–" },
            { icon: Utensils, label: "Tarvitaanko catering", value: wo.needsCatering === "yes" ? "Kyllä" : wo.needsCatering === "no" ? "Ei" : "–" },
            { icon: Volume2, label: "Tarvitaanko AV", value: wo.needsAV === "yes" ? "Kyllä" : wo.needsAV === "no" ? "Ei" : "–" },
          ]
          const openCompose = () => {
            const firstName = wo.customerName?.split(" ")[0] ?? wo.customerName ?? ""
            const isIncoming = wo.source === "varausjarjestelma"
            const draft = isIncoming
              ? `Hei ${firstName},\n\nKiitos yhteydenotosta! Olemme kirjanneet alla tapahtumanne tiedot. Tarkistathan että kaikki on oikein ja kerro meille jos jotain pitää muuttaa.\n\nTerveisin,\nJOKI-tiimi`
              : `Hei ${firstName},\n\n`
            setComposeMessage(draft)
            setComposeOpen(true)
          }

          return (
            <div className="bg-white overflow-hidden">
              <Link
                to={`${base}/perustiedot`}
                className="block p-5 no-underline hover:bg-gray-50 transition-all"
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

              {/* CTA-palkki kortin alla */}
              <div className="border-t border-gray-100 px-5 py-3 flex flex-col gap-2">
                {wo.clientUpdatedAt && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[12px] text-blue-600 font-medium">
                      <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      Asiakas päivitti tietoja — {new Date(wo.clientUpdatedAt).toLocaleDateString("fi-FI")}
                    </div>
                    <button
                      onClick={() => updateWorkOrder(workOrderId, { clientUpdatedAt: undefined })}
                      className="text-[11px] text-gray-400 hover:text-gray-600 underline shrink-0 ml-3"
                    >
                      Merkitse nähdyksi
                    </button>
                  </div>
                )}
              <div className="flex items-center justify-between">
                {perustiedotProposal?.status === "approved" ? (
                  <div className="flex items-center gap-2 text-[13px] text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Asiakas vahvistanut tiedot</span>
                  </div>
                ) : perustiedotProposal?.status === "sent" ? (
                  <>
                    <span className="text-[12px] font-medium" style={{ color: perustiedotProposal.clientReadAt ? "#2563eb" : "#d97706" }}>
                      {perustiedotProposal.clientReadAt ? `Avattu ${perustiedotProposal.clientReadAt}` : "Tapahtumavahvistus lähetetty — ei vielä avattu"}
                    </span>
                    <button
                      onClick={openCompose}
                      className="text-[12px] text-gray-400 hover:text-gray-600 underline shrink-0 ml-3"
                    >
                      Lähetä uudelleen
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-[12px] text-gray-400">
                      {wo.source === "varausjarjestelma"
                        ? "Ei vielä vastattu asiakkaalle"
                        : "Ei vielä lähetetty asiakkaalle"}
                    </span>
                    <button
                      onClick={openCompose}
                      className="flex items-center gap-1.5 bg-gray-900 text-white text-[12px] font-medium px-4 py-2 hover:bg-gray-800 transition-colors shrink-0"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {wo.source === "varausjarjestelma"
                        ? "Vastaa asiakkaalle"
                        : "Lähetä asiakkaalle"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          )
        })()}

        {/* Kutsu asiakas portaaliin — kompakti nappi */}
        {(() => {
          const portalUrl = `${window.location.origin}/tyomarain/${workOrderId}/ehdotus`
          const [showModal, setShowModal] = useState(false)
          return (
            <>
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2 text-[13px] text-gray-600">
                  <Link2 className="h-4 w-4 text-gray-400" />
                  <span>Kutsu asiakas portaaliin</span>
                  {wo.customerEmail && <span className="text-gray-400">— {wo.customerEmail}</span>}
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-[12px] font-medium text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                >
                  Jaa linkki
                </button>
              </div>

              {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
                  <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 space-y-4" onClick={e => e.stopPropagation()}>
                    <h3 className="text-[16px] font-semibold text-gray-900">Kutsu asiakas portaaliin</h3>
                    <div className="flex items-center gap-2">
                      <input type="email" defaultValue={wo.customerEmail ?? ""} placeholder="asiakkaan@sahkoposti.fi"
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-gray-400"
                        id="modal-invite-email" />
                      <button id="modal-send-btn"
                        onClick={() => {
                          const btn = document.getElementById("modal-send-btn")
                          if (btn) { btn.textContent = "Lähetetty ✓"; setTimeout(() => { btn.textContent = "Lähetä"; setShowModal(false) }, 1500) }
                        }}
                        className="rounded-lg bg-gray-900 text-white px-4 py-2 text-[13px] font-medium hover:bg-gray-800 shrink-0">
                        Lähetä
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-[11px] text-gray-400 truncate">{portalUrl}</div>
                      <button id="modal-copy-btn"
                        onClick={() => { navigator.clipboard.writeText(portalUrl).then(() => { const btn = document.getElementById("modal-copy-btn"); if (btn) { btn.textContent = "Kopioitu!"; setTimeout(() => { btn.textContent = "Kopioi" }, 1500) } }) }}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] font-medium text-gray-600 hover:border-gray-300 shrink-0">
                        Kopioi
                      </button>
                    </div>
                    <button onClick={() => setShowModal(false)} className="w-full text-[12px] text-gray-400 hover:text-gray-600">Sulje</button>
                  </div>
                </div>
              )}
            </>
          )
        })()}

        <h2 className="text-lg font-bold text-gray-900">Osiot</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((s) => {
            const proposal = proposals.find((p) => p.sectionKey === s.key)
            const isRead = proposal?.status === "sent" && !!proposal.clientReadAt
            // Catering "sent" tarkoittaa kumppanilla, ei asiakkaalla
            const proposalMeta = proposal
              ? (s.key === "catering" && proposal.status === "sent"
                  ? { label: "Kumppanilla", badge: "bg-amber-100 text-amber-700" }
                  : isRead
                  ? { label: "Avattu", badge: "bg-blue-100 text-blue-700" }
                  : PROPOSAL_STATUS_META[proposal.status])
              : null

            const inProposal = proposalKeys.has(s.key)
            const hasDraft = proposal?.status === "draft"

            // Indikaattori: kumppani vastannut catering-osioon
            const hasCateringResponse = s.key === "catering" && respondedPartners.filter(([, p]) => p.status === "vastattu").length > 0

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
                  progressColor={s.progressColor}
                  description={s.description}
                  members={getMembersForSection(s.key)}
                  dateLabel={eventDate}
                  note={proposal?.status === "changes_requested" && proposal.clientComment ? `Asiakas: "${proposal.clientComment}"` : undefined}
                  participantCount={
                    s.key === "tilat" ? allSpaces.length
                    : s.key === "catering" ? cateringPlan.moments.length
                    : s.key === "aikataulu" ? allScheduleItems.length
                    : 0
                  }
                  messageCount={getMessages(s.key).length}
                  thumbnails={s.key === "tilat" ? tilaThumbails : undefined}
                />
                {hasCateringResponse && (
                  <span className="absolute top-2 left-2 z-10 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" title="Kumppani on vastannut" />
                )}

                {/* Muutospyyntö — toiminnot */}
                {proposal?.status === "changes_requested" && (
                  <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault(); e.stopPropagation()
                        updateWorkOrder(workOrderId, {
                          proposalSections: (wo.proposalSections ?? []).map(p =>
                            p.sectionKey === s.key ? { ...p, status: "sent" as const, clientComment: undefined } : p
                          )
                        })
                      }}
                      className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-2.5 py-1.5 text-[11px] font-medium hover:bg-emerald-100 transition-colors shadow-sm"
                    >
                      ✓ Käsitelty
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToProposal(s.key) }}
                      className="flex items-center gap-1.5 rounded-lg bg-gray-900 text-white px-2.5 py-1.5 text-[11px] font-medium hover:bg-gray-800 transition-colors shadow-sm"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Lähetä uudelleen
                    </button>
                  </div>
                )}

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
        <PostItBoard sectionKey="yleinen" showFilter />
      </div>

      <div className="mt-6">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-2">Keskustelu asiakkaan kanssa</h2>
        <SectionChat sectionKey="asiakas" />
      </div>

      {/* Compose-modali — Tapahtumavahvistus */}
      {composeOpen && (() => {
        const day = wo.eventDays[0]
        const eventInfoRows = [
          { label: "Yhtiö", value: wo.customerCompany },
          { label: "Tapahtumatyyppi", value: wo.eventType },
          { label: "Osallistujia", value: `${wo.participantEstimate} hlö` },
          day ? { label: "Päivämäärä", value: day.date } : null,
          day ? { label: "Kellonaika", value: `${day.bookingStart}–${day.bookingEnd}` } : null,
          { label: "Catering", value: wo.needsCatering === "yes" ? "Kyllä" : wo.needsCatering === "no" ? "Ei" : "–" },
          { label: "AV-tekniikka", value: wo.needsAV === "yes" ? "Kyllä" : wo.needsAV === "no" ? "Ei" : "–" },
        ].filter(Boolean) as { label: string; value: string }[]

        function addToDraft() {
          const existing = proposals.find(p => p.sectionKey === "perustiedot")
          const entry = {
            ...(existing ?? {}),
            sectionKey: "perustiedot",
            sentAt: null,
            status: "draft" as const,
            sellerMessage: composeMessage,
          }
          const updatedSections = existing
            ? proposals.map(p => p.sectionKey === "perustiedot" ? entry : p)
            : [...proposals, entry]
          updateWorkOrder(workOrderId, { proposalSections: updatedSections })
          setComposeOpen(false)
        }

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setComposeOpen(false)}>
            <div className="bg-white w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <p className="text-[15px] font-semibold text-gray-900">
                    {wo.source === "varausjarjestelma" ? "Vastaa asiakkaalle" : "Lähetä asiakkaalle"}
                  </p>
                  {wo.customerEmail && (
                    <p className="text-[12px] text-gray-400 mt-0.5">Vastaanottaja: {wo.customerEmail}</p>
                  )}
                </div>
                <button onClick={() => setComposeOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Viesti */}
              <div className="px-5 pt-4">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">Viesti asiakkaalle</p>
                <Textarea
                  value={composeMessage}
                  onChange={e => setComposeMessage(e.target.value)}
                  rows={5}
                  className="text-[13px] text-gray-700 leading-relaxed resize-none"
                  autoFocus
                />
              </div>

              {/* Tapahtuman tiedot */}
              <div className="px-5 pt-4 pb-2">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">Tapahtuman tiedot (näkyy asiakkaalle)</p>
                <div className="bg-gray-50 px-3 py-2 space-y-1.5">
                  {eventInfoRows.map(row => (
                    <div key={row.label} className="flex items-center justify-between text-[12px]">
                      <span className="text-gray-500">{row.label}</span>
                      <span className="font-medium text-gray-800">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Napit */}
              <div className="flex items-center gap-2 px-5 py-4 border-t border-gray-100">
                <Button variant="outline" size="sm" onClick={() => setComposeOpen(false)} className="flex-1">
                  Peruuta
                </Button>
                <Button size="sm" onClick={addToDraft} className="flex-1 gap-1.5 bg-gray-900 hover:bg-gray-800">
                  <Send className="h-3.5 w-3.5" />
                  Lisää ehdotukseen
                </Button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
