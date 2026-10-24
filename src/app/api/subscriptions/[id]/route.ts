import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await db.subscription.findUnique({
      where: { id },
      include: { expenses: true },
    })
    if (!item) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ item })
  } catch (e) {
    console.error('GET /api/subscriptions/[id]', e)
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
    const {
      name, provider, billingCycle, amount, startDate, renewalDate,
      active, bucket, category, notes,
    } = body

    const item = await db.subscription.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name) }),
        ...(provider !== undefined && { provider: provider || null }),
        ...(billingCycle !== undefined && { billingCycle }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(renewalDate !== undefined && { renewalDate: renewalDate ? new Date(renewalDate) : null }),
        ...(active !== undefined && { active: Boolean(active) }),
        ...(bucket !== undefined && { bucket }),
        ...(category !== undefined && { category }),
        ...(notes !== undefined && { notes: notes || null }),
      },
      include: { expenses: true },
    })
    return NextResponse.json({ item })
  } catch (e) {
    console.error('PUT /api/subscriptions/[id]', e)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Antes de borrar, desvincular gastos asociados
    await db.expense.updateMany({
      where: { subscriptionId: id },
      data: { subscriptionId: null },
    })
    await db.subscription.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/subscriptions/[id]', e)
    return NextResponse.json({ error: 'Error al borrar' }, { status: 500 })
  }
}
