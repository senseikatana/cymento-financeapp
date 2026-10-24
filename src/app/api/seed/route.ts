import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/seed — carga datos de ejemplo genéricos para que el usuario vea
// cómo funciona la app. No asume ningún supuesto laboral ni escenario concreto.
// El usuario puede borrarlos o editarlos a su gusto.
export async function POST() {
  try {
    // Limpiar primero
    await db.expense.deleteMany()
    await db.subscription.deleteMany()
    await db.income.deleteMany()
    await db.settings.deleteMany()

    // --- Settings singleton (regla por defecto sobre el total de ingresos) ---
    await db.settings.create({
      data: {
        id: 'singleton',
        pctFixed: 50,
        pctExtra: 30,
        pctSavings: 20,
        ruleBase: 'total',
        currency: 'EUR',
        locale: 'es-ES',
      },
    })

    // --- Ingresos de ejemplo ---
    await db.income.create({
      data: {
        type: 'salario',
        source: 'Nómina mensual',
        amount: 1300,
        frequency: 'mensual',
        date: new Date(),
        active: true,
        notes: 'Edita este valor con tu salario neto real',
        category: 'trabajo',
      },
    })

    await db.income.create({
      data: {
        type: 'otro',
        source: 'Paga extra (ejemplo)',
        amount: 650,
        frequency: 'unico',
        date: new Date(),
        active: true,
        notes: 'Cambia o elimina este ingreso según tu caso',
        category: 'extra',
      },
    })

    // --- Gastos fijos (50%) - ejemplos editables ---
    const fixedExpenses = [
      { category: 'vivienda', description: 'Alquiler / vivienda', amount: 400 },
      { category: 'vivienda', description: 'Luz + agua + gas', amount: 60 },
      { category: 'comunicaciones', description: 'Móvil + internet', amount: 30 },
      { category: 'transporte', description: 'Abono transporte', amount: 25 },
      { category: 'comida', description: 'Cesta básica mensual', amount: 200 },
      { category: 'salud', description: 'Farmacia / copago', amount: 20 },
    ]
    for (const e of fixedExpenses) {
      await db.expense.create({
        data: { ...e, bucket: 'fijo', frequency: 'mensual', date: new Date() },
      })
    }

    // --- Gastos extraordinarios (30%) - ejemplo ---
    await db.expense.create({
      data: {
        bucket: 'extraordinario',
        category: 'ocio',
        description: 'Ocio / salidas',
        amount: 80,
        frequency: 'mensual',
        date: new Date(),
      },
    })

    // --- Ahorro (20%) - Fondo de Estabilidad ---
    await db.expense.create({
      data: {
        bucket: 'ahorro',
        category: 'fondo_estabilidad',
        description: 'Ahorro automático 20%',
        amount: 260,
        frequency: 'mensual',
        date: new Date(),
        notes: 'Ajusta el porcentaje y el importe en Ajustes',
      },
    })

    // --- Suscripciones comunes de ejemplo ---
    const subs = [
      { name: 'Netflix', provider: 'Netflix', billingCycle: 'mensual', amount: 12.99, bucket: 'extraordinario', category: 'streaming' },
      { name: 'Spotify', provider: 'Spotify', billingCycle: 'mensual', amount: 10.99, bucket: 'extraordinario', category: 'musica' },
      { name: 'iCloud 200GB', provider: 'Apple', billingCycle: 'mensual', amount: 2.99, bucket: 'extraordinario', category: 'cloud' },
      { name: 'Microsoft 365', provider: 'Microsoft', billingCycle: 'anual', amount: 99, bucket: 'extraordinario', category: 'software' },
    ]
    for (const s of subs) {
      const renewal = new Date()
      renewal.setMonth(renewal.getMonth() + (s.billingCycle === 'anual' ? 12 : 1))
      await db.subscription.create({
        data: {
          ...s,
          startDate: new Date(),
          renewalDate: renewal,
          active: true,
        },
      })
    }

    return NextResponse.json({ ok: true, message: 'Datos de ejemplo cargados correctamente' })
  } catch (e) {
    console.error('POST /api/seed', e)
    return NextResponse.json({ error: 'Error al cargar datos iniciales' }, { status: 500 })
  }
}
