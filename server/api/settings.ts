// GET /api/settings · PUT /api/settings
const SINGLETON_ID = "singleton";

async function getOrCreateSettings() {
  let s = await db.settings.findUnique({ where: { id: SINGLETON_ID } });
  if (!s) {
    s = await db.settings.create({ data: { id: SINGLETON_ID } });
  }
  return s;
}

export default defineEventHandler(async (event) => {
  try {
    if (event.method === "GET") {
      const settings = await getOrCreateSettings();
      return { settings };
    }

    if (event.method === "PUT") {
      const body = await readBody(event);
      const { pctFixed, pctExtra, pctSavings, ruleBase, currency, locale } =
        body || {};

      await getOrCreateSettings();
      const updated = await db.settings.update({
        where: { id: SINGLETON_ID },
        data: {
          ...(pctFixed !== undefined && { pctFixed: Number(pctFixed) }),
          ...(pctExtra !== undefined && { pctExtra: Number(pctExtra) }),
          ...(pctSavings !== undefined && { pctSavings: Number(pctSavings) }),
          ...(ruleBase !== undefined && { ruleBase }),
          ...(currency !== undefined && { currency }),
          ...(locale !== undefined && { locale }),
        },
      });
      return { settings: updated };
    }

    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  } catch (e: any) {
    console.error("/api/settings", e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "Error al procesar ajustes",
    });
  }
});
