import { useExecuteWorkflowNodeMutation } from '@unifyapps/app-builder-sdk/hooks/workflow'

const AUTOMATION_ID = '6a65054eab85b259ce633243'
const DATA_SOURCE_ID = 'e_6a666f7a06bf6a2e7c503753'
const RESOURCE_VERSION = 5579

const INTERNALS = {
  m: 'BUILDER',
  s: 'global-page-of-code-builder',
  c: 'PLATFORM',
  p: 'browser',
} as const

/**
 * The execute-node call can nest the automation output at a few depths
 * depending on the automation's response node. We defensively search the
 * result for a `random_text` string wherever it lands.
 */
function extractRandomText(value: unknown): string | undefined {
  if (value == null || typeof value !== 'object') return undefined

  const record = value as Record<string, unknown>
  if (typeof record.random_text === 'string') return record.random_text

  for (const nested of Object.values(record)) {
    const found = extractRandomText(nested)
    if (found !== undefined) return found
  }
  return undefined
}

/**
 * Runs the "testing-pupose" automation, which takes no inputs and returns a
 * single `random_text` string. Fires on demand via `run()`.
 */
export function useRandomText() {
  const { mutateAsync, isPending, error, reset } =
    useExecuteWorkflowNodeMutation()

  const run = async (): Promise<string | undefined> => {
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
          parameters: { __internals__: INTERNALS },
          synchronous: true,
        },
        options: {},
      },
    })
    return extractRandomText(result)
  }

  return { run, isPending, error, reset }
}
