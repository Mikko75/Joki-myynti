import { Outlet } from "react-router-dom"
import { TopBar } from "./TopBar"
import { MainSidebar } from "./MainSidebar"

export function MainLayout() {
  return (
    <div className="flex h-full overflow-hidden">
      <MainSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar breadcrumbs={["Työmääräimet"]} />
        <main className="flex-1 overflow-auto bg-[rgba(249,250,251,0.8)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
