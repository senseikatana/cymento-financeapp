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
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    :class="
      cn(
        'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        modelValue ? 'bg-primary' : 'bg-input',
        $props.class
      )
    "
    @click="onToggle"
  >
    <span
      :class="
        cn(
          'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform',
          modelValue ? 'translate-x-4' : 'translate-x-0'
        )
      "
    />
  </button>
</template>
