<script setup lang="ts">
import { CheckCircle2, Info, XCircle } from '@lucide/vue';
import { useToast } from '@/composables/useToast';

const { toasts, dismiss } = useToast();

function variantClasses(variant: string) {
  switch (variant) {
    case 'success':
      return 'border-emerald-500/40';
    case 'error':
      return 'border-rose-500/40';
    default:
      return 'border-border';
  }
}

function iconFor(variant: string) {
  switch (variant) {
    case 'success':
      return CheckCircle2;
    case 'error':
      return XCircle;
    default:
      return Info;
  }
}
</script>

<template>
  <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto flex items-start gap-3 rounded-lg border bg-background p-3 shadow-lg"
        :class="variantClasses(t.variant)"
      >
        <component
          :is="iconFor(t.variant)"
          class="h-5 w-5 shrink-0 mt-0.5"
          :class="
            t.variant === 'success'
              ? 'text-emerald-500'
              : t.variant === 'error'
                ? 'text-rose-500'
                : 'text-muted-foreground'
          "
        />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium">
            {{ t.title }}
          </p>
          <p v-if="t.description" class="text-xs text-muted-foreground mt-0.5">
            {{ t.description }}
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-sm opacity-50 hover:opacity-100"
          aria-label="Cerrar"
          @click="dismiss(t.id)"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
