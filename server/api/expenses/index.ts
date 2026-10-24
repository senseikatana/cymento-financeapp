// GET /api/expenses · POST /api/expenses
export default defineEventHandler(async (event) => {
  try {
    if (event.method === "GET") {
      const query = getQuery(event);
      const bucket = query.bucket as string | undefined;
      const items = await db.expense.findMany({
        where: bucket ? { bucket } : undefined,
        include: { subscription: true },
        orderBy: { date: "desc" },
      });
      return { items };
    }

    if (event.method === "POST") {
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

      if (!description || typeof amount !== "number") {
        throw createError({
          statusCode: 400,
          statusMessage: "Faltan campos obligatorios",
        });
      }

      const item = await db.expense.create({
        data: {
          bucket: bucket || "fijo",
          category: category || "general",
          description: String(description),
          amount: Number(amount),
          frequency: frequency || "unico",
          date: date ? new Date(date) : new Date(),
          notes: notes || null,
          subscriptionId: subscriptionId || null,
        },
        include: { subscription: true },
      });
      return { item };
    }

    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  } catch (e: any) {
    console.error("/api/expenses", e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "Error al procesar gastos",
    });
  }
});
