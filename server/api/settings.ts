// GET /api/settings · PUT /api/settings
import { getInsforge } from '../utils/insforge';
import { mapSettings } from '../utils/mappers';

const SINGLETON_ID = 'singleton';

async function getOrCreateSettings() {
  const { data, error } = await getInsforge()
    .database.from('settings')
    .select()
    .eq('id', SINGLETON_ID)
    .limit(1);
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });
  if (data?.length) return mapSettings(data[0]);

  const { data: created, error: insertError } = await getInsforge()
    .database.from('settings')
    .insert([{ id: SINGLETON_ID }])
    .select();
  if (insertError) throw createError({ statusCode: 500, statusMessage: insertError.message });
  if (!created?.length) {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo crear la configuración' });
  }
  return mapSettings(created[0]);
}

export default defineEventHandler(async (event) => {
  try {
    if (event.method === 'GET') {
      const settings = await getOrCreateSettings();
      return { settings };
    }

    if (event.method === 'PUT') {
      const body = await readBody(event);
      const { pctFixed, pctExtra, pctSavings, ruleBase, currency, locale } = body || {};

      const current = await getOrCreateSettings();
      const nextFixed = pctFixed !== undefined ? Number(pctFixed) : current.pctFixed;
      const nextExtra = pctExtra !== undefined ? Number(pctExtra) : current.pctExtra;
      const nextSavings = pctSavings !== undefined ? Number(pctSavings) : current.pctSavings;
      if (Math.round((nextFixed + nextExtra + nextSavings) * 100) !== 10000) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Los porcentajes de la regla deben sumar 100',
        });
      }

      const { data, error } = await getInsforge()
        .database.from('settings')
        .update({
          pct_fixed: nextFixed,
          pct_extra: nextExtra,
          pct_savings: nextSavings,
          ...(ruleBase !== undefined && { rule_base: ruleBase }),
          ...(currency !== undefined && { currency }),
          ...(locale !== undefined && { locale }),
        })
        .eq('id', SINGLETON_ID)
        .select();

      if (error) throw createError({ statusCode: 400, statusMessage: error.message });
      if (!data?.length) {
        throw createError({
          statusCode: 500,
          statusMessage: 'No se pudo actualizar la configuración',
        });
      }
      return { settings: mapSettings(data[0]) };
    }

    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
  } catch (e: any) {
    console.error('/api/settings', e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Error al procesar ajustes',
    });
  }
});
