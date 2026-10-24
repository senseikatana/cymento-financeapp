import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const SINGLETON_ID = 'singleton'

async function getOrCreateSettings() {
  let s = await db.settings.findUnique({ where: { id: SINGLETON_ID } })
  if (!s) {
    s = await db.settings.create({ data: { id: SINGLETON_ID } })
  }
  return s
}

export async function GET() {
  try {
    const settings = await getOrCreateSettings()
    return NextResponse.json({ settings })
  } catch (e) {
    console.error('GET /api/settings', e)
    return NextResponse.json({ error: 'Error al leer ajustes' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      pctFixed, pctExtra, pctSavings,
      ruleBase, currency, locale,
    } = body

    const current = await getOrCreateSettings()
    const updated = await db.settings.update({
      where: { id: SINGLETON_ID },
      data: {
        ...(pctFixed !== undefined && { pctFixed: Number(pctFixed) }),
        ...(pctExtra !== undefined && { pctExtra: Number(pctExtra) }),
        ...(pctSavings !== undefined && { pctSavings: Number(pctSavings) }),
        ...(ruleBase !== undefined && { ruleBase }),
        ...(currency !== undefined && { currency }),
        ...(locale !== undefined && { locale }),
      },
    })
    return NextResponse.json({ settings: updated })
  } catch (e) {
    console.error('PUT /api/settings', e)
    return NextResponse.json({ error: 'Error al actualizar ajustes' }, { status: 500 })
  }
}
