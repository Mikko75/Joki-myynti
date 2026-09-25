import { useState, useRef, useEffect } from "react"
import { Input } from "./input"
import { Badge } from "./badge"
import { cn } from "@/lib/utils"

export interface ComboboxOption {
  label: string
  sublabel?: string
  detail?: string
  isExisting?: boolean
}

interface ComboboxProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (option: ComboboxOption) => void
  options: ComboboxOption[]
  placeholder?: string
  className?: string
}

export function Combobox({ value, onChange, onSelect, options, placeholder, className }: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [focusIndex, setFocusIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const query = value.toLowerCase()
  const filtered = query.length > 0
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query) ||
          (o.sublabel && o.sublabel.toLowerCase().includes(query))
      )
    : []

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(option: ComboboxOption) {
    onChange(option.label)
    onSelect?.(option)
    setOpen(false)
    setFocusIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || filtered.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setFocusIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setFocusIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1))
    } else if (e.key === "Enter" && focusIndex >= 0) {
      e.preventDefault()
      handleSelect(filtered[focusIndex])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setFocusIndex(-1)
        }}
        onFocus={() => { if (value.length > 0) setOpen(true) }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {filtered.map((option, i) => (
            <button
              key={option.label}
              type="button"
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                i === focusIndex ? "bg-gray-50" : "hover:bg-gray-50",
                i > 0 && "border-t border-gray-50"
              )}
              onMouseEnter={() => setFocusIndex(i)}
              onClick={() => handleSelect(option)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-gray-900 truncate">{option.label}</span>
                  {option.isExisting && (
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">Asiakas</Badge>
                  )}
                </div>
                {(option.sublabel || option.detail) && (
                  <p className="text-[11px] text-gray-500 truncate">
                    {[option.sublabel, option.detail].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
