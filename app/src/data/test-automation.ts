import { useExecuteWorkflowNodeMutation } from '@unifyapps/app-builder-sdk/hooks/workflow'

const AUTOMATION_ID = '6a63b2c907f71634a9450643'
const DATA_SOURCE_ID = 'e_6a667ec71c23e0623892c3b6'
const RESOURCE_VERSION = 5580

const INTERNALS = {
  m: 'BUILDER',
  s: 'global-page-of-code-builder',
  c: 'PLATFORM',
  p: 'browser',
} as const

export type DataRow = Record<string, unknown>

/**
 * The execute-node call nests the automation output at varying depths
 * depending on its response node. We defensively search for the first
 * array-valued `data` field wherever it lands.
 */
function extractRows(value: unknown): DataRow[] | undefined {
  if (value == null || typeof value !== 'object') return undefined

  const record = value as Record<string, unknown>
  if (Array.isArray(record.data)) return record.data as DataRow[]

  for (const nested of Object.values(record)) {
    const found = extractRows(nested)
    if (found !== undefined) return found
  }
  return undefined
}

/**
 * Runs the "test automation", which takes `limit`/`offset` and returns a
 * `data` array. Fires on demand via `run(limit, offset)`.
 */
export function useTestAutomation() {
  const { mutateAsync, isPending, error, reset } =
    useExecuteWorkflowNodeMutation()

  const run = async (limit: number, offset: number): Promise<DataRow[]> => {
    const result = await mutateAsync({
      data: {
        context: {
          appName: 'callables',
          resourceName: 'callables_call_automation',
          resourceVersion: RESOURCE_VERSION,
        },
        id: DATA_SOURCE_ID,
        inputs: {
          automationId: AUTOMATION_ID,
          version: '-1',
          runtimeConnections: {},
          parameters: { __internals__: INTERNALS, limit, offset },
          synchronous: true,
        },
        options: {},
      },
    })
    return extractRows(result) ?? []
  }

  return { run, isPending, error, reset }
}
