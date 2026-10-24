// GET /api/incomes/:id · PUT /api/incomes/:id · DELETE /api/incomes/:id
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: "Falta id" });
    }

    if (event.method === "GET") {
      const item = await db.income.findUnique({ where: { id } });
      if (!item) {
        throw createError({ statusCode: 404, statusMessage: "No encontrado" });
      }
      return { item };
    }

    if (event.method === "PUT") {
      const body = await readBody(event);
      const { type, source, amount, frequency, date, active, notes, category } =
        body || {};

      const item = await db.income.update({
        where: { id },
        data: {
          ...(type !== undefined && { type }),
          ...(source !== undefined && { source: String(source) }),
          ...(amount !== undefined && { amount: Number(amount) }),
          ...(frequency !== undefined && { frequency }),
          ...(date !== undefined && { date: new Date(date) }),
          ...(active !== undefined && { active: Boolean(active) }),
          ...(notes !== undefined && { notes: notes || null }),
          ...(category !== undefined && { category: category || null }),
        },
      });
      return { item };
    }

    if (event.method === "DELETE") {
      await db.income.delete({ where: { id } });
      return { ok: true };
    }

    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  } catch (e: any) {
    console.error("/api/incomes/[id]", e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "Error al procesar ingreso",
    });
  }
});
