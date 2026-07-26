import { useMemo, useState } from 'react'
import {
  Search,
  PackageSearch,
  Laptop,
  Monitor,
  Package,
  PenTool,
  ShieldCheck,
  Wifi,
  KeyRound,
  LockKeyhole,
  Mails,
  Inbox,
  PackagePlus,
  Armchair,
  type LucideIcon,
} from 'lucide-react'
import { CATEGORIES, type Category } from '@/lib/constants'
import { useCatalog } from '@/data'
import { useUIStore } from '@/lib/store'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const ICONS: Record<string, LucideIcon> = {
  Laptop,
  Monitor,
  Package,
  PenTool,
  ShieldCheck,
  Wifi,
  KeyRound,
  LockKeyhole,
  Mails,
  Inbox,
  PackagePlus,
  Armchair,
}

const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[]

export default function Catalog() {
  const services = useCatalog()
  const openCreate = useUIStore((s) => s.openCreate)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return services.filter((s) => {
      if (category !== 'all' && s.category !== category) return false
      if (q && !`${s.name} ${s.description}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [services, query, category])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Service catalog"
        description="Request common IT services — each becomes a tracked ticket."
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[16rem] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services…"
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={category === 'all'} onClick={() => setCategory('all')}>
            All
          </Chip>
          {CATEGORY_KEYS.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {CATEGORIES[c]}
            </Chip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No services match"
          description="Try a different search term or category."
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3">
          {filtered.map((s) => {
            const Icon = ICONS[s.icon] ?? Package
            return (
              <article
                key={s.id}
                className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex size-9 items-center justify-center rounded-sm bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] text-primary">
                    <Icon className="size-4.5" aria-hidden />
                  </span>
                  <span className="rounded-sm bg-secondary px-2 py-0.5 text-[0.625rem] font-medium text-secondary-foreground">
                    {CATEGORIES[s.category]}
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-heading text-sm font-semibold">{s.name}</h3>
                  <p className="text-sm text-muted-foreground text-pretty">{s.description}</p>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">{s.fulfillmentTime}</span>
                  <button
                    type="button"
                    onClick={() =>
                      openCreate({ type: 'request', category: s.category, subject: s.name })
                    }
                    className="text-sm font-medium text-primary transition-colors hover:underline"
                  >
                    Request this
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Chip({
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
      className={cn(
        'rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-transparent text-muted-foreground hover:bg-accent',
      )}
    >
      {children}
    </button>
  )
}
