// Vasemman työmääräin-sidebarin värimääritykset (UnifiedLayout).
// MainSidebar.tsx on täysin itsenäinen — muuta sen värit siellä.
// Kaikki värit tulevat index.css:n @theme-tokeneista.

export const SIDEBAR_SHADOW_CLASS = "shadow-sidebar"
export const SIDEBAR_WIDTH_CLASS = "w-70"

// Työmääräin-sidebarin tausta — muuta token: --color-sidebar-workorder (index.css)
export const WORK_ORDER_SIDEBAR_BG = "bg-[var(--color-sidebar-workorder)]"

export const NAV_ITEM_TEXT_CLASS =
  "h-11 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-sidebar-nav-text)] transition-colors hover:bg-[var(--color-sidebar-nav-hover)] hover:text-white no-underline"
export const NAV_ITEM_ACTIVE_CLASS = "bg-[var(--color-sidebar-nav-active)] text-white"
export const NAV_ICON_CLASS = "h-6 w-6 text-[var(--color-sidebar-nav-text)] shrink-0"

export const COLLAPSED_NAV_ITEM_CLASS =
  "flex items-center justify-center rounded-lg size-8 text-[var(--color-sidebar-nav-text)] hover:text-white hover:bg-[var(--color-sidebar-nav-hover)] transition-colors no-underline"
export const COLLAPSED_NAV_ITEM_ACTIVE_CLASS = "text-white bg-[var(--color-sidebar-nav-active)]"

export const TOGGLE_BUTTON_CLASS =
  "flex items-center justify-center rounded-lg size-8 text-[var(--color-sidebar-nav-text)] hover:text-white hover:bg-[var(--color-sidebar-nav-hover)] transition-colors"

export const SECTION_LABEL_CLASS = "text-[11px] font-semibold text-[var(--color-sidebar-nav-text)] tracking-[1px] opacity-60"

export const LOGO_LINK_CLASS = "text-xl font-semibold text-[var(--color-text-on-dark)] no-underline hover:text-white"
export const LOGO_ICON_CLASS =
  "flex items-center justify-center rounded-lg size-8 bg-[#394ef7] text-white text-base font-semibold no-underline shrink-0 mb-1"

export const USER_FOOTER_CLASS = "p-4 border-t border-[var(--color-sidebar-border)]"
export const USER_AVATAR_CLASS =
  "flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 text-xs font-semibold text-[var(--color-text-on-dark)] shrink-0"
export const USER_NAME_CLASS = "text-sm font-semibold text-[var(--color-text-on-dark)] truncate"
export const USER_ROLE_CLASS = "text-xs text-[var(--color-sidebar-nav-text)]"
