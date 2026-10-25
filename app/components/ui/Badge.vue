<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/utils/cn';

type Variant = 'default' | 'secondary' | 'destructive' | 'outline';

const props = withDefaults(defineProps<{ variant?: Variant; class?: string }>(), {
  variant: 'default',
});

const variantClasses: Record<Variant, string> = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-destructive text-destructive-foreground',
  outline: 'text-foreground',
};

const classes = computed(() =>
  cn(
    'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    variantClasses[props.variant],
    props.class
  )
);
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
