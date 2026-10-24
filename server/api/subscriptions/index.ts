// GET /api/subscriptions · POST /api/subscriptions
export default defineEventHandler(async (event) => {
  try {
    if (event.method === "GET") {
      const items = await db.subscription.findMany({
        include: { expenses: true },
        orderBy: { name: "asc" },
      });
      return { items };
    }

    if (event.method === "POST") {
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

      if (!name || typeof amount !== "number") {
        throw createError({
          statusCode: 400,
          statusMessage: "Faltan campos obligatorios",
        });
      }

      const item = await db.subscription.create({
        data: {
          name: String(name),
          provider: provider || null,
          billingCycle: billingCycle || "mensual",
          amount: Number(amount),
          startDate: startDate ? new Date(startDate) : new Date(),
          renewalDate: renewalDate ? new Date(renewalDate) : null,
          active: active ?? true,
          bucket: bucket || "extraordinario",
          category: category || "suscripcion",
          notes: notes || null,
        },
      });

      // Generar gasto asociado automáticamente si se solicita
      if (createExpense) {
        await db.expense.create({
          data: {
            bucket: item.bucket,
            category: item.category,
            description: `Suscripción: ${item.name}`,
            amount: item.amount,
            frequency: item.billingCycle === "anual" ? "anual" : "mensual",
            date: new Date(),
            subscriptionId: item.id,
          },
        });
      }

      return { item };
    }

    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  } catch (e: any) {
    console.error("/api/subscriptions", e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "Error al procesar suscripciones",
    });
  }
});
