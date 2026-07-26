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

type WorkflowResponse = {
  response?: { body?: { random_text?: string } }
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
    return (result as WorkflowResponse | undefined)?.response?.body?.random_text
  }

  return { run, isPending, error, reset }
}
