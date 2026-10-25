<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue';
import { useTheme } from '@/composables/useTheme';

const { toggleTheme } = useTheme();
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground relative"
    aria-label="Cambiar tema"
    title="Cambiar tema claro/oscuro"
    @click="toggleTheme"
  >
    <Sun class="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    <Moon class="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
  </button>
</template>
