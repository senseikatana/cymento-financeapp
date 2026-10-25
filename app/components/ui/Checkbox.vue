<script setup lang="ts">
import { cn } from '@/utils/cn';

const props = withDefaults(
  defineProps<{
    id?: string;
    disabled?: boolean;
    class?: string;
    modelValue?: boolean;
  }>(),
  { modelValue: false }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

function onToggle() {
  if (!props.disabled) emit('update:modelValue', !props.modelValue);
}
</script>

<template>
  <button
    :id="id"
    type="button"
    role="checkbox"
    :aria-checked="modelValue"
    :disabled="disabled"
    :class="
      cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center',
        modelValue ? 'bg-primary text-primary-foreground' : 'bg-transparent',
        $props.class
      )
    "
    @click="onToggle"
  >
    <svg
      v-if="modelValue"
      class="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="3"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </button>
</template>
