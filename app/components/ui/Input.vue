<script setup lang="ts">
import { cn } from "~/utils/cn";

withDefaults(
  defineProps<{
    id?: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    min?: string;
    max?: string;
    step?: string;
    disabled?: boolean;
    class?: string;
    modelValue?: string | number;
  }>(),
  { type: "text" },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

function onInput(ev: Event) {
  emit("update:modelValue", (ev.target as HTMLInputElement).value);
}
</script>

<template>
  <input
    :id="id"
    :type="type"
    :placeholder="placeholder"
    :required="required"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :value="modelValue"
    :class="
      cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        $props.class,
      )
    "
    @input="onInput"
  />
</template>
