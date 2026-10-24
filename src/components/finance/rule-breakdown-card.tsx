'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { Summary } from '@/lib/finance/hooks'
import { formatEUR, BUCKET_COLORS, BUCKET_LABELS } from '@/lib/finance/format'
import { Home, Sparkles, PiggyBank } from 'lucide-react'

type Props = { summary: Summary }

export function RuleBreakdownCard({ summary }: Props) {
  const { buckets, totals } = summary
  const items = [
    {
      key: 'fijo',
      label: BUCKET_LABELS.fijo,
      icon: Home,
      target: buckets.targets.fixed,
      real: buckets.monthly.fijo || 0,
      pct: buckets.pct.fixed,
      color: BUCKET_COLORS.fijo,
      hint: 'Vivienda, comida, transporte, suministros, salud.',
    },
    {
      key: 'extraordinario',
      label: BUCKET_LABELS.extraordinario,
      icon: Sparkles,
      target: buckets.targets.extra,
      real: buckets.monthly.extraordinario || 0,
      pct: buckets.pct.extra,
      color: BUCKET_COLORS.extraordinario,
      hint: 'Ocio, suscripciones, restaurantes, caprichos.',
    },
    {
      key: 'ahorro',
      label: BUCKET_LABELS.ahorro,
      icon: PiggyBank,
      target: buckets.targets.savings,
      real: buckets.monthly.ahorro || 0,
      pct: buckets.pct.savings,
      color: BUCKET_COLORS.ahorro,
      hint: 'Fondo de estabilidad → cuenta remunerada.',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Regla {buckets.pct.fixed}/{buckets.pct.extra}/{buckets.pct.savings}</CardTitle>
        <CardDescription>
          Objetivos calculados sobre{' '}
          <strong className="text-foreground">
            {buckets.base === 'salario' ? 'el salario' : buckets.base === 'total' ? 'el total de ingresos' : 'base personalizada'}
          </strong>{' '}
          ({formatEUR(buckets.baseAmount)}/mes).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((it) => {
          const ratio = it.target > 0 ? (it.real / it.target) * 100 : 0
          const over = it.real > it.target
          const diff = it.real - it.target
          const Icon = it.icon
          return (
            <div key={it.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="rounded-md p-1.5"
                    style={{ backgroundColor: `${it.color}20`, color: it.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{it.label}</p>
                    <p className="text-xs text-muted-foreground">{it.hint}</p>
                  </div>
                </div>
                <div className="text-right tabular-nums">
                  <p className="font-semibold">{formatEUR(it.real)}/mes</p>
                  <p className="text-xs text-muted-foreground">objetivo {formatEUR(it.target)}</p>
                </div>
              </div>
              <Progress
                value={Math.min(100, ratio)}
                className="h-2"
                style={{
                  ['--progress-foreground' as any]: it.color,
                }}
              />
              <div className="flex items-center justify-between text-xs">
                <span className={over ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                  {over ? `+${formatEUR(Math.abs(diff))} sobre objetivo` : `${formatEUR(Math.abs(diff))} de margen`}
                </span>
                <span className="text-muted-foreground">{Math.round(ratio)}% del objetivo</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
