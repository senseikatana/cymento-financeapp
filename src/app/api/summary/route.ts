import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper: convertir frecuencia a equivalente mensual
function monthlyAmount(amount: number, freq: string): number {
  switch (freq) {
    case 'mensual': return amount
    case 'anual': return amount / 12
    case 'trimestral': return amount / 3
    case 'semestral': return amount / 6
    case 'unico': return 0 // los únicos no se cuentan como recurrentes
    default: return amount
  }
}

// Helper: anualizar una cantidad según frecuencia
function yearlyAmount(amount: number, freq: string): number {
  switch (freq) {
    case 'mensual': return amount * 12
    case 'anual': return amount
    case 'trimestral': return amount * 4
    case 'semestral': return amount * 2
    case 'unico': return amount
    default: return amount * 12
  }
}

export async function GET() {
  try {
    const [incomes, expenses, subscriptions, settings] = await Promise.all([
      db.income.findMany(),
      db.expense.findMany(),
      db.subscription.findMany({ include: { expenses: true } }),
      db.settings.findUnique({ where: { id: 'singleton' } }),
    ])

    // 1. Ingresos recurrentes mensuales
    const activeIncomes = incomes.filter((i) => i.active && i.frequency !== 'unico')
    const totalIncomeMonthly = activeIncomes.reduce(
      (sum, i) => sum + monthlyAmount(i.amount, i.frequency),
      0
    )

    // 2. Ingresos únicos (paga extra, ahorros previos puntuales)
    const uniqueIncomes = incomes.filter((i) => i.frequency === 'unico')
    const totalUniqueIncome = uniqueIncomes.reduce((sum, i) => sum + i.amount, 0)

    // 3. Gastos recurrentes por bucket
    const recurringExpenses = expenses.filter((e) => e.frequency !== 'unico')
    const bucketMonthly = {
      fijo: 0,
      extraordinario: 0,
      ahorro: 0,
    } as Record<string, number>
    for (const e of recurringExpenses) {
      bucketMonthly[e.bucket] = (bucketMonthly[e.bucket] || 0) + monthlyAmount(e.amount, e.frequency)
    }

    // 4. Gastos únicos por bucket (acumulado histórico)
    const uniqueExpenses = expenses.filter((e) => e.frequency === 'unico')
    const bucketUnique = { fijo: 0, extraordinario: 0, ahorro: 0 } as Record<string, number>
    for (const e of uniqueExpenses) {
      bucketUnique[e.bucket] = (bucketUnique[e.bucket] || 0) + e.amount
    }

    // 5. Suscripciones: total mensual y anual
    const activeSubs = subscriptions.filter((s) => s.active)
    const subsMonthly = activeSubs.reduce(
      (sum, s) => sum + monthlyAmount(s.amount, s.billingCycle),
      0
    )
    const subsYearly = activeSubs.reduce(
      (sum, s) => sum + yearlyAmount(s.amount, s.billingCycle),
      0
    )

    // 6. Aplicar la regla 50/30/20 según base configurada
    const pctFixed = settings?.pctFixed ?? 50
    const pctExtra = settings?.pctExtra ?? 30
    const pctSavings = settings?.pctSavings ?? 20
    const ruleBase = settings?.ruleBase || 'total'

    let baseForRule = totalIncomeMonthly
    if (ruleBase === 'salario') {
      const salario = activeIncomes.find((i) => i.type === 'salario')
      baseForRule = salario ? monthlyAmount(salario.amount, salario.frequency) : 0
    }

    const ruleTargets = {
      fixed: (baseForRule * pctFixed) / 100,
      extra: (baseForRule * pctExtra) / 100,
      savings: (baseForRule * pctSavings) / 100,
    }

    // 7. Estado real vs objetivo
    const realFixed = bucketMonthly.fijo
    const realExtra = bucketMonthly.extraordinario
    const realSavings = bucketMonthly.ahorro
    const totalSpent = realFixed + realExtra + realSavings
    const balance = totalIncomeMonthly - totalSpent

    // 8. Desglose por categoría (mensual)
    const byCategory: Record<string, number> = {}
    for (const e of recurringExpenses) {
      byCategory[e.category] = (byCategory[e.category] || 0) + monthlyAmount(e.amount, e.frequency)
    }

    // 9. Próximas renovaciones de suscripciones
    const upcomingRenewals = activeSubs
      .filter((s) => s.renewalDate)
      .map((s) => ({
        id: s.id,
        name: s.name,
        amount: s.amount,
        billingCycle: s.billingCycle,
        renewalDate: s.renewalDate!,
        daysUntil: Math.ceil((new Date(s.renewalDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5)

    return NextResponse.json({
      totals: {
        incomeMonthly: totalIncomeMonthly,
        incomeUnique: totalUniqueIncome,
        incomeYearly: totalIncomeMonthly * 12 + totalUniqueIncome,
        expensesMonthly: totalSpent,
        balanceMonthly: balance,
        subsMonthly,
        subsYearly,
      },
      buckets: {
        monthly: bucketMonthly,
        unique: bucketUnique,
        targets: ruleTargets,
        pct: { fixed: pctFixed, extra: pctExtra, savings: pctSavings },
        base: ruleBase,
        baseAmount: baseForRule,
      },
      byCategory,
      subscriptions: {
        count: activeSubs.length,
        monthly: subsMonthly,
        yearly: subsYearly,
        upcomingRenewals,
      },
      counts: {
        incomes: incomes.length,
        expenses: expenses.length,
        subscriptions: subscriptions.length,
      },
    })
  } catch (e) {
    console.error('GET /api/summary', e)
    return NextResponse.json({ error: 'Error al calcular resumen' }, { status: 500 })
  }
}
