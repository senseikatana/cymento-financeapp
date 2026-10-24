import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

// ============================================================
// POST /api/sync/import  — recibe un archivo .xlsx y lo importa
// Formato esperado (3 hojas): Ingresos, Gastos, Suscripciones
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 })
    }

    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array' })

    let imported = { incomes: 0, expenses: 0, subscriptions: 0 }

    // --- Hoja Ingresos ---
    if (wb.SheetNames.includes('Ingresos')) {
      const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets['Ingresos'])
      for (const r of rows) {
        if (!r.source && !r.fuente) continue
        await db.income.create({
          data: {
            type: String(r.type || r.tipo || 'salario'),
            source: String(r.source || r.fuente),
            amount: Number(r.amount || r.importe || 0),
            frequency: String(r.frequency || r.frecuencia || 'unico'),
            date: r.date || r.fecha ? new Date(r.date || r.fecha) : new Date(),
            active: r.active !== undefined ? Boolean(r.active) : true,
            notes: r.notes || r.notas ? String(r.notes || r.notas) : null,
            category: r.category || r.categoria ? String(r.category || r.categoria) : null,
          },
        })
        imported.incomes++
      }
    }

    // --- Hoja Gastos ---
    if (wb.SheetNames.includes('Gastos')) {
      const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets['Gastos'])
      for (const r of rows) {
        if (!r.description && !r.descripcion) continue
        await db.expense.create({
          data: {
            bucket: String(r.bucket || 'fijo'),
            category: String(r.category || r.categoria || 'general'),
            description: String(r.description || r.descripcion),
            amount: Number(r.amount || r.importe || 0),
            frequency: String(r.frequency || r.frecuencia || 'unico'),
            date: r.date || r.fecha ? new Date(r.date || r.fecha) : new Date(),
            notes: r.notes || r.notas ? String(r.notes || r.notas) : null,
          },
        })
        imported.expenses++
      }
    }

    // --- Hoja Suscripciones ---
    if (wb.SheetNames.includes('Suscripciones')) {
      const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets['Suscripciones'])
      for (const r of rows) {
        if (!r.name && !r.nombre) continue
        await db.subscription.create({
          data: {
            name: String(r.name || r.nombre),
            provider: r.provider || r.proveedor ? String(r.provider || r.proveedor) : null,
            billingCycle: String(r.billingCycle || r.ciclo || 'mensual'),
            amount: Number(r.amount || r.importe || 0),
            startDate: r.startDate || r.fechaInicio ? new Date(r.startDate || r.fechaInicio) : new Date(),
            renewalDate: r.renewalDate || r.renovacion ? new Date(r.renewalDate || r.renovacion) : null,
            active: r.active !== undefined ? Boolean(r.active) : true,
            bucket: String(r.bucket || 'extraordinario'),
            category: String(r.category || r.categoria || 'suscripcion'),
            notes: r.notes || r.notas ? String(r.notes || r.notas) : null,
          },
        })
        imported.subscriptions++
      }
    }

    return NextResponse.json({ ok: true, imported })
  } catch (e) {
    console.error('POST /api/sync/import', e)
    return NextResponse.json({ error: 'Error al importar Excel' }, { status: 500 })
  }
}

// ============================================================
// GET /api/sync/export  — descarga un .xlsx con todos los datos
// ============================================================
export async function GET() {
  try {
    const [incomes, expenses, subscriptions] = await Promise.all([
      db.income.findMany(),
      db.expense.findMany(),
      db.subscription.findMany(),
    ])

    const wb = XLSX.utils.book_new()

    // Hoja Ingresos
    const incomesAoA = [
      ['type', 'source', 'amount', 'frequency', 'date', 'active', 'notes', 'category'],
      ...incomes.map((i) => [
        i.type,
        i.source,
        i.amount,
        i.frequency,
        i.date.toISOString().slice(0, 10),
        i.active ? 1 : 0,
        i.notes || '',
        i.category || '',
      ]),
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(incomesAoA)
    XLSX.utils.book_append_sheet(wb, ws1, 'Ingresos')

    // Hoja Gastos
    const expensesAoA = [
      ['bucket', 'category', 'description', 'amount', 'frequency', 'date', 'notes'],
      ...expenses.map((e) => [
        e.bucket,
        e.category,
        e.description,
        e.amount,
        e.frequency,
        e.date.toISOString().slice(0, 10),
        e.notes || '',
      ]),
    ]
    const ws2 = XLSX.utils.aoa_to_sheet(expensesAoA)
    XLSX.utils.book_append_sheet(wb, ws2, 'Gastos')

    // Hoja Suscripciones
    const subsAoA = [
      ['name', 'provider', 'billingCycle', 'amount', 'startDate', 'renewalDate', 'active', 'bucket', 'category', 'notes'],
      ...subscriptions.map((s) => [
        s.name,
        s.provider || '',
        s.billingCycle,
        s.amount,
        s.startDate.toISOString().slice(0, 10),
        s.renewalDate ? s.renewalDate.toISOString().slice(0, 10) : '',
        s.active ? 1 : 0,
        s.bucket,
        s.category,
        s.notes || '',
      ]),
    ]
    const ws3 = XLSX.utils.aoa_to_sheet(subsAoA)
    XLSX.utils.book_append_sheet(wb, ws3, 'Suscripciones')

    // Hoja Resumen con la regla 50/30/20
    const summaryAoA: any[][] = [
      ['Resumen mensual'],
      [],
      ['Concepto', 'Importe €'],
      ['Ingresos mensuales recurrentes', incomes
        .filter((i) => i.active && i.frequency !== 'unico')
        .reduce((s, i) => s + (i.frequency === 'mensual' ? i.amount : i.frequency === 'anual' ? i.amount / 12 : 0), 0)],
      ['Gastos fijos (objetivo 50%)', expenses
        .filter((e) => e.bucket === 'fijo' && e.frequency !== 'unico')
        .reduce((s, e) => s + (e.frequency === 'mensual' ? e.amount : e.frequency === 'anual' ? e.amount / 12 : 0), 0)],
      ['Gastos extraordinarios (objetivo 30%)', expenses
        .filter((e) => e.bucket === 'extraordinario' && e.frequency !== 'unico')
        .reduce((s, e) => s + (e.frequency === 'mensual' ? e.amount : e.frequency === 'anual' ? e.amount / 12 : 0), 0)],
      ['Ahorro (objetivo 20%)', expenses
        .filter((e) => e.bucket === 'ahorro' && e.frequency !== 'unico')
        .reduce((s, e) => s + (e.frequency === 'mensual' ? e.amount : e.frequency === 'anual' ? e.amount / 12 : 0), 0)],
    ]
    const ws4 = XLSX.utils.aoa_to_sheet(summaryAoA)
    XLSX.utils.book_append_sheet(wb, ws4, 'Resumen')

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    const filename = `finanzas_${new Date().toISOString().slice(0, 10)}.xlsx`

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (e) {
    console.error('GET /api/sync/export', e)
    return NextResponse.json({ error: 'Error al exportar Excel' }, { status: 500 })
  }
}
