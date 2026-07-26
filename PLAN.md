# PLAN.md — Relay Service Desk

## APP
- Name: Relay
- An IT service management (ITSM) console for an internal service desk: incident/request
  queue, SLA tracking, service catalog, knowledge base, and an operations dashboard.
- Target users: IT support agents (primary) and the service-desk manager (secondary).
- Primary device: desktop (dense, data-heavy console); fully responsive down to tablet
  and usable on mobile (queue collapses to cards, sidebar becomes a drawer).

## FEATURES

1. **Operations dashboard**
   Landing view summarizing service-desk health at a glance. Shows KPI stat tiles (Open
   tickets, Unassigned, Breaching SLA, Resolved today, Avg. first-response time), an
   area chart of ticket volume (created vs. resolved) over the last 14 days, a donut of
   open tickets by priority, a bar of open tickets by status, an agent-workload list
   (open tickets per agent), and a recent-activity feed. All figures derive from the
   ticket dataset.
   *Acceptance:* Every tile shows a real computed number; "Breaching SLA" counts tickets
   whose SLA due time is in the past and status is not Resolved/Closed; charts render
   from seed data; clicking a KPI tile navigates to Tickets pre-filtered (e.g.
   Unassigned → assignee=Unassigned). Loading shows skeletons; if the dataset is empty,
   a dashboard empty state invites creating the first ticket.

2. **Ticket queue (list)**
   The core working surface: a sortable, filterable table of all tickets. Columns: Key
   (e.g. INC-1042), Subject, Type (Incident/Request), Priority, Status, Assignee,
   Requester, SLA (live countdown / "Breached"), Updated. Toolbar: text search
   (subject/key/requester), and filters for Status, Priority, Type, and Assignee, plus a
   quick "My tickets" / "Unassigned" toggle. Sortable by Priority, SLA, Updated, Created.
   *Acceptance:* Filters and search combine (AND) and update the table instantly;
   sorting works on the named columns; SLA cell shows a live-relative countdown colored
   by urgency (breached=error, <2h=warning, else normal); row click opens ticket detail;
   result count is shown ("48 of 60 tickets"). States: skeleton rows while loading, a
   distinct empty state when filters match nothing (with a "Clear filters" action) vs.
   when there are no tickets at all.

