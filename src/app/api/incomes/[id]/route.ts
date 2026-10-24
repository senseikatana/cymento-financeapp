import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/incomes/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await db.income.findUnique({ where: { id } })
    if (!item) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ item })
  } catch (e) {
    console.error('GET /api/incomes/[id]', e)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

// PUT /api/incomes/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { type, source, amount, frequency, date, active, notes, category } = body

    const item = await db.income.update({
      where: { id },
      data: {
        ...(type !== undefined && { type }),
        ...(source !== undefined && { source: String(source) }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(frequency !== undefined && { frequency }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(active !== undefined && { active: Boolean(active) }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(category !== undefined && { category: category || null }),
      },
    })
    return NextResponse.json({ item })
  } catch (e) {
    console.error('PUT /api/incomes/[id]', e)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

// DELETE /api/incomes/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.income.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/incomes/[id]', e)
    return NextResponse.json({ error: 'Error al borrar' }, { status: 500 })
  }
}
