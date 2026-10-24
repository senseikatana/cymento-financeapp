<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Settings as SettingsIcon,
  Plus,
  Calendar,
  Repeat,
  Bell,
  Loader2,
  ScrollText,
} from "@lucide/vue";
import {
  useFinances,
  type Income,
  type Expense,
  type Subscription,
} from "~/composables/useFinances";
import { formatEUR, formatDate, toMonthly, toYearly } from "~/utils/format";

const {
  summary,
  incomes,
  expenses,
  subs,
  loadingSummary,
  loadingIncomes,
  loadingExpenses,
  loadingSubs,
  dateRange,
  monthlyExpenses,
  yearlyExpenses,
  realExpenses,
  calculateMonthlyExpenses,
  calculateRealExpenses,
} = useFinances();

const activeTab = ref("dashboard");
const incomeDialog = ref(false);
const expenseDialog = ref(false);
const subDialog = ref(false);
const settingsDialog = ref(false);

const editingIncome = ref<Income | null>(null);
const editingExpense = ref<Expense | null>(null);
const editingSub = ref<Subscription | null>(null);

function openNewIncome() {
  editingIncome.value = null;
  incomeDialog.value = true;
}

function handleDateRangeChange(range: { start: string; end: string }) {
  dateRange.value = range;
  calculateMonthlyExpenses();
  calculateRealExpenses();
}
function openEditIncome(i: Income) {
  editingIncome.value = i;
  incomeDialog.value = true;
}
function openNewExpense() {
  editingExpense.value = null;
  expenseDialog.value = true;
}
function openEditExpense(e: Expense) {
  editingExpense.value = e;
  expenseDialog.value = true;
}
function openNewSub() {
  editingSub.value = null;
  subDialog.value = true;
}
function openEditSub(s: Subscription) {
  editingSub.value = s;
  subDialog.value = true;
}

