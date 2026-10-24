<script setup lang="ts">
import { ref } from "vue";
import { Pencil, Trash2, Plus } from "@lucide/vue";
import { useFinances, type Expense } from "~/composables/useFinances";
import { useToast } from "~/composables/useToast";
import {
  formatEUR,
  formatDate,
  FREQUENCY_LABELS,
  BUCKET_SHORT,
  toMonthly,
} from "~/utils/format";

const props = defineProps<{
  items: Expense[];
  onEdit?: (e: Expense) => void;
  onAdd?: () => void;
}>();

const emit = defineEmits<{
  (e: "edit", item: Expense): void;
  (e: "add"): void;
}>();

const { deleteExpense } = useFinances();
const { toast } = useToast();

const toDelete = ref<Expense | null>(null);

async function confirm() {
  if (!toDelete.value) return;
  try {
    await deleteExpense(toDelete.value.id);
    toast.success("Gasto eliminado");
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || e?.message || "Error al eliminar");
  } finally {
    toDelete.value = null;
  }
}
</script>

<template>
  <div>
    <div
      v-if="items.length === 0"
      class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground"
    >
      Aún no hay gastos. Pulsa 'Añadir gasto' para empezar.
    </div>
    <div v-else class="rounded-lg border overflow-hidden">
      <div class="max-h-[400px] overflow-y-auto">
        <div class="relative w-full overflow-auto">
          <table class="w-full caption-bottom text-sm">
            <thead class="[&_tr]:border-b">
              <tr class="sticky top-0 bg-muted/50 backdrop-blur z-10 border-b">
                <th
                  class="h-10 px-2 text-left align-middle font-medium text-muted-foreground"
                >
                  Descripción
                </th>
                <th
                  class="h-10 px-2 text-left align-middle font-medium text-muted-foreground"
                >
                  Bucket
                </th>
                <th
                  class="h-10 px-2 text-left align-middle font-medium text-muted-foreground"
                >
                  Categoría
                </th>
                <th
                  class="h-10 px-2 text-left align-middle font-medium text-muted-foreground"
                >
                  Frec.
                </th>
                <th
                  class="h-10 px-2 text-right align-middle font-medium text-muted-foreground tabular-nums"
                >
                  Mensual
                </th>
                <th
                  class="h-10 px-2 text-right align-middle font-medium text-muted-foreground tabular-nums"
                >
                  Importe
                </th>
                <th
                  class="h-10 px-2 text-left align-middle font-medium text-muted-foreground"
                >
                  Fecha
                </th>
                <th
                  class="h-10 px-2 text-right align-middle font-medium text-muted-foreground w-24"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="[&_tr:last-child]:border-0">
              <tr v-for="row in items" :key="row.id" class="border-b">
                <td class="p-2 align-middle">
                  <div class="min-w-0">
                    <p class="font-medium truncate">{{ row.description }}</p>
                    <p
                      v-if="row.notes"
                      class="text-xs text-muted-foreground truncate"
                    >
                      {{ row.notes }}
                    </p>
                    <p
                      v-if="row.subscription"
                      class="text-xs text-violet-600 dark:text-violet-400"
                    >
                      ↳ suscripción: {{ row.subscription.name }}
                    </p>
                  </div>
                </td>
                <td class="p-2 align-middle">
                  <span
                    class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold"
                  >
                    {{ BUCKET_SHORT[row.bucket] || row.bucket }}
                  </span>
                </td>
                <td class="p-2 align-middle">
                  <span class="text-xs">{{ row.category }}</span>
                </td>
                <td class="p-2 align-middle">
                  <span class="text-xs">{{
                    FREQUENCY_LABELS[row.frequency] || row.frequency
                  }}</span>
                </td>
                <td class="p-2 align-middle text-right tabular-nums">
                  {{ formatEUR(toMonthly(row.amount, row.frequency)) }}
                </td>
                <td
                  class="p-2 align-middle text-right font-medium tabular-nums"
                >
                  {{ formatEUR(row.amount) }}
                </td>
                <td class="p-2 align-middle">
                  <span class="text-xs text-muted-foreground">{{
                    formatDate(row.date)
                  }}</span>
                </td>
                <td class="p-2 align-middle text-right">
                  <div class="flex justify-end gap-1">
                    <button
                      type="button"
                      class="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent hover:text-accent-foreground"
                      aria-label="Editar"
                      @click="
                        props.onEdit ? props.onEdit(row) : emit('edit', row)
                      "
                    >
                      <Pencil class="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center h-7 w-7 rounded-md text-rose-600 hover:text-rose-700 hover:bg-accent"
                      aria-label="Eliminar"
                      @click="toDelete = row"
                    >
                      <Trash2 class="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <button
      v-if="items.length === 0"
      type="button"
      class="mt-3 w-full inline-flex items-center justify-center gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs"
      @click="props.onAdd ? props.onAdd() : emit('add')"
    >
      <Plus class="h-4 w-4" /> Añadir primer gasto
    </button>

    <Teleport to="body">
      <div
        v-if="toDelete"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div class="fixed inset-0 bg-black/50" @click="toDelete = null" />
        <div
          class="relative z-50 w-full max-w-lg grid gap-4 border bg-background p-6 shadow-lg rounded-lg"
        >
          <div class="flex flex-col space-y-2">
            <h2 class="text-lg font-semibold">¿Eliminar gasto?</h2>
            <p class="text-sm text-muted-foreground">
              Se eliminará "{{ toDelete.description }}" de forma permanente.
            </p>
          </div>
          <div
            class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
          >
            <button
              type="button"
              class="inline-flex items-center justify-center border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 rounded-md text-sm font-medium"
              @click="toDelete = null"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 py-2 rounded-md text-sm font-medium"
              @click="confirm"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
