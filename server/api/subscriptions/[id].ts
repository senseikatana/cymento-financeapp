// GET /api/subscriptions/:id · PUT /api/subscriptions/:id · DELETE /api/subscriptions/:id
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: "Falta id" });
    }

    if (event.method === "GET") {
      const item = await db.subscription.findUnique({
        where: { id },
        include: { expenses: true },
      });
      if (!item) {
        throw createError({ statusCode: 404, statusMessage: "No encontrado" });
      }
      return { item };
    }

    if (event.method === "PUT") {
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

      const item = await db.subscription.update({
        where: { id },
        data: {
          ...(name !== undefined && { name: String(name) }),
          ...(provider !== undefined && { provider: provider || null }),
          ...(billingCycle !== undefined && { billingCycle }),
          ...(amount !== undefined && { amount: Number(amount) }),
          ...(startDate !== undefined && { startDate: new Date(startDate) }),
          ...(renewalDate !== undefined && {
            renewalDate: renewalDate ? new Date(renewalDate) : null,
          }),
          ...(active !== undefined && { active: Boolean(active) }),
          ...(bucket !== undefined && { bucket }),
          ...(category !== undefined && { category }),
          ...(notes !== undefined && { notes: notes || null }),
        },
        include: { expenses: true },
      });
      return { item };
    }

    if (event.method === "DELETE") {
      // Antes de borrar, desvincular gastos asociados
      await db.expense.updateMany({
        where: { subscriptionId: id },
        data: { subscriptionId: null },
      });
      await db.subscription.delete({ where: { id } });
      return { ok: true };
    }

    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  } catch (e: any) {
    console.error("/api/subscriptions/[id]", e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "Error al procesar suscripción",
    });
  }
});
