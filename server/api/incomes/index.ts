// GET /api/incomes — lista todos los ingresos
// POST /api/incomes — crea un nuevo ingreso
import { getInsforge } from '../../utils/insforge';
import { mapIncome, toDateOnly } from '../../utils/mappers';

export default defineEventHandler(async (event) => {
  try {
    if (event.method === 'GET') {
      const { data, error } = await getInsforge()
        .database.from('incomes')
        .select()
        .order('date', { ascending: false });
      if (error) throw createError({ statusCode: 500, statusMessage: error.message });
      return { items: (data ?? []).map(mapIncome) };
    }

    if (event.method === 'POST') {
      const body = await readBody(event);
      const { type, source, amount, frequency, date, active, notes, category } = body || {};

      if (!source || typeof amount !== 'number') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Faltan campos obligatorios',
        });
      }

      const { data, error } = await getInsforge()
        .database.from('incomes')
        .insert([
          {
            type: type || 'salario',
            source: String(source),
            amount: Number(amount),
            frequency: frequency || 'unico',
            date: toDateOnly(date) ?? toDateOnly(new Date())!,
            active: active ?? true,
            notes: notes || null,
            category: category || null,
          },
        ])
        .select();

      if (error) throw createError({ statusCode: 400, statusMessage: error.message });
      if (!data?.length) {
        throw createError({ statusCode: 500, statusMessage: 'No se pudo crear el ingreso' });
      }
      return { item: mapIncome(data[0]) };
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
  } catch (e: any) {
    console.error('/api/incomes', e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Error al procesar ingresos',
    });
  }
});
