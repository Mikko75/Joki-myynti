import { Routes, Route, Navigate, useParams } from "react-router-dom"
import { useMode } from "@/context/ModeContext"
import { UnifiedLayout } from "./UnifiedLayout"
import OverviewPage from "@/pages/work-order/OverviewPage"
import SpacesPage from "@/pages/work-order/SpacesPage"
import SchedulePage from "@/pages/work-order/SchedulePage"
import CateringPage from "@/pages/work-order/CateringPage"
import AVPage from "@/pages/work-order/AVPage"
import ServicesPage from "@/pages/work-order/ServicesPage"
import ConversationsPage from "@/pages/work-order/ConversationsPage"
import CustomerChatPage from "@/pages/work-order/CustomerChatPage"
import OfferPage from "@/pages/work-order/OfferPage"
import PartnerCateringPage from "@/pages/partner/PartnerCateringPage"
import PartnerAVPage from "@/pages/partner/PartnerAVPage"
import PartnerSchedulePage from "@/pages/partner/PartnerSchedulePage"
import PartnerChatPage from "@/pages/partner/PartnerChatPage"
import PartnerProductsPage from "@/pages/partner/PartnerProductsPage"
import ClientPortal from "@/pages/client/ClientPortal"
import InvitePage from "@/pages/work-order/InvitePage"
import PerustiedotPage from "@/pages/work-order/PerustiedotPage"

function ClientPortalPage() {
  const { id } = useParams<{ id: string }>()
  return <ClientPortal workOrderId={id ?? ""} />
}

function ModeRedirect() {
  const { mode } = useMode()
  if (mode === "client") return <Navigate to="asiakas" replace />
  return <Navigate to="yleiskuva" replace />
}

function CateringRouter() {
  const { mode } = useMode()
  return mode === "seller" ? <CateringPage /> : <PartnerCateringPage />
}

function AVRouter() {
  const { mode } = useMode()
  return mode === "seller" ? <AVPage /> : <PartnerAVPage />
}

function ScheduleRouter() {
  const { mode } = useMode()
  return mode === "seller" ? <SchedulePage /> : <PartnerSchedulePage />
}

function ChatRouter() {
  const { mode } = useMode()
  return mode === "seller" ? <ConversationsPage /> : <PartnerChatPage />
}

export function ModeRouter() {
  return (
    <Routes>
      <Route element={<UnifiedLayout />}>
        <Route index element={<ModeRedirect />} />
        <Route path="yleiskuva" element={<OverviewPage />} />
        <Route path="perustiedot" element={<PerustiedotPage />} />
        <Route path="kutsu" element={<InvitePage />} />
        <Route path="asiakas" element={<ClientPortalPage />} />
        <Route path="tilat" element={<SpacesPage />} />
        <Route path="aikataulu" element={<ScheduleRouter />} />
        <Route path="catering" element={<CateringRouter />} />
        <Route path="av" element={<AVRouter />} />
        <Route path="lisapalvelut" element={<ServicesPage />} />
        <Route path="tuotteet" element={<PartnerProductsPage />} />
        <Route path="asiakas-chat" element={<CustomerChatPage />} />
        <Route path="keskustelut" element={<ChatRouter />} />
        <Route path="keskustelu" element={<PartnerChatPage />} />
        <Route path="tarjous" element={<OfferPage />} />
        <Route path="*" element={<ModeRedirect />} />
      </Route>
    </Routes>
  )
}
