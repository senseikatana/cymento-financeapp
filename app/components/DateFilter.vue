<!-- DateFilter.vue -->
<template>
  <div class="flex flex-col sm:flex-row gap-2">
    <div class="flex items-center gap-2">
      <label class="text-sm font-medium">Mes actual</label>
      <Button variant="outline" @click="handleCurrentMonth">
        <CalendarIcon class="h-4 w-4 mr-1" />
        <span>Mes actual</span>
      </Button>
    </div>
    <div class="flex items-center gap-2">
      <label class="text-sm font-medium">Año actual</label>
      <Button variant="outline" @click="handleCurrentYear">
        <CalendarIcon class="h-4 w-4 mr-1" />
        <span>Año actual</span>
      </Button>
    </div>
    <div class="flex items-center gap-2">
      <label class="text-sm font-medium">Personalizado</label>
      <Button variant="outline" @click="showCustomRange = true">
        <CalendarRangeIcon class="h-4 w-4 mr-1" />
        <span>Personalizado</span>
      </Button>
    </div>
    <Teleport to="body">
      <div
        v-if="showCustomRange"
        class="fixed inset-0 z-50 bg-background rounded-lg p-4 shadow-lg border border-input max-w-md mx-auto mt-4"
      >
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-sm font-medium">Selecciona rango de fechas</h3>
          <Button variant="outline" @click="showCustomRange = false">
            <XIcon class="h-4 w-4" />
            Cancelar
          </Button>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <div class="flex items-center gap-2">
            <label class="text-xs font-medium">Fecha de inicio</label>
            <Input
              type="date"
              v-model="startDate"
              @change="updateCustomRange"
              class="flex-1"
            />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs font-medium">Fecha de fin</label>
            <Input
              type="date"
              v-model="endDate"
              @change="updateCustomRange"
              class="flex-1"
            />
          </div>
        </div>
        <Button @click="applyCustomRange" class="mt-3 w-full sm:w-auto"
          >Aplicar</Button
        >
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { CalendarIcon, CalendarRangeIcon, X } from "@lucide/vue";
import { Button, Input } from "~/components/ui";

const showCustomRange = ref(false);
const startDate = ref<Date | "">("");
const endDate = ref<Date | "">("");

const handleCurrentMonth = () => {
  const today = new Date();
  startDate.value = today.toISOString().split("T")[0];
  endDate.value = today.toISOString().split("T")[0];
  showCustomRange.value = false;
};

const handleCurrentYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  startDate.value = `${year}-01-01`;
  endDate.value = today.toISOString().split("T")[0];
  showCustomRange.value = false;
};

const updateCustomRange = () => {
  if (!startDate.value || !endDate.value) return;
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  if (start > end) {
    startDate.value = endDate.value;
  }
};

const applyCustomRange = () => {
  if (!startDate.value || !endDate.value) return;
  showCustomRange.value = false;
  emit("rangeSelected", { start: startDate.value, end: endDate.value });
};

defineEmits(["rangeSelected", "close"]);
</script>
