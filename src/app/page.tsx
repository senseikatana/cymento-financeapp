'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Settings as SettingsIcon,
  Plus, Calendar, Repeat, Bell, Loader2, ScrollText,
} from 'lucide-react'

import { KpiCard } from '@/components/finance/kpi-card'
import { SyncToolbar } from '@/components/finance/sync-toolbar'
import { DashboardCharts } from '@/components/finance/dashboard-charts'
import { RuleBreakdownCard } from '@/components/finance/rule-breakdown-card'
import {
  IncomesTable, ExpensesTable, SubscriptionsTable,
} from '@/components/finance/data-tables'
import { IncomeFormDialog } from '@/components/finance/income-form-dialog'
import { ExpenseFormDialog } from '@/components/finance/expense-form-dialog'
import { SubscriptionFormDialog } from '@/components/finance/subscription-form-dialog'
import { SettingsDialog } from '@/components/finance/settings-dialog'
import { ThemeToggle } from '@/components/theme-toggle'

import {
  useIncomes, useExpenses, useSubscriptions, useSummary,
  type Income, type Expense, type Subscription,
} from '@/lib/finance/hooks'
import { formatEUR, formatDate } from '@/lib/finance/format'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [incomeDialog, setIncomeDialog] = useState(false)
  const [expenseDialog, setExpenseDialog] = useState(false)
  const [subDialog, setSubDialog] = useState(false)
  const [settingsDialog, setSettingsDialog] = useState(false)

  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editingSub, setEditingSub] = useState<Subscription | null>(null)

  const { data: summary, isLoading: loadingSummary } = useSummary()
  const { data: incomes = [], isLoading: loadingIncomes } = useIncomes()
  const { data: expenses = [], isLoading: loadingExpenses } = useExpenses()
  const { data: subs = [], isLoading: loadingSubs } = useSubscriptions()

  const openNewIncome = () => { setEditingIncome(null); setIncomeDialog(true) }
  const openEditIncome = (i: Income) => { setEditingIncome(i); setIncomeDialog(true) }
  const openNewExpense = () => { setEditingExpense(null); setExpenseDialog(true) }
  const openEditExpense = (e: Expense) => { setEditingExpense(e); setExpenseDialog(true) }
  const openNewSub = () => { setEditingSub(null); setSubDialog(true) }
  const openEditSub = (s: Subscription) => { setEditingSub(s); setSubDialog(true) }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-violet-600 p-1.5 text-white">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold leading-none">Finanzas Personales</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Regla 50/30/20 · Sincronizable con Excel / Google Sheets
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSettingsDialog(true)}>
              <SettingsIcon className="h-4 w-4 mr-2" /> Ajustes
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ===== Main ===== */}
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
        {/* Sync toolbar */}
        <div className="rounded-xl border bg-card p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  Sincronización
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Exporta tu presupuesto a Excel para abrirlo en OnlyOffice/LibreOffice o subirlo a Google Drive.
                </p>
              </div>
            </div>
            <SyncToolbar />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm">Dashboard</TabsTrigger>
            <TabsTrigger value="ingresos" className="text-xs sm:text-sm">
              Ingresos {incomes.length > 0 && <Badge variant="secondary" className="ml-1.5">{incomes.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="gastos" className="text-xs sm:text-sm">
              Gastos {expenses.length > 0 && <Badge variant="secondary" className="ml-1.5">{expenses.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="suscripciones" className="text-xs sm:text-sm">
              Suscripciones {subs.length > 0 && <Badge variant="secondary" className="ml-1.5">{subs.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* ===== DASHBOARD ===== */}
          <TabsContent value="dashboard" className="space-y-6 mt-4">
            {loadingSummary || !summary ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* KPIs */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                  <KpiCard
                    title="Ingresos / mes"
                    value={formatEUR(summary.totals.incomeMonthly)}
                    subtitle={`+ ${formatEUR(summary.totals.incomeUnique)} únicos`}
                    icon={TrendingUp}
                    accent="green"
                  />
                  <KpiCard
                    title="Gastos / mes"
                    value={formatEUR(summary.totals.expensesMonthly)}
                    subtitle={`Saldo: ${formatEUR(summary.totals.balanceMonthly)}`}
                    icon={TrendingDown}
                    accent={summary.totals.balanceMonthly >= 0 ? 'slate' : 'red'}
                  />
                  <KpiCard
                    title="Suscripciones / mes"
                    value={formatEUR(summary.totals.subsMonthly)}
                    subtitle={`${formatEUR(summary.totals.subsYearly)}/año · ${summary.subscriptions.count} activas`}
                    icon={Repeat}
                    accent="amber"
                  />
                  <KpiCard
                    title="Ahorro / mes"
                    value={formatEUR(summary.buckets.monthly.ahorro || 0)}
                    subtitle={`Objetivo: ${formatEUR(summary.buckets.targets.savings)}`}
                    icon={PiggyBank}
                    accent="violet"
                    progress={
                      summary.buckets.targets.savings > 0
                        ? ((summary.buckets.monthly.ahorro || 0) / summary.buckets.targets.savings) * 100
                        : 0
                    }
                  />
                </div>

                {/* Charts */}
                <DashboardCharts summary={summary} />

                {/* Rule breakdown */}
                <RuleBreakdownCard summary={summary} />

                {/* Próximas renovaciones */}
                {summary.subscriptions.upcomingRenewals.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Bell className="h-4 w-4 text-amber-500" />
                        Próximas renovaciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {summary.subscriptions.upcomingRenewals.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{r.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(r.renewalDate)}
                            </p>
                          </div>
                          <div className="text-right ml-2 shrink-0">
                            <p className="text-sm font-medium tabular-nums">{formatEUR(r.amount)}</p>
                            <p className={`text-xs ${r.daysUntil < 0 ? 'text-rose-500' : r.daysUntil < 7 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                              {r.daysUntil < 0 ? `hace ${Math.abs(r.daysUntil)}d` : `en ${r.daysUntil}d`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

              </>
            )}
          </TabsContent>

          {/* ===== INGRESOS ===== */}
          <TabsContent value="ingresos" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Ingresos</h2>
                <p className="text-sm text-muted-foreground">
                  Salario, subsidio de paro, ahorros previos. Marca recurrentes para que cuenten en los totales mensuales.
                </p>
              </div>
              <Button onClick={openNewIncome} size="sm">
                <Plus className="h-4 w-4 mr-2" /> Añadir ingreso
              </Button>
            </div>
            {loadingIncomes ? (
              <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : (
              <IncomesTable items={incomes} onEdit={openEditIncome} onAdd={openNewIncome} />
            )}
          </TabsContent>

          {/* ===== GASTOS ===== */}
          <TabsContent value="gastos" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Gastos</h2>
                <p className="text-sm text-muted-foreground">
                  Clasificados en los 3 buckets de la regla 50/30/20. Marca frecuentes como mensuales/anuales para que cuenten.
                </p>
              </div>
              <Button onClick={openNewExpense} size="sm">
                <Plus className="h-4 w-4 mr-2" /> Añadir gasto
              </Button>
            </div>
            {loadingExpenses ? (
              <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : (
              <ExpensesTable items={expenses} onEdit={openEditExpense} onAdd={openNewExpense} />
            )}
          </TabsContent>

          {/* ===== SUSCRIPCIONES ===== */}
          <TabsContent value="suscripciones" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Suscripciones</h2>
                <p className="text-sm text-muted-foreground">
                  Gestiona tus pagos recurrentes. Las mensuales y anuales se contabilizan automáticamente en el bucket seleccionado.
                </p>
              </div>
              <Button onClick={openNewSub} size="sm">
                <Plus className="h-4 w-4 mr-2" /> Añadir suscripción
              </Button>
            </div>
            {loadingSubs ? (
              <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : (
              <>
                {subs.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Mensual equivalente</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold tabular-nums">
                          {formatEUR(subs.filter(s => s.active).reduce((sum, s) => {
                            if (s.billingCycle === 'mensual') return sum + s.amount
                            if (s.billingCycle === 'anual') return sum + s.amount / 12
                            if (s.billingCycle === 'trimestral') return sum + s.amount / 3
                            if (s.billingCycle === 'semestral') return sum + s.amount / 6
                            return sum
                          }, 0))}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">suma de todas las activas</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Coste anual</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold tabular-nums">
                          {formatEUR(subs.filter(s => s.active).reduce((sum, s) => {
                            if (s.billingCycle === 'mensual') return sum + s.amount * 12
                            if (s.billingCycle === 'anual') return sum + s.amount
                            if (s.billingCycle === 'trimestral') return sum + s.amount * 4
                            if (s.billingCycle === 'semestral') return sum + s.amount * 2
                            return sum
                          }, 0))}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">lo que gastarás en 12 meses</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Suscripciones activas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold tabular-nums">{subs.filter(s => s.active).length}</p>
                        <p className="text-xs text-muted-foreground mt-1">de {subs.length} totales</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
                <SubscriptionsTable items={subs} onEdit={openEditSub} onAdd={openNewSub} />
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* ===== Footer ===== */}
      <footer className="mt-auto border-t bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
          <p>
            Hecho con Next.js · Prisma · shadcn/ui · Recharts · xlsx
          </p>
          <p>
            Datos almacenados en SQLite local · Exportable a Excel/Google Sheets para BigLinux + OnlyOffice
          </p>
        </div>
      </footer>

      {/* ===== Dialogs ===== */}
      <IncomeFormDialog open={incomeDialog} onOpenChange={setIncomeDialog} editing={editingIncome} />
      <ExpenseFormDialog open={expenseDialog} onOpenChange={setExpenseDialog} editing={editingExpense} />
      <SubscriptionFormDialog open={subDialog} onOpenChange={setSubDialog} editing={editingSub} />
      <SettingsDialog open={settingsDialog} onOpenChange={setSettingsDialog} />
    </div>
  )
}
