// GET /api/subscriptions · POST /api/subscriptions
import { getInsforge } from '../../utils/insforge';
import { mapSubscription, toDateOnly } from '../../utils/mappers';

export default defineEventHandler(async (event) => {
  try {
    if (event.method === 'GET') {
      const { data, error } = await getInsforge()
        .database.from('subscriptions')
        .select('*, expenses(*)')
        .order('name', { ascending: true });
      if (error) throw createError({ statusCode: 500, statusMessage: error.message });
      return { items: (data ?? []).map(mapSubscription) };
    }

    if (event.method === 'POST') {
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
        createExpense,
      } = body || {};

      if (!name || typeof amount !== 'number') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Faltan campos obligatorios',
        });
      }

      const { data, error } = await getInsforge()
        .database.from('subscriptions')
        .insert([
          {
            name: String(name),
            provider: provider || null,
            billing_cycle: billingCycle || 'mensual',
            amount: Number(amount),
            start_date: toDateOnly(startDate) ?? toDateOnly(new Date())!,
            renewal_date: toDateOnly(renewalDate),
            active: active ?? true,
            bucket: bucket || 'extraordinario',
            category: category || 'suscripcion',
            notes: notes || null,
          },
        ])
        .select();

      if (error) throw createError({ statusCode: 400, statusMessage: error.message });
      if (!data?.length) {
        throw createError({ statusCode: 500, statusMessage: 'No se pudo crear la suscripción' });
      }
      const item = mapSubscription(data[0]);

      // Generar gasto asociado automáticamente si se solicita
      if (createExpense) {
        const { error: expenseError } = await getInsforge()
          .database.from('expenses')
          .insert([
            {
              bucket: item.bucket,
              category: item.category,
              description: `Suscripción: ${item.name}`,
              amount: item.amount,
              frequency: item.billingCycle,
              date: toDateOnly(new Date())!,
              subscription_id: item.id,
            },
          ]);
        if (expenseError) {
          console.error('/api/subscriptions createExpense', expenseError);
        }
      }

      return { item };
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
  } catch (e: any) {
    console.error('/api/subscriptions', e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Error al procesar suscripciones',
    });
  }
});
