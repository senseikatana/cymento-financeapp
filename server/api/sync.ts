import * as XLSX from "xlsx";

// GET /api/sync — exporta un .xlsx con todos los datos
// POST /api/sync — recibe un archivo .xlsx y lo importa
export default defineEventHandler(async (event) => {
  try {
    // ============ EXPORT ============
    if (event.method === "GET") {
      const [incomes, expenses, subscriptions] = await Promise.all([
        db.income.findMany(),
        db.expense.findMany(),
        db.subscription.findMany(),
      ]);

      const wb = XLSX.utils.book_new();

      // Hoja Ingresos
      const incomesAoA = [
        [
          "type",
          "source",
          "amount",
          "frequency",
          "date",
          "active",
          "notes",
          "category",
        ],
        ...incomes.map((i) => [
          i.type,
          i.source,
          i.amount,
          i.frequency,
          i.date.toISOString().slice(0, 10),
          i.active ? 1 : 0,
          i.notes || "",
          i.category || "",
        ]),
      ];
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(incomesAoA),
        "Ingresos",
      );

      // Hoja Gastos
      const expensesAoA = [
        [
          "bucket",
          "category",
          "description",
          "amount",
          "frequency",
          "date",
          "notes",
        ],
        ...expenses.map((e) => [
          e.bucket,
          e.category,
          e.description,
          e.amount,
          e.frequency,
          e.date.toISOString().slice(0, 10),
          e.notes || "",
        ]),
      ];
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(expensesAoA),
        "Gastos",
      );

      // Hoja Suscripciones
      const subsAoA = [
        [
          "name",
          "provider",
          "billingCycle",
          "amount",
          "startDate",
          "renewalDate",
          "active",
          "bucket",
          "category",
          "notes",
        ],
        ...subscriptions.map((s) => [
          s.name,
          s.provider || "",
          s.billingCycle,
          s.amount,
          s.startDate.toISOString().slice(0, 10),
          s.renewalDate ? s.renewalDate.toISOString().slice(0, 10) : "",
          s.active ? 1 : 0,
          s.bucket,
          s.category,
          s.notes || "",
        ]),
      ];
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(subsAoA),
        "Suscripciones",
      );

      // Hoja Resumen
      const summaryAoA: (string | number)[][] = [
        ["Resumen mensual"],
        [],
        ["Concepto", "Importe €"],
        [
          "Ingresos mensuales recurrentes",
          incomes
            .filter((i) => i.active && i.frequency !== "unico")
            .reduce(
              (s, i) =>
                s +
                (i.frequency === "mensual"
                  ? i.amount
                  : i.frequency === "anual"
                    ? i.amount / 12
                    : 0),
              0,
            ),
        ],
        [
          "Gastos fijos (objetivo 50%)",
          expenses
            .filter((e) => e.bucket === "fijo" && e.frequency !== "unico")
            .reduce(
              (s, e) =>
                s +
                (e.frequency === "mensual"
                  ? e.amount
                  : e.frequency === "anual"
                    ? e.amount / 12
                    : 0),
              0,
            ),
        ],
        [
          "Gastos extraordinarios (objetivo 30%)",
          expenses
            .filter(
              (e) => e.bucket === "extraordinario" && e.frequency !== "unico",
            )
            .reduce(
              (s, e) =>
                s +
                (e.frequency === "mensual"
                  ? e.amount
                  : e.frequency === "anual"
                    ? e.amount / 12
                    : 0),
              0,
            ),
        ],
        [
          "Ahorro (objetivo 20%)",
          expenses
            .filter((e) => e.bucket === "ahorro" && e.frequency !== "unico")
            .reduce(
              (s, e) =>
                s +
                (e.frequency === "mensual"
                  ? e.amount
                  : e.frequency === "anual"
                    ? e.amount / 12
                    : 0),
              0,
            ),
        ],
      ];
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(summaryAoA),
        "Resumen",
      );

      const buf = XLSX.write(wb, {
        type: "buffer",
        bookType: "xlsx",
      }) as Buffer;
      const filename = `finanzas_${new Date().toISOString().slice(0, 10)}.xlsx`;

      setResponseHeaders(event, {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      });
      return buf;
    }

    // ============ IMPORT ============
    if (event.method === "POST") {
      const parts = await readMultipartFormData(event);
      const filePart = parts?.find((p) => p.name === "file" && p.data);
      if (!filePart) {
        throw createError({
          statusCode: 400,
          statusMessage: "No se envió ningún archivo",
        });
      }

      const wb = XLSX.read(filePart.data, { type: "array" });
      const imported = { incomes: 0, expenses: 0, subscriptions: 0 };

      // Hoja Ingresos
      if (wb.SheetNames.includes("Ingresos")) {
        const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets["Ingresos"]);
        for (const r of rows) {
          if (!r.source && !r.fuente) continue;
          await db.income.create({
            data: {
              type: String(r.type || r.tipo || "salario"),
              source: String(r.source || r.fuente),
              amount: Number(r.amount || r.importe || 0),
              frequency: String(r.frequency || r.frecuencia || "unico"),
              date:
                r.date || r.fecha ? new Date(r.date || r.fecha) : new Date(),
              active: r.active !== undefined ? Boolean(r.active) : true,
              notes: r.notes || r.notas ? String(r.notes || r.notas) : null,
              category:
                r.category || r.categoria
                  ? String(r.category || r.categoria)
                  : null,
            },
          });
          imported.incomes++;
        }
      }

      // Hoja Gastos
      if (wb.SheetNames.includes("Gastos")) {
        const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets["Gastos"]);
        for (const r of rows) {
          if (!r.description && !r.descripcion) continue;
          await db.expense.create({
            data: {
              bucket: String(r.bucket || "fijo"),
              category: String(r.category || r.categoria || "general"),
              description: String(r.description || r.descripcion),
              amount: Number(r.amount || r.importe || 0),
              frequency: String(r.frequency || r.frecuencia || "unico"),
              date:
                r.date || r.fecha ? new Date(r.date || r.fecha) : new Date(),
              notes: r.notes || r.notas ? String(r.notes || r.notas) : null,
            },
          });
          imported.expenses++;
        }
      }

      // Hoja Suscripciones
      if (wb.SheetNames.includes("Suscripciones")) {
        const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets["Suscripciones"]);
        for (const r of rows) {
          if (!r.name && !r.nombre) continue;
          await db.subscription.create({
            data: {
              name: String(r.name || r.nombre),
              provider:
                r.provider || r.proveedor
                  ? String(r.provider || r.proveedor)
                  : null,
              billingCycle: String(r.billingCycle || r.ciclo || "mensual"),
              amount: Number(r.amount || r.importe || 0),
              startDate:
                r.startDate || r.fechaInicio
                  ? new Date(r.startDate || r.fechaInicio)
                  : new Date(),
              renewalDate:
                r.renewalDate || r.renovacion
                  ? new Date(r.renewalDate || r.renovacion)
                  : null,
              active: r.active !== undefined ? Boolean(r.active) : true,
              bucket: String(r.bucket || "extraordinario"),
              category: String(r.category || r.categoria || "suscripcion"),
              notes: r.notes || r.notas ? String(r.notes || r.notas) : null,
            },
          });
          imported.subscriptions++;
        }
      }

      return { ok: true, imported };
    }

    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  } catch (e: any) {
    console.error("/api/sync", e);
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "Error al sincronizar Excel",
    });
  }
});
