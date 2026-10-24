'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import type { Summary } from '@/lib/finance/hooks'
import { formatEUR, BUCKET_COLORS, BUCKET_SHORT } from '@/lib/finance/format'

type Props = { summary: Summary }

export function DashboardCharts({ summary }: Props) {
  const pieData = [
    { name: BUCKET_SHORT.fijo, value: summary.buckets.monthly.fijo || 0, key: 'fijo' },
    { name: BUCKET_SHORT.extraordinario, value: summary.buckets.monthly.extraordinario || 0, key: 'extraordinario' },
    { name: BUCKET_SHORT.ahorro, value: summary.buckets.monthly.ahorro || 0, key: 'ahorro' },
  ].filter((d) => d.value > 0)

  const catData = Object.entries(summary.byCategory)
    .filter(([_, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }))

  // Comparativa objetivo vs real
  const compareData = [
    {
      name: 'Fijos',
      Objetivo: summary.buckets.targets.fixed,
      Real: summary.buckets.monthly.fijo || 0,
    },
    {
      name: 'Extras',
      Objetivo: summary.buckets.targets.extra,
      Real: summary.buckets.monthly.extraordinario || 0,
    },
    {
      name: 'Ahorro',
      Objetivo: summary.buckets.targets.savings,
      Real: summary.buckets.monthly.ahorro || 0,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Pie de buckets */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">Distribución mensual por bucket</h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                label={(entry: any) => `${entry.name}: ${formatEUR(entry.value)}`}
                labelLine={false}
                fontSize={11}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.key} fill={BUCKET_COLORS[entry.key as keyof typeof BUCKET_COLORS]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatEUR(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparativa objetivo vs real */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">Objetivo vs Real (mensual)</h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={compareData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}€`} />
              <Tooltip formatter={(v: number) => formatEUR(v)} contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Objetivo" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Real" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gastos por categoría */}
      <div className="rounded-xl border bg-card p-4 md:col-span-2">
        <h3 className="text-sm font-semibold mb-3">Top 8 categorías de gasto (mensual)</h3>
        {catData.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Sin datos de gastos todavía.</p>
        ) : (
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={catData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}€`} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number) => formatEUR(v)} contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
