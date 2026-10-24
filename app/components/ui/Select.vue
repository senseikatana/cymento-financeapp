<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { cn } from "~/utils/cn";

interface SelectOption {
  value: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    options?: SelectOption[];
    placeholder?: string;
    id?: string;
    class?: string;
  }>(),
  { modelValue: "", options: () => [], placeholder: "Seleccionar…", class: "" },
);

const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);

const selectedLabel = computed(() => {
  const found = props.options.find((o) => o.value === props.modelValue);
  return found?.label || props.placeholder;
});

function select(value: string) {
  emit("update:modelValue", value);
  open.value = false;
}

function toggle() {
  open.value = !open.value;
}

function onDocumentClick(ev: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(ev.target as Node)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener("click", onDocumentClick));
onBeforeUnmount(() => document.removeEventListener("click", onDocumentClick));
</script>

<template>
  <div ref="rootRef" :class="cn('relative', props.class)">
    <button
      :id="id"
      type="button"
      class="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      @click="toggle"
    >
      <span>{{ selectedLabel }}</span>
      <svg
        class="h-4 w-4 opacity-50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M8 9l4-4 4 4m0 6l-4 4-4-4"
        />
      </svg>
    </button>

    <div
      v-show="open"
      class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
    >
      <div
        v-for="opt in options"
        :key="opt.value"
        role="option"
        :aria-selected="opt.value === modelValue"
        :class="
          cn(
            'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
            opt.value === modelValue && 'bg-accent text-accent-foreground',
          )
        "
        @click="select(opt.value)"
      >
        {{ opt.label }}
      </div>
    </div>
  </div>
</template>
