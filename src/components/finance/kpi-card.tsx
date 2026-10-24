'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type Props = {
  title: string
  value: string
  subtitle?: string
  icon?: LucideIcon
  accent?: 'green' | 'amber' | 'violet' | 'red' | 'slate'
  progress?: number // 0-100
}

const accentMap: Record<NonNullable<Props['accent']>, { ring: string; icon: string; bar: string }> = {
  green:  { ring: 'ring-emerald-500/30',  icon: 'text-emerald-600 dark:text-emerald-400',  bar: 'bg-emerald-500' },
  amber:  { ring: 'ring-amber-500/30',    icon: 'text-amber-600 dark:text-amber-400',      bar: 'bg-amber-500' },
  violet: { ring: 'ring-violet-500/30',   icon: 'text-violet-600 dark:text-violet-400',   bar: 'bg-violet-500' },
  red:    { ring: 'ring-rose-500/30',     icon: 'text-rose-600 dark:text-rose-400',         bar: 'bg-rose-500' },
  slate:  { ring: 'ring-slate-500/30',    icon: 'text-slate-600 dark:text-slate-400',      bar: 'bg-slate-500' },
}

export function KpiCard({ title, value, subtitle, icon: Icon, accent = 'slate', progress }: Props) {
  const a = accentMap[accent]
  return (
    <Card className={cn('relative overflow-hidden ring-1', a.ring)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
              {title}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums sm:text-2xl">{value}</p>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className={cn('rounded-lg bg-muted/50 p-2 shrink-0', a.icon)}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        {typeof progress === 'number' && (
          <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full transition-all', a.bar)}
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
