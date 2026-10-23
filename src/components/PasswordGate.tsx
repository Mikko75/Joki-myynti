import { useState } from "react"

const DEMO_PASSWORD = "joki2026"
const STORAGE_KEY = "joki-demo-auth"

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(STORAGE_KEY) === "1")
  const [input, setInput] = useState("")
  const [error, setError] = useState(false)

  if (authed) return <>{children}</>

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input === DEMO_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1")
      setAuthed(true)
    } else {
      setError(true)
      setInput("")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-sidebar-main)" }}>
      <div className="bg-white p-10 w-full max-w-sm shadow-2xl">
        <img src="/logo.png" alt="JOKI" className="h-14 w-auto mx-auto mb-8" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Salasana</label>
            <input
              type="password"
              value={input}
              onChange={e => { setInput(e.target.value); setError(false) }}
              placeholder="••••••••"
              autoFocus
              className="w-full border border-gray-200 px-3 py-2.5 text-[14px] outline-none focus:border-gray-900 transition-colors"
            />
            {error && <p className="text-[12px] text-red-500 mt-1">Väärä salasana</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-2.5 text-[13px] font-semibold hover:bg-gray-800 transition-colors"
          >
            Kirjaudu demoon
          </button>
        </form>
      </div>
    </div>
  )
}