const activeSubs = computed(() => subs.value.filter((s) => s.active));
const subsMonthlyEquivalent = computed(() =>
  activeSubs.value.reduce(
    (sum, s) => sum + toMonthly(s.amount, s.billingCycle),
    0,
  ),
);
const subsYearly = computed(() =>
  activeSubs.value.reduce(
    (sum, s) => sum + toYearly(s.amount, s.billingCycle),
    0,
  ),
);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-muted/30">
    <!-- ===== Header ===== -->
    <header
      class="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div
        class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3"
      >
        <div class="flex items-center gap-2">
          <div
            class="rounded-lg bg-gradient-to-br from-emerald-500 to-violet-600 p-1.5 text-white"
          >
            <Wallet class="h-5 w-5" />
          </div>
          <div>
            <h1 class="text-base sm:text-lg font-bold leading-none">
              Finanzas Personales
            </h1>
            <p class="text-xs text-muted-foreground hidden sm:block">
              Regla 50/30/20 · Sincronizable con Excel / Google Sheets
            </p>
          </div>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" @click="settingsDialog = true">
            <SettingsIcon class="h-4 w-4 mr-2" /> Ajustes
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>

    <!-- ===== Main ===== -->
    <main
      class="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6"
    >
      <!-- Sync toolbar + DateFilter -->
      <div class="rounded-xl border bg-card p-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <div class="flex flex-col gap-3">
              <div>
                <h2 class="text-sm font-semibold flex items-center gap-2">
                  <ScrollText
                    class="h-4 w-4 text-violet-600 dark:text-violet-400"
                  />
                  Sincronización
                </h2>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Exporta tu presupuesto a Excel para abrirlo en
                  OnlyOffice/LibreOffice o subirlo a Google Drive.
                </p>
              </div>
              <SyncToolbar />
            </div>
          </div>
          <div class="flex-none">
            <DateFilter @rangeSelected="handleDateRangeChange" />
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <Tabs v-model="activeTab">
        <TabsList class="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="dashboard" class="text-xs sm:text-sm"
            >Dashboard</TabsTrigger
          >
          <TabsTrigger value="ingresos" class="text-xs sm:text-sm">
            Ingresos
            <span
              v-if="incomes.length > 0"
              class="ml-1.5 inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground"
            >
              {{ incomes.length }}
            </span>
          </TabsTrigger>
          <TabsTrigger value="gastos" class="text-xs sm:text-sm">
            Gastos
            <span
              v-if="expenses.length > 0"
              class="ml-1.5 inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground"
            >
              {{ expenses.length }}
            </span>
          </TabsTrigger>
          <TabsTrigger value="suscripciones" class="text-xs sm:text-sm">
            Suscripciones
            <span
              v-if="subs.length > 0"
              class="ml-1.5 inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground"
            >
              {{ subs.length }}
            </span>
          </TabsTrigger>
        </TabsList>

        <!-- ===== DASHBOARD ===== -->
        <TabsContent value="dashboard" class="space-y-6 mt-4">
          <div
            v-if="loadingSummary || !summary"
            class="flex items-center justify-center py-20"
          >
            <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
          <template v-else>
            <!-- KPIs -->
            <div class="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Ingresos / mes"
                :value="formatEUR(summary.totals.incomeMonthly)"
                :subtitle="`+ ${formatEUR(summary.totals.incomeUnique)} únicos`"
                :icon="TrendingUp"
                accent="green"
              />
              <KpiCard
                title="Gastos / mes"
                :value="formatEUR(summary.totals.expensesMonthly)"
                :subtitle="`Saldo: ${formatEUR(summary.totals.balanceMonthly)}`"
                :icon="TrendingDown"
                :accent="summary.totals.balanceMonthly >= 0 ? 'slate' : 'red'"
              />
              <KpiCard
                title="Gastos reales"
                :value="formatEUR(realExpenses)"
                :subtitle="`vs ${formatEUR(monthlyExpenses)}`"
                :icon="TrendingDown"
                :accent="realExpenses <= monthlyExpenses ? 'green' : 'red'"
              />
              <KpiCard
                title="Gastos anuales"
                :value="formatEUR(yearlyExpenses)"
                :subtitle="`Total anual`"
                :icon="TrendingDown"
                accent="violet"
              />
              <KpiCard
                title="Suscripciones / mes"
                :value="formatEUR(summary.totals.subsMonthly)"
                :subtitle="`${formatEUR(summary.totals.subsYearly)}/año · ${summary.subscriptions.count} activas`"
                :icon="Repeat"
                accent="amber"
              />
              <KpiCard
                title="Ahorro / mes"
                :value="formatEUR(summary.buckets.monthly.ahorro || 0)"
                :subtitle="`Objetivo: ${formatEUR(summary.buckets.targets.savings)}`"
                :icon="PiggyBank"
                accent="violet"
                :progress="
                  summary.buckets.targets.savings > 0
                    ? ((summary.buckets.monthly.ahorro || 0) /
                        summary.buckets.targets.savings) *
                      100
                    : 0
                "
              />
            </div>

            <!-- Charts -->
            <DashboardCharts
              :summary="summary"
              :realExpenses="realExpenses"
              :monthlyExpenses="monthlyExpenses"
              :yearlyExpenses="yearlyExpenses"
            />

            <!-- Rule breakdown -->
            <RuleBreakdownCard :summary="summary" />

            <!-- Próximas renovaciones -->
            <div
              v-if="summary.subscriptions.upcomingRenewals.length > 0"
              class="rounded-xl border bg-card text-card-foreground shadow-sm"
            >
              <div class="flex flex-col space-y-1.5 p-6">
                <h3
                  class="font-semibold leading-none tracking-tight text-base flex items-center gap-2"
                >
                  <Bell class="h-4 w-4 text-amber-500" />
                  Próximas renovaciones
                </h3>
              </div>
              <div class="p-6 pt-0 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <div
                  v-for="r in summary.subscriptions.upcomingRenewals"
                  :key="r.id"
                  class="flex items-center justify-between rounded-lg border p-3"
                >
                  <div class="min-w-0">
                    <p class="text-sm font-medium truncate">{{ r.name }}</p>
                    <p
                      class="text-xs text-muted-foreground flex items-center gap-1"
                    >
                      <Calendar class="h-3 w-3" />
                      {{ formatDate(r.renewalDate) }}
                    </p>
                  </div>
                  <div class="text-right ml-2 shrink-0">
                    <p class="text-sm font-medium tabular-nums">
                      {{ formatEUR(r.amount) }}
                    </p>
                    <p
                      :class="
                        r.daysUntil < 0
                          ? 'text-rose-500'
                          : r.daysUntil < 7
                            ? 'text-amber-500'
                            : 'text-muted-foreground'
                      "
                      class="text-xs"
                    >
                      {{
                        r.daysUntil < 0
                          ? `hace ${Math.abs(r.daysUntil)}d`
                          : `en ${r.daysUntil}d`
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </TabsContent>

        <!-- ===== INGRESOS ===== -->
        <TabsContent value="ingresos" class="space-y-4 mt-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold">Ingresos</h2>
              <p class="text-sm text-muted-foreground">
                Salario, subsidio de paro, ahorros previos. Marca recurrentes
                para que cuenten en los totales mensuales.
              </p>
            </div>
            <Button size="sm" @click="openNewIncome">
              <Plus class="h-4 w-4 mr-2" /> Añadir ingreso
            </Button>
          </div>
          <div v-if="loadingIncomes" class="flex justify-center py-10">
            <Loader2 class="h-5 w-5 animate-spin" />
          </div>
          <IncomesTable
            v-else
            :items="incomes"
            @edit="openEditIncome"
            @add="openNewIncome"
          />
        </TabsContent>

        <!-- ===== GASTOS ===== -->
        <TabsContent value="gastos" class="space-y-4 mt-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold">Gastos</h2>
              <p class="text-sm text-muted-foreground">
                Clasificados en los 3 buckets de la regla 50/30/20. Marca
                frecuentes como mensuales/anuales para que cuenten.
              </p>
            </div>
            <Button size="sm" @click="openNewExpense">
              <Plus class="h-4 w-4 mr-2" /> Añadir gasto
            </Button>
          </div>
          <div v-if="loadingExpenses" class="flex justify-center py-10">
            <Loader2 class="h-5 w-5 animate-spin" />
          </div>
          <ExpensesTable
            v-else
            :items="expenses"
            @edit="openEditExpense"
            @add="openNewExpense"
          />
        </TabsContent>

        <!-- ===== SUSCRIPCIONES ===== -->
        <TabsContent value="suscripciones" class="space-y-4 mt-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold">Suscripciones</h2>
              <p class="text-sm text-muted-foreground">
                Gestiona tus pagos recurrentes. Las mensuales y anuales se
                contabilizan automáticamente en el bucket seleccionado.
              </p>
            </div>
            <Button size="sm" @click="openNewSub">
              <Plus class="h-4 w-4 mr-2" /> Añadir suscripción
            </Button>
          </div>
          <div v-if="loadingSubs" class="flex justify-center py-10">
            <Loader2 class="h-5 w-5 animate-spin" />
          </div>
          <template v-else>
            <div v-if="subs.length > 0" class="grid gap-3 sm:grid-cols-3">
              <div
                class="rounded-xl border bg-card text-card-foreground shadow-sm"
              >
                <div class="flex flex-col space-y-1.5 p-6 pb-2">
                  <h3
                    class="text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    Mensual equivalente
                  </h3>
                </div>
                <div class="p-6 pt-0">
                  <p class="text-2xl font-bold tabular-nums">
                    {{ formatEUR(subsMonthlyEquivalent) }}
                  </p>
                  <p class="text-xs text-muted-foreground mt-1">
                    suma de todas las activas
                  </p>
                </div>
              </div>
              <div
                class="rounded-xl border bg-card text-card-foreground shadow-sm"
              >
                <div class="flex flex-col space-y-1.5 p-6 pb-2">
                  <h3
                    class="text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    Coste anual
                  </h3>
                </div>
                <div class="p-6 pt-0">
                  <p class="text-2xl font-bold tabular-nums">
                    {{ formatEUR(subsYearly) }}
                  </p>
                  <p class="text-xs text-muted-foreground mt-1">
                    lo que gastarás en 12 meses
                  </p>
                </div>
              </div>
              <div
                class="rounded-xl border bg-card text-card-foreground shadow-sm"
              >
                <div class="flex flex-col space-y-1.5 p-6 pb-2">
                  <h3
                    class="text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    Suscripciones activas
                  </h3>
                </div>
                <div class="p-6 pt-0">
                  <p class="text-2xl font-bold tabular-nums">
                    {{ activeSubs.length }}
                  </p>
                  <p class="text-xs text-muted-foreground mt-1">
                    de {{ subs.length }} totales
                  </p>
                </div>
              </div>
            </div>
            <SubscriptionsTable
              :items="subs"
              @edit="openEditSub"
              @add="openNewSub"
            />
          </template>
        </TabsContent>
      </Tabs>
    </main>

    <!-- ===== Footer ===== -->
    <footer class="mt-auto border-t bg-background">
      <div
        class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2"
      >
        <p>Hecho con Nuxt · Prisma · Tailwind · Vue</p>
        <p>
          Datos almacenados en SQLite local · Exportable a Excel/Google Sheets
          para BigLinux + OnlyOffice
        </p>
      </div>
    </footer>

    <!-- ===== Dialogs ===== -->
    <IncomeFormDialog v-model="incomeDialog" :editing="editingIncome" />
    <ExpenseFormDialog v-model="expenseDialog" :editing="editingExpense" />
    <SubscriptionFormDialog v-model="subDialog" :editing="editingSub" />
    <SettingsDialog v-model="settingsDialog" />
  </div>
</template>
