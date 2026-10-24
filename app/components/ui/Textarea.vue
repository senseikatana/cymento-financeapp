<script setup lang="ts">
import { cn } from "~/utils/cn";

withDefaults(
  defineProps<{
    id?: string;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    class?: string;
    modelValue?: string;
  }>(),
  { rows: 3 },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

function onInput(ev: Event) {
  emit("update:modelValue", (ev.target as HTMLTextAreaElement).value);
}
</script>

<template>
  <textarea
    :id="id"
    :placeholder="placeholder"
    :rows="rows"
    :disabled="disabled"
    :value="modelValue"
    :class="
      cn(
        'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        $props.class,
      )
    "
    @input="onInput"
  />
</template>