3. **Create ticket**
   A dialog to log a new incident or request. Fields: Type (Incident/Request), Subject
   (required), Description, Requester (select from people), Category (Hardware, Software,
   Network, Access, Email, Other), Priority (Low/Medium/High/Urgent), Assignee
   (optional, defaults Unassigned). On submit, a Key is generated (INC-#### for
   incidents, REQ-#### for requests), status set to New, an SLA due time computed from
   priority, and a "created" activity entry added.
   *Acceptance:* Subject required (inline error if empty); Key auto-increments and is
   unique; new ticket appears at the top of the queue; success toast; ticket persists
   across reload.

4. **Ticket detail & work**
   Full ticket record on its own route. Left/main column: header (Key, subject, type
   badge), description, and an activity timeline mixing comments and system events
   (status changes, assignments, priority changes) in reverse-chronological order, with
   a comment/worklog composer (public reply vs. internal note toggle). Right rail:
   editable properties — Status, Priority, Assignee, Category — plus an SLA panel
   (target, due time, time remaining / breached) and requester info.
   *Acceptance:* Editing a property updates the ticket, appends a system activity entry,
   and toasts; posting a comment prepends it to the timeline and updates "Updated";
   resolving a ticket sets Resolved and stops the SLA clock; changes persist. Unknown
   ticket key shows a not-found state with a link back to the queue.

5. **SLA tracking & priority**
   Each priority carries a response/resolution target (Urgent 2h, High 8h, Medium 24h,
   Low 72h). SLA due = created + target. The queue and detail show remaining time; the
   dashboard counts breaches. Breached and near-breach tickets are visually flagged.
   *Acceptance:* Due time computed correctly per priority; countdown recomputes on view;
   breach state is consistent between queue, detail, and dashboard; changing priority on
   an open ticket recomputes the SLA due time and logs it.

6. **Service catalog**
   A browsable catalog of requestable IT services grouped by category (e.g. "New laptop",
   "Software license", "VPN access", "Password reset", "Mailing list", "Onboarding
   kit"), each a card with icon, name, short description, and typical fulfillment time.
   "Request this" opens the Create-ticket dialog pre-filled (Type=Request, Category,
   Subject) so a request becomes a tracked ticket.
   *Acceptance:* Catalog searchable and filterable by category; requesting an item
   creates a REQ ticket and routes to it (or toasts + shows in queue); empty search
   shows a "no services match" state.

7. **Knowledge base**
   Searchable library of help articles grouped by category, each with title, category,
   excerpt, author, updated date, and view count. List/grid view with search + category
   filter; clicking opens a reader view with formatted article body and related
   articles. From a ticket, agents can reference articles.
   *Acceptance:* Search matches title/excerpt/body; category filter works; reader shows
   full body and increments a session view count; empty search and empty category states
   designed; unknown article slug shows not-found.

8. **Global search & navigation**
   Persistent sidebar navigation (Dashboard, Tickets, Catalog, Knowledge, plus a "New
   ticket" button) and a top bar with global search (jumps to matching ticket by key or
   subject), theme toggle, and the current agent's avatar/name.
   *Acceptance:* Active route highlighted; New-ticket button available from every screen;
   global search returns ticket matches and navigates on select; sidebar collapses to a
   drawer under the tablet breakpoint.

## SCREENS

- **Dashboard** (`/`) — KPI tiles, volume area chart, priority donut, status bar chart,
  agent workload list, recent activity feed. Empty state: "No tickets yet — log your
  first one." Loading: skeleton tiles + chart placeholders.
- **Tickets** (`/tickets`) — toolbar (search + filters + My/Unassigned toggles), result
  count, data table with live SLA countdowns, New-ticket button. Empty states: no-match
  (clear filters) and no-tickets-at-all.
- **Ticket detail** (`/tickets/:key`) — header, description, activity timeline +
  composer, right-rail properties + SLA panel + requester. Not-found state for bad keys.
- **Service Catalog** (`/catalog`) — search + category chips, grid of service cards,
  "Request this" action. Empty state for no matches.
- **Knowledge Base** (`/knowledge`) — search + category filter, article cards. Empty
  states for no-match / empty category.
- **Article reader** (`/knowledge/:slug`) — title, meta, formatted body, related
  articles, back link. Not-found for bad slug.
- **Create-ticket dialog** — reachable from anywhere; validated form (see Feature 3).

## DATA MODEL & STATE

PERSISTENCE: local
AUTH: public

Rationale: user chose no backend, so all data lives in the browser via a zustand store
persisted to localStorage (seeded on first run). No sign-in concept — this is a
single-agent demo console; a fixed "current agent" is assumed (no login page). Store in
`src/lib/store.ts` holds only UI state (filters, search text, dialog open, selection,
sorting); the seeded domain data lives in a persisted store and is read through data
hooks in `src/data/` (e.g. `useTickets`, `useTicket`, `useAgents`, `useCatalog`,
`useArticles`, `useDashboardMetrics`) that expose loading/error/empty + mutators.

**Entities**

- **Ticket**: `id`, `key` (INC-#### / REQ-####), `type` ("incident" | "request"),
  `subject`, `description`, `status` ("new" | "in_progress" | "on_hold" | "resolved" |
  "closed"), `priority` ("low" | "medium" | "high" | "urgent"), `category` ("hardware" |
  "software" | "network" | "access" | "email" | "other"), `requesterId`, `assigneeId |
  null`, `createdAt` (ISO), `updatedAt` (ISO), `slaDueAt` (ISO), `resolvedAt | null`,
  `activity`: Activity[].
- **Activity**: `id`, `type` ("comment" | "system"), `authorId`, `body` (comment text or
  system message like "changed status New → In Progress"), `visibility` ("public" |
  "internal", comments only), `createdAt`.
- **Agent** (a.k.a. person): `id`, `name`, `email`, `role` ("agent" | "manager" |
  "requester"), `avatarUrl` (initials-based, no external asset), `team`.
- **CatalogService**: `id`, `name`, `description`, `category`, `icon` (lucide name),
  `fulfillmentTime` (e.g. "1–2 business days").
- **Article**: `id`, `slug`, `title`, `category` ("Getting Started" | "Hardware" |
  "Software" | "Network" | "Accounts" | "Email"), `excerpt`, `body` (markdown-ish
  paragraphs/lists), `authorId`, `updatedAt`, `views`.

**Seed data (realistic, plentiful):**
- **60 tickets** spanning all statuses, priorities, types, and categories, with
  createdAt spread across the last ~14 days and varied assignees (including ~8
  unassigned); SLA due times computed per priority so several are breached and several
  are near-breach; each ticket has 2–6 activity entries (mix of system events and
  comments). Keys sequential per type.
- **10 agents/people** with realistic names, emails, roles (mostly agents, one manager,
  several requesters), teams (Service Desk, Infrastructure, Endpoint).
- **12 catalog services** across categories with sensible descriptions and fulfillment
  times.
- **14 knowledge articles** across the 6 categories with multi-paragraph bodies,
  excerpts, authors, updated dates, and view counts.
- Constants (statuses, priorities, categories, SLA targets, priority/status colors) live
  in `src/lib/constants.ts` as `as const` objects + union types (no enums, no magic
  strings).

## COMPONENTS
- **Layout/nav:** Sidebar (custom, using `sidebar` tokens), Sheet (mobile drawer),
  Avatar, Button, Input (top-bar search), DropdownMenu (agent menu), Separator, Tooltip.
- **Dashboard:** Card, Badge, recharts (AreaChart, PieChart/donut, BarChart via
  `var(--chart-1..5)`), Skeleton, ScrollArea (activity feed).
- **Tickets:** Table, Badge (status/priority/SLA), Select + Input + Toggle/ToggleGroup
  (filters), Button, DropdownMenu (row actions), Skeleton, Pagination or virtualized
  scroll if long.
- **Create ticket:** Dialog, Form fields (Input, Textarea, Select), Label, Button,
  sonner toast.
- **Ticket detail:** Card, Tabs (Activity / Details on mobile), Badge, Select (inline
  property edit), Textarea + Toggle (comment composer), Avatar, Separator, timeline
  (custom list).
- **Catalog:** Card, Badge, Input (search), ToggleGroup (category), Button.
- **Knowledge:** Card, Input, Badge, ScrollArea; reader uses Prose-styled article body.
- **Shared:** StatusBadge / PriorityBadge / SlaBadge components mapping domain values to
  semantic tokens; EmptyState component; PageHeader component. Toaster already mounted.

## DESIGN SYSTEM

- **Color mode:** Dark (default), with a working light toggle. Scene: an IT support
  agent watches an incident queue and SLA countdowns for a full 8-hour shift in an
  office/ops room — a dark console reduces glare fatigue and lets amber urgency signals
  pop. Dark is the right home; light exists for personal preference and bright rooms.
- **Color strategy:** Restrained-committed. A near-neutral dark ops surface (tinted a
  hair toward the brand amber hue) carries the data; a single honey-amber primary is the
  signature, reserved for primary actions, active nav, focus rings, and the priority/SLA
  urgency it naturally reads as. Status semantics use a small deliberate palette; color
  is never decorative.
- **Palette (OKLCH, dark default):** background `oklch(0.16 0.008 65)`, foreground
  `oklch(0.93 0.006 65)`, card `oklch(0.19 0.008 65)`, popover `oklch(0.20 0.008 65)`,
  primary `oklch(0.78 0.15 68)` (honey amber) with primary-foreground
  `oklch(0.20 0.03 68)` (dark ink — amber reads bright, so dark text stays crisp on it),
  secondary `oklch(0.26 0.01 65)`, muted `oklch(0.24 0.01 65)`, muted-foreground
  `oklch(0.72 0.01 65)`, accent surface `oklch(0.30 0.02 65)`, border/input
  `oklch(0.28 0.01 65)`, ring `oklch(0.78 0.15 68)`. Neutrals carry ~0.008 chroma toward
  hue 65 for cohesion (never a cream/sand near-white). Light mode: pure-white
  background, ink `oklch(0.22 0.01 65)`, same amber primary at `oklch(0.70 0.15 65)`.
  Full token set (both modes) is in `theme.json`.
- **Semantic colors (status/priority), mapped to real values:**
  - Status: New → info blue `chart-2` `oklch(0.62 0.12 250)`; In Progress → amber
    `primary`; On Hold → muted/neutral; Resolved → green `oklch(0.68 0.13 160)`; Closed →
    muted foreground.
  - Priority: Low → neutral/muted; Medium → blue `chart-2`; High → amber `primary`;
    Urgent → red/destructive `oklch(0.60 0.19 25)`.
  - SLA: breached → destructive; near-breach (<2h) → amber warning; healthy → muted/green.
  - Success/warning/error/info reuse green/amber/red/blue above, consistently.
- **Chart ramp (deliberate multi-hue):** chart-1 amber `0.78 0.15 68`, chart-2 steel
  blue `0.62 0.12 250`, chart-3 teal-green `0.68 0.12 165`, chart-4 rose `0.65 0.16 15`,
  chart-5 violet `0.62 0.12 300` — five distinct hues, not tints of one.
- **Contrast (WCAG AA):** foreground on background and on cards ≥ 7:1; muted-foreground
  `0.72` on dark surfaces ≥ 4.5:1 for body; dark ink foreground on amber primary and
  white on red/blue/green fills all verified AA; no light-gray-on-tint body text.
- **Font:** Headings **Familjen Grotesk** (a characterful grotesque — precise,
  operational, slightly mechanical); body **Public Sans** (a humanist, highly legible
  workhorse with strong tabular figures for dense tables and SLA/number columns).
  Grotesque + humanist is a real contrast axis, not two similar sans. Use `font-variant-
  numeric: tabular-nums` for all ticket keys, counts, and SLA/time columns. Loaded via
  the Google Fonts href in `theme.json`.
- **Layout:** Left sidebar (nav + New-ticket) using `sidebar` tokens; top bar with
  global search + theme toggle + agent menu; content zone max-width fluid for tables,
  constrained (~72ch) for the article reader. Density: dense (compact table rows, tight
  KPI tiles) — this is a working console. Under the tablet breakpoint the sidebar
  collapses into a Sheet drawer and the ticket table reflows to stacked cards.
- **Dark-mode strategy:** single set of semantic tokens swapped via the `.dark` class
  (both token sets defined in `theme.json`); no per-component color overrides. Depth in
  dark mode comes from surface lightness steps (bg 0.16 → card 0.19 → popover 0.20), not
  shadows.
- **Corner radius:** `0.25rem` (crisp). Reason: a dense data console with tables, badges,
  and status chips reads sharper and more instrument-like with crisp corners; soft/pill
  rounding would soften the precision the product is selling.
- **Motion:** 150–220ms ease-out on hover/focus/state changes and dialog/drawer
  transitions; SLA countdowns update quietly; list rows stagger subtly on first load
  only. Full `prefers-reduced-motion` fallbacks (crossfade/instant). No decorative or
  page-load choreography.
- Avoid all AI-default tells: no purple gradients, no gradient text, no cream/sand body
  bg, no glassmorphism, no colored side-stripe borders (status shown via full badges,
  not left stripes), no ghost-card border+big-shadow pairing.

## NOTES
- Resolved defaults (user gave no preferences): primary user = IT support agent; v1 =
  incidents + requests, SLA tracking, service catalog, knowledge base, and analytics
  dashboard; ticket model = Priority + Category + Status workflow (New → In Progress →
  On Hold → Resolved → Closed) with incidents & requests as ticket types; persistence =
  local (localStorage). These are the higher-ceiling reading of "an ITSM app."
- Non-goals for v1: real authentication/roles/permissions, change & problem management
  as separate ITIL modules, asset/CI inventory, email ingestion, multi-tenant orgs, real
  backend/API. The data model leaves room to add these later.
- SLA countdowns are computed live from `slaDueAt`; "now" is the current time, so the
  seed spread must keep several tickets breached/near-breach at any run.
- Avatars are initials-based (no external image assets); every icon is lucide-react.
