import { useExecuteWorkflowNodeMutation } from '@unifyapps/app-builder-sdk/hooks/workflow'

const AUTOMATION_ID = '6a652db5ab85b259ce6341bc'
const DATA_SOURCE_ID = 'e_6a67115abc305c197b8e2d22'
const RESOURCE_VERSION = 5593

const INTERNALS = {
  m: 'BUILDER',
  s: 'global-page-of-code-builder',
  c: 'PLATFORM',
  p: 'browser',
} as const

export type InputOutputResult = { fieldone: string; fieldtwo: string }

type ExecuteResponse = {
  response?: { body?: Partial<InputOutputResult> }
} & Partial<InputOutputResult>

/** Defensively find fieldone/fieldtwo wherever the response node nests them. */
function extractResult(value: unknown): InputOutputResult | undefined {
  if (value == null || typeof value !== 'object') return undefined
  const record = value as Record<string, unknown>
  if (typeof record.fieldone === 'string' && typeof record.fieldtwo === 'string') {
    return { fieldone: record.fieldone, fieldtwo: record.fieldtwo }
  }
  for (const nested of Object.values(record)) {
    const found = extractResult(nested)
    if (found !== undefined) return found
  }
  return undefined
}

/**
 * Runs the "input output" automation: takes a `testt` string, returns
 * `fieldone` and `fieldtwo`. Fires on demand via `run(testt)`.
 */
export function useInputOutput() {
  const { mutateAsync, isPending, error, reset } = useExecuteWorkflowNodeMutation()

  const run = async (testt: string): Promise<InputOutputResult | undefined> => {
    const result = (await mutateAsync({
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
          parameters: { __internals__: INTERNALS, testt },
          synchronous: true,
        },
        options: {},
      },
    })) as ExecuteResponse
    return extractResult(result)
  }

  return { run, isPending, error, reset }
}
