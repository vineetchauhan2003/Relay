import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, AlertCircle, Database } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { useTestAutomation, type DataRow } from '@/data/test-automation'

const LIMIT = 20
const OFFSET = 0

function toCell(value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export default function Data() {
  const { run, isPending, error } = useTestAutomation()
  const [rows, setRows] = useState<DataRow[] | null>(null)

  async function load() {
    try {
      const result = await run(LIMIT, OFFSET)
      setRows(result)
    } catch {
      toast.error('Could not load data. Please try again.')
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columns = useMemo(() => {
    if (!rows || rows.length === 0) return []
    const keys = new Set<string>()
    for (const row of rows) {
      Object.keys(row).forEach((key) => keys.add(key))
    }
    return Array.from(keys)
  }, [rows])

  const hasData = rows !== null && rows.length > 0

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Data"
        description="Live results fetched from the connected automation."
        actions={
          <Button onClick={() => void load()} disabled={isPending} className="gap-2">
            <RefreshCw
              className={`size-4 ${isPending ? 'animate-spin' : ''}`}
              aria-hidden
            />
            Refresh
          </Button>
        }
      />

      {isPending && rows === null ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>Something went wrong loading the data. Try refreshing.</p>
        </div>
      ) : hasData ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col} className="whitespace-nowrap">
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows!.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col} className="align-top">
                      {toCell(row[col])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={Database}
          title="No data returned"
          description="The automation ran but returned no rows. Try refreshing."
          action={
            <Button variant="outline" onClick={() => void load()} className="gap-2">
              <RefreshCw className="size-4" aria-hidden />
              Refresh
            </Button>
          }
        />
      )}
    </div>
  )
}
