import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Search, BookOpen, Eye } from 'lucide-react'
import { ARTICLE_CATEGORIES, type ArticleCategory } from '@/lib/constants'
import { useArticles, agentName } from '@/data'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function Knowledge() {
  const articles = useArticles()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<ArticleCategory | 'all'>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return articles.filter((a) => {
      if (category !== 'all' && a.category !== category) return false
      if (q && !`${a.title} ${a.excerpt} ${a.body.join(' ')}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [articles, query, category])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Knowledge base"
        description="Self-service guides and answers for common IT questions."
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[16rem] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={category === 'all'} onClick={() => setCategory('all')}>
            All
          </Chip>
          {ARTICLE_CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Chip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No articles found"
          description="Try a different search term or category."
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-3">
          {filtered.map((a) => (
            <Link
              key={a.id}
              to={`/knowledge/${a.slug}`}
              className="flex flex-col gap-2 rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <span className="text-xs font-medium text-primary">{a.category}</span>
              <h3 className="font-heading text-base font-semibold text-balance">{a.title}</h3>
              <p className="line-clamp-2 flex-1 text-sm text-muted-foreground text-pretty">
                {a.excerpt}
              </p>
              <div className="flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                <span>{agentName(a.authorId)}</span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Eye className="size-3" /> {a.views.toLocaleString()}
                </span>
                <span className="ml-auto">
                  {formatDistanceToNow(new Date(a.updatedAt), { addSuffix: true })}
                </span>
              </div>
            </Link>
          ))}
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
