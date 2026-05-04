# EarthMind: Pre-Development Skill & Tooling Analysis

This document provides a comprehensive, `skills.sh` roadmap for building the EarthMind platform. It maps out the exact capabilities you should install via `npx skills add` to enhance your AI agent for this specific architecture.

## 1. Frontend & Geospatial UI

### `wshobson/agents@nextjs-app-router-patterns`
* **Install Command**: `npx skills add wshobson/agents@nextjs-app-router-patterns`
* **Parent Category**: Frontend
* **Relevance**: Best practices for Next.js 14+, App Router, and Server Components, ensuring the foundation of EarthMind is robust.
* **Priority**: HIGH
* **Requirement Timeline**: REQUIRED NOW (Phase 1)

### `secondsky/claude-skills@tailwind-v4-shadcn`
* **Install Command**: `npx skills add secondsky/claude-skills@tailwind-v4-shadcn`
* **Parent Category**: Frontend / Design System
* **Relevance**: Crucial for achieving the "visually elite" and "Palantir-style" aesthetic rapidly using Shadcn UI and Tailwind.
* **Priority**: HIGH
* **Requirement Timeline**: REQUIRED NOW (Phase 1)

### `mapbox/mapbox-agent-skills@mapbox-geospatial-operations`
* **Install Command**: `npx skills add mapbox/mapbox-agent-skills@mapbox-geospatial-operations`
* **Parent Category**: Geospatial
* **Relevance**: Although Mapbox-specific, it gives the agent immense geospatial context for rendering maps, handling GeoJSON, and dealing with bounding boxes (easily transferable to Leaflet).
* **Priority**: HIGH
* **Requirement Timeline**: REQUIRED NOW (Phase 1)

## 2. Backend & API Integration

### `wshobson/agents@fastapi-templates`
* **Install Command**: `npx skills add wshobson/agents@fastapi-templates`
* **Parent Category**: Backend
* **Relevance**: The high-performance backend serving map metadata, triggering AI inference, and handling temporal analytics queries. Provides production async patterns.
* **Priority**: HIGH
* **Requirement Timeline**: REQUIRED SOON (Phase 3)

### `thebushidocollective/han@fastapi-async-patterns`
* **Install Command**: `npx skills add thebushidocollective/han@fastapi-async-patterns`
* **Parent Category**: Backend
* **Relevance**: Ensures all spatial queries and AI inference queues are non-blocking.
* **Priority**: MEDIUM
* **Requirement Timeline**: Phase 3

## 3. Computer Vision & Intelligence

### `mindrally/skills@computer-vision-opencv`
* **Install Command**: `npx skills add mindrally/skills@computer-vision-opencv`
* **Parent Category**: AI / CV
* **Relevance**: Essential for lower-level image processing and detection logic that will run on CPU/Integrated GPU.
* **Priority**: HIGH
* **Requirement Timeline**: Phase 4 (AI Overlays)

### `wshobson/agents@kpi-dashboard-design`
* **Install Command**: `npx skills add wshobson/agents@kpi-dashboard-design`
* **Parent Category**: Analytics / UI
* **Relevance**: Provides structural patterns for intelligence-style dashboards, matching the "Palantir-style" requirement.
* **Priority**: HIGH
* **Requirement Timeline**: Phase 6 (Dashboard System)

## 4. Geospatial Data Pipeline

### `erichowens/some_claude_skills@geospatial-data-pipeline`
* **Install Command**: `npx skills add erichowens/some_claude_skills@geospatial-data-pipeline`
* **Parent Category**: Geospatial Data
* **Relevance**: Handling raster data, imagery processing, and pipeline construction before passing it to AI models.
* **Priority**: HIGH
* **Requirement Timeline**: LATER (Phase 4)

## 4. Local AI & Reporting

### `yoanbernabeu/grepai-skills@grepai-ollama-setup`
* **Install Command**: `npx skills add yoanbernabeu/grepai-skills@grepai-ollama-setup`
* **Parent Category**: Local AI
* **Relevance**: Provides the workflows for setting up local models without cloud APIs. Used to generate the "Intelligence Reports" from anomaly data.
* **Priority**: HIGH
* **Requirement Timeline**: LATER (Phase 7)

---

## Master Skill Integration Tree (skills.sh)

Run these commands in your project to give your AI agent the necessary context:

**Phase 1 Execution (Do Now):**
```bash
npx skills add wshobson/agents@nextjs-app-router-patterns
npx skills add secondsky/claude-skills@tailwind-v4-shadcn
npx skills add mapbox/mapbox-agent-skills@mapbox-geospatial-operations
```

**Phase 3 Execution (Backend):**
```bash
npx skills add wshobson/agents@fastapi-templates
```

**Phase 4+ Execution (Data & AI):**
```bash
npx skills add erichowens/some_claude_skills@geospatial-data-pipeline
npx skills add mindrally/skills@computer-vision-opencv
npx skills add yoanbernabeu/grepai-skills@grepai-ollama-setup
```

**Phase 6 Execution (Analytics):**
```bash
npx skills add wshobson/agents@kpi-dashboard-design
```

---

# PHASE 1: MAP FOUNDATION

**Goal**: Rapidly build professional geospatial frontend.

### Architecture Evolution (Phase 1)
```text
earthmind/
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router (Layouts, Pages)
│   │   ├── components/         # Shadcn UI + EarthMind custom components
│   │   │   ├── map/            # Leaflet map wrappers (Client Components)
│   │   │   ├── dashboard/      # UI Panels
│   │   │   └── ui/             # Reusable Shadcn elements
│   │   ├── lib/                # Utils (Tailwind merge, etc.)
│   │   └── styles/             # globals.css
│   ├── package.json
│   └── tailwind.config.ts
└── README.md
```

# PHASE 4: REAL-WORLD CONNECTIVITY & HARDENING
**Focus**: From Simulation to Reality.

### Key Workflows:
1. **Satellite Fetcher (Sentinel-2)**:
   - Use `httpx` to interface with Sentinel Hub.
   - Fetch 10m/pixel data based on Map bounding boxes.
2. **Temporal Database (SQLite Evolution)**:
   - Schema update: `ALTER TABLE anomalies ADD COLUMN scan_id TEXT`.
   - Schema update: `ALTER TABLE anomalies ADD COLUMN timestamp DATETIME`.
3. **Dashboard Evolution**:
   - Create `HistoryPanel` for report archiving.
   - Integrate `TimelineSlider` using Radix UI/Shadcn.

### Required Skills (Already Added):
- `mapbox-geospatial-operations`
- `fastapi-templates`
- `computer-vision-opencv`
- `grepai-ollama-setup`

