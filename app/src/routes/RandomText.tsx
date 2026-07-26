import { useState } from 'react'
import { format } from 'date-fns'
import { Sparkles, AlertCircle, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useRandomText } from '@/data/random-text'

const MAX_HISTORY = 8

type HistoryEntry = { id: string; text: string; at: Date }

export default function RandomText() {
  const { run, isPending, error } = useRandomText()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const latest = history[0]

  async function handleGenerate() {
    try {
      const text = await run()
      if (!text) {
        toast.error('The automation returned no text.')
        return
      }
      setHistory((prev) =>
        [
          { id: crypto.randomUUID(), text, at: new Date() },
          ...prev,
        ].slice(0, MAX_HISTORY),
      )
    } catch {
      toast.error('Could not run the automation. Please try again.')
    }
  }

  async function handleCopy(entry: HistoryEntry) {
    await navigator.clipboard.writeText(entry.text)
    setCopiedId(entry.id)
    toast.success('Copied to clipboard')
    window.setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Random Text
        </h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          Run the connected automation to fetch a fresh piece of random text on
          demand.
        </p>
      </header>

      <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-muted-foreground">
            {latest ? 'Latest result' : 'No result yet'}
          </span>
          <Button onClick={handleGenerate} disabled={isPending} className="gap-2">
            <Sparkles className="size-4" aria-hidden />
            {isPending ? 'Generating…' : 'Generate'}
          </Button>
        </div>

        {isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>Something went wrong running the automation. Try again.</p>
          </div>
        ) : latest ? (
          <p className="text-lg leading-relaxed text-foreground">{latest.text}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Press <span className="font-medium text-foreground">Generate</span> to
            fetch your first result.
          </p>
        )}
      </div>

      {history.length > 1 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            History
          </h2>
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
            {history.slice(1).map((entry) => (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-4 p-4"
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm text-foreground">{entry.text}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(entry.at, 'MMM d, h:mm:ss a')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  aria-label="Copy result"
                  onClick={() => handleCopy(entry)}
                >
                  {copiedId === entry.id ? (
                    <Check className="size-4" aria-hidden />
                  ) : (
                    <Copy className="size-4" aria-hidden />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
