import { cn } from '@/lib/utils'
import {
  PRIORITIES,
  PRIORITY_STYLES,
  STATUS_STYLES,
  STATUSES,
  TICKET_TYPES,
  type Priority,
  type Status,
  type TicketType,
  type Ticket,
} from '@/lib/constants'
import { getSlaState, slaLabel } from '@/lib/sla'
import { AlertTriangle, Clock } from 'lucide-react'

const BASE =
  'inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium whitespace-nowrap'

export function StatusBadge({ status }: { status: Status }) {
  return <span className={cn(BASE, STATUS_STYLES[status])}>{STATUSES[status]}</span>
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={cn(BASE, PRIORITY_STYLES[priority])}>{PRIORITIES[priority]}</span>
}

export function TypeBadge({ type }: { type: TicketType }) {
  return (
    <span className={cn(BASE, 'bg-secondary text-secondary-foreground')}>{TICKET_TYPES[type]}</span>
  )
}

export function SlaBadge({ ticket, now }: { ticket: Ticket; now?: number }) {
  const state = getSlaState(ticket, now)
  const label = slaLabel(ticket, now)
  if (state === 'done') return <span className="text-muted-foreground tabular-nums">—</span>
  const styles =
    state === 'breached'
      ? 'text-destructive'
      : state === 'warning'
        ? 'text-primary'
        : 'text-muted-foreground'
  const Icon = state === 'breached' ? AlertTriangle : Clock
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs tabular-nums font-medium', styles)}>
      <Icon className="size-3" aria-hidden />
      {label}
    </span>
  )
}
