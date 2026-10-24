import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/subscriptions
export async function GET() {
  try {
    const items = await db.subscription.findMany({
      include: { expenses: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ items })
  } catch (e) {
    console.error('GET /api/subscriptions', e)
    return NextResponse.json({ error: 'Error al listar suscripciones' }, { status: 500 })
  }
}

// POST /api/subscriptions
// Si el body incluye `createExpense: true` también genera un gasto asociado para el mes actual
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, provider, billingCycle, amount, startDate, renewalDate,
      active, bucket, category, notes, createExpense,
    } = body

    if (!name || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const item = await db.subscription.create({
      data: {
        name: String(name),
        provider: provider || null,
        billingCycle: billingCycle || 'mensual',
        amount: Number(amount),
        startDate: startDate ? new Date(startDate) : new Date(),
        renewalDate: renewalDate ? new Date(renewalDate) : null,
        active: active ?? true,
        bucket: bucket || 'extraordinario',
        category: category || 'suscripcion',
        notes: notes || null,
      },
    })

    // Generar gasto asociado automáticamente si se solicita
    if (createExpense) {
      await db.expense.create({
        data: {
          bucket: item.bucket,
          category: item.category,
          description: `Suscripción: ${item.name}`,
          amount: item.amount,
          frequency: item.billingCycle === 'anual' ? 'anual' : 'mensual',
          date: new Date(),
          subscriptionId: item.id,
        },
      })
    }

    return NextResponse.json({ item })
  } catch (e) {
    console.error('POST /api/subscriptions', e)
    return NextResponse.json({ error: 'Error al crear suscripción' }, { status: 500 })
  }
}
