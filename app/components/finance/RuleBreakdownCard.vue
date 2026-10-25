<script setup lang="ts">
import type { Summary } from '@/composables/useFinances';
import { Home, PiggyBank, Sparkles } from '@lucide/vue';
import { computed } from 'vue';
import { BUCKET_COLORS, BUCKET_LABELS, formatEUR } from '@/utils/format';

const props = defineProps<{ summary: Summary }>();

const items = computed(() => {
  const { buckets } = props.summary;
  return [
    {
      key: 'fijo',
      label: BUCKET_LABELS.fijo,
      icon: Home,
      target: buckets.targets.fixed,
      real: buckets.monthly.fijo || 0,
      pct: buckets.pct.fixed,
      color: BUCKET_COLORS.fijo,
      hint: 'Vivienda, comida, transporte, suministros, salud.',
    },
    {
      key: 'extraordinario',
      label: BUCKET_LABELS.extraordinario,
      icon: Sparkles,
      target: buckets.targets.extra,
      real: buckets.monthly.extraordinario || 0,
      pct: buckets.pct.extra,
      color: BUCKET_COLORS.extraordinario,
      hint: 'Ocio, suscripciones, restaurantes, caprichos.',
    },
    {
      key: 'ahorro',
      label: BUCKET_LABELS.ahorro,
      icon: PiggyBank,
      target: buckets.targets.savings,
      real: buckets.monthly.ahorro || 0,
      pct: buckets.pct.savings,
      color: BUCKET_COLORS.ahorro,
      hint: 'Fondo de estabilidad → cuenta remunerada.',
    },
  ];
});

function baseLabel(base: string) {
  if (base === 'salario') return 'el salario';
  if (base === 'total') return 'el total de ingresos';
  return 'base personalizada';
}
</script>

<template>
  <div class="rounded-xl border bg-card text-card-foreground shadow-sm">
    <div class="flex flex-col space-y-1.5 p-6">
      <h3 class="font-semibold leading-none tracking-tight text-base">
        Regla {{ summary.buckets.pct.fixed }}/{{ summary.buckets.pct.extra }}/{{
          summary.buckets.pct.savings
        }}
      </h3>
      <p class="text-sm text-muted-foreground">
        Objetivos calculados sobre
        <strong class="text-foreground">{{ baseLabel(summary.buckets.base) }}</strong>
        ({{ formatEUR(summary.buckets.baseAmount) }}/mes).
      </p>
    </div>
    <div class="p-6 pt-0 space-y-4">
      <div v-for="it in items" :key="it.key" class="space-y-1.5">
        <div class="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 items-center gap-2">
            <div
              class="rounded-md p-1.5"
              :style="{ backgroundColor: `${it.color}20`, color: it.color }"
            >
              <component :is="it.icon" class="h-4 w-4" />
            </div>
            <div class="min-w-0">
              <p class="font-medium">
                {{ it.label }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ it.hint }}
              </p>
            </div>
          </div>
          <div class="shrink-0 tabular-nums sm:text-right">
            <p class="font-semibold">{{ formatEUR(it.real) }}/mes</p>
            <p class="text-xs text-muted-foreground">objetivo {{ formatEUR(it.target) }}</p>
          </div>
        </div>

        <div
          class="relative h-2 w-full overflow-hidden rounded-full bg-primary/20"
          :style="{ '--bar-color': it.color }"
        >
          <div
            class="h-full w-full flex-1 transition-all"
            :style="{
              width: `${Math.min(100, it.target > 0 ? (it.real / it.target) * 100 : 0)}%`,
              backgroundColor: it.color,
            }"
          />
        </div>

        <div class="flex items-center justify-between text-xs">
          <span
            :class="
              it.real > it.target
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            "
          >
            {{
              it.real > it.target
                ? `+${formatEUR(Math.abs(it.real - it.target))} sobre objetivo`
                : `${formatEUR(Math.abs(it.real - it.target))} de margen`
            }}
          </span>
          <span class="text-muted-foreground">
            {{ Math.round(it.target > 0 ? (it.real / it.target) * 100 : 0) }}% del objetivo
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
