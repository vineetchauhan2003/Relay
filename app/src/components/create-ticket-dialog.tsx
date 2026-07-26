import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CATEGORIES,
  CURRENT_AGENT_ID,
  PRIORITIES,
  PRIORITY_ORDER,
  TICKET_TYPES,
  UNASSIGNED,
  type Category,
  type Priority,
  type TicketType,
} from '@/lib/constants'
import { useUIStore } from '@/lib/store'
import { useAgents, useTicketActions } from '@/data'

const TYPE_KEYS = Object.keys(TICKET_TYPES) as TicketType[]
const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[]

export function CreateTicketDialog() {
  const open = useUIStore((s) => s.createOpen)
  const prefill = useUIStore((s) => s.createPrefill)
  const closeCreate = useUIStore((s) => s.closeCreate)
  const { createTicket } = useTicketActions()
  const agents = useAgents()
  const navigate = useNavigate()

  const [type, setType] = useState<TicketType>('incident')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [requesterId, setRequesterId] = useState(agents[0]?.id ?? '')
  const [category, setCategory] = useState<Category>('other')
  const [priority, setPriority] = useState<Priority>('medium')
  const [assigneeId, setAssigneeId] = useState<string>(UNASSIGNED)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setType(prefill?.type ?? 'incident')
    setSubject(prefill?.subject ?? '')
    setDescription('')
    setRequesterId(agents[0]?.id ?? '')
    setCategory(prefill?.category ?? 'other')
    setPriority('medium')
    setAssigneeId(UNASSIGNED)
    setError('')
  }, [open, prefill, agents])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim()) {
      setError('A subject is required.')
      return
    }
    const ticket = createTicket({
      type,
      subject: subject.trim(),
      description: description.trim(),
      requesterId,
      category,
      priority,
      assigneeId: assigneeId === UNASSIGNED ? null : assigneeId,
    })
    toast.success(`${ticket.key} created`, { description: ticket.subject })
    closeCreate()
    navigate(`/tickets/${ticket.key}`)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? null : closeCreate())}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading">Log a ticket</DialogTitle>
          <DialogDescription>
            Capture an incident or request. An SLA target is set automatically from priority.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as TicketType)}>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_KEYS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {TICKET_TYPES[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_ORDER.map((k) => (
                    <SelectItem key={k} value={k}>
                      {PRIORITIES[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value)
                if (error) setError('')
              }}
              placeholder="Short summary of the issue or request"
              aria-invalid={!!error}
            />
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any detail that will help resolve this faster"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="requester">Requester</Label>
              <Select value={requesterId} onValueChange={setRequesterId}>
                <SelectTrigger id="requester" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_KEYS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {CATEGORIES[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assignee">Assignee</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger id="assignee" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                {agents
                  .filter((a) => a.role !== 'requester' || a.id === CURRENT_AGENT_ID)
                  .map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={closeCreate}>
              Cancel
            </Button>
            <Button type="submit">Create ticket</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
