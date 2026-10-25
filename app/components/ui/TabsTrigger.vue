<script setup lang="ts">
import { computed, inject } from 'vue';
import { TABS_CONTEXT_KEY } from '@/composables/useTabs';
import { cn } from '@/utils/cn';

const props = defineProps<{
  value: string;
  class?: string;
  disabled?: boolean;
}>();

const ctx = inject(TABS_CONTEXT_KEY, null);

const isActive = computed(() => ctx?.activeTab.value === props.value);

function onClick() {
  if (!props.disabled && ctx) ctx.setTab(props.value);
}
</script>

<template>
  <button
    type="button"
    role="tab"
    :aria-selected="isActive"
    :disabled="disabled"
    :class="
      cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        isActive ? 'bg-background text-foreground shadow' : 'hover:text-foreground',
        $props.class
      )
    "
    @click="onClick"
  >
    <slot />
  </button>
</template>
