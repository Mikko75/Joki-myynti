import { Outlet } from "react-router-dom"
import { TopBar } from "./TopBar"

export function MainLayout() {
  return (
    <div className="flex h-full flex-col min-w-0">
      <TopBar breadcrumbs={["Työpöytä"]} />
      <main className="flex-1 overflow-auto bg-[rgba(249,250,251,0.8)]">
        <Outlet />
      </main>
    </div>
  )
}
