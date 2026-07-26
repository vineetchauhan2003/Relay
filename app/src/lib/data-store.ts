import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  SLA_TARGET_HOURS,
  STATUSES,
  STORAGE_KEY,
  type Activity,
  type Priority,
  type Status,
  type Ticket,
} from './constants'
import { ARTICLES, AGENTS, buildSeedTickets, CATALOG_SERVICES } from './seed'

// Domain data lives here, persisted to localStorage and seeded on first run.
// It is read exclusively through the hooks in src/data — components never touch
// this store directly.

type NewTicketInput = {
  type: Ticket['type']
  subject: string
  description: string
  requesterId: string
  category: Ticket['category']
  priority: Priority
  assigneeId: string | null
}

type DataState = {
  tickets: Ticket[]
  createTicket: (input: NewTicketInput) => Ticket
  updateTicket: (id: string, patch: Partial<Ticket>, systemNote?: string) => void
  addComment: (id: string, body: string, visibility: 'public' | 'internal', authorId: string) => void
  resolveTicket: (id: string, authorId: string) => void
  resetSeed: () => void
}

function nextKey(tickets: Ticket[], type: Ticket['type']): string {
  const prefix = type === 'incident' ? 'INC' : 'REQ'
  const max = tickets
    .filter((t) => t.key.startsWith(prefix))
    .reduce((acc, t) => Math.max(acc, Number(t.key.split('-')[1]) || 0), 0)
  return `${prefix}-${max + 1}`
}

export function slaDueFrom(createdISO: string, priority: Priority): string {
  const ms = SLA_TARGET_HOURS[priority] * 60 * 60 * 1000
  return new Date(new Date(createdISO).getTime() + ms).toISOString()
}

function sysActivity(authorId: string, body: string): Activity {
  return {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'system',
    authorId,
    body,
    createdAt: new Date().toISOString(),
  }
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      tickets: buildSeedTickets(),

      createTicket: (input) => {
        const now = new Date().toISOString()
        const ticket: Ticket = {
          id: `tk-${Date.now()}`,
          key: nextKey(get().tickets, input.type),
          type: input.type,
          subject: input.subject,
          description: input.description,
          status: 'new',
          priority: input.priority,
          category: input.category,
          requesterId: input.requesterId,
          assigneeId: input.assigneeId,
          createdAt: now,
          updatedAt: now,
          slaDueAt: slaDueFrom(now, input.priority),
          resolvedAt: null,
          activity: [
            {
              id: `act-${Date.now()}-init`,
              type: 'system',
              authorId: input.requesterId,
              body: `logged this ${input.type}`,
              createdAt: now,
            },
          ],
        }
        set((s) => ({ tickets: [ticket, ...s.tickets] }))
        return ticket
      },

      updateTicket: (id, patch, systemNote) => {
        set((s) => ({
          tickets: s.tickets.map((t) => {
            if (t.id !== id) return t
            const now = new Date().toISOString()
            const next: Ticket = { ...t, ...patch, updatedAt: now }
            if (patch.priority && patch.priority !== t.priority) {
              next.slaDueAt = slaDueFrom(t.createdAt, patch.priority)
            }
            if (systemNote) {
              next.activity = [sysActivity('agent-1', systemNote), ...t.activity]
            }
            return next
          }),
        }))
      },

      addComment: (id, body, visibility, authorId) => {
        set((s) => ({
          tickets: s.tickets.map((t) => {
            if (t.id !== id) return t
            const now = new Date().toISOString()
            const comment: Activity = {
              id: `act-${Date.now()}`,
              type: 'comment',
              authorId,
              body,
              visibility,
              createdAt: now,
            }
            return { ...t, updatedAt: now, activity: [comment, ...t.activity] }
          }),
        }))
      },

      resolveTicket: (id, authorId) => {
        const now = new Date().toISOString()
        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: 'resolved' as Status,
                  resolvedAt: now,
                  updatedAt: now,
                  activity: [sysActivity(authorId, `resolved this ticket`), ...t.activity],
                }
              : t,
          ),
        }))
      },

      resetSeed: () => set({ tickets: buildSeedTickets() }),
    }),
    { name: STORAGE_KEY },
  ),
)

// Static reference data (not user-mutated) — exported plainly.
export const agents = AGENTS
export const catalog = CATALOG_SERVICES
export const articles = ARTICLES
export { STATUSES }
