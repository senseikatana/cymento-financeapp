// GET /api/expenses · POST /api/expenses
import { getInsforge } from '../../utils/insforge';
import { mapExpense, toDateOnly } from '../../utils/mappers';

export default defineEventHandler(async (event) => {
  try {
    if (event.method === 'GET') {
      const query = getQuery(event);
      const bucket = query.bucket as string | undefined;

      let q = getInsforge()
        .database.from('expenses')
        .select('*, subscription:subscriptions(*)')
        .order('date', { ascending: false });
      if (bucket) q = q.eq('bucket', bucket);

      const { data, error } = await q;
      if (error) throw createError({ statusCode: 500, statusMessage: error.message });
      return { items: (data ?? []).map(mapExpense) };
    }

    if (event.method === 'POST') {
      const body = await readBody(event);
      const { bucket, category, description, amount, frequency, date, notes, subscriptionId } =
        body || {};

      if (!description || typeof amount !== 'number') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Faltan campos obligatorios',
        });
      }

      const { data, error } = await getInsforge()
        .database.from('expenses')
        .insert([
          {
            bucket: bucket || 'fijo',
            category: category || 'general',
            description: String(description),
            amount: Number(amount),
            frequency: frequency || 'unico',
            date: toDateOnly(date) ?? toDateOnly(new Date())!,
            notes: notes || null,
            subscription_id: subscriptionId || null,
          },
        ])
        .select('*, subscription:subscriptions(*)');

      if (error) throw createError({ statusCode: 400, statusMessage: error.message });
      if (!data?.length) {
        throw createError({ statusCode: 500, statusMessage: 'No se pudo crear el gasto' });
      }
      return { item: mapExpense(data[0]) };
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
  } catch (e: any) {
    console.error('/api/expenses', e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Error al procesar gastos',
    });
  }
});
