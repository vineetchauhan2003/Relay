import { create } from 'zustand'
import type { Category, Priority, Status, TicketType } from './constants'

// UI-only client state: filters, search, dialog open/prefill, sorting, theme.
// No server/domain data lives here.

export type SortKey = 'priority' | 'sla' | 'updated' | 'created'
export type AssigneeFilter = 'all' | 'mine' | 'unassigned'

export type CreatePrefill = {
  type?: TicketType
  category?: Category
  subject?: string
} | null

type UIState = {
  // ticket queue filters
  search: string
  statusFilter: Status | 'all'
  priorityFilter: Priority | 'all'
  typeFilter: TicketType | 'all'
  assigneeFilter: AssigneeFilter
  sortKey: SortKey
  setSearch: (v: string) => void
  setStatusFilter: (v: Status | 'all') => void
  setPriorityFilter: (v: Priority | 'all') => void
  setTypeFilter: (v: TicketType | 'all') => void
  setAssigneeFilter: (v: AssigneeFilter) => void
  setSortKey: (v: SortKey) => void
  clearFilters: () => void

  // create dialog
  createOpen: boolean
  createPrefill: CreatePrefill
  openCreate: (prefill?: CreatePrefill) => void
  closeCreate: () => void
}

export const useUIStore = create<UIState>((set) => ({
  search: '',
  statusFilter: 'all',
  priorityFilter: 'all',
  typeFilter: 'all',
  assigneeFilter: 'all',
  sortKey: 'updated',
  setSearch: (v) => set({ search: v }),
  setStatusFilter: (v) => set({ statusFilter: v }),
  setPriorityFilter: (v) => set({ priorityFilter: v }),
  setTypeFilter: (v) => set({ typeFilter: v }),
  setAssigneeFilter: (v) => set({ assigneeFilter: v }),
  setSortKey: (v) => set({ sortKey: v }),
  clearFilters: () =>
    set({
      search: '',
      statusFilter: 'all',
      priorityFilter: 'all',
      typeFilter: 'all',
      assigneeFilter: 'all',
    }),

  createOpen: false,
  createPrefill: null,
  openCreate: (prefill = null) => set({ createOpen: true, createPrefill: prefill }),
  closeCreate: () => set({ createOpen: false, createPrefill: null }),
}))
