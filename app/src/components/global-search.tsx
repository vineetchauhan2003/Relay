import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { useTickets } from '@/data'
import { StatusBadge } from '@/components/badges'

const MAX_RESULTS = 6

export function GlobalSearch() {
  const { tickets } = useTickets()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return tickets
      .filter(
        (t) => t.key.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q),
      )
      .slice(0, MAX_RESULTS)
  }, [query, tickets])

  function go(key: string) {
    navigate(`/tickets/${key}`)
    setOpen(false)
    setQuery('')
  }

  return (
    <Popover open={open && query.trim().length > 0} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            placeholder="Search tickets by key or subject…"
            className="pl-8"
            aria-label="Search tickets"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {results.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-muted-foreground">No matching tickets.</p>
        ) : (
          <ul className="max-h-72 overflow-y-auto">
            {results.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => go(t.key)}
                  className="flex w-full items-center gap-3 rounded-sm px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent"
                >
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">{t.key}</span>
                  <span className="min-w-0 flex-1 truncate">{t.subject}</span>
                  <StatusBadge status={t.status} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
