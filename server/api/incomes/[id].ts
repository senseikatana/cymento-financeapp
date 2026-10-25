// GET /api/incomes/:id · PUT /api/incomes/:id · DELETE /api/incomes/:id
import { getInsforge } from '../../utils/insforge';
import { mapIncome, toDateOnly } from '../../utils/mappers';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Falta id' });
    }

    if (event.method === 'GET') {
      const { data, error } = await getInsforge()
        .database.from('incomes')
        .select()
        .eq('id', id)
        .limit(1);
      if (error) throw createError({ statusCode: 500, statusMessage: error.message });
      if (!data?.length) {
        throw createError({ statusCode: 404, statusMessage: 'No encontrado' });
      }
      return { item: mapIncome(data[0]) };
    }

    if (event.method === 'PUT') {
      const body = await readBody(event);
      const { type, source, amount, frequency, date, active, notes, category } = body || {};

      const { data, error } = await getInsforge()
        .database.from('incomes')
        .update({
          ...(type !== undefined && { type }),
          ...(source !== undefined && { source: String(source) }),
          ...(amount !== undefined && { amount: Number(amount) }),
          ...(frequency !== undefined && { frequency }),
          ...(date !== undefined && { date: toDateOnly(date) }),
          ...(active !== undefined && { active: Boolean(active) }),
          ...(notes !== undefined && { notes: notes || null }),
          ...(category !== undefined && { category: category || null }),
        })
        .eq('id', id)
        .select();

      if (error) throw createError({ statusCode: 400, statusMessage: error.message });
      if (!data?.length) {
        throw createError({ statusCode: 404, statusMessage: 'No encontrado' });
      }
      return { item: mapIncome(data[0]) };
    }

    if (event.method === 'DELETE') {
      const { error } = await getInsforge().database.from('incomes').delete().eq('id', id);
      if (error) throw createError({ statusCode: 400, statusMessage: error.message });
      return { ok: true };
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
  } catch (e: any) {
    console.error('/api/incomes/[id]', e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Error al procesar ingreso',
    });
  }
});
