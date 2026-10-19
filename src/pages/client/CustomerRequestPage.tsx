import { useState } from "react"
import { useParams } from "react-router-dom"
import { CheckCircle2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { useChat } from "@/context/ChatContext"

export default function CustomerRequestPage() {
  const { id } = useParams<{ id: string }>()
  const woId = id ?? ""
  const { getWorkOrder, updateWorkOrder } = useWorkOrders()
  const { sendMessage } = useChat()
  const workOrder = getWorkOrder(woId)

  const [sent, setSent] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [updateMessage, setUpdateMessage] = useState("")

  if (!workOrder) return <p className="text-gray-500 p-8">Tapahtumaa ei löydy.</p>

  const wo = workOrder
  const scheduleDisplay = wo.eventDays.flatMap((d) => d.scheduleItems).map((si) => `${si.startTime} ${si.title}`).join("\n")

  function handleSend() {
    updateWorkOrder(woId, { clientUpdatedAt: new Date().toISOString() })
    const chatContent = updateMessage.trim()
      ? `Asiakas päivitti tapahtuman tietoja: "${updateMessage}"`
      : "Asiakas päivitti tapahtuman tietoja."
    sendMessage("yleinen", chatContent, {
      name: wo.customerName ?? "Asiakas",
      initials: wo.customerName?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "AS",
      color: "#22c55e",
      role: "client",
      roleLabel: "Asiakas",
    })
    setShowDialog(false)
    setUpdateMessage("")
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Oma tapahtumapyyntöni</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tarkista tietosi ja lähetä muutokset myyjälle jos jotain muuttuu.
        </p>
      </div>

      {sent && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <p className="text-[13px] font-medium text-emerald-800">Päivitys lähetetty myyjälle.</p>
        </div>
      )}

      {/* Tapahtuman perustiedot */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-[15px] font-semibold text-gray-900">Perustiedot</h2>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-gray-700">Tapahtuman nimi</label>
          <Input value={wo.eventName ?? ""} onChange={(e) => updateWorkOrder(woId, { eventName: e.target.value })} placeholder="Tapahtuman nimi" />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-gray-700">Tapahtuman kuvaus</label>
          <Textarea value={wo.eventDescription ?? ""} onChange={(e) => updateWorkOrder(woId, { eventDescription: e.target.value })} placeholder="Kerro tapahtumastasi..." rows={4} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Tapahtuman tyyppi</label>
            <p className="text-[13px] text-gray-900 py-2">{wo.eventType || "–"}</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Arvioitu osallistujamäärä</label>
            <Input type="number" value={wo.participantEstimate || ""} onChange={(e) => updateWorkOrder(woId, { participantEstimate: parseInt(e.target.value) || 0 })} placeholder="0" />
          </div>
        </div>

        {/* Päivämäärät */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-gray-700">Tapahtumapäivä(t)</label>
          {wo.eventDays.length > 0 ? (
            <div className="space-y-1">
              {wo.eventDays.map((d) => (
                <p key={d.id} className="text-[13px] text-gray-900">{d.date}</p>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-gray-400">Ei päivämäärää</p>
          )}
        </div>
      </div>

      {/* Alustava aikataulu */}
      {scheduleDisplay && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
          <h2 className="text-[15px] font-semibold text-gray-900">Alustava ohjelmarunko</h2>
          <Textarea
            value={scheduleDisplay}
            onChange={() => {}}
            rows={6}
            className="font-mono text-[13px] text-gray-700"
            readOnly
          />
          <p className="text-[11px] text-gray-400">Ota yhteyttä myyjään jos haluat muuttaa aikataulua.</p>
        </div>
      )}

      {/* Catering */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-[15px] font-semibold text-gray-900">Catering ja tekniikka</h2>

        <div className="flex items-center justify-between">
          <span className="text-[13px] text-gray-600">Tarvitaan catering</span>
          <span className={`text-[13px] font-medium ${wo.needsCatering === "yes" ? "text-emerald-600" : "text-gray-500"}`}>
            {wo.needsCatering === "yes" ? "Kyllä" : wo.needsCatering === "no" ? "Ei" : "Ei tietoa"}
          </span>
        </div>

        {wo.needsCatering === "yes" && wo.accessibilityNeeds && (
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Erikoisruokavaliot</label>
            <Textarea value={wo.accessibilityNeeds} onChange={(e) => updateWorkOrder(woId, { accessibilityNeeds: e.target.value })} rows={2} />
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[13px] text-gray-600">Tarvitaan AV / tekniikka</span>
          <span className={`text-[13px] font-medium ${wo.needsAV === "yes" ? "text-emerald-600" : "text-gray-500"}`}>
            {wo.needsAV === "yes" ? "Kyllä" : wo.needsAV === "no" ? "Ei" : "Ei tietoa"}
          </span>
        </div>

        {wo.needsAV === "yes" && wo.additionalNotes && (
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-700">Tekniikkatarpeet</label>
            <Textarea value={wo.additionalNotes} onChange={(e) => updateWorkOrder(woId, { additionalNotes: e.target.value })} rows={2} />
          </div>
        )}
      </div>

      <Button onClick={() => setShowDialog(true)} className="w-full gap-2">
        <Send className="h-4 w-4" />
        Lähetä päivitys myyjälle
      </Button>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 space-y-4">
            <h3 className="text-[16px] font-semibold text-gray-900">Lähetä päivitys myyjälle</h3>
            <p className="text-[13px] text-gray-500">Kuvaa lyhyesti mikä muuttui tai miksi otat yhteyttä.</p>
            <Textarea value={updateMessage} onChange={(e) => setUpdateMessage(e.target.value)} placeholder="Esim. Osallistujamäärä kasvoi 300→450." rows={4} autoFocus />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDialog(false)}>Peruuta</Button>
              <Button className="flex-1 gap-2" onClick={handleSend}>
                <Send className="h-4 w-4" /> Lähetä
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
