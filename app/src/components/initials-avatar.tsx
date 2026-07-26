import { cn } from '@/lib/utils'

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

const SIZES = {
  sm: 'size-6 text-[0.625rem]',
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm',
} as const

export function InitialsAvatar({
  name,
  size = 'md',
  className,
}: {
  name: string
  size?: keyof typeof SIZES
  className?: string
}) {
  const isUnassigned = name === 'Unassigned'
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-sm font-medium',
        isUnassigned
          ? 'bg-muted text-muted-foreground'
          : 'bg-[color-mix(in_srgb,var(--primary)_22%,transparent)] text-primary',
        SIZES[size],
        className,
      )}
    >
      {isUnassigned ? '—' : initials(name)}
    </span>
  )
}
