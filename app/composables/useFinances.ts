// Composable de datos financieros — reemplaza los React Query hooks originales

export interface Income {
  id: string;
  type: string;
  source: string;
  amount: number;
  frequency: string;
  date: string;
  active: boolean;
  notes: string | null;
  category: string | null;
}

export interface Subscription {
  id: string;
  name: string;
  provider: string | null;
  billingCycle: string;
  amount: number;
  startDate: string;
  renewalDate: string | null;
  active: boolean;
  bucket: string;
  category: string;
  notes: string | null;
}

export interface Expense {
  id: string;
  bucket: string;
  category: string;
  description: string;
  amount: number;
  frequency: string;
  date: string;
  notes: string | null;
  subscriptionId: string | null;
  subscription?: Subscription | null;
}

export interface Settings {
  id: string;
  pctFixed: number;
  pctExtra: number;
  pctSavings: number;
  ruleBase: string;
  currency: string;
  locale: string;
}

export interface Summary {
  totals: {
    incomeMonthly: number;
    incomeUnique: number;
    incomeYearly: number;
    expensesMonthly: number;
    balanceMonthly: number;
    subsMonthly: number;
    subsYearly: number;
  };
  buckets: {
    monthly: Record<string, number>;
    unique: Record<string, number>;
    targets: { fixed: number; extra: number; savings: number };
    pct: { fixed: number; extra: number; savings: number };
    base: string;
    baseAmount: number;
  };
  byCategory: Record<string, number>;
  subscriptions: {
    count: number;
    monthly: number;
    yearly: number;
    upcomingRenewals: Array<{
      id: string;
      name: string;
      amount: number;
      billingCycle: string;
      renewalDate: string;
      daysUntil: number;
    }>;
  };
  counts: {
    incomes: number;
    expenses: number;
    subscriptions: number;
  };
}

export function useFinances() {
  // ---------- State ----------
  const dateRange = ref<{ start: string; end: string }>({
    start: getFirstDayOfMonth(new Date()).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  // ---------- Queries ----------
  const {
    data: summary,
    pending: loadingSummary,
    refresh: refreshSummary,
  } = useFetch<Summary>("/api/summary", { default: () => null });

  const {
    data: incomes,
    pending: loadingIncomes,
    refresh: refreshIncomes,
  } = useFetch<{ items: Income[] }>("/api/incomes", {
    default: () => ({ items: [] }),
  });

  const {
    data: expenses,
    pending: loadingExpenses,
    refresh: refreshExpenses,
  } = useFetch<{ items: Expense[] }>("/api/expenses", {
    default: () => ({ items: [] }),
  });

  const {
    data: subs,
    pending: loadingSubs,
    refresh: refreshSubs,
  } = useFetch<{ items: Subscription[] }>("/api/subscriptions", {
    default: () => ({ items: [] }),
  });

  const {
    data: settings,
    pending: loadingSettings,
    refresh: refreshSettings,
  } = useFetch<{ settings: Settings | null }>("/api/settings", {
    default: () => ({ settings: null }),
  });

  const refreshAll = async () => {
    await Promise.all([
      refreshSummary(),
      refreshIncomes(),
      refreshExpenses(),
      refreshSubs(),
      refreshSettings(),
    ]);
  };

  // ---------- Mutations: Incomes ----------
  async function createIncome(input: Partial<Income>) {
    await $fetch("/api/incomes", { method: "POST", body: input });
    await refreshIncomes();
    await refreshSummary();
  }

  async function updateIncome(input: Partial<Income> & { id: string }) {
    const { id, ...rest } = input;
    await $fetch(`/api/incomes/${id}`, { method: "PUT", body: rest });
    await refreshIncomes();
    await refreshSummary();
  }

  async function deleteIncome(id: string) {
    await $fetch(`/api/incomes/${id}`, { method: "DELETE" });
    await refreshIncomes();
    await refreshSummary();
  }

  // ---------- Mutations: Expenses ----------
  async function createExpense(input: Partial<Expense>) {
    await $fetch("/api/expenses", { method: "POST", body: input });
    await refreshExpenses();
    await refreshSummary();
  }

  async function updateExpense(input: Partial<Expense> & { id: string }) {
    const { id, ...rest } = input;
    await $fetch(`/api/expenses/${id}`, { method: "PUT", body: rest });
    await refreshExpenses();
    await refreshSummary();
  }

  async function deleteExpense(id: string) {
    await $fetch(`/api/expenses/${id}`, { method: "DELETE" });
    await refreshExpenses();
    await refreshSummary();
  }

  // ---------- Mutations: Subscriptions ----------
  async function createSubscription(
    input: Partial<Subscription> & { createExpense?: boolean },
  ) {
    await $fetch("/api/subscriptions", { method: "POST", body: input });
    await refreshSubs();
    await refreshExpenses();
    await refreshSummary();
  }

  async function updateSubscription(
    input: Partial<Subscription> & { id: string },
  ) {
    const { id, ...rest } = input;
    await $fetch(`/api/subscriptions/${id}`, { method: "PUT", body: rest });
    await refreshSubs();
    await refreshSummary();
  }

  async function deleteSubscription(id: string) {
    await $fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    await refreshSubs();
    await refreshExpenses();
    await refreshSummary();
  }

  // ---------- Mutations: Settings ----------
  async function updateSettings(input: Partial<Settings>) {
    await $fetch("/api/settings", { method: "PUT", body: input });
    await refreshSettings();
    await refreshSummary();
  }

  // ---------- Sync ----------
  async function exportExcel() {
    const blob = await $fetch<Blob>("/api/sync", { method: "GET" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finanzas_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function importExcel(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const result = await $fetch<{
      ok: boolean;
      imported: { incomes: number; expenses: number; subscriptions: number };
    }>("/api/sync", { method: "POST", body: fd });
    await refreshAll();
    return result;
  }

  async function seed() {
    await $fetch("/api/seed", { method: "POST" });
    await refreshAll();
  }

  return {
    // State
    summary,
    incomes: computed(() => incomes.value?.items ?? []),
    expenses: computed(() => expenses.value?.items ?? []),
    subs: computed(() => subs.value?.items ?? []),
    settings: computed(() => settings.value?.settings),
    loadingSummary,
    loadingIncomes,
    loadingExpenses,
    loadingSubs,
    loadingSettings,
    refreshAll,
    dateRange,
    // Calculated Expenses
    monthlyExpenses: async () => {
      const response = await $fetch<{
        monthlyExpenses: number;
        yearlyExpenses: number;
      }>("/api/expenses/monthly", {
        method: "GET",
        headers: {
          "X-Date-Range": `${dateRange.value.start},${dateRange.value.end}`,
        },
      });
      return response.monthlyExpenses;
    },
    yearlyExpenses: async () => {
      const response = await $fetch<{
        monthlyExpenses: number;
        yearlyExpenses: number;
      }>("/api/expenses/monthly", {
        method: "GET",
        headers: {
          "X-Date-Range": `${dateRange.value.start},${dateRange.value.end}`,
        },
      });
      return response.yearlyExpenses;
    },
    realExpenses: async () => {
      const response = await $fetch<{ realExpenses: number }>(
        "/api/expenses/real",
        {
          method: "GET",
        },
      );
      return response.realExpenses;
    },
    // Helper functions
    calculateMonthlyExpenses: calculateMonthlyExpenses,
    calculateRealExpenses: calculateRealExpenses,
    // Mutations
    createIncome,
    updateIncome,
    deleteIncome,
    createExpense,
    updateExpense,
    deleteExpense,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    updateSettings,
    exportExcel,
    importExcel,
    seed,
  };
}
