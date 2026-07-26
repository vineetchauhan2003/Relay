import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PRIORITY_CHART_VAR, STATUS_CHART_VAR } from '@/lib/constants'
import type { DashboardMetrics } from '@/data'

const AXIS = 'var(--muted-foreground)'
const GRID = 'var(--border)'

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label ? <p className="mb-1 font-medium text-popover-foreground">{label}</p> : null}
      {payload.map((entry: any) => (
        <p key={entry.name} className="flex items-center gap-2 text-muted-foreground">
          <span
            className="inline-block size-2 rounded-full"
            style={{ background: entry.color ?? entry.payload?.fill }}
          />
          <span className="capitalize">{entry.name}</span>
          <span className="ml-auto font-medium tabular-nums text-popover-foreground">
            {entry.value}
          </span>
        </p>
      ))}
    </div>
  )
}

export function VolumeChart({ data }: { data: DashboardMetrics['volume'] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="fillCreated" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fillResolved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          stroke={AXIS}
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          interval="preserveStartEnd"
        />
        <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="created"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#fillCreated)"
        />
        <Area
          type="monotone"
          dataKey="resolved"
          stroke="var(--chart-3)"
          strokeWidth={2}
          fill="url(#fillResolved)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function PriorityDonut({ data }: { data: DashboardMetrics['byPriority'] }) {
  const total = data.reduce((a, b) => a + b.count, 0)
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            innerRadius={58}
            outerRadius={82}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((d) => (
              <Cell key={d.priority} fill={PRIORITY_CHART_VAR[d.priority]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-2xl font-semibold tabular-nums">{total}</span>
        <span className="text-xs text-muted-foreground">open</span>
      </div>
    </div>
  )
}

export function StatusBars({ data }: { data: DashboardMetrics['byStatus'] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <XAxis dataKey="label" stroke={AXIS} fontSize={11} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)' }} />
        <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={48}>
          {data.map((d) => (
            <Cell key={d.status} fill={STATUS_CHART_VAR[d.status]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
