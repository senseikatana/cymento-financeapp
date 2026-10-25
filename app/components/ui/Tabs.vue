<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import { TABS_CONTEXT_KEY } from '@/composables/useTabs';
import { cn } from '@/utils/cn';

const props = withDefaults(
  defineProps<{ modelValue?: string; defaultValue?: string; class?: string }>(),
  { modelValue: '', defaultValue: '', class: '' }
);

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const activeTab = ref(props.modelValue || props.defaultValue);

const setTab = (value: string) => {
  activeTab.value = value;
  emit('update:modelValue', value);
};

provide(TABS_CONTEXT_KEY, { activeTab, setTab });

const classes = computed(() => cn('w-full', props.class));
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
