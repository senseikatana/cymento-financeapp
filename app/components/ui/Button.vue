<script setup lang="ts">
import { computed } from "vue";
import { cn } from "~/utils/cn";

type Variant =
  "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type Size = "default" | "sm" | "lg" | "icon";

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    size?: Size;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    class?: string;
  }>(),
  {
    variant: "default",
    size: "default",
    type: "button",
    disabled: false,
  },
);

const emit = defineEmits<{ (e: "click", ev: MouseEvent): void }>();

const variantClasses: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline:
    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeClasses: Record<Size, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 rounded-md px-8",
  icon: "h-9 w-9",
};

const classes = computed(() =>
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    variantClasses[props.variant],
    sizeClasses[props.size],
    props.class,
  ),
);

function onClick(ev: MouseEvent) {
  if (!props.disabled) emit("click", ev);
}
</script>

<template>
  <button :type="type" :disabled="disabled" :class="classes" @click="onClick">
    <slot />
  </button>
</template>
