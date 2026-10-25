<script setup lang="ts">
import { cn } from '@/utils/cn';

withDefaults(
  defineProps<{
    value?: number;
    max?: number;
    class?: string;
    style?: Record<string, string>;
  }>(),
  { value: 0, max: 100 }
);
</script>

<template>
  <div
    role="progressbar"
    :aria-valuenow="value"
    :aria-valuemax="max"
    :class="cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/20', $props.class)"
    :style="style"
  >
    <div
      class="h-full w-full flex-1 bg-primary transition-all"
      :style="{ width: `${Math.min(100, Math.max(0, value))}%` }"
    />
  </div>
</template>
