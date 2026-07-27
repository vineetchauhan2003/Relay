import { useState } from 'react'
import { Play, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useInputOutput, type InputOutputResult } from '@/data/input-output'

export default function InputOutput() {
  const { run, isPending, error } = useInputOutput()
  const [testt, setTestt] = useState('')
  const [result, setResult] = useState<InputOutputResult | null>(null)

  const canRun = testt.trim().length > 0 && !isPending

  async function handleRun() {
    if (!canRun) return
    try {
      const data = await run(testt.trim())
      if (!data) {
        toast.error('The automation returned no result.')
        return
      }
      setResult(data)
    } catch {
      toast.error('Could not run the automation. Please try again.')
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Input Output
        </h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          Send a value to the connected automation and see the two fields it
          returns.
        </p>
      </header>

      <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="testt">Input value</Label>
          <div className="flex items-center gap-3">
            <Input
              id="testt"
              value={testt}
              placeholder="Type a value to send…"
              onChange={(e) => setTestt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRun()
              }}
            />
            <Button onClick={handleRun} disabled={!canRun} className="shrink-0 gap-2">
              <Play className="size-4" aria-hidden />
              {isPending ? 'Running…' : 'Run'}
            </Button>
          </div>
        </div>

        {isPending ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>Something went wrong running the automation. Try again.</p>
          </div>
        ) : result ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <ResultField label="Field one" value={result.fieldone} />
            <ResultField label="Field two" value={result.fieldtwo} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter a value and press <span className="font-medium text-foreground">Run</span> to
            see the result.
          </p>
        )}
      </div>
    </div>
  )
}

function ResultField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md bg-muted/50 p-4">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-lg font-medium leading-snug text-foreground">
        {value || '—'}
      </span>
    </div>
  )
}
