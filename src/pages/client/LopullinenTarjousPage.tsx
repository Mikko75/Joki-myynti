import { useState } from "react"
import { useParams } from "react-router-dom"
import { Clock, Printer, CheckCircle2, Check } from "lucide-react"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { additionalServices } from "@/data/mock"

const VAT = 0.255

function fmtEur(n: number) {
  return n.toLocaleString("fi-FI", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
}

type LineItem = {
  description: string
  qty: number
  unit: string
  unitPrice: number
  vatPct: number
}

function TarjousRivi({ item, i }: { item: LineItem; i: number }) {
  const exVat = item.qty * item.unitPrice
  const vat = exVat * (item.vatPct / 100)
  const incVat = exVat + vat
  return (
    <tr className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
      <td className="px-4 py-2.5 text-[13px] text-gray-800">{item.description}</td>
      <td className="px-4 py-2.5 text-[13px] text-right text-gray-600">{item.qty}</td>
      <td className="px-4 py-2.5 text-[13px] text-right text-gray-600">{item.unit}</td>
      <td className="px-4 py-2.5 text-[13px] text-right text-gray-700">{fmtEur(item.unitPrice)}</td>
      <td className="px-4 py-2.5 text-[13px] text-right text-gray-500">{item.vatPct} %</td>
      <td className="px-4 py-2.5 text-[13px] text-right text-gray-700">{fmtEur(exVat)}</td>
      <td className="px-4 py-2.5 text-[13px] text-right text-gray-500">{fmtEur(vat)}</td>
      <td className="px-4 py-2.5 text-[13px] text-right font-semibold text-gray-900">{fmtEur(incVat)}</td>
    </tr>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={8} className="px-4 pt-4 pb-1 text-[11px] font-bold uppercase tracking-widest text-gray-400 bg-white border-t border-gray-100">
        {label}
      </td>
    </tr>
  )
}

export default function LopullinenTarjousPage() {
  const { id } = useParams<{ id: string }>()
  const woId = id ?? ""
  const { getWorkOrder, getCateringPlan } = useWorkOrders()
  const wo = getWorkOrder(woId)

  if (!wo) return <p className="p-8 text-gray-500">Työmääräintä ei löydy.</p>

  if (wo.offerPhase !== "tarjous") {
    return (
      <div className="max-w-xl mx-auto py-16 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mx-auto mb-4">
          <Clock className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Lopullinen tarjous ei ole vielä valmis</h2>
        <p className="text-gray-500 mt-2 text-[14px]">Myyjä valmistelee tarjousta. Saat ilmoituksen kun se on valmis.</p>
      </div>
    )
  }

  const cateringPlan = getCateringPlan(woId)
  const allSpaces = wo.eventDays.flatMap(d => d.spaces)
  const cateringMoments = cateringPlan.moments
  const avAreas = wo.avProduction?.productionAreas.filter(a => a.status !== "ei_tarvita") ?? []
  const selectedServices = (wo.selectedAddOns ?? [])
    .map(sel => { const svc = additionalServices.find(s => s.id === sel.productId); return svc ? { ...svc, quantity: sel.quantity ?? 1 } : null })
    .filter(Boolean) as any[]

  // Build line items
  const spaceLines: LineItem[] = allSpaces.map(s => ({
    description: s.spaceName,
    qty: 1, unit: "pv",
    unitPrice: s.price ?? 0,
    vatPct: 25.5,
  }))

  const cateringLines: LineItem[] = cateringMoments.map(m => ({
    description: m.title + (m.menuName ? ` (${m.menuName})` : ""),
    qty: wo.participantEstimate,
    unit: "hlö",
    unitPrice: wo.participantEstimate > 0 ? m.price / wo.participantEstimate : 0,
    vatPct: 14,
  }))

  const avLines: LineItem[] = avAreas.map(a => ({
    description: a.label,
    qty: 1, unit: "kpl",
    unitPrice: a.price ?? 0,
    vatPct: 25.5,
  }))

  const addOnLines: LineItem[] = selectedServices.map(s => ({
    description: s.name,
    qty: s.quantity, unit: "kpl",
    unitPrice: s.price,
    vatPct: 25.5,
  }))

  const allLines = [...spaceLines, ...cateringLines, ...avLines, ...addOnLines]
  const totalExVat = allLines.reduce((s, l) => s + l.qty * l.unitPrice, 0)
  const totalVat = allLines.reduce((s, l) => s + l.qty * l.unitPrice * (l.vatPct / 100), 0)
  const totalIncVat = totalExVat + totalVat

  const { updateWorkOrder } = useWorkOrders()
  const [accepted, setAccepted] = useState(wo.status === "vahvistettu")

  function handleAccept() {
    updateWorkOrder(woId, { status: "vahvistettu" })
    setAccepted(true)
  }

  const today = new Date().toLocaleDateString("fi-FI")
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("fi-FI")
  const eventDate = wo.eventDays[0]?.date ?? "–"
  const version = wo.currentOfferVersion || 1

  // VAT summary by rate
  const vatByRate = allLines.reduce((acc, l) => {
    const base = l.qty * l.unitPrice
    const vatAmt = base * (l.vatPct / 100)
    acc[l.vatPct] = (acc[l.vatPct] ?? { base: 0, vat: 0 })
    acc[l.vatPct].base += base
    acc[l.vatPct].vat += vatAmt
    return acc
  }, {} as Record<number, { base: number; vat: number }>)

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Toimintopalkit */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-[13px] font-medium text-gray-600 hover:border-gray-300 transition-colors">
          <Printer className="h-4 w-4" /> Tulosta / PDF
        </button>
        {accepted ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-2.5">
            <Check className="h-5 w-5 text-emerald-600" />
            <span className="text-[14px] font-semibold text-emerald-800">Tarjous hyväksytty — tapahtuma vahvistettu!</span>
          </div>
        ) : (
          <button
            onClick={handleAccept}
            className="flex items-center gap-2 rounded-xl bg-gray-900 text-white px-6 py-2.5 text-[14px] font-semibold hover:bg-gray-800 transition-colors shadow-sm"
          >
            <CheckCircle2 className="h-5 w-5" />
            Hyväksy tarjous ja vahvista tapahtuma
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between p-8 border-b border-gray-100 bg-gray-900 text-white">
          <div>
            <img src="/logo.png" alt="JOKI" className="h-10 w-auto mb-3 brightness-0 invert" />
            <p className="text-[13px] text-gray-300">Vierailukeskus Joki</p>
            <p className="text-[13px] text-gray-300">Teknologiakiinteistöt Oy</p>
            <p className="text-[13px] text-gray-300">Lemminkäisenkatu 14–18, 20520 Turku</p>
            <p className="text-[13px] text-gray-300">info@teknologiakiinteistot.fi</p>
          </div>
          <div className="text-right">
            <p className="text-[28px] font-bold tracking-tight">TARJOUS</p>
            <p className="text-[15px] text-gray-300 mt-1">#{wo.number} / v.{version}</p>
            <div className="mt-3 space-y-1 text-[13px] text-gray-300">
              <p>Päivätty: <span className="text-white font-medium">{today}</span></p>
              <p>Voimassa: <span className="text-white font-medium">{validUntil}</span></p>
            </div>
          </div>
        </div>

        {/* Asiakas + Tapahtuma */}
        <div className="grid grid-cols-2 gap-0 border-b border-gray-100">
          <div className="p-6 border-r border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Asiakas</p>
            <p className="text-[15px] font-bold text-gray-900">{wo.customerCompany}</p>
            <p className="text-[13px] text-gray-700 mt-0.5">{wo.customerName}</p>
            {wo.customerEmail && <p className="text-[13px] text-gray-500 mt-0.5">{wo.customerEmail}</p>}
            {wo.customerPhone && <p className="text-[13px] text-gray-500">{wo.customerPhone}</p>}
          </div>
          <div className="p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Tapahtuma</p>
            <p className="text-[15px] font-bold text-gray-900">{wo.eventName || wo.eventType}</p>
            <p className="text-[13px] text-gray-600 mt-0.5">{eventDate}</p>
            <p className="text-[13px] text-gray-600">{wo.participantEstimate} osallistujaa</p>
            {allSpaces.length > 0 && <p className="text-[13px] text-gray-500 mt-1">{allSpaces.map(s => s.spaceName).join(", ")}</p>}
          </div>
        </div>

        {/* Rivierittely */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 w-[35%]">Tuote / palvelu</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">Määrä</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">Yks.</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">à-hinta</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">ALV%</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">Veroton</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">ALV</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">Yht. sis. ALV</th>
              </tr>
            </thead>
            <tbody>
              {spaceLines.length > 0 && (<>
                <SectionHeader label="Tilat" />
                {spaceLines.map((l, i) => <TarjousRivi key={i} item={l} i={i} />)}
              </>)}
              {cateringLines.length > 0 && (<>
                <SectionHeader label="Catering" />
                {cateringLines.map((l, i) => <TarjousRivi key={i} item={l} i={i} />)}
              </>)}
              {avLines.length > 0 && (<>
                <SectionHeader label="AV-tuotanto" />
                {avLines.map((l, i) => <TarjousRivi key={i} item={l} i={i} />)}
              </>)}
              {addOnLines.length > 0 && (<>
                <SectionHeader label="Lisäpalvelut" />
                {addOnLines.map((l, i) => <TarjousRivi key={i} item={l} i={i} />)}
              </>)}
            </tbody>
          </table>
        </div>

        {/* ALV-erittely + Yhteensä */}
        <div className="border-t-2 border-gray-200 flex justify-end">
          <div className="w-80 p-6 space-y-3">
            {/* ALV per kanta */}
            {Object.entries(vatByRate).map(([rate, { base, vat }]) => (
              <div key={rate} className="flex justify-between text-[12px] text-gray-500">
                <span>ALV {rate} % (pohja {fmtEur(base)})</span>
                <span>{fmtEur(vat)}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 space-y-1.5">
              <div className="flex justify-between text-[13px] text-gray-600">
                <span>Yhteensä veroton</span>
                <span>{fmtEur(totalExVat)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-gray-600">
                <span>ALV yhteensä</span>
                <span>{fmtEur(totalVat)}</span>
              </div>
            </div>
            <div className="border-t-2 border-gray-900 pt-3 flex justify-between text-[17px] font-bold text-gray-900">
              <span>Maksettava yhteensä</span>
              <span>{fmtEur(totalIncVat)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-8 py-4 bg-gray-50">
          <p className="text-[11px] text-gray-400">
            Tarjous voimassa {validUntil} asti · Hinnat sisältävät ALV eri kannoilla · Y-tunnus: 0987654-3
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Vierailukeskus Joki · Teknologiakiinteistöt Oy · Lemminkäisenkatu 14–18, 20520 Turku · info@teknologiakiinteistot.fi
          </p>
        </div>
      </div>
    </div>
  )
}
