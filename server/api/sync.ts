import type { Buffer } from 'node:buffer';
import * as XLSX from 'xlsx';
import { getInsforge } from '../utils/insforge';
import { isoDay, mapExpense, mapIncome, mapSubscription, toDateOnly } from '../utils/mappers';

// GET /api/sync — exporta un .xlsx con todos los datos
// POST /api/sync — recibe un archivo .xlsx y lo importa
export default defineEventHandler(async (event) => {
  try {
    // ============ EXPORT ============
    if (event.method === 'GET') {
      const [incomesRes, expensesRes, subscriptionsRes] = await Promise.all([
        getInsforge().database.from('incomes').select(),
        getInsforge().database.from('expenses').select(),
        getInsforge().database.from('subscriptions').select(),
      ]);
      const firstError = incomesRes.error || expensesRes.error || subscriptionsRes.error;
      if (firstError) {
        throw createError({ statusCode: 500, statusMessage: firstError.message });
      }

      const incomes = (incomesRes.data ?? []).map(mapIncome);
      const expenses = (expensesRes.data ?? []).map(mapExpense);
      const subscriptions = (subscriptionsRes.data ?? []).map(mapSubscription);

      const wb = XLSX.utils.book_new();

      // Hoja Ingresos
      const incomesAoA = [
        ['type', 'source', 'amount', 'frequency', 'date', 'active', 'notes', 'category'],
        ...incomes.map((i) => [
          i.type,
          i.source,
          i.amount,
          i.frequency,
          isoDay(i.date),
          i.active ? 1 : 0,
          i.notes || '',
          i.category || '',
        ]),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(incomesAoA), 'Ingresos');

      // Hoja Gastos
      const expensesAoA = [
        ['bucket', 'category', 'description', 'amount', 'frequency', 'date', 'notes'],
        ...expenses.map((e) => [
          e.bucket,
          e.category,
          e.description,
          e.amount,
          e.frequency,
          isoDay(e.date),
          e.notes || '',
        ]),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(expensesAoA), 'Gastos');

      // Hoja Suscripciones
      const subsAoA = [
        [
          'name',
          'provider',
          'billingCycle',
          'amount',
          'startDate',
          'renewalDate',
          'active',
          'bucket',
          'category',
          'notes',
        ],
        ...subscriptions.map((s) => [
          s.name,
          s.provider || '',
          s.billingCycle,
          s.amount,
          isoDay(s.startDate),
          s.renewalDate ? isoDay(s.renewalDate) : '',
          s.active ? 1 : 0,
          s.bucket,
          s.category,
          s.notes || '',
        ]),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(subsAoA), 'Suscripciones');

      // Hoja Resumen
      const monthly = (amount: number, freq: string) =>
        freq === 'mensual' ? amount : freq === 'anual' ? amount / 12 : 0;
      const bucketTotal = (bucket: string) =>
        expenses
          .filter((e) => e.bucket === bucket && e.frequency !== 'unico')
          .reduce((s, e) => s + monthly(e.amount, e.frequency), 0);

      const summaryAoA: (string | number)[][] = [
        ['Resumen mensual'],
        [],
        ['Concepto', 'Importe €'],
        [
          'Ingresos mensuales recurrentes',
          incomes
            .filter((i) => i.active && i.frequency !== 'unico')
            .reduce((s, i) => s + monthly(i.amount, i.frequency), 0),
        ],
        ['Gastos fijos (objetivo 50%)', bucketTotal('fijo')],
        ['Gastos extraordinarios (objetivo 30%)', bucketTotal('extraordinario')],
        ['Ahorro (objetivo 20%)', bucketTotal('ahorro')],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryAoA), 'Resumen');

      const buf = XLSX.write(wb, {
        type: 'buffer',
        bookType: 'xlsx',
      }) as Buffer;
      const filename = `finanzas_${new Date().toISOString().slice(0, 10)}.xlsx`;

      setResponseHeaders(event, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      });
      return buf;
    }

    // ============ IMPORT ============
    if (event.method === 'POST') {
      const parts = await readMultipartFormData(event);
      const filePart = parts?.find((p) => p.name === 'file' && p.data);
      if (!filePart) {
        throw createError({
          statusCode: 400,
          statusMessage: 'No se envió ningún archivo',
        });
      }

      const MAX_BYTES = 5 * 1024 * 1024;
      if (filePart.data.length > MAX_BYTES) {
        throw createError({ statusCode: 413, statusMessage: 'El archivo supera los 5 MB' });
      }

      const wb = XLSX.read(filePart.data, { type: 'buffer', cellDates: true });
      const imported = { incomes: 0, expenses: 0, subscriptions: 0 };

      // Hoja Ingresos
      const incomesSheet = wb.Sheets.Ingresos;
      if (incomesSheet) {
        const rows = XLSX.utils.sheet_to_json<any>(incomesSheet);
        const payload = rows
          .filter((r) => r.source || r.fuente)
          .map((r) => ({
            type: String(r.type || r.tipo || 'salario'),
            source: String(r.source || r.fuente),
            amount: Number(r.amount || r.importe || 0),
            frequency: String(r.frequency || r.frecuencia || 'unico'),
            date: r.date || r.fecha ? toDateOnly(r.date || r.fecha)! : toDateOnly(new Date())!,
            active:
              r.active === undefined ? true : ![false, 0, '0', 'false', ''].includes(r.active),
            notes: r.notes || r.notas ? String(r.notes || r.notas) : null,
            category: r.category || r.categoria ? String(r.category || r.categoria) : null,
          }));
        if (payload.length) {
          const { error } = await getInsforge().database.from('incomes').insert(payload);
          if (error) throw createError({ statusCode: 400, statusMessage: error.message });
          imported.incomes = payload.length;
        }
      }

      // Hoja Gastos
      const expensesSheet = wb.Sheets.Gastos;
      if (expensesSheet) {
        const rows = XLSX.utils.sheet_to_json<any>(expensesSheet);
        const payload = rows
          .filter((r) => r.description || r.descripcion)
          .map((r) => ({
            bucket: String(r.bucket || 'fijo'),
            category: String(r.category || r.categoria || 'general'),
            description: String(r.description || r.descripcion),
            amount: Number(r.amount || r.importe || 0),
            frequency: String(r.frequency || r.frecuencia || 'unico'),
            date: r.date || r.fecha ? toDateOnly(r.date || r.fecha)! : toDateOnly(new Date())!,
            notes: r.notes || r.notas ? String(r.notes || r.notas) : null,
          }));
        if (payload.length) {
          const { error } = await getInsforge().database.from('expenses').insert(payload);
          if (error) throw createError({ statusCode: 400, statusMessage: error.message });
          imported.expenses = payload.length;
        }
      }

      // Hoja Suscripciones
      const subsSheet = wb.Sheets.Suscripciones;
      if (subsSheet) {
        const rows = XLSX.utils.sheet_to_json<any>(subsSheet);
        const payload = rows
          .filter((r) => r.name || r.nombre)
          .map((r) => ({
            name: String(r.name || r.nombre),
            provider: r.provider || r.proveedor ? String(r.provider || r.proveedor) : null,
            billing_cycle: String(r.billingCycle || r.ciclo || 'mensual'),
            amount: Number(r.amount || r.importe || 0),
            start_date:
              r.startDate || r.fechaInicio
                ? toDateOnly(r.startDate || r.fechaInicio)!
                : toDateOnly(new Date())!,
            renewal_date:
              r.renewalDate || r.renovacion ? toDateOnly(r.renewalDate || r.renovacion) : null,
            active:
              r.active === undefined ? true : ![false, 0, '0', 'false', ''].includes(r.active),
            bucket: String(r.bucket || 'extraordinario'),
            category: String(r.category || r.categoria || 'suscripcion'),
            notes: r.notes || r.notas ? String(r.notes || r.notas) : null,
          }));
        if (payload.length) {
          const { error } = await getInsforge().database.from('subscriptions').insert(payload);
          if (error) throw createError({ statusCode: 400, statusMessage: error.message });
          imported.subscriptions = payload.length;
        }
      }

      return { ok: true, imported };
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
  } catch (e: any) {
    console.error('/api/sync', e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Error al sincronizar Excel',
    });
  }
});
