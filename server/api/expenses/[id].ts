// GET /api/expenses/:id · PUT /api/expenses/:id · DELETE /api/expenses/:id
import { getInsforge } from '../../utils/insforge';
import { mapExpense, toDateOnly } from '../../utils/mappers';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Falta id' });
    }

    if (event.method === 'GET') {
      const { data, error } = await getInsforge()
        .database.from('expenses')
        .select('*, subscription:subscriptions(*)')
        .eq('id', id)
        .limit(1);
      if (error) throw createError({ statusCode: 500, statusMessage: error.message });
      if (!data?.length) {
        throw createError({ statusCode: 404, statusMessage: 'No encontrado' });
      }
      return { item: mapExpense(data[0]) };
    }

    if (event.method === 'PUT') {
      const body = await readBody(event);
      const { bucket, category, description, amount, frequency, date, notes, subscriptionId } =
        body || {};

      const { data, error } = await getInsforge()
        .database.from('expenses')
        .update({
          ...(bucket !== undefined && { bucket }),
          ...(category !== undefined && { category }),
          ...(description !== undefined && { description: String(description) }),
          ...(amount !== undefined && { amount: Number(amount) }),
          ...(frequency !== undefined && { frequency }),
          ...(date !== undefined && { date: toDateOnly(date) }),
          ...(notes !== undefined && { notes: notes || null }),
          ...(subscriptionId !== undefined && { subscription_id: subscriptionId || null }),
        })
        .eq('id', id)
        .select('*, subscription:subscriptions(*)');

      if (error) throw createError({ statusCode: 400, statusMessage: error.message });
      if (!data?.length) {
        throw createError({ statusCode: 404, statusMessage: 'No encontrado' });
      }
      return { item: mapExpense(data[0]) };
    }

    if (event.method === 'DELETE') {
      const { error } = await getInsforge().database.from('expenses').delete().eq('id', id);
      if (error) throw createError({ statusCode: 400, statusMessage: error.message });
      return { ok: true };
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
  } catch (e: any) {
    console.error('/api/expenses/[id]', e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Error al procesar gasto',
    });
  }
});
