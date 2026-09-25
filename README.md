# JOKI Myynti-Peli (Joki-MP)

JOKI Myynti-Peli is an event sales work order management system (työmääräinjärjestelmä) for a Finnish venue. It covers the full lifecycle of an event booking — from lead capture through space selection, catering and AV planning, partner collaboration, offer generation, and client approval.

The application is a frontend-only demo/prototype. All data lives in React state initialized from mock data. There is no backend or API — the focus is on UI flows and interaction design.

The UI language is Finnish throughout.

## Features

- **Kanban board** — Work orders across five pipeline stages (Uusi → Työn alla → Asiakkaalla → Vahvistettu → Toteutunut)
- **Calendar view** — Monthly and weekly views of all events with navigation and click-to-open
- **Work order management** — Lead creation form, event day management, basic info editing, status tracking
- **Space selection** — Browse venue spaces with capacity, features, pricing and availability. Select spaces and send options to client
- **Schedule/timeline** — Unified event timeline aggregating program phases, catering moments, and AV items
- **Catering planning** — Provider selection, requirement briefs, serving moment creation (individual or bulk text-parse), product assignment from menu catalog
- **AV/technical requirements** — Microphones, audio, screens, streaming, recording
- **Product & menu management** — Full CRUD for menus and products with ERP-grade fields (D365 code, bilingual names, VAT%, dietary tags, validity dates)
- **Additional services** — Photography, decoration, cloakroom, parking, security
- **Team collaboration** — Invite partners via email or suggested list, assign section access, per-section chat
- **Offer generation** — Auto-calculated pricing from spaces + catering + AV with ALV 25.5%
- **Client portal** — Customer-facing offer view with accept, reject, request changes, and chat with seller

### Multi-Mode Demo

The app has a mode switcher bar at the top of the screen for viewing the same work order from three perspectives:

| Mode | Description |
|------|-------------|
| **Myyjä** (Seller) | Full access to all work order sections. Default mode |
| **Kumppani** (Partner) | Scoped view for external partners (catering, AV). Only sees assigned sections |
| **Asiakas** (Client) | Read-only customer portal showing the offer and pricing |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm (included with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd joki-mp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app runs at [http://localhost:5173](http://localhost:5173).

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | Run Oxlint |
| `npm run preview` | Preview the production build locally |

## Tech Stack

- **React 19** with TypeScript
- **Vite 8** — Build tool with HMR
- **Tailwind CSS v4** — Styling with custom theme tokens (navy palette, status colors)
- **Radix UI** — Accessible primitives (dialog, select, checkbox, tooltip, tabs, etc.)
- **React Router v7** — Client-side routing with Finnish-language paths
- **Lucide React** — Icons
- **date-fns** — Date formatting with Finnish locale
- **Oxlint** — Linting with React and TypeScript rules

## Project Structure

```
src/
├── components/
│   ├── ui/          # Base UI components (Button, Badge, Input, Dialog, Select, etc.)
│   ├── layout/      # Layout shells (UnifiedLayout, MainLayout, ModeSwitcher, TopBar, etc.)
│   ├── common/      # Shared components (DayTabs, TaskList, SectionChat, StatusBadge, etc.)
│   ├── kanban/      # Kanban board, columns, and cards
│   └── team/        # InviteDialog for partner onboarding
├── pages/
│   ├── work-order/  # Seller view pages (Overview, Spaces, Schedule, Catering, AV, Offer, etc.)
│   ├── partner/     # Partner view pages (PartnerCatering, PartnerAV, PartnerProducts, etc.)
│   └── client/      # Client portal pages
├── context/         # React Context providers (WorkOrder, Team, Chat, Menu, Mode)
├── data/            # TypeScript types and mock data
├── hooks/           # Custom hooks
└── lib/             # Utilities (cn helper, date formatting)
```

## Mock Data

The demo includes pre-populated data for a realistic scenario:

- **13 work orders** across all pipeline stages
- **4 venue spaces** (Cave-teatteri, Aula, Neuvotteluhuone, Studio)
- **2 catering providers** (Mauno Catering, Unica Catering) with 6 menus and 24 products
- **9 schedule items** on the primary work order
- **3 catering moments** with per-person pricing
