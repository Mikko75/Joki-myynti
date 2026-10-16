import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TeamProvider } from '@/context/TeamContext'
import { WorkOrderProvider } from '@/context/WorkOrderContext'
import { ModeProvider } from '@/context/ModeContext'
import { ChatProvider } from '@/context/ChatContext'
import { MenuProvider } from '@/context/MenuContext'
import { CustomerEnrichmentProvider } from '@/context/CustomerEnrichmentContext'
import { TemplateProvider } from '@/context/TemplateContext'
import { ModeSwitcher } from '@/components/layout/ModeSwitcher'
import { MainLayout } from '@/components/layout/MainLayout'
import { MainSidebar } from '@/components/layout/MainSidebar'
import KanbanPage from '@/pages/KanbanPage'
import CalendarPage from '@/pages/CalendarPage'
import NewLeadWrapper from '@/pages/NewLeadWrapper'
import { ModeRouter } from '@/components/layout/ModeRouter'
import CustomersPage from '@/pages/CustomersPage'

export default function App() {
  return (
    <WorkOrderProvider>
      <TeamProvider>
        <ChatProvider>
          <MenuProvider>
            <CustomerEnrichmentProvider>
            <TemplateProvider>
            <ModeProvider>
            <BrowserRouter>
              <div className="flex flex-col h-screen">
                <ModeSwitcher />
                <div className="flex flex-1 overflow-hidden">
                  <MainSidebar />
                  <div className="flex-1 overflow-hidden">
                    <Routes>
                      <Route element={<MainLayout />}>
                        <Route index element={<KanbanPage />} />
                        <Route path="/kalenteri" element={<CalendarPage />} />
                        <Route path="/asiakkaat" element={<CustomersPage />} />
                      </Route>
                      <Route path="/uusi-liidi" element={<NewLeadWrapper />} />
                      <Route path="/tyomarain/:id/*" element={<ModeRouter />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </BrowserRouter>
            </ModeProvider>
            </TemplateProvider>
            </CustomerEnrichmentProvider>
          </MenuProvider>
        </ChatProvider>
      </TeamProvider>
    </WorkOrderProvider>
  )
}
