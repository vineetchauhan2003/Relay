// Domain vocabulary for Relay ITSM. All statuses/priorities/categories are `as const`
// objects + union types (no enums, no magic strings elsewhere in the app).

export const TICKET_TYPES = {
  incident: 'Incident',
  request: 'Request',
} as const
export type TicketType = keyof typeof TICKET_TYPES

export const STATUSES = {
  new: 'New',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  resolved: 'Resolved',
  closed: 'Closed',
} as const
export type Status = keyof typeof STATUSES
export const STATUS_ORDER: Status[] = ['new', 'in_progress', 'on_hold', 'resolved', 'closed']
export const OPEN_STATUSES: Status[] = ['new', 'in_progress', 'on_hold']

export const PRIORITIES = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
} as const
export type Priority = keyof typeof PRIORITIES
export const PRIORITY_ORDER: Priority[] = ['urgent', 'high', 'medium', 'low']
// numeric weight for sorting (higher = more urgent)
export const PRIORITY_WEIGHT: Record<Priority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
}

export const CATEGORIES = {
  hardware: 'Hardware',
  software: 'Software',
  network: 'Network',
  access: 'Access',
  email: 'Email',
  other: 'Other',
} as const
export type Category = keyof typeof CATEGORIES

// SLA resolution targets in hours, keyed by priority.
export const SLA_TARGET_HOURS: Record<Priority, number> = {
  urgent: 2,
  high: 8,
  medium: 24,
  low: 72,
}

// near-breach window: an open ticket due within this many ms reads as "warning".
export const NEAR_BREACH_MS = 2 * 60 * 60 * 1000

// Semantic token class per status badge (background wash + readable foreground).
// Uses theme tokens only — never raw color literals.
export const STATUS_STYLES: Record<Status, string> = {
  new: 'bg-[color-mix(in_srgb,var(--chart-2)_18%,transparent)] text-[var(--chart-2)]',
  in_progress: 'bg-[color-mix(in_srgb,var(--primary)_18%,transparent)] text-primary',
  on_hold: 'bg-muted text-muted-foreground',
  resolved: 'bg-[color-mix(in_srgb,var(--chart-3)_18%,transparent)] text-[var(--chart-3)]',
  closed: 'bg-secondary text-muted-foreground',
}

export const PRIORITY_STYLES: Record<Priority, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-[color-mix(in_srgb,var(--chart-2)_18%,transparent)] text-[var(--chart-2)]',
  high: 'bg-[color-mix(in_srgb,var(--primary)_20%,transparent)] text-primary',
  urgent: 'bg-[color-mix(in_srgb,var(--destructive)_20%,transparent)] text-destructive',
}

// A stable per-priority dot color (for charts / legends), using chart tokens.
export const PRIORITY_CHART_VAR: Record<Priority, string> = {
  urgent: 'var(--chart-4)',
  high: 'var(--chart-1)',
  medium: 'var(--chart-2)',
  low: 'var(--chart-5)',
}

export const STATUS_CHART_VAR: Record<Status, string> = {
  new: 'var(--chart-2)',
  in_progress: 'var(--chart-1)',
  on_hold: 'var(--chart-5)',
  resolved: 'var(--chart-3)',
  closed: 'var(--chart-4)',
}

export const STORAGE_KEY = 'relay-itsm-data-v1'
export const CURRENT_AGENT_ID = 'agent-1'
export const UNASSIGNED = 'unassigned'

export const DASHBOARD_VOLUME_DAYS = 14
export const ACTIVITY_FEED_LIMIT = 8

export type Role = 'agent' | 'manager' | 'requester'
export type Visibility = 'public' | 'internal'
export type ActivityType = 'comment' | 'system'

export interface Activity {
  id: string
  type: ActivityType
  authorId: string
  body: string
  visibility?: Visibility
  createdAt: string
}

export interface Ticket {
  id: string
  key: string
  type: TicketType
  subject: string
  description: string
  status: Status
  priority: Priority
  category: Category
  requesterId: string
  assigneeId: string | null
  createdAt: string
  updatedAt: string
  slaDueAt: string
  resolvedAt: string | null
  activity: Activity[]
}

export interface Agent {
  id: string
  name: string
  email: string
  role: Role
  team: string
}

export interface CatalogService {
  id: string
  name: string
  description: string
  category: Category
  icon: string
  fulfillmentTime: string
}

export const ARTICLE_CATEGORIES = [
  'Getting Started',
  'Hardware',
  'Software',
  'Network',
  'Accounts',
  'Email',
] as const
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number]

export interface Article {
  id: string
  slug: string
  title: string
  category: ArticleCategory
  excerpt: string
  body: string[]
  authorId: string
  updatedAt: string
  views: number
}
