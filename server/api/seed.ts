// POST /api/seed — carga datos de ejemplo genéricos
import process from 'node:process';
import { getInsforge } from '../utils/insforge';
import { toDateOnly } from '../utils/mappers';

// Filtro "match all" para poder vaciar tablas con PostgREST
const MATCH_ALL_ID = '00000000-0000-0000-0000-000000000000';

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
  }
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== 'true') {
    throw createError({ statusCode: 403, statusMessage: 'Seed deshabilitado en producción' });
  }

  try {
    // Limpiar primero
    for (const table of ['expenses', 'subscriptions', 'incomes']) {
      const { error } = await getInsforge().database.from(table).delete().neq('id', MATCH_ALL_ID);
      if (error) throw createError({ statusCode: 500, statusMessage: error.message });
    }
    await getInsforge().database.from('settings').delete().neq('id', '___none___');

    // Settings singleton
    {
      const { error } = await getInsforge()
        .database.from('settings')
        .insert([
          {
            id: 'singleton',
            pct_fixed: 50,
            pct_extra: 30,
            pct_savings: 20,
            rule_base: 'total',
            currency: 'EUR',
            locale: 'es-ES',
          },
        ]);
      if (error) throw createError({ statusCode: 500, statusMessage: error.message });
    }

    const today = toDateOnly(new Date())!;

    // Ingresos de ejemplo
    {
      const { error } = await getInsforge()
        .database.from('incomes')
        .insert([
          {
            type: 'salario',
            source: 'Nómina mensual',
            amount: 1300,
            frequency: 'mensual',
            date: today,
            active: true,
            notes: 'Edita este valor con tu salario neto real',
            category: 'trabajo',
          },
          {
            type: 'otro',
            source: 'Paga extra (ejemplo)',
            amount: 650,
            frequency: 'unico',
            date: today,
            active: true,
            notes: 'Cambia o elimina este ingreso según tu caso',
            category: 'extra',
          },
        ]);
      if (error) throw createError({ statusCode: 500, statusMessage: error.message });
    }

    // Gastos de ejemplo (fijos + extraordinario + ahorro)
    {
      const fixedExpenses = [
        { category: 'vivienda', description: 'Alquiler / vivienda', amount: 400 },
        { category: 'vivienda', description: 'Luz + agua + gas', amount: 60 },
        { category: 'comunicaciones', description: 'Móvil + internet', amount: 30 },
        { category: 'transporte', description: 'Abono transporte', amount: 25 },
        { category: 'comida', description: 'Cesta básica mensual', amount: 200 },
        { category: 'salud', description: 'Farmacia / copago', amount: 20 },
      ];
      const rows = [
        ...fixedExpenses.map((e) => ({
          ...e,
          bucket: 'fijo',
          frequency: 'mensual',
          date: today,
        })),
        {
          bucket: 'extraordinario',
          category: 'ocio',
          description: 'Ocio / salidas',
          amount: 80,
          frequency: 'mensual',
          date: today,
        },
        {
          bucket: 'ahorro',
          category: 'fondo_estabilidad',
          description: 'Ahorro automático 20%',
          amount: 260,
          frequency: 'mensual',
          date: today,
          notes: 'Ajusta el porcentaje y el importe en Ajustes',
        },
      ];
      const { error } = await getInsforge().database.from('expenses').insert(rows);
      if (error) throw createError({ statusCode: 500, statusMessage: error.message });
    }

    // Suscripciones de ejemplo
    {
      const subs = [
        {
          name: 'Netflix',
          provider: 'Netflix',
          billing_cycle: 'mensual',
          amount: 12.99,
          bucket: 'extraordinario',
          category: 'streaming',
        },
        {
          name: 'Spotify',
          provider: 'Spotify',
          billing_cycle: 'mensual',
          amount: 10.99,
          bucket: 'extraordinario',
          category: 'musica',
        },
        {
          name: 'iCloud 200GB',
          provider: 'Apple',
          billing_cycle: 'mensual',
          amount: 2.99,
          bucket: 'extraordinario',
          category: 'cloud',
        },
        {
          name: 'Microsoft 365',
          provider: 'Microsoft',
          billing_cycle: 'anual',
          amount: 99,
          bucket: 'extraordinario',
          category: 'software',
        },
      ];
      const rows = subs.map((s) => {
        const renewal = new Date();
        renewal.setMonth(renewal.getMonth() + (s.billing_cycle === 'anual' ? 12 : 1));
        return {
          ...s,
          start_date: today,
          renewal_date: toDateOnly(renewal),
          active: true,
        };
      });
      const { error } = await getInsforge().database.from('subscriptions').insert(rows);
      if (error) throw createError({ statusCode: 500, statusMessage: error.message });
    }

    return { ok: true, message: 'Datos de ejemplo cargados correctamente' };
  } catch (e: any) {
    console.error('POST /api/seed', e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Error al cargar datos iniciales',
    });
  }
});
