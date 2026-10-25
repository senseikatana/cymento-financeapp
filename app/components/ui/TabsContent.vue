<script setup lang="ts">
import { computed, inject } from 'vue';
import { TABS_CONTEXT_KEY } from '@/composables/useTabs';
import { cn } from '@/utils/cn';

const props = defineProps<{ value: string; class?: string }>();

const ctx = inject(TABS_CONTEXT_KEY, null);

const isActive = computed(() => ctx?.activeTab.value === props.value);
</script>

<template>
  <div
    v-show="isActive"
    role="tabpanel"
    :class="
      cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        $props.class
      )
    "
  >
    <slot />
  </div>
</template>
