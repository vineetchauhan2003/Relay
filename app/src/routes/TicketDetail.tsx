import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, FileQuestion, Send } from 'lucide-react'
import {
  CATEGORIES,
  CURRENT_AGENT_ID,
  OPEN_STATUSES,
  PRIORITIES,
  PRIORITY_ORDER,
  SLA_TARGET_HOURS,
  STATUSES,
  STATUS_ORDER,
  UNASSIGNED,
  type Category,
  type Priority,
  type Status,
} from '@/lib/constants'
import { useTicket, useTicketActions, useAgents, agentName } from '@/data'
import { getSlaState } from '@/lib/sla'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PriorityBadge, SlaBadge, StatusBadge, TypeBadge } from '@/components/badges'
import { InitialsAvatar } from '@/components/initials-avatar'
import { ActivityTimeline } from '@/components/activity-timeline'
import { cn } from '@/lib/utils'

export default function TicketDetail() {
  const { key } = useParams()
  const { ticket } = useTicket(key)
  const { updateTicket, addComment, resolveTicket } = useTicketActions()
  const agents = useAgents()
  const [comment, setComment] = useState('')
  const [internal, setInternal] = useState(false)

  if (!ticket) {
    return (
      <div className="space-y-6">
        <BackLink />
        <EmptyState
          icon={FileQuestion}
          title="Ticket not found"
          description={`We couldn't find a ticket with the key "${key}".`}
          action={
            <Button asChild>
              <Link to="/tickets">Back to queue</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const isOpen = OPEN_STATUSES.includes(ticket.status)
  const requester = agentName(ticket.requesterId)
  const slaState = getSlaState(ticket)

  function handleStatus(next: Status) {
    if (next === ticket!.status) return
    updateTicket(ticket!.id, { status: next }, `changed status to ${STATUSES[next]}`)
    toast.success(`Status set to ${STATUSES[next]}`)
  }
  function handlePriority(next: Priority) {
    if (next === ticket!.priority) return
    updateTicket(ticket!.id, { priority: next }, `set priority to ${PRIORITIES[next]}`)
    toast.success(`Priority set to ${PRIORITIES[next]}`)
  }
  function handleAssignee(next: string) {
    const value = next === UNASSIGNED ? null : next
    updateTicket(
      ticket!.id,
      { assigneeId: value },
      value ? `assigned to ${agentName(value)}` : 'unassigned this ticket',
    )
    toast.success(value ? `Assigned to ${agentName(value)}` : 'Ticket unassigned')
  }
  function handleCategory(next: Category) {
    if (next === ticket!.category) return
    updateTicket(ticket!.id, { category: next }, `changed category to ${CATEGORIES[next]}`)
  }
  function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return
    addComment(ticket!.id, comment.trim(), internal ? 'internal' : 'public', CURRENT_AGENT_ID)
    setComment('')
    toast.success(internal ? 'Internal note added' : 'Reply posted')
  }
  function handleResolve() {
    resolveTicket(ticket!.id, CURRENT_AGENT_ID)
    toast.success(`${ticket!.key} resolved`)
  }

  return (
    <div className="space-y-5">
      <BackLink />

      <PageHeader
        title={ticket.subject}
        actions={
          isOpen ? (
            <Button onClick={handleResolve} className="gap-2">
              <CheckCircle2 className="size-4" /> Resolve
            </Button>
          ) : undefined
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm tabular-nums text-muted-foreground">{ticket.key}</span>
        <TypeBadge type={ticket.type} />
        <StatusBadge status={ticket.status} />
        <PriorityBadge priority={ticket.priority} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className="rounded-md border border-border bg-card p-4">
            <h2 className="mb-2 font-heading text-sm font-semibold">Description</h2>
            <p className="text-sm text-foreground/90 text-pretty">{ticket.description}</p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-sm font-semibold">Activity</h2>
            <form onSubmit={handleComment} className="space-y-3 rounded-md border border-border bg-card p-3">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={internal ? 'Add an internal note…' : 'Write a public reply…'}
                rows={3}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch id="internal" checked={internal} onCheckedChange={setInternal} />
                  <Label htmlFor="internal" className="text-sm text-muted-foreground">
                    Internal note
                  </Label>
                </div>
                <Button type="submit" size="sm" disabled={!comment.trim()} className="gap-1.5">
                  <Send className="size-3.5" />
                  {internal ? 'Add note' : 'Reply'}
                </Button>
              </div>
            </form>
            <ActivityTimeline activity={ticket.activity} />
          </section>
        </div>

        <aside className="space-y-4">
          <section className="space-y-4 rounded-md border border-border bg-card p-4">
            <h2 className="font-heading text-sm font-semibold">Properties</h2>
            <PropertyRow label="Status">
              <InlineSelect value={ticket.status} onChange={(v) => handleStatus(v as Status)}
                options={STATUS_ORDER.map((s) => ({ value: s, label: STATUSES[s] }))} />
            </PropertyRow>
            <PropertyRow label="Priority">
              <InlineSelect value={ticket.priority} onChange={(v) => handlePriority(v as Priority)}
                options={PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITIES[p] }))} />
            </PropertyRow>
            <PropertyRow label="Assignee">
              <InlineSelect
                value={ticket.assigneeId ?? UNASSIGNED}
                onChange={handleAssignee}
                options={[
                  { value: UNASSIGNED, label: 'Unassigned' },
                  ...agents
                    .filter((a) => a.role !== 'requester' || a.id === CURRENT_AGENT_ID)
                    .map((a) => ({ value: a.id, label: a.name })),
                ]}
              />
            </PropertyRow>
            <PropertyRow label="Category">
              <InlineSelect value={ticket.category} onChange={(v) => handleCategory(v as Category)}
                options={(Object.keys(CATEGORIES) as Category[]).map((c) => ({ value: c, label: CATEGORIES[c] }))} />
            </PropertyRow>
          </section>

          <section className="space-y-3 rounded-md border border-border bg-card p-4">
            <h2 className="font-heading text-sm font-semibold">SLA</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Target</span>
              <span className="font-medium tabular-nums">{SLA_TARGET_HOURS[ticket.priority]}h</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Due</span>
              <span className="tabular-nums">{format(new Date(ticket.slaDueAt), 'MMM d, HH:mm')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {slaState === 'done' ? 'Resolved' : 'Remaining'}
              </span>
              {slaState === 'done' ? (
                <span className="tabular-nums text-muted-foreground">
                  {ticket.resolvedAt
                    ? formatDistanceToNow(new Date(ticket.resolvedAt), { addSuffix: true })
                    : '—'}
                </span>
              ) : (
                <SlaBadge ticket={ticket} />
              )}
            </div>
            {slaState === 'breached' ? (
              <p className="rounded-sm bg-[color-mix(in_srgb,var(--destructive)_12%,transparent)] px-2.5 py-1.5 text-xs font-medium text-destructive">
                This ticket has breached its SLA target.
              </p>
            ) : null}
          </section>

          <section className="space-y-3 rounded-md border border-border bg-card p-4">
            <h2 className="font-heading text-sm font-semibold">Requester</h2>
            <div className="flex items-center gap-3">
              <InitialsAvatar name={requester} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{requester}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {agents.find((a) => a.id === ticket.requesterId)?.email}
                </p>
              </div>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">
              Opened {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })} · Updated{' '}
              {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}

function BackLink() {
  return (
    <Link
      to="/tickets"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" /> Back to queue
    </Link>
  )
}

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

function InlineSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
