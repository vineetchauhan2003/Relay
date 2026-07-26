import { format, formatDistanceToNow } from 'date-fns'
import { Lock } from 'lucide-react'
import type { Activity } from '@/lib/constants'
import { agentName } from '@/data'
import { InitialsAvatar } from '@/components/initials-avatar'
import { cn } from '@/lib/utils'

export function ActivityTimeline({ activity }: { activity: Activity[] }) {
  return (
    <ol className="space-y-4">
      {activity.map((item) =>
        item.type === 'comment' ? (
          <CommentItem key={item.id} item={item} />
        ) : (
          <SystemItem key={item.id} item={item} />
        ),
      )}
    </ol>
  )
}

function CommentItem({ item }: { item: Activity }) {
  const isInternal = item.visibility === 'internal'
  return (
    <li className="flex gap-3">
      <InitialsAvatar name={agentName(item.authorId)} size="md" />
      <div
        className={cn(
          'min-w-0 flex-1 rounded-md border p-3',
          isInternal
            ? 'border-primary/30 bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]'
            : 'border-border bg-card',
        )}
      >
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{agentName(item.authorId)}</span>
          {isInternal ? (
            <span className="inline-flex items-center gap-1 rounded-sm bg-[color-mix(in_srgb,var(--primary)_18%,transparent)] px-1.5 py-0.5 text-[0.625rem] font-medium text-primary">
              <Lock className="size-2.5" /> Internal
            </span>
          ) : null}
          <span
            className="ml-auto text-xs text-muted-foreground"
            title={format(new Date(item.createdAt), 'PPpp')}
          >
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-foreground/90 text-pretty">{item.body}</p>
      </div>
    </li>
  )
}

function SystemItem({ item }: { item: Activity }) {
  return (
    <li className="flex items-center gap-3 pl-1 text-sm text-muted-foreground">
      <span className="ml-3.5 size-1.5 shrink-0 rounded-full bg-border" aria-hidden />
      <span>
        <span className="font-medium text-foreground/80">{agentName(item.authorId)}</span> {item.body}
      </span>
      <span className="ml-auto text-xs">
        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
      </span>
    </li>
  )
}
