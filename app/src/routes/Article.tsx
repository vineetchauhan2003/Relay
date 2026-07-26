import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, Eye, FileQuestion } from 'lucide-react'
import { useArticle, useArticles, agentName } from '@/data'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { InitialsAvatar } from '@/components/initials-avatar'

const RELATED_LIMIT = 3

export default function Article() {
  const { slug } = useParams()
  const article = useArticle(slug)
  const all = useArticles()

  const related = useMemo(() => {
    if (!article) return []
    return all
      .filter((a) => a.category === article.category && a.id !== article.id)
      .slice(0, RELATED_LIMIT)
  }, [all, article])

  if (!article) {
    return (
      <div className="space-y-6">
        <BackLink />
        <EmptyState
          icon={FileQuestion}
          title="Article not found"
          description="This article may have been moved or removed."
          action={
            <Button asChild>
              <Link to="/knowledge">Browse knowledge base</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BackLink />

      <article className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-3">
          <span className="text-sm font-medium text-primary">{article.category}</span>
          <PageHeader title={article.title} />
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <InitialsAvatar name={agentName(article.authorId)} size="sm" />
              {agentName(article.authorId)}
            </span>
            <span>·</span>
            <span>Updated {format(new Date(article.updatedAt), 'MMM d, yyyy')}</span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Eye className="size-3.5" /> {article.views.toLocaleString()} views
            </span>
          </div>
        </div>

        <div className="space-y-4 text-[0.95rem] leading-relaxed text-foreground/90">
          {article.body.map((para, i) => (
            <p key={i} className="text-pretty">
              {para}
            </p>
          ))}
        </div>
      </article>

      {related.length > 0 ? (
        <section className="mx-auto max-w-2xl space-y-3 border-t border-border pt-6">
          <h2 className="font-heading text-sm font-semibold">Related articles</h2>
          <ul className="space-y-1">
            {related.map((a) => (
              <li key={a.id}>
                <Link
                  to={`/knowledge/${a.slug}`}
                  className="flex items-center justify-between gap-3 rounded-sm px-2 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <span className="min-w-0 truncate font-medium">{a.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{a.category}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function BackLink() {
  return (
    <Link
      to="/knowledge"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" /> Back to knowledge base
    </Link>
  )
}
