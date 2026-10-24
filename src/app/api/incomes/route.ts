import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/incomes — lista todos los ingresos
export async function GET() {
  try {
    const items = await db.income.findMany({
      orderBy: { date: 'desc' },
    })
    return NextResponse.json({ items })
  } catch (e) {
    console.error('GET /api/incomes', e)
    return NextResponse.json({ error: 'Error al listar ingresos' }, { status: 500 })
  }
}

// POST /api/incomes — crea un nuevo ingreso
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, source, amount, frequency, date, active, notes, category } = body

    if (!source || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const item = await db.income.create({
      data: {
        type: type || 'salario',
        source: String(source),
        amount: Number(amount),
        frequency: frequency || 'unico',
        date: date ? new Date(date) : new Date(),
        active: active ?? true,
        notes: notes || null,
        category: category || null,
      },
    })
    return NextResponse.json({ item })
  } catch (e) {
    console.error('POST /api/incomes', e)
    return NextResponse.json({ error: 'Error al crear ingreso' }, { status: 500 })
  }
}
