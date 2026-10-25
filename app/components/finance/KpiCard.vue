<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/utils/cn';

type Accent = 'green' | 'amber' | 'violet' | 'red' | 'slate';

const props = withDefaults(
  defineProps<{
    title: string;
    value: string;
    subtitle?: string;
    icon?: any;
    accent?: Accent;
    progress?: number;
  }>(),
  { accent: 'slate' }
);

const accentMap: Record<Accent, { ring: string; icon: string; bar: string }> = {
  green: {
    ring: 'ring-emerald-500/30',
    icon: 'text-emerald-600 dark:text-emerald-400',
    bar: 'bg-emerald-500',
  },
  amber: {
    ring: 'ring-amber-500/30',
    icon: 'text-amber-600 dark:text-amber-400',
    bar: 'bg-amber-500',
  },
  violet: {
    ring: 'ring-violet-500/30',
    icon: 'text-violet-600 dark:text-violet-400',
    bar: 'bg-violet-500',
  },
  red: {
    ring: 'ring-rose-500/30',
    icon: 'text-rose-600 dark:text-rose-400',
    bar: 'bg-rose-500',
  },
  slate: {
    ring: 'ring-slate-500/30',
    icon: 'text-slate-600 dark:text-slate-400',
    bar: 'bg-slate-500',
  },
};

const a = computed(() => accentMap[props.accent]);
const progressWidth = computed(() => Math.max(0, Math.min(100, props.progress ?? 0)));
</script>

<template>
  <div
    :class="
      cn(
        'relative min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm ring-1',
        a.ring
      )
    "
  >
    <div class="p-4 sm:p-5">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p
            class="text-xs font-medium uppercase leading-tight tracking-wide text-muted-foreground"
          >
            {{ title }}
          </p>
          <p
            class="mt-1 break-words text-lg font-bold tabular-nums min-[380px]:text-xl sm:text-2xl"
          >
            {{ value }}
          </p>
          <p v-if="subtitle" class="mt-1 text-xs text-muted-foreground">
            {{ subtitle }}
          </p>
        </div>
        <div v-if="icon" :class="cn('rounded-lg bg-muted/50 p-2 shrink-0', a.icon)">
          <component :is="icon" class="h-5 w-5" />
        </div>
      </div>
      <div
        v-if="typeof progress === 'number'"
        class="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden"
      >
        <div :class="cn('h-full transition-all', a.bar)" :style="{ width: `${progressWidth}%` }" />
      </div>
    </div>
  </div>
</template>
