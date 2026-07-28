import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Ticket as TicketIcon,
  LayoutGrid,
  BookOpen,
  Sparkles,
  Plus,
  Menu,
  LifeBuoy,
  Database,
  ArrowLeftRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUIStore } from '@/lib/store'
import { CURRENT_AGENT_ID } from '@/lib/constants'
import { useAgentMap } from '@/data'
import { InitialsAvatar } from '@/components/initials-avatar'
import { GlobalSearch } from '@/components/global-search'
import { CreateTicketDialog } from '@/components/create-ticket-dialog'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tickets', label: 'Tickets', icon: TicketIcon, end: false },
  { to: '/catalog', label: 'Catalog', icon: LayoutGrid, end: false },
  { to: '/knowledge', label: 'Knowledge', icon: BookOpen, end: false },
  { to: '/random', label: 'Random Text', icon: Sparkles, end: false },
  { to: '/input-output', label: 'Input Output', icon: ArrowLeftRight, end: false },
  { to: '/data', label: 'Data', icon: Database, end: false },
] as const

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Primary">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
            )
          }
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-sm bg-primary text-primary-foreground">
        <LifeBuoy className="size-5" aria-hidden />
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight">Relay</span>
    </Link>
  )
}

function SidebarInner({ onNavigate }: { onNavigate?: () => void }) {
  const openCreate = useUIStore((s) => s.openCreate)
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="px-1 pt-1">
        <Brand />
      </div>
      <Button
        onClick={() => {
          openCreate()
          onNavigate?.()
        }}
        className="w-full justify-start gap-2"
      >
        <Plus className="size-4" aria-hidden />
        New ticket
      </Button>
      <NavItems onNavigate={onNavigate} />
      <p className="mt-auto px-3 text-xs text-sidebar-foreground/50">
        Service desk console
      </p>
    </div>
  )
}

export function AppLayout() {
  const agentMap = useAgentMap()
  const me = agentMap[CURRENT_AGENT_ID]
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarInner />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarInner onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <GlobalSearch />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-sm px-1.5 py-1 transition-colors hover:bg-accent"
              >
                <InitialsAvatar name={me?.name ?? 'Agent'} size="sm" />
                <span className="hidden text-sm font-medium sm:inline">{me?.name}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{me?.name}</p>
                  <p className="text-xs font-normal text-muted-foreground">{me?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="capitalize">
                {me?.role} · {me?.team}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      <CreateTicketDialog />
    </div>
  )
}
