import { SectionChat } from "@/components/common/SectionChat"

export default function ConversationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Kaikki keskustelut</h1>

      <div>
        <h2 className="text-[14px] font-semibold text-gray-700 mb-2">Tiimi (sisäinen)</h2>
        <SectionChat sectionKey="general" />
      </div>

      <div>
        <h2 className="text-[14px] font-semibold text-gray-700 mb-2">Catering</h2>
        <SectionChat sectionKey="catering" />
      </div>

      <div>
        <h2 className="text-[14px] font-semibold text-gray-700 mb-2">AV / tekniikka</h2>
        <SectionChat sectionKey="av" />
      </div>

    </div>
  )
}
