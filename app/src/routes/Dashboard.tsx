import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Inbox, UserX, AlertTriangle, CheckCircle2, Timer, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRIORITY_CHART_VAR } from '@/lib/constants'
import { useDashboardMetrics, useTickets } from '@/data'
import { useUIStore } from '@/lib/store'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { PriorityDonut, StatusBars, VolumeChart } from '@/components/dashboard-charts'
import { StatusBadge } from '@/components/badges'

type KpiDef = {
  key: string
  label: string
  value: string
  icon: typeof Inbox
  to: string
  accent?: boolean
}

function Kpi({ def, onGo }: { def: KpiDef; onGo: () => void }) {
  return (
    <button
      type="button"
      onClick={onGo}
      className="group flex flex-col gap-2 rounded-md border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent/40"
    >
      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <def.icon
          className={cn('size-4', def.accent ? 'text-destructive' : 'text-muted-foreground')}
          aria-hidden
        />
        {def.label}
      </span>
      <span
        className={cn(
          'font-heading text-3xl font-semibold tabular-nums tracking-tight',
          def.accent ? 'text-destructive' : 'text-foreground',
        )}
      >
        {def.value}
      </span>
    </button>
  )
}

function Panel({
  title,
  children,
  className,
  aside,
}: {
  title: string
  children: React.ReactNode
  className?: string
  aside?: React.ReactNode
}) {
  return (
    <section className={cn('rounded-md border border-border bg-card p-4', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-sm font-semibold text-foreground">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

export default function Dashboard() {
  const m = useDashboardMetrics()
  const { tickets } = useTickets()
  const openCreate = useUIStore((s) => s.openCreate)
  const navigate = useNavigate()

  if (tickets.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Operations" description="Service-desk health at a glance." />
        <EmptyState
          icon={Inbox}
          title="No tickets yet"
          description="Log your first incident or request to start tracking service-desk activity."
          action={
            <Button onClick={() => openCreate()}>
              <Plus className="size-4" /> New ticket
            </Button>
          }
        />
      </div>
    )
  }

  const kpis: KpiDef[] = [
    { key: 'open', label: 'Open tickets', value: String(m.open), icon: Inbox, to: '/tickets' },
    { key: 'unassigned', label: 'Unassigned', value: String(m.unassigned), icon: UserX, to: '/tickets?assignee=unassigned' },
    { key: 'breaching', label: 'Breaching SLA', value: String(m.breaching), icon: AlertTriangle, to: '/tickets?sort=sla', accent: m.breaching > 0 },
    { key: 'resolved', label: 'Resolved today', value: String(m.resolvedToday), icon: CheckCircle2, to: '/tickets?status=resolved' },
    {
      key: 'response',
      label: 'Avg first response',
      value: m.avgFirstResponseHours == null ? '—' : `${m.avgFirstResponseHours.toFixed(1)}h`,
      icon: Timer,
      to: '/tickets',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations"
        description="Service-desk health at a glance."
        actions={
          <Button onClick={() => openCreate()}>
            <Plus className="size-4" /> New ticket
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((k) => (
          <Kpi key={k.key} def={k} onGo={() => navigate(k.to)} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Ticket volume · last 14 days"
          className="lg:col-span-2"
          aside={
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <LegendDot color="var(--chart-1)" label="Created" />
              <LegendDot color="var(--chart-3)" label="Resolved" />
            </div>
          }
        >
          <VolumeChart data={m.volume} />
        </Panel>

        <Panel title="Open by priority">
          <PriorityDonut data={m.byPriority} />
          <ul className="mt-3 space-y-1.5">
            {m.byPriority.map((p) => (
              <li key={p.priority} className="flex items-center gap-2 text-sm">
                <LegendDot color={PRIORITY_CHART_VAR[p.priority]} label={p.label} />
                <span className="ml-auto font-medium tabular-nums text-muted-foreground">
                  {p.count}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Open by status">
          <StatusBars data={m.byStatus} />
        </Panel>

        <Panel title="Agent workload">
          {m.workload.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No assigned open tickets.</p>
          ) : (
            <ul className="space-y-3">
              {m.workload.map((w) => {
                const max = m.workload[0].count || 1
                return (
                  <li key={w.agentId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{w.name}</span>
                      <span className="font-medium tabular-nums text-muted-foreground">{w.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(w.count / max) * 100}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Recent activity">
          <ul className="space-y-1">
            {m.recent.map((t) => (
              <li key={t.id}>
                <Link
                  to={`/tickets/${t.key}`}
                  className="flex items-center gap-3 rounded-sm px-2 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">{t.key}</span>
                  <span className="min-w-0 flex-1 truncate">{t.subject}</span>
                  <StatusBadge status={t.status} />
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                    {formatDistanceToNow(new Date(t.updatedAt), { addSuffix: true })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block size-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}
