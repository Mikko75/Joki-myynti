import { useTeam } from "@/context/TeamContext"
import { useMode } from "@/context/ModeContext"
import { SectionChat } from "@/components/common/SectionChat"

export default function PartnerChatPage() {
  const { mode } = useMode()
  const { members, getMemberSectionKeys } = useTeam()

  const member = members.find((m) => m.id === mode)
  const sectionKeys = member ? getMemberSectionKeys(member.id) : []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Keskustelu</h1>

      <div>
        <h2 className="text-[14px] font-semibold text-gray-700 mb-2">Yleinen keskustelu</h2>
        <SectionChat sectionKey="general" />
      </div>

      {sectionKeys.map((key) => (
        <div key={key}>
          <h2 className="text-[14px] font-semibold text-gray-700 mb-2 capitalize">{key}</h2>
          <SectionChat sectionKey={key} />
        </div>
      ))}
    </div>
  )
}
