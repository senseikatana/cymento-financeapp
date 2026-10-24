/*
 * @description Retrieves the monthly and yearly expenses for the current user within a specified date range.
 * @param {H3Event<globalThis.EventHandlerRequest>} event - The event object for the request.
 * @returns {Promise<{monthlyExpenses: number, yearlyExpenses: number}>} - The response object containing the calculated expenses.
 * GET /api/expenses/monthly
 * @header {string} x-date-range - The date range for which to calculate expenses, formatted as "startDate,endDate".
 * @returns {Promise<{monthlyExpenses: number, yearlyExpenses: number}>} - The response object containing the calculated expenses.
 * Returns monthly and yearly expenses for the current user within the specified date range.
 */
export default defineEventHandler(async (event) => {
  const headers = getHeaders(event);
  const dateRange = headers["x-date-range"] as string | undefined;

  if (!dateRange) {
    throw createError({
      statusCode: 400,
      statusMessage: "Date range header is required",
    });
  }

  const [startDateStr, endDateStr] = dateRange.split(",");
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Calculate monthly expenses for the selected date range
  const monthlyExpenses = await db.expense.sum({
    where: {
      AND: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    _sum: { amount: true },
  });

  // Calculate yearly expenses for the selected date range
  const yearlyExpenses = await db.expense.sum({
    where: {
      AND: {
        date: {
          gte: new Date(startDate.getFullYear(), 0, 1),
          lte: new Date(endDate.getFullYear(), 11, 31),
        },
      },
    },
    _sum: { amount: true },
  });

  return {
    monthlyExpenses: monthlyExpenses._sum?.amount || 0,
    yearlyExpenses: yearlyExpenses._sum?.amount || 0,
  };
});
