<script setup lang="ts">
import { cn } from "~/utils/cn";

defineProps<{ class?: string }>();
</script>

<template>
  <thead :class="cn('[&_tr]:border-b', $props.class)">
    <slot />
  </thead>
</template>
