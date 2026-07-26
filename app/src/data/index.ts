// Data layer — ALL data access for the app lives here. This is a local
// (localStorage) app: the hooks wrap the persisted zustand data-store and the
// static reference data, exposing loading/error/empty semantics plus mutators.
// Components import from '@/data' and never touch the store directly.

import { useMemo } from 'react'
import {
  ACTIVITY_FEED_LIMIT,
  DASHBOARD_VOLUME_DAYS,
  OPEN_STATUSES,
  PRIORITIES,
  PRIORITY_ORDER,
  STATUS_ORDER,
  STATUSES,
  type Agent,
  type Article,
  type CatalogService,
  type Priority,
  type Status,
  type Ticket,
} from '@/lib/constants'
import { agents, articles, catalog, useDataStore } from '@/lib/data-store'
import { getSlaState, isBreaching } from '@/lib/sla'

export function useAgents(): Agent[] {
  return agents
}

export function useAgentMap(): Record<string, Agent> {
  return useMemo(() => Object.fromEntries(agents.map((a) => [a.id, a])), [])
}

export function agentName(id: string | null): string {
  if (!id) return 'Unassigned'
  return agents.find((a) => a.id === id)?.name ?? 'Unknown'
}

export function useTickets() {
  const tickets = useDataStore((s) => s.tickets)
  return { tickets, loading: false, error: null as unknown }
}

export function useTicket(key: string | undefined) {
  const ticket = useDataStore((s) => s.tickets.find((t) => t.key === key))
  return { ticket, loading: false, error: null as unknown }
}

// Mutators — return the store actions.
export function useTicketActions() {
  const createTicket = useDataStore((s) => s.createTicket)
  const updateTicket = useDataStore((s) => s.updateTicket)
  const addComment = useDataStore((s) => s.addComment)
  const resolveTicket = useDataStore((s) => s.resolveTicket)
  return { createTicket, updateTicket, addComment, resolveTicket }
}

export function useCatalog(): CatalogService[] {
  return catalog
}

export function useArticles(): Article[] {
  return articles
}

export function useArticle(slug: string | undefined): Article | undefined {
  return useMemo(() => articles.find((a) => a.slug === slug), [slug])
}

export type DashboardMetrics = {
  open: number
  unassigned: number
  breaching: number
  resolvedToday: number
  avgFirstResponseHours: number | null
  byPriority: { priority: Priority; label: string; count: number }[]
  byStatus: { status: Status; label: string; count: number }[]
  volume: { date: string; created: number; resolved: number }[]
  workload: { agentId: string; name: string; count: number }[]
  recent: Ticket[]
  total: number
}

export function useDashboardMetrics(): DashboardMetrics {
  const tickets = useDataStore((s) => s.tickets)
  return useMemo(() => {
    const now = Date.now()
    const open = tickets.filter((t) => OPEN_STATUSES.includes(t.status))
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const byPriority = PRIORITY_ORDER.map((priority) => ({
      priority,
      label: PRIORITIES[priority],
      count: open.filter((t) => t.priority === priority).length,
    }))
    const byStatus = STATUS_ORDER.filter((s) => OPEN_STATUSES.includes(s)).map((status) => ({
      status,
      label: STATUSES[status],
      count: tickets.filter((t) => t.status === status).length,
    }))

    // volume over last N days
    const volume: DashboardMetrics['volume'] = []
    for (let i = DASHBOARD_VOLUME_DAYS - 1; i >= 0; i--) {
      const day = new Date()
      day.setHours(0, 0, 0, 0)
      day.setDate(day.getDate() - i)
      const next = new Date(day)
      next.setDate(next.getDate() + 1)
      const created = tickets.filter((t) => {
        const c = new Date(t.createdAt).getTime()
        return c >= day.getTime() && c < next.getTime()
      }).length
      const resolved = tickets.filter((t) => {
        if (!t.resolvedAt) return false
        const r = new Date(t.resolvedAt).getTime()
        return r >= day.getTime() && r < next.getTime()
      }).length
      volume.push({
        date: day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        created,
        resolved,
      })
    }

    const workloadMap = new Map<string, number>()
    for (const t of open) {
      if (!t.assigneeId) continue
      workloadMap.set(t.assigneeId, (workloadMap.get(t.assigneeId) ?? 0) + 1)
    }
    const workload = [...workloadMap.entries()]
      .map(([agentId, count]) => ({ agentId, name: agentName(agentId), count }))
      .sort((a, b) => b.count - a.count)

    // avg first response: time from creation to first agent comment
    const responseHours: number[] = []
    for (const t of tickets) {
      const chron = [...t.activity].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      const firstComment = chron.find((a) => a.type === 'comment')
      if (firstComment) {
        const diff = new Date(firstComment.createdAt).getTime() - new Date(t.createdAt).getTime()
        if (diff > 0) responseHours.push(diff / (60 * 60 * 1000))
      }
    }
    const avgFirstResponseHours =
      responseHours.length > 0
        ? responseHours.reduce((a, b) => a + b, 0) / responseHours.length
        : null

    const recent = [...tickets]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, ACTIVITY_FEED_LIMIT)

    return {
      open: open.length,
      unassigned: open.filter((t) => !t.assigneeId).length,
      breaching: tickets.filter((t) => isBreaching(t, now)).length,
      resolvedToday: tickets.filter(
        (t) => t.resolvedAt && new Date(t.resolvedAt).getTime() >= startOfToday.getTime(),
      ).length,
      avgFirstResponseHours,
      byPriority,
      byStatus,
      volume,
      workload,
      recent,
      total: tickets.length,
    }
  }, [tickets])
}

export { getSlaState }

