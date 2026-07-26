import { formatDistanceToNowStrict } from 'date-fns'
import { NEAR_BREACH_MS, OPEN_STATUSES, type Ticket } from './constants'

export type SlaState = 'breached' | 'warning' | 'healthy' | 'done'

export function getSlaState(ticket: Ticket, now: number = Date.now()): SlaState {
  if (!OPEN_STATUSES.includes(ticket.status)) return 'done'
  const due = new Date(ticket.slaDueAt).getTime()
  const remaining = due - now
  if (remaining <= 0) return 'breached'
  if (remaining <= NEAR_BREACH_MS) return 'warning'
  return 'healthy'
}

export function slaLabel(ticket: Ticket, now: number = Date.now()): string {
  const state = getSlaState(ticket, now)
  if (state === 'done') return '—'
  if (state === 'breached') return 'Breached'
  return formatDistanceToNowStrict(new Date(ticket.slaDueAt))
}

export function isBreaching(ticket: Ticket, now: number = Date.now()): boolean {
  return getSlaState(ticket, now) === 'breached'
}
