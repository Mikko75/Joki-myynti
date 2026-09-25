import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { useCustomers } from "@/hooks/useCustomers"
import { useWorkOrders } from "@/context/WorkOrderContext"
import { statusLabels } from "@/components/kanban/KanbanCard"
import type { DerivedCustomer } from "@/hooks/useCustomers"
import type { EventSource } from "@/data/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog"

type SortColumn = "company" | "primaryContact" | "workOrderCount"
type SortDir = "asc" | "desc"

const sourceLabels: Record<EventSource, string> = {
  web: "Web",
  sahkoposti: "Sähköposti",
  puhelin: "Puhelin",
}

const sourceBadgeVariant: Record<EventSource, "blue" | "purple" | "success"> = {
  web: "blue",
  sahkoposti: "purple",
  puhelin: "success",
}

export default function CustomersPage() {
  const navigate = useNavigate()
  const { customers, updateCustomer } = useCustomers()
  const { workOrders } = useWorkOrders()
  const [woDropdownFor, setWoDropdownFor] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [sourceFilter, setSourceFilter] = useState<EventSource | "all">("all")
  const [sortColumn, setSortColumn] = useState<SortColumn>("company")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [editingCustomer, setEditingCustomer] = useState<DerivedCustomer | null>(null)

  // Edit form state
  const [editCompany, setEditCompany] = useState("")
  const [editContact, setEditContact] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editSource, setEditSource] = useState<EventSource>("web")
  const [editIndustry, setEditIndustry] = useState("")
  const [editAddress, setEditAddress] = useState("")
  const [editYTunnus, setEditYTunnus] = useState("")
  const [editNotes, setEditNotes] = useState("")

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function openEdit(customer: DerivedCustomer) {
    setEditingCustomer(customer)
    setEditCompany(customer.company)
    setEditContact(customer.primaryContact)
    setEditEmail(customer.email)
    setEditPhone(customer.phone)
    setEditSource(customer.source)
    setEditIndustry(customer.industry)
    setEditAddress(customer.address)
    setEditYTunnus(customer.yTunnus)
    setEditNotes(customer.notes)
  }

  function handleSave() {
    if (!editingCustomer) return
    updateCustomer(editingCustomer.company, {
      company: editCompany,
      primaryContact: editContact,
      email: editEmail,
      phone: editPhone,
      source: editSource,
      industry: editIndustry,
      address: editAddress,
      yTunnus: editYTunnus,
      notes: editNotes,
    })
    setEditingCustomer(null)
  }

  function toggleSort(col: SortColumn) {
    if (sortColumn === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortColumn(col)
      setSortDir("asc")
    }
  }

  const filtered = useMemo(() => {
    let list = customers

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (c) =>
          c.company.toLowerCase().includes(q) ||
          c.primaryContact.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      )
    }

    if (sourceFilter !== "all") {
      list = list.filter((c) => c.source === sourceFilter)
    }

    const sorted = [...list].sort((a, b) => {
      let cmp = 0
      if (sortColumn === "company") cmp = a.company.localeCompare(b.company, "fi")
      else if (sortColumn === "primaryContact") cmp = a.primaryContact.localeCompare(b.primaryContact, "fi")
      else if (sortColumn === "workOrderCount") cmp = a.workOrderCount - b.workOrderCount
      return sortDir === "desc" ? -cmp : cmp
    })

    return sorted
  }, [customers, searchQuery, sourceFilter, sortColumn, sortDir])

  function SortIcon({ col }: { col: SortColumn }) {
    if (sortColumn !== col) return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />
    return sortDir === "asc"
      ? <ChevronUp className="h-3.5 w-3.5 text-gray-700" />
      : <ChevronDown className="h-3.5 w-3.5 text-gray-700" />
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900">Asiakkaat</h1>

      {/* Toolbar */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Etsi yritystä, yhteyshenkilöä tai sähköpostia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-80 pl-9"
          />
        </div>

        <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as EventSource | "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Kaikki lähteet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Kaikki lähteet</SelectItem>
            <SelectItem value="web">Web</SelectItem>
            <SelectItem value="sahkoposti">Sähköposti</SelectItem>
            <SelectItem value="puhelin">Puhelin</SelectItem>
          </SelectContent>
        </Select>

        <Badge variant="secondary" className="ml-auto">
          {filtered.length} {filtered.length === 1 ? "asiakas" : "asiakasta"}
        </Badge>
      </div>

      {/* Table */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">
                <button onClick={() => toggleSort("company")} className="flex items-center gap-1 hover:text-gray-700">
                  Yritys <SortIcon col="company" />
                </button>
              </th>
              <th className="px-4 py-3">
                <button onClick={() => toggleSort("primaryContact")} className="flex items-center gap-1 hover:text-gray-700">
                  Yhteyshenkilö <SortIcon col="primaryContact" />
                </button>
              </th>
              <th className="px-4 py-3">Sähköposti</th>
              <th className="px-4 py-3">Puhelin</th>
              <th className="px-4 py-3">Lähde</th>
              <th className="px-4 py-3">Toimiala</th>
              <th className="px-4 py-3">
                <button onClick={() => toggleSort("workOrderCount")} className="flex items-center gap-1 hover:text-gray-700">
                  Työmääräimet <SortIcon col="workOrderCount" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  Ei asiakkaita hakuehdoilla.
                </td>
              </tr>
            ) : (
              filtered.map((customer) => (
                <tr
                  key={customer.company}
                  onClick={() => {
                    if (customer.workOrderIds.length > 0) {
                      navigate(`/tyomarain/${customer.workOrderIds[0]}/yleiskuva`)
                    }
                  }}
                  className="border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{customer.company}</td>
                  <td className="px-4 py-3 text-gray-700">{customer.primaryContact}</td>
                  <td className="px-4 py-3 text-gray-500">{customer.email}</td>
                  <td className="px-4 py-3 text-gray-500">{customer.phone}</td>
                  <td className="px-4 py-3">
                    <Badge variant={sourceBadgeVariant[customer.source]}>
                      {sourceLabels[customer.source]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{customer.industry}</td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setWoDropdownFor(woDropdownFor === customer.company ? null : customer.company)
                      }}
                      className="inline-flex"
                    >
                      <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">
                        {customer.workOrderCount}
                      </Badge>
                    </button>
                    {woDropdownFor === customer.company && (
                      <div className="absolute right-4 top-full z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white shadow-lg">
                        <div className="p-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Työmääräimet</div>
                        {customer.workOrderIds.map((woId) => {
                          const wo = workOrders.find((w) => w.id === woId)
                          if (!wo) return null
                          return (
                            <button
                              key={woId}
                              onClick={(e) => {
                                e.stopPropagation()
                                setWoDropdownFor(null)
                                navigate(`/tyomarain/${woId}/yleiskuva`)
                              }}
                              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] hover:bg-gray-50 transition-colors"
                            >
                              <div className="min-w-0">
                                <span className="font-medium text-gray-900">{wo.number}</span>
                                <span className="text-gray-500 ml-1.5">{wo.eventType}</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] shrink-0">{statusLabels[wo.status]}</Badge>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Muokkaa asiakastietoja</DialogTitle>
            <DialogDescription>
              Muokkaa yrityksen ja yhteyshenkilön tietoja.
              {editingCustomer && editingCustomer.workOrderCount > 1 && (
                <> Tämä yritys liittyy {editingCustomer.workOrderCount} työmääräimeen.</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] font-medium text-gray-700">Yritys</label>
                <Input value={editCompany} onChange={(e) => setEditCompany(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-[13px] font-medium text-gray-700">Yhteyshenkilö</label>
                <Input value={editContact} onChange={(e) => setEditContact(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] font-medium text-gray-700">Sähköposti</label>
                <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-[13px] font-medium text-gray-700">Puhelin</label>
                <Input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] font-medium text-gray-700">Lähde</label>
                <Select value={editSource} onValueChange={(v) => setEditSource(v as EventSource)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="sahkoposti">Sähköposti</SelectItem>
                    <SelectItem value="puhelin">Puhelin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[13px] font-medium text-gray-700">Toimiala</label>
                <Input value={editIndustry} onChange={(e) => setEditIndustry(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div>
              <label className="text-[13px] font-medium text-gray-700">Osoite</label>
              <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] font-medium text-gray-700">Y-tunnus</label>
                <Input value={editYTunnus} onChange={(e) => setEditYTunnus(e.target.value)} className="mt-1" />
              </div>
              <div />
            </div>

            <div>
              <label className="text-[13px] font-medium text-gray-700">Muistiinpanot</label>
              <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="mt-1" rows={3} />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Peruuta</Button>
            </DialogClose>
            <Button onClick={handleSave}>Tallenna</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
