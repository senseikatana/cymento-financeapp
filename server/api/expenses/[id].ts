// GET /api/expenses/:id · PUT /api/expenses/:id · DELETE /api/expenses/:id
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: "Falta id" });
    }

    if (event.method === "GET") {
      const item = await db.expense.findUnique({
        where: { id },
        include: { subscription: true },
      });
      if (!item) {
        throw createError({ statusCode: 404, statusMessage: "No encontrado" });
      }
      return { item };
    }

    if (event.method === "PUT") {
      const body = await readBody(event);
      const {
        bucket,
        category,
        description,
        amount,
        frequency,
        date,
        notes,
        subscriptionId,
      } = body || {};

      const item = await db.expense.update({
        where: { id },
        data: {
          ...(bucket !== undefined && { bucket }),
          ...(category !== undefined && { category }),
          ...(description !== undefined && {
            description: String(description),
          }),
          ...(amount !== undefined && { amount: Number(amount) }),
          ...(frequency !== undefined && { frequency }),
          ...(date !== undefined && { date: new Date(date) }),
          ...(notes !== undefined && { notes: notes || null }),
          ...(subscriptionId !== undefined && {
            subscriptionId: subscriptionId || null,
          }),
        },
        include: { subscription: true },
      });
      return { item };
    }

    if (event.method === "DELETE") {
      await db.expense.delete({ where: { id } });
      return { ok: true };
    }

    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  } catch (e: any) {
    console.error("/api/expenses/[id]", e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "Error al procesar gasto",
    });
  }
});
