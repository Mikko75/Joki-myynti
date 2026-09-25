import { SectionChat } from "@/components/common/SectionChat"
import { InfoBanner } from "@/components/common/InfoBanner"

export default function CustomerChatPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Keskustelu asiakkaan kanssa</h1>

      <InfoBanner>
        Tämä keskustelu näkyy asiakkaalle. Sisäiset tiimikeskustelut löytyvät "Kaikki keskustelut" -sivulta.
      </InfoBanner>

      <SectionChat sectionKey="asiakas" />
    </div>
  )
}
