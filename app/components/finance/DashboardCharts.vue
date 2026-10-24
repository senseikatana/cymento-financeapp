<script setup lang="ts">
import { computed } from "vue";
import { formatEUR, BUCKET_COLORS, BUCKET_SHORT } from "~/utils/format";
import type { Summary } from "~/composables/useFinances";

const props = defineProps<{
  summary: Summary;
  realExpenses?: number;
  monthlyExpenses?: number;
  yearlyExpenses?: number;
}>();

const pieData = computed(() =>
  [
    {
      name: BUCKET_SHORT.fijo,
      value: props.summary.buckets.monthly.fijo || 0,
      key: "fijo",
    },
    {
      name: BUCKET_SHORT.extraordinario,
      value: props.summary.buckets.monthly.extraordinario || 0,
      key: "extraordinario",
    },
    {
      name: BUCKET_SHORT.ahorro,
      value: props.summary.buckets.monthly.ahorro || 0,
      key: "ahorro",
    },
  ].filter((d) => d.value > 0),
);

const pieTotal = computed(() => pieData.value.reduce((s, d) => s + d.value, 0));

const conicGradient = computed(() => {
  const total = pieTotal.value;
  if (total <= 0) return "conic-gradient(#e5e7eb 0deg 360deg)";
  let acc = 0;
  const stops = pieData.value.map((d) => {
    const start = (acc / total) * 360;
    acc += d.value;
    const end = (acc / total) * 360;
    return `${BUCKET_COLORS[d.key]} ${start}deg ${end}deg`;
  });
  return `conic-gradient(${stops.join(", ")})`;
});

const catData = computed(() =>
  Object.entries(props.summary.byCategory)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8),
);

const catMax = computed(() =>
  catData.value.length ? Math.max(...catData.value.map(([, v]) => v)) : 0,
);

const compareData = computed(() => [
  {
    name: "Fijos",
    objetivo: props.summary.buckets.targets.fixed,
    real: props.summary.buckets.monthly.fijo || 0,
  },
  {
    name: "Extras",
    objetivo: props.summary.buckets.targets.extra,
    real: props.summary.buckets.monthly.extraordinario || 0,
  },
  {
    name: "Ahorro",
    objetivo: props.summary.buckets.targets.savings,
    real: props.summary.buckets.monthly.ahorro || 0,
  },
]);

const compareMax = computed(() =>
  Math.max(...compareData.value.flatMap((d) => [d.objetivo, d.real]), 1),
);
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2">
    <!-- Donut de buckets -->
    <div class="rounded-xl border bg-card p-4">
      <h3 class="text-sm font-semibold mb-3">
        Distribución mensual por bucket
      </h3>
      <div class="flex flex-col sm:flex-row items-center gap-4">
        <div
          class="relative h-40 w-40 shrink-0 rounded-full"
          :style="{ background: conicGradient }"
        >
          <div class="absolute inset-4 rounded-full bg-card" />
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-sm font-semibold tabular-nums">{{
              formatEUR(pieTotal)
            }}</span>
          </div>
        </div>
        <ul class="flex-1 space-y-2 text-sm">
          <li
            v-for="d in pieData"
            :key="d.key"
            class="flex items-center justify-between gap-2"
          >
            <span class="flex items-center gap-2">
              <span
                class="h-3 w-3 rounded-sm"
                :style="{ backgroundColor: BUCKET_COLORS[d.key] }"
              />
              {{ d.name }}
            </span>
            <span class="tabular-nums text-muted-foreground">{{
              formatEUR(d.value)
            }}</span>
          </li>
          <li v-if="pieData.length === 0" class="text-muted-foreground">
            Sin datos.
          </li>
        </ul>
      </div>
    </div>

    <!-- Gastos reales vs totales -->
    <div class="rounded-xl border bg-card p-4">
      <h3 class="text-sm font-semibold mb-3">Gastos reales vs totales</h3>
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <div class="flex justify-between mb-2">
              <span class="text-sm font-medium">Gastado este mes</span>
              <span class="text-sm font-semibold tabular-nums">{{
                formatEUR(props.realExpenses || 0)
              }}</span>
            </div>
            <div class="h-2 bg-muted rounded-full overflow-hidden">
              <div
                class="h-full bg-emerald-500"
                :style="{
                  width: `${props.realExpenses ? (props.realExpenses / (props.monthlyExpenses || 1)) * 100 : 0}%`,
                }"
              />
            </div>
          </div>
          <div class="flex-1">
            <div class="flex justify-between mb-2">
              <span class="text-sm font-medium">Total mensual</span>
              <span class="text-sm font-semibold tabular-nums">{{
                formatEUR(props.monthlyExpenses || 0)
              }}</span>
            </div>
            <div class="h-2 bg-muted rounded-full overflow-hidden">
              <div class="h-full bg-slate-400" style="width: 100%" />
            </div>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <div class="flex justify-between mb-2">
              <span class="text-sm font-medium">Total anual</span>
              <span class="text-sm font-semibold tabular-nums">{{
                formatEUR(props.yearlyExpenses || 0)
              }}</span>
            </div>
            <div class="h-2 bg-muted rounded-full overflow-hidden">
              <div class="h-full bg-violet-500" style="width: 100%" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Comparativa objetivo vs real -->
    <div class="rounded-xl border bg-card p-4">
      <h3 class="text-sm font-semibold mb-3">Objetivo vs Real (mensual)</h3>
      <div class="space-y-4">
        <div v-for="d in compareData" :key="d.name">
          <div class="flex justify-between text-xs mb-1">
            <span class="font-medium">{{ d.name }}</span>
            <span class="tabular-nums text-muted-foreground">
              {{ formatEUR(d.real) }} / {{ formatEUR(d.objetivo) }}
            </span>
          </div>
          <div class="space-y-1">
            <div class="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                class="h-full rounded-full bg-slate-400"
                :style="{ width: `${(d.objetivo / compareMax) * 100}%` }"
              />
            </div>
            <div class="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                class="h-full rounded-full bg-emerald-500"
                :style="{ width: `${(d.real / compareMax) * 100}%` }"
              />
            </div>
          </div>
        </div>
        <div class="flex gap-4 text-xs text-muted-foreground">
          <span class="flex items-center gap-1.5"
            ><span class="h-2 w-2 rounded-full bg-slate-400" /> Objetivo</span
          >
          <span class="flex items-center gap-1.5"
            ><span class="h-2 w-2 rounded-full bg-emerald-500" /> Real</span
          >
        </div>
      </div>
    </div>

    <!-- Top categorías de gasto -->
    <div class="rounded-xl border bg-card p-4 md:col-span-2">
      <h3 class="text-sm font-semibold mb-3">
        Top 8 categorías de gasto (mensual)
      </h3>
      <p
        v-if="catData.length === 0"
        class="text-sm text-muted-foreground py-8 text-center"
      >
        Sin datos de gastos todavía.
      </p>
      <div v-else class="space-y-2">
        <div
          v-for="[name, value] in catData"
          :key="name"
          class="flex items-center gap-3"
        >
          <span class="w-32 shrink-0 truncate text-xs text-muted-foreground">{{
            name
          }}</span>
          <div class="h-4 flex-1 rounded bg-muted overflow-hidden">
            <div
              class="h-full rounded bg-violet-500"
              :style="{ width: `${catMax > 0 ? (value / catMax) * 100 : 0}%` }"
            />
          </div>
          <span class="w-20 shrink-0 text-right text-xs tabular-nums">{{
            formatEUR(value)
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
