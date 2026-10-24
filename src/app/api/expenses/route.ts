import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/expenses
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const bucket = searchParams.get('bucket')
    const items = await db.expense.findMany({
      where: bucket ? { bucket } : undefined,
      include: { subscription: true },
      orderBy: { date: 'desc' },
    })
    return NextResponse.json({ items })
  } catch (e) {
    console.error('GET /api/expenses', e)
    return NextResponse.json({ error: 'Error al listar gastos' }, { status: 500 })
  }
}

// POST /api/expenses
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { bucket, category, description, amount, frequency, date, notes, subscriptionId } = body

    if (!description || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const item = await db.expense.create({
      data: {
        bucket: bucket || 'fijo',
        category: category || 'general',
        description: String(description),
        amount: Number(amount),
        frequency: frequency || 'unico',
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
        subscriptionId: subscriptionId || null,
      },
      include: { subscription: true },
    })
    return NextResponse.json({ item })
  } catch (e) {
    console.error('POST /api/expenses', e)
    return NextResponse.json({ error: 'Error al crear gasto' }, { status: 500 })
  }
}
