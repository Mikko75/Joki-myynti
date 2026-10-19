import { useMode, SELLER_MODE, CLIENT_MODE } from "@/context/ModeContext"
import { useTeam } from "@/context/TeamContext"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { cn } from "@/lib/utils"

export function ModeSwitcher() {
  const { mode, setMode, setModeInfo } = useMode()
  const { members } = useTeam()
  const navigate = useNavigate()
  const location = useLocation()
  const id = location.pathname.match(/\/tyomarain\/([^/]+)/)?.[1]

  function goToDefault(newMode: string) {
    if (!id) {
      navigate("/")
      return
    }
    if (newMode === "client") {
      navigate(`/tyomarain/${id}/ehdotus`)
    } else if (newMode === "seller") {
      navigate(`/tyomarain/${id}/yleiskuva`)
    } else {
      const member = members.find((m) => m.id === newMode)
      if (member) {
        const sectionMap: Record<string, string> = { "Catering": "catering", "AV / tekniikka": "av" }
        const firstSection = member.sections[0]
        const route = sectionMap[firstSection] ?? "yleiskuva"
        navigate(`/tyomarain/${id}/${route}`)
      } else {
        navigate(`/tyomarain/${id}/yleiskuva`)
      }
    }
  }

  function selectSeller() {
    setMode("seller")
    setModeInfo(SELLER_MODE)
    goToDefault("seller")
  }

  function selectMember(m: typeof members[0]) {
    setMode(m.id)
    setModeInfo({
      key: m.id,
      label: m.role || m.name.split(" ")[0],
      name: m.name,
      role: m.role,
      initials: m.initials,
      color: m.color,
    })
    goToDefault(m.id)
  }

  function selectClient() {
    setMode("client")
    setModeInfo(CLIENT_MODE)
    goToDefault("client")
  }

  return (
    <div className="flex items-center gap-1.5 bg-gray-900 px-4 py-1.5 shrink-0 overflow-x-auto">
      <span className="text-[11px] text-gray-500 font-medium mr-2 uppercase tracking-wider shrink-0">Näkymä</span>

      {/* Seller — always available */}
      <ModeButton
        active={mode === "seller"}
        onClick={selectSeller}
        initials="ML"
        color="#3b82f6"
        label="Myyjä"
      />

      {/* Team members — only shown after invite */}
      {members.map((m) => (
        <ModeButton
          key={m.id}
          active={mode === m.id}
          onClick={() => selectMember(m)}
          initials={m.initials}
          color={m.color}
          label={m.role || m.name.split(" ")[0]}
        />
      ))}

      {/* Client — always available */}
      <ModeButton
        active={mode === "client"}
        onClick={selectClient}
        initials="AS"
        color="#f59e0b"
        label="Asiakas"
      />

      {/* Separator */}
      <div className="mx-2 h-4 w-px bg-gray-700 shrink-0" />

      {/* Lomake — linkki omalle sivulle */}
      <Link
        to="/lomake"
        className={cn(
          "flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium transition-all shrink-0",
          location.pathname === "/lomake"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-400 hover:text-white hover:bg-gray-800"
        )}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white shrink-0 bg-emerald-500">
          ✎
        </span>
        Lomake
      </Link>
    </div>
  )
}

function ModeButton({ active, onClick, initials, color, label }: {
  active: boolean
  onClick: () => void
  initials: string
  color: string
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium transition-all shrink-0",
        active
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-400 hover:text-white hover:bg-gray-800"
      )}
    >
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white shrink-0"
        style={{ backgroundColor: color }}
      >
        {initials}
      </span>
      {label}
    </button>
  )
}
