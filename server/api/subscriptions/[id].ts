// GET /api/subscriptions/:id · PUT /api/subscriptions/:id · DELETE /api/subscriptions/:id
import { getInsforge } from '../../utils/insforge';
import { mapSubscription, toDateOnly } from '../../utils/mappers';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Falta id' });
    }

    if (event.method === 'GET') {
      const { data, error } = await getInsforge()
        .database.from('subscriptions')
        .select('*, expenses(*)')
        .eq('id', id)
        .limit(1);
      if (error) throw createError({ statusCode: 500, statusMessage: error.message });
      if (!data?.length) {
        throw createError({ statusCode: 404, statusMessage: 'No encontrado' });
      }
      return { item: mapSubscription(data[0]) };
    }

    if (event.method === 'PUT') {
      const body = await readBody(event);
      const {
        name,
        provider,
        billingCycle,
        amount,
        startDate,
        renewalDate,
        active,
        bucket,
        category,
        notes,
      } = body || {};

      const { data, error } = await getInsforge()
        .database.from('subscriptions')
        .update({
          ...(name !== undefined && { name: String(name) }),
          ...(provider !== undefined && { provider: provider || null }),
          ...(billingCycle !== undefined && { billing_cycle: billingCycle }),
          ...(amount !== undefined && { amount: Number(amount) }),
          ...(startDate !== undefined && { start_date: toDateOnly(startDate) }),
          ...(renewalDate !== undefined && {
            renewal_date: toDateOnly(renewalDate),
          }),
          ...(active !== undefined && { active: Boolean(active) }),
          ...(bucket !== undefined && { bucket }),
          ...(category !== undefined && { category }),
          ...(notes !== undefined && { notes: notes || null }),
        })
        .eq('id', id)
        .select('*, expenses(*)');

      if (error) throw createError({ statusCode: 400, statusMessage: error.message });
      if (!data?.length) {
        throw createError({ statusCode: 404, statusMessage: 'No encontrado' });
      }
      return { item: mapSubscription(data[0]) };
    }

    if (event.method === 'DELETE') {
      // La FK expenses.subscription_id ya aplica ON DELETE SET NULL
      const { error } = await getInsforge().database.from('subscriptions').delete().eq('id', id);
      if (error) throw createError({ statusCode: 400, statusMessage: error.message });
      return { ok: true };
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
  } catch (e: any) {
    console.error('/api/subscriptions/[id]', e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Error al procesar suscripción',
    });
  }
});
