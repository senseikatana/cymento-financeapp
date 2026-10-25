<script setup lang="ts">
import { Calendar, CalendarRange, X } from '@lucide/vue';
import { ref } from 'vue';

// Button/Input están auto-importados por Nuxt (components.pathPrefix: false)
const emit = defineEmits<{ rangeSelected: [range: { start: string; end: string } | null] }>();

const showCustomRange = ref(false);
const startDate = ref('');
const endDate = ref('');

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function currentMonth() {
  const now = new Date();
  startDate.value = toISO(new Date(now.getFullYear(), now.getMonth(), 1));
  endDate.value = toISO(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  emit('rangeSelected', { start: startDate.value, end: endDate.value });
}

function currentYear() {
  const now = new Date();
  startDate.value = `${now.getFullYear()}-01-01`;
  endDate.value = toISO(now);
  emit('rangeSelected', { start: startDate.value, end: endDate.value });
}

function clearRange() {
  emit('rangeSelected', null);
}

function applyCustomRange() {
  if (!startDate.value || !endDate.value) return;
  const range =
    startDate.value <= endDate.value
      ? { start: startDate.value, end: endDate.value }
      : { start: endDate.value, end: startDate.value };
  showCustomRange.value = false;
  emit('rangeSelected', range);
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Button variant="outline" @click="currentMonth">
      <Calendar class="h-4 w-4" />
      Mes actual
    </Button>
    <Button variant="outline" @click="currentYear">
      <Calendar class="h-4 w-4" />
      Año actual
    </Button>
    <Button variant="outline" @click="showCustomRange = true">
      <CalendarRange class="h-4 w-4" />
      Personalizado
    </Button>
    <Button variant="ghost" @click="clearRange">
      <X class="h-4 w-4" />
      Limpiar
    </Button>

    <Teleport to="body">
      <div
        v-if="showCustomRange"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showCustomRange = false"
      >
        <div class="w-full max-w-md rounded-lg border bg-popover p-4 shadow-lg">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold">Selecciona un rango de fechas</h3>
            <Button variant="ghost" size="sm" @click="showCustomRange = false">
              <X class="h-4 w-4" />
            </Button>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1 space-y-1">
              <label for="range-start" class="text-xs font-medium">Inicio</label>
              <Input id="range-start" v-model="startDate" type="date" class="w-full" />
            </div>
            <div class="flex-1 space-y-1">
              <label for="range-end" class="text-xs font-medium">Fin</label>
              <Input id="range-end" v-model="endDate" type="date" class="w-full" />
            </div>
          </div>
          <Button class="mt-4 w-full" :disabled="!startDate || !endDate" @click="applyCustomRange">
            Aplicar
          </Button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
