import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Plus, Search, Inbox, SlidersHorizontal, X } from 'lucide-react'
import {
  CURRENT_AGENT_ID,
  PRIORITIES,
  PRIORITY_ORDER,
  PRIORITY_WEIGHT,
  STATUSES,
  STATUS_ORDER,
  TICKET_TYPES,
  type Priority,
  type Status,
  type TicketType,
} from '@/lib/constants'
import { useTickets, agentName } from '@/data'
import { useUIStore, type SortKey } from '@/lib/store'
import { getSlaState } from '@/lib/sla'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PriorityBadge, SlaBadge, StatusBadge, TypeBadge } from '@/components/badges'
import { InitialsAvatar } from '@/components/initials-avatar'

const SORT_LABELS: Record<SortKey, string> = {
  updated: 'Recently updated',
  created: 'Newest',
  priority: 'Priority',
  sla: 'SLA urgency',
}

export default function Tickets() {
  const { tickets } = useTickets()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const search = useUIStore((s) => s.search)
  const statusFilter = useUIStore((s) => s.statusFilter)
  const priorityFilter = useUIStore((s) => s.priorityFilter)
  const typeFilter = useUIStore((s) => s.typeFilter)
  const assigneeFilter = useUIStore((s) => s.assigneeFilter)
  const sortKey = useUIStore((s) => s.sortKey)
  const setSearch = useUIStore((s) => s.setSearch)
  const setStatusFilter = useUIStore((s) => s.setStatusFilter)
  const setPriorityFilter = useUIStore((s) => s.setPriorityFilter)
  const setTypeFilter = useUIStore((s) => s.setTypeFilter)
  const setAssigneeFilter = useUIStore((s) => s.setAssigneeFilter)
  const setSortKey = useUIStore((s) => s.setSortKey)
  const clearFilters = useUIStore((s) => s.clearFilters)
  const openCreate = useUIStore((s) => s.openCreate)

  // Apply KPI deep-link params once on mount / when they change.
  useEffect(() => {
    const status = params.get('status') as Status | null
    const assignee = params.get('assignee')
    const sort = params.get('sort') as SortKey | null
    if (status && STATUS_ORDER.includes(status)) setStatusFilter(status)
    if (assignee === 'unassigned' || assignee === 'mine') setAssigneeFilter(assignee)
    if (sort && sort in SORT_LABELS) setSortKey(sort)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const hasFilters =
    !!search ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    typeFilter !== 'all' ||
    assigneeFilter !== 'all'

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const rows = tickets.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (assigneeFilter === 'unassigned' && t.assigneeId) return false
      if (assigneeFilter === 'mine' && t.assigneeId !== CURRENT_AGENT_ID) return false
      if (q) {
        const hay = `${t.key} ${t.subject} ${agentName(t.requesterId)}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    const sorted = [...rows].sort((a, b) => {
      switch (sortKey) {
        case 'priority':
          return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
        case 'sla':
          return new Date(a.slaDueAt).getTime() - new Date(b.slaDueAt).getTime()
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })
    return sorted
  }, [tickets, search, statusFilter, priorityFilter, typeFilter, assigneeFilter, sortKey])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tickets"
        description="Every incident and request across the service desk."
        actions={
          <Button onClick={() => openCreate()}>
            <Plus className="size-4" /> New ticket
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[14rem] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject, key or requester…"
            className="pl-8"
          />
        </div>

        <FilterSelect
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as Status | 'all')}
          placeholder="Status"
          options={STATUS_ORDER.map((s) => ({ value: s, label: STATUSES[s] }))}
        />
        <FilterSelect
          value={priorityFilter}
          onChange={(v) => setPriorityFilter(v as Priority | 'all')}
          placeholder="Priority"
          options={PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITIES[p] }))}
        />
        <FilterSelect
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as TicketType | 'all')}
          placeholder="Type"
          options={(Object.keys(TICKET_TYPES) as TicketType[]).map((t) => ({
            value: t,
            label: TICKET_TYPES[t],
          }))}
        />

        <div className="inline-flex overflow-hidden rounded-md border border-border">
          <ToggleBtn active={assigneeFilter === 'mine'} onClick={() => setAssigneeFilter(assigneeFilter === 'mine' ? 'all' : 'mine')}>
            My tickets
          </ToggleBtn>
          <ToggleBtn
            active={assigneeFilter === 'unassigned'}
            onClick={() => setAssigneeFilter(assigneeFilter === 'unassigned' ? 'all' : 'unassigned')}
          >
            Unassigned
          </ToggleBtn>
        </div>

        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-auto gap-2">
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <SelectItem key={k} value={k}>
                {SORT_LABELS[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground tabular-nums">
          {filtered.length} of {tickets.length} tickets
        </p>
        {hasFilters ? (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
            <X className="size-3.5" /> Clear filters
          </Button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={hasFilters ? 'No tickets match your filters' : 'No tickets yet'}
          description={
            hasFilters
              ? 'Try broadening or clearing the filters to see more tickets.'
              : 'Log the first incident or request to populate the queue.'
          }
          action={
            hasFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button onClick={() => openCreate()}>
                <Plus className="size-4" /> New ticket
              </Button>
            )
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-md border border-border md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-24">Key</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => {
                  const breached = getSlaState(t) === 'breached'
                  return (
                    <TableRow
                      key={t.id}
                      onClick={() => navigate(`/tickets/${t.key}`)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                        {t.key}
                      </TableCell>
                      <TableCell className="max-w-sm">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">{t.subject}</span>
                          <TypeBadge type={t.type} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={t.priority} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={t.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <InitialsAvatar name={agentName(t.assigneeId)} size="sm" />
                          <span className="text-sm text-muted-foreground">
                            {t.assigneeId ? agentName(t.assigneeId) : 'Unassigned'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className={breached ? 'font-medium' : undefined}>
                        <SlaBadge ticket={t} />
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(t.updatedAt), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-2 md:hidden">
            {filtered.map((t) => (
              <li key={t.id}>
                <Link
                  to={`/tickets/${t.key}`}
                  className="block rounded-md border border-border bg-card p-3 transition-colors hover:bg-accent/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">{t.key}</span>
                    <SlaBadge ticket={t} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm font-medium">{t.subject}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                    <span className="ml-auto text-xs text-muted-foreground">
                      {t.assigneeId ? agentName(t.assigneeId) : 'Unassigned'}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-auto min-w-28">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {placeholder.toLowerCase()}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        'px-3 py-1.5 text-sm font-medium transition-colors ' +
        (active ? 'bg-primary text-primary-foreground' : 'bg-transparent hover:bg-accent')
      }
    >
      {children}
    </button>
  )
}
