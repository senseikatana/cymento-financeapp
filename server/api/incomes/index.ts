// GET /api/incomes — lista todos los ingresos
// POST /api/incomes — crea un nuevo ingreso
export default defineEventHandler(async (event) => {
  try {
    if (event.method === "GET") {
      const items = await db.income.findMany({
        orderBy: { date: "desc" },
      });
      return { items };
    }

    if (event.method === "POST") {
      const body = await readBody(event);
      const { type, source, amount, frequency, date, active, notes, category } =
        body || {};

      if (!source || typeof amount !== "number") {
        throw createError({
          statusCode: 400,
          statusMessage: "Faltan campos obligatorios",
        });
      }

      const item = await db.income.create({
        data: {
          type: type || "salario",
          source: String(source),
          amount: Number(amount),
          frequency: frequency || "unico",
          date: date ? new Date(date) : new Date(),
          active: active ?? true,
          notes: notes || null,
          category: category || null,
        },
      });
      return { item };
    }

    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  } catch (e: any) {
    console.error("/api/incomes", e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "Error al procesar ingresos",
    });
  }
});
