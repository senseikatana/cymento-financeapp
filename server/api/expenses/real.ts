/*
 * @description Retrieves the real expenses for the current user for the current month.
 * @param {H3Event<globalThis.EventHandlerRequest>} event - The event object for the request.
 * @returns {Promise<{realExpenses: number}>} - The response object containing the calculated real expenses.
 * GET /api/expenses/real
 * @header {string} x-date-range - The date range for which to calculate real expenses, formatted as "startDate,endDate".
 * @returns {Promise<{realExpenses: number}>} - The response object containing the calculated real expenses.
 * Returns real expenses for the current user for the current month.
 */
export default defineEventHandler(async () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const realExpenses = await db.expense.sum({
    where: {
      AND: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    },
    _sum: { amount: true },
  });

  return {
    realExpenses: realExpenses._sum?.amount || 0,
  };
});
