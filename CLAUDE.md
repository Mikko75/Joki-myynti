# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JOKI Myynti-Peli (Joki-MP) is an event sales work order management system ("työmääräinjärjestelmä") for a Finnish venue. It is a frontend-only demo/prototype — all data lives in React state initialized from mock data, with no backend or API.

The UI language is Finnish. Route paths, type names, status values, and labels use Finnish terminology throughout.

## Commands

- `npm run dev` — Start Vite dev server (http://localhost:5173)
- `npm run build` — TypeScript check + Vite production build
- `npm run lint` — Run Oxlint

There are no tests configured.

## Architecture

### Multi-Mode System

The app has three viewing modes, toggled via `ModeSwitcher` (a bar at the very top of the screen):

- **Seller (myyjä)** — Full access to all work order sections. Default mode.
- **Partner (kumppani)** — Scoped view for external partners (catering, AV). Partners see only sections assigned to them via `TeamContext`. Partner members are added dynamically through `InviteDialog`.
- **Client (asiakas)** — Read-only customer portal showing the offer.

Mode state is held in `ModeContext`. The `ModeRouter` component uses mode-aware router components (`CateringRouter`, `AVRouter`, etc.) that render different page components based on the active mode — seller pages live in `pages/work-order/`, partner pages in `pages/partner/`, client pages in `pages/client/`.

**Critical constraint:** There is a single `Routes` tree in `App.tsx` and one `UnifiedLayout` that adapts its sidebar navigation, participant bar, and right panel based on mode. Do not create separate layout components per mode.

### Routing

Finnish-language routes under `/tyomarain/:id/*`:
- `yleiskuva` (overview), `tilat` (spaces), `aikataulu` (schedule), `catering`, `av`, `lisapalvelut` (services), `tuotteet` (products), `keskustelut`/`keskustelu` (conversations), `tarjous` (offer), `asiakas-chat`, `asiakas` (client portal)

Top-level: `/` (Kanban board), `/kalenteri` (calendar), `/uusi-liidi` (new lead form).

### State Management

All state is React Context — no external state library:

- `WorkOrderContext` — Work orders, schedule items, catering plans, AV plans. Initialized from `data/mock.ts`.
- `TeamContext` — Partner team members and their section assignments. Starts empty; members are added at runtime.
- `ChatContext` — Per-section messaging between participants.
- `MenuContext` — Catering menus and products per partner. Initialized from mock data.
- `ModeContext` — Current viewing mode and user identity.

### UI Stack

- Tailwind CSS v4 with `@theme` custom tokens in `index.css` (navy palette, primary blues, status colors)
- Radix UI primitives for dialogs, selects, checkboxes, tooltips, scroll areas
- shadcn/ui-style components in `components/ui/` (Button, Badge, Input, Select, etc.)
- Lucide React for icons
- Path alias: `@` → `src/`

### Key Domain Types

Defined in `data/types.ts`. Central entity is `WorkOrder`, which contains `EventDay[]` with spaces, schedule items. Related entities: `CateringPlan`, `AVPlan`, `Offer`, `Menu`, `Product`. Status enums use Finnish values (`uusi`, `tyonalla`, `asiakkaalla`, `vahvistettu`, `toteutunut`).
