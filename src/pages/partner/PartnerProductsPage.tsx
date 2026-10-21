import { useState } from "react"
import type { FormEvent } from "react"
import { Plus, Pencil, Trash2, ShoppingBag, Package, ChevronRight, X, UtensilsCrossed, Upload, Search, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useMenus } from "@/context/MenuContext"
import { useMode } from "@/context/ModeContext"
import { cateringProviders } from "@/data/mock"
import type { Menu, Product } from "@/data/types"

/* ---------- helpers ---------- */

const DIETARY_OPTIONS = ["gluteeniton", "vegaani", "laktoositon", "maidoton"]

function statusBadgeVariant(status: string) {
  switch (status) {
    case "aktiivinen": return "success" as const
    case "luonnos": return "outline" as const
    case "arkistoitu": return "secondary" as const
    default: return "outline" as const
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "aktiivinen": return "Aktiivinen"
    case "luonnos": return "Luonnos"
    case "arkistoitu": return "Arkistoitu"
    default: return status
  }
}

/* ========== Page ========== */

export default function PartnerProductsPage() {
  const { menus, getMenusByPartner, getAllProducts, addMenu, updateMenu, removeMenu, addProduct, updateProduct, removeProduct } = useMenus()
  const { mode } = useMode()

  const isSeller = mode === "seller"
  const [selectedProviderId, setSelectedProviderId] = useState(
    isSeller ? cateringProviders[0].id : mode
  )

  const filteredMenus = getMenusByPartner(selectedProviderId)

  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null)

  // Menu dialogs
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const [editMenuOpen, setEditMenuOpen] = useState(false)
  const [deleteMenuOpen, setDeleteMenuOpen] = useState(false)
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)

  // Menu form state
  const [menuName, setMenuName] = useState("")
  const [menuDesc, setMenuDesc] = useState("")
  const [menuPrice, setMenuPrice] = useState("")

  // Product panel
  const [productPanelOpen, setProductPanelOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteProductOpen, setDeleteProductOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<{ menuId: string; product: Product } | null>(null)

  // Product form state
  const [prodName, setProdName] = useState("")
  const [prodNameEn, setProdNameEn] = useState("")
  const [prodDesc, setProdDesc] = useState("")
  const [prodDescEn, setProdDescEn] = useState("")
  const [prodPrice, setProdPrice] = useState("")
  const [prodVat, setProdVat] = useState("14")
  const [prodUnit, setProdUnit] = useState("")
  const [prodCategory, setProdCategory] = useState("")
  const [prodDietary, setProdDietary] = useState<string[]>([])
  const [prodD365, setProdD365] = useState("")
  const [prodValidFrom, setProdValidFrom] = useState("")
  const [prodValidTo, setProdValidTo] = useState("")
  const [prodVersion, setProdVersion] = useState("1")
  const [prodActive, setProdActive] = useState(true)
  const [showEnglish, setShowEnglish] = useState(false)

  // Excel import
  const [excelOpen, setExcelOpen] = useState(false)

  // All-products sidebar search
  const [allProductsSearch, setAllProductsSearch] = useState("")

  const selectedMenu = menus.find((m) => m.id === selectedMenuId)

  // All products for sidebar
  const allProducts = getAllProducts(selectedProviderId)
  const filteredAllProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(allProductsSearch.toLowerCase())
  )

  /* ---------- Menu handlers ---------- */

  function openCreateMenu() {
    setMenuName("")
    setMenuDesc("")
    setMenuPrice("")
    setCreateMenuOpen(true)
  }

  function handleCreateMenu(e: FormEvent) {
    e.preventDefault()
    if (!menuName.trim()) return
    const menu: Menu = {
      id: `menu-${Date.now()}`,
      partnerId: selectedProviderId,
      name: menuName.trim(),
      description: menuDesc.trim(),
      pricePerPerson: parseFloat(menuPrice) || 0,
      products: [],
      status: "luonnos",
    }
    addMenu(menu)
    setCreateMenuOpen(false)
  }

  function openEditMenu(menu: Menu) {
    setEditingMenu(menu)
    setMenuName(menu.name)
    setMenuDesc(menu.description)
    setMenuPrice(String(menu.pricePerPerson))
    setEditMenuOpen(true)
  }

  function handleEditMenu(e: FormEvent) {
    e.preventDefault()
    if (!editingMenu || !menuName.trim()) return
    updateMenu(editingMenu.id, {
      name: menuName.trim(),
      description: menuDesc.trim(),
      pricePerPerson: parseFloat(menuPrice) || 0,
    })
    setEditMenuOpen(false)
    setEditingMenu(null)
  }

  function openDeleteMenu(menu: Menu) {
    setMenuToDelete(menu)
    setDeleteMenuOpen(true)
  }

  function confirmDeleteMenu() {
    if (!menuToDelete) return
    if (selectedMenuId === menuToDelete.id) setSelectedMenuId(null)
    removeMenu(menuToDelete.id)
    setDeleteMenuOpen(false)
    setMenuToDelete(null)
  }

  /* ---------- Product handlers ---------- */

  function resetProductForm() {
    setProdName("")
    setProdNameEn("")
    setProdDesc("")
    setProdDescEn("")
    setProdPrice("")
    setProdVat("14")
    setProdUnit("")
    setProdCategory("")
    setProdDietary([])
    setProdD365("")
    setProdValidFrom("")
    setProdValidTo("")
    setProdVersion("1")
    setProdActive(true)
    setShowEnglish(false)
  }

  function openAddProduct() {
    setEditingProduct(null)
    resetProductForm()
    setProductPanelOpen(true)
  }

  function openEditProduct(product: Product) {
    setEditingProduct(product)
    setProdName(product.name)
    setProdNameEn(product.nameEn)
    setProdDesc(product.description)
    setProdDescEn(product.descriptionEn)
    setProdPrice(String(product.unitPrice))
    setProdVat(String(product.vatPercent))
    setProdUnit(product.unit)
    setProdCategory(product.category)
    setProdDietary([...product.dietaryTags])
    setProdD365(product.d365Code)
    setProdValidFrom(product.validFrom)
    setProdValidTo(product.validTo)
    setProdVersion(String(product.version))
    setProdActive(product.active)
    setShowEnglish(false)
    setProductPanelOpen(true)
  }

  function handleSaveProduct(e: FormEvent) {
    e.preventDefault()
    if (!selectedMenuId || !prodName.trim()) return

    const data = {
      name: prodName.trim(),
      nameEn: prodNameEn.trim(),
      description: prodDesc.trim(),
      descriptionEn: prodDescEn.trim(),
      unitPrice: parseFloat(prodPrice) || 0,
      vatPercent: parseFloat(prodVat) || 14,
      unit: prodUnit.trim(),
      category: prodCategory.trim(),
      dietaryTags: prodDietary,
      d365Code: prodD365.trim(),
      validFrom: prodValidFrom,
      validTo: prodValidTo,
      version: parseInt(prodVersion) || 1,
      active: prodActive,
    }

    if (editingProduct) {
      updateProduct(selectedMenuId, editingProduct.id, data)
    } else {
      const product: Product = {
        id: `prod-${Date.now()}`,
        ...data,
      }
      addProduct(selectedMenuId, product)
    }

    setProductPanelOpen(false)
    resetProductForm()
    setEditingProduct(null)
  }

  function openDeleteProduct(menuId: string, product: Product) {
    setProductToDelete({ menuId, product })
    setDeleteProductOpen(true)
  }

  function confirmDeleteProduct() {
    if (!productToDelete) return
    removeProduct(productToDelete.menuId, productToDelete.product.id)
    setDeleteProductOpen(false)
    setProductToDelete(null)
  }

  function toggleDietary(tag: string) {
    setProdDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  /* ========== Render ========== */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tuotteet</h1>
        <Button onClick={openCreateMenu}>
          <Plus className="h-4 w-4" />
          Luo menu
        </Button>
      </div>

      {/* Provider selector */}
      {isSeller && (
        <div className="flex gap-2">
          {cateringProviders.map((p) => (
            <button
              key={p.id}
              onClick={() => { setSelectedProviderId(p.id); setSelectedMenuId(null) }}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-[13px] font-medium transition-all",
                selectedProviderId === p.id
                  ? "border-primary-500 ring-1 ring-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
              )}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: p.color }}
              >
                {p.initials}
              </span>
              {p.name}
              <span className="text-[11px] text-gray-400">{getMenusByPartner(p.id).length} menua</span>
            </button>
          ))}
          <Button variant="outline" onClick={() => setExcelOpen(true)}>
            <Upload className="h-4 w-4" />
            Tuo Excelistä
          </Button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Left: Menu list */}
        <div className="flex-1 min-w-0 space-y-3">
          {filteredMenus.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-[13px] text-gray-400">
              <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              Ei vielä menuja. Luo ensimmäinen menu yllä olevalla painikkeella.
            </div>
          ) : (
            filteredMenus.map((menu) => {
              const isSelected = selectedMenuId === menu.id
              return (
                <div key={menu.id} className="space-y-0">
                  {/* Menu card */}
                  <div
                    className={cn(
                      "rounded-lg border bg-white p-4 transition-colors cursor-pointer",
                      isSelected
                        ? "border-primary-300 ring-1 ring-primary-200"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => setSelectedMenuId(isSelected ? null : menu.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Menu image placeholder */}
                      <div className="h-16 w-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                        <UtensilsCrossed className="h-6 w-6 text-gray-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-[15px] font-semibold text-gray-900 truncate">
                            {menu.name}
                          </h3>
                          <Badge variant={statusBadgeVariant(menu.status)}>
                            {statusLabel(menu.status)}
                          </Badge>
                        </div>
                        {menu.description && (
                          <p className="text-[13px] text-gray-500 mb-2 line-clamp-2">
                            {menu.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-[12px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <Package className="h-3.5 w-3.5 text-gray-400" />
                            {menu.products.length} tuotetta
                          </span>
                          <span>{menu.pricePerPerson.toFixed(2)} EUR / hlö</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditMenu(menu)
                          }}
                          title="Muokkaa menua"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-100 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            openDeleteMenu(menu)
                          }}
                          title="Poista menu"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 text-gray-400 transition-transform ml-1",
                            isSelected && "rotate-90"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded: products */}
                  {isSelected && selectedMenu && (
                    <div className="ml-4 mt-2 space-y-3 border-l-2 border-primary-100 pl-4 pb-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[14px] font-semibold text-gray-800">
                          {selectedMenu.name} — Tuotteet
                        </h3>
                        <Button size="sm" variant="outline" onClick={openAddProduct}>
                          <Plus className="h-4 w-4" />
                          Lisää tuote
                        </Button>
                      </div>

                      {selectedMenu.products.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-[13px] text-gray-400">
                          Ei vielä tuotteita tässä menussa.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedMenu.products.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="text-[13px] font-semibold text-gray-900 truncate">
                                    {product.name}
                                  </p>
                                  {product.category && (
                                    <Badge variant="secondary" className="text-[10px]">
                                      {product.category}
                                    </Badge>
                                  )}
                                </div>
                                {product.description && (
                                  <p className="text-[12px] text-gray-500 truncate">
                                    {product.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[12px] text-gray-600 font-medium">
                                    {product.unitPrice.toFixed(2)} EUR / {product.unit || "kpl"}
                                  </span>
                                  {product.dietaryTags.length > 0 && (
                                    <div className="flex gap-1">
                                      {product.dietaryTags.map((tag) => (
                                        <Badge
                                          key={tag}
                                          variant="blue"
                                          className="text-[10px] px-1.5 py-0"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                                  onClick={() => openEditProduct(product)}
                                  title="Muokkaa tuotetta"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-100 transition-colors"
                                  onClick={() => openDeleteProduct(menu.id, product)}
                                  title="Poista tuote"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Right: Product side panel */}
        {productPanelOpen && selectedMenuId && (
          <div className="w-96 shrink-0 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
            <form onSubmit={handleSaveProduct} className="flex flex-col h-full">
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <h3 className="text-[15px] font-semibold text-gray-900">
                  {editingProduct ? "Muokkaa tuotetta" : "Lisää tuote"}
                </h3>
                <button
                  type="button"
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                  onClick={() => {
                    setProductPanelOpen(false)
                    setEditingProduct(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-5 space-y-4">
                {/* Language toggle */}
                <div className="flex gap-1 rounded-lg border border-gray-200 p-0.5 w-fit">
                  <button type="button" className={cn("px-3 py-1 rounded-md text-[12px] font-medium transition-colors", !showEnglish ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-100")} onClick={() => setShowEnglish(false)}>FI</button>
                  <button type="button" className={cn("px-3 py-1 rounded-md text-[12px] font-medium transition-colors", showEnglish ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-100")} onClick={() => setShowEnglish(true)}>EN</button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-gray-700">D365-tuotenumero</label>
                  <Input placeholder="Esim. PIKA-MAUNO-1" value={prodD365} onChange={(e) => setProdD365(e.target.value)} />
                </div>

                {!showEnglish ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-gray-700">Nimi (fi)</label>
                      <Input placeholder="Tuotteen nimi" value={prodName} onChange={(e) => setProdName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-gray-700">Kuvaus (fi)</label>
                      <Textarea placeholder="Lyhyt kuvaus" value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} rows={2} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-gray-700">Name (en)</label>
                      <Input placeholder="Product name" value={prodNameEn} onChange={(e) => setProdNameEn(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-gray-700">Description (en)</label>
                      <Textarea placeholder="Short description" value={prodDescEn} onChange={(e) => setProdDescEn(e.target.value)} rows={2} />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-gray-700">0 % ALV hinta</label>
                    <Input type="number" step="0.01" min="0" placeholder="0.00" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-gray-700">ALV %</label>
                    <Input type="number" step="0.5" min="0" placeholder="14" value={prodVat} onChange={(e) => setProdVat(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-gray-700">Yksikkö</label>
                    <Input placeholder="Esim. kuppi, annos" value={prodUnit} onChange={(e) => setProdUnit(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-gray-700">Kategoria</label>
                    <Input placeholder="Esim. Alkuruoat, Juomat" value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-gray-700">Voimassa alkaen</label>
                    <Input type="date" value={prodValidFrom} onChange={(e) => setProdValidFrom(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-gray-700">Voimassa päättyen</label>
                    <Input type="date" value={prodValidTo} onChange={(e) => setProdValidTo(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-gray-700">Puskuripäivät</label>
                    <Input type="number" min="0" placeholder="1" value={prodVersion} onChange={(e) => setProdVersion(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-gray-700">Aktiivinen</label>
                    <div className="flex items-center gap-2 h-9">
                      <button type="button" className={cn("h-6 w-11 rounded-full relative transition-colors", prodActive ? "bg-emerald-500" : "bg-gray-300")} onClick={() => setProdActive(!prodActive)}>
                        <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", prodActive ? "right-0.5" : "left-0.5")} />
                      </button>
                      <span className="text-[12px] text-gray-500">{prodActive ? "Kyllä" : "Ei"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Erityisruokavaliot</label>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-[12px] font-medium transition-colors",
                          prodDietary.includes(tag)
                            ? "border-primary-300 bg-primary-50 text-primary-700"
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        )}
                        onClick={() => toggleDietary(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setProductPanelOpen(false)
                    setEditingProduct(null)
                  }}
                >
                  Peruuta
                </Button>
                <Button type="submit" size="sm">
                  {editingProduct ? "Tallenna" : "Lisää"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Right sidebar: All products — hidden when editing a product */}
        {!productPanelOpen && (
        <div className="w-72 shrink-0 rounded-xl border border-gray-200 bg-white overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 200px)" }}>
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-semibold text-gray-900">Kaikki tuotteet</h3>
              <span className="text-[12px] text-gray-400">{allProducts.length} kpl</span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Hae tuotetta..."
                value={allProductsSearch}
                onChange={(e) => setAllProductsSearch(e.target.value)}
                className="pl-8 h-8 text-[13px]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto px-2 pb-2">
            {filteredAllProducts.length === 0 ? (
              <div className="px-2 py-6 text-center text-[12px] text-gray-400">
                Ei tuotteita.
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredAllProducts.map((product) => {
                  const isInMenu = selectedMenu?.products.some((p) => p.id === product.id)
                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-[12px] text-gray-400 truncate">
                          {product.unitPrice.toFixed(2)} EUR / {product.unit || "kpl"}
                        </p>
                      </div>
                      {!selectedMenuId ? (
                        <button
                          disabled
                          title="Valitse ensin menu"
                          className="p-1 rounded-md text-gray-300 cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      ) : isInMenu ? (
                        <span className="p-1 text-emerald-500">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : (
                        <button
                          className="p-1 rounded-md text-primary-600 hover:bg-primary-50 transition-colors"
                          onClick={() => addProduct(selectedMenuId, product)}
                          title="Lisää menuun"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 px-3 py-2.5">
            <button
              className="flex items-center gap-1.5 text-[13px] font-medium text-primary-600 hover:text-primary-700 transition-colors w-full justify-center"
              onClick={openAddProduct}
            >
              <Plus className="h-3.5 w-3.5" />
              Luo uusi tuote
            </button>
          </div>
        </div>
        )}
      </div>

      {/* ---- Dialogs ---- */}

      {/* Create menu dialog */}
      <Dialog open={createMenuOpen} onOpenChange={setCreateMenuOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateMenu}>
            <DialogHeader>
              <DialogTitle>Luo menu</DialogTitle>
              <DialogDescription>Luo uusi menu tuotteidesi hallintaa varten.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-gray-700">Kuva</label>
                <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors">
                  <UtensilsCrossed className="h-8 w-8 text-gray-300" />
                  <span className="text-[13px] text-gray-500">Klikkaa tai raahaa kuva tähän</span>
                  <span className="text-[11px] text-gray-400">PNG, JPG — max 5 MB</span>
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-gray-700">Nimi</label>
                <Input
                  placeholder="Menun nimi"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-gray-700">Kuvaus</label>
                <Textarea
                  placeholder="Lyhyt kuvaus menusta"
                  value={menuDesc}
                  onChange={(e) => setMenuDesc(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-gray-700">Hinta / hlö (EUR)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={menuPrice}
                  onChange={(e) => setMenuPrice(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">Peruuta</Button>
              </DialogClose>
              <Button type="submit">Luo</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit menu dialog */}
      <Dialog open={editMenuOpen} onOpenChange={setEditMenuOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleEditMenu}>
            <DialogHeader>
              <DialogTitle>Muokkaa menua</DialogTitle>
              <DialogDescription>Päivitä menun tiedot.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-gray-700">Nimi</label>
                <Input
                  placeholder="Menun nimi"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-gray-700">Kuvaus</label>
                <Textarea
                  placeholder="Lyhyt kuvaus menusta"
                  value={menuDesc}
                  onChange={(e) => setMenuDesc(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-gray-700">Hinta / hlö (EUR)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={menuPrice}
                  onChange={(e) => setMenuPrice(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">Peruuta</Button>
              </DialogClose>
              <Button type="submit">Tallenna</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete menu confirmation */}
      <Dialog open={deleteMenuOpen} onOpenChange={setDeleteMenuOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Poista menu</DialogTitle>
            <DialogDescription>
              Haluatko varmasti poistaa menun{" "}
              <span className="font-semibold text-gray-900">{menuToDelete?.name}</span>?
              Tätä toimintoa ei voi perua.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Peruuta</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDeleteMenu}>
              Poista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete product confirmation */}
      <Dialog open={deleteProductOpen} onOpenChange={setDeleteProductOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Poista tuote</DialogTitle>
            <DialogDescription>
              Haluatko varmasti poistaa tuotteen{" "}
              <span className="font-semibold text-gray-900">{productToDelete?.product.name}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Peruuta</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDeleteProduct}>
              Poista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excel import dialog */}
      <Dialog open={excelOpen} onOpenChange={setExcelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tuo tuotteet Excelistä</DialogTitle>
            <DialogDescription>Lataa Excel-tiedosto (.xlsx) tuotteiden tuomiseksi.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors">
              <Upload className="h-10 w-10 text-gray-300" />
              <div className="text-center">
                <p className="text-[13px] text-gray-600">Raahaa tiedosto tähän tai klikkaa valitaksesi</p>
                <p className="text-[11px] text-gray-400 mt-1">Tuetut muodot: .xlsx, .csv</p>
              </div>
              <input type="file" accept=".xlsx,.csv" className="hidden" />
            </label>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Peruuta</Button>
            </DialogClose>
            <Button disabled>Tuo tuotteet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
