import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await db.expense.findUnique({ where: { id }, include: { subscription: true } })
    if (!item) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ item })
  } catch (e) {
    console.error('GET /api/expenses/[id]', e)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { bucket, category, description, amount, frequency, date, notes, subscriptionId } = body

    const item = await db.expense.update({
      where: { id },
      data: {
        ...(bucket !== undefined && { bucket }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description: String(description) }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(frequency !== undefined && { frequency }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(subscriptionId !== undefined && { subscriptionId: subscriptionId || null }),
      },
      include: { subscription: true },
    })
    return NextResponse.json({ item })
  } catch (e) {
    console.error('PUT /api/expenses/[id]', e)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.expense.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/expenses/[id]', e)
    return NextResponse.json({ error: 'Error al borrar' }, { status: 500 })
  }
}
