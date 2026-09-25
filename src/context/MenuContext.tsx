import { createContext, useContext, useState, useCallback } from "react"
import type { ReactNode } from "react"
import type { Menu, Product } from "@/data/types"
import { menus as maunoMenus, unicaMenus } from "@/data/mock"

const initialMenus = [...maunoMenus, ...unicaMenus]

interface MenuContextValue {
  menus: Menu[]
  getMenusByPartner: (partnerId: string) => Menu[]
  getAllProducts: (partnerId: string) => Product[]
  getMenu: (id: string) => Menu | undefined
  addMenu: (menu: Menu) => void
  updateMenu: (id: string, updates: Partial<Menu>) => void
  removeMenu: (id: string) => void
  addProduct: (menuId: string, product: Product) => void
  updateProduct: (menuId: string, productId: string, updates: Partial<Product>) => void
  removeProduct: (menuId: string, productId: string) => void
}

const MenuContext = createContext<MenuContextValue | null>(null)

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menus, setMenus] = useState<Menu[]>(initialMenus)

  const getMenu = useCallback(
    (id: string) => menus.find((m) => m.id === id),
    [menus]
  )

  const getMenusByPartner = useCallback(
    (partnerId: string) => menus.filter((m) => m.partnerId === partnerId),
    [menus]
  )

  const getAllProducts = useCallback(
    (partnerId: string) => {
      const seen = new Set<string>()
      const out: Product[] = []
      for (const menu of menus) {
        if (menu.partnerId !== partnerId) continue
        for (const p of menu.products) {
          if (!seen.has(p.id)) {
            seen.add(p.id)
            out.push(p)
          }
        }
      }
      return out
    },
    [menus]
  )

  const addMenu = useCallback((menu: Menu) => {
    setMenus((prev) => [...prev, menu])
  }, [])

  const updateMenu = useCallback((id: string, updates: Partial<Menu>) => {
    setMenus((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    )
  }, [])

  const removeMenu = useCallback((id: string) => {
    setMenus((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const addProduct = useCallback((menuId: string, product: Product) => {
    setMenus((prev) =>
      prev.map((m) =>
        m.id === menuId ? { ...m, products: [...m.products, product] } : m
      )
    )
  }, [])

  const updateProduct = useCallback(
    (menuId: string, productId: string, updates: Partial<Product>) => {
      setMenus((prev) =>
        prev.map((m) =>
          m.id === menuId
            ? {
                ...m,
                products: m.products.map((p) =>
                  p.id === productId ? { ...p, ...updates } : p
                ),
              }
            : m
        )
      )
    },
    []
  )

  const removeProduct = useCallback((menuId: string, productId: string) => {
    setMenus((prev) =>
      prev.map((m) =>
        m.id === menuId
          ? { ...m, products: m.products.filter((p) => p.id !== productId) }
          : m
      )
    )
  }, [])

  return (
    <MenuContext.Provider
      value={{ menus, getMenusByPartner, getAllProducts, getMenu, addMenu, updateMenu, removeMenu, addProduct, updateProduct, removeProduct }}
    >
      {children}
    </MenuContext.Provider>
  )
}

export function useMenus() {
  const ctx = useContext(MenuContext)
  if (!ctx) throw new Error("useMenus must be used within MenuProvider")
  return ctx
}
