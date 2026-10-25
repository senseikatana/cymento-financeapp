<script setup lang="ts">
import type { Subscription } from '@/composables/useFinances';
import { Pencil, Plus, Trash2 } from '@lucide/vue';
import { ref } from 'vue';
import { useFinances } from '@/composables/useFinances';
import { useToast } from '@/composables/useToast';
import { BUCKET_SHORT, formatDate, formatEUR, FREQUENCY_LABELS, toMonthly } from '@/utils/format';

const props = defineProps<{
  items: Subscription[];
  onEdit?: (s: Subscription) => void;
  onAdd?: () => void;
}>();

const emit = defineEmits<{
  (e: 'edit', item: Subscription): void;
  (e: 'add'): void;
}>();

const { deleteSubscription } = useFinances();
const { toast } = useToast();

const toDelete = ref<Subscription | null>(null);

function daysUntil(renewalDate: string) {
  return Math.ceil((new Date(renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

async function confirm() {
  if (!toDelete.value) return;
  try {
    await deleteSubscription(toDelete.value.id);
    toast.success('Suscripción eliminada');
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || e?.message || 'Error al eliminar');
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
      Aún no hay suscripciones. Pulsa 'Añadir suscripción' para empezar.
    </div>
    <div v-else class="rounded-lg border overflow-hidden">
      <div class="max-h-[400px] overflow-y-auto">
        <div class="relative w-full overflow-auto">
          <table class="w-full caption-bottom text-sm">
            <thead class="[&_tr]:border-b">
              <tr class="sticky top-0 bg-muted/50 backdrop-blur z-10 border-b">
                <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                  Nombre
                </th>
                <th
                  class="h-10 px-2 text-left align-middle font-medium text-muted-foreground hidden md:table-cell"
                >
                  Ciclo
                </th>
                <th
                  class="h-10 px-2 text-right align-middle font-medium text-muted-foreground tabular-nums"
                >
                  Importe
                </th>
                <th
                  class="h-10 px-2 text-right align-middle font-medium text-muted-foreground tabular-nums hidden lg:table-cell"
                >
                  Mensual eq.
                </th>
                <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                  Próx. renovación
                </th>
                <th
                  class="h-10 px-2 text-left align-middle font-medium text-muted-foreground hidden md:table-cell"
                >
                  Bucket
                </th>
                <th
                  class="h-10 px-2 text-left align-middle font-medium text-muted-foreground hidden sm:table-cell"
                >
                  Estado
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
                  <div class="min-w-0 max-w-[10rem] sm:max-w-none">
                    <p class="font-medium truncate">
                      {{ row.name }}
                    </p>
                    <p v-if="row.provider" class="text-xs text-muted-foreground truncate">
                      {{ row.provider }}
                    </p>
                  </div>
                </td>
                <td class="p-2 align-middle hidden md:table-cell">
                  <span
                    class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold"
                  >
                    {{ FREQUENCY_LABELS[row.billingCycle] || row.billingCycle }}
                  </span>
                </td>
                <td class="p-2 align-middle text-right font-medium tabular-nums">
                  {{ formatEUR(row.amount) }}
                </td>
                <td class="p-2 align-middle text-right tabular-nums hidden lg:table-cell">
                  {{ formatEUR(toMonthly(row.amount, row.billingCycle)) }}
                </td>
                <td class="p-2 align-middle">
                  <template v-if="row.renewalDate">
                    <div class="text-xs">
                      <p>{{ formatDate(row.renewalDate) }}</p>
                      <p
                        :class="
                          daysUntil(row.renewalDate) < 0
                            ? 'text-rose-500'
                            : daysUntil(row.renewalDate) < 7
                              ? 'text-amber-500'
                              : 'text-muted-foreground'
                        "
                      >
                        {{
                          daysUntil(row.renewalDate) < 0
                            ? `hace ${Math.abs(daysUntil(row.renewalDate))}d`
                            : `en ${daysUntil(row.renewalDate)}d`
                        }}
                      </p>
                    </div>
                  </template>
                  <span v-else class="text-xs text-muted-foreground">—</span>
                </td>
                <td class="p-2 align-middle hidden md:table-cell">
                  <span
                    class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold"
                  >
                    {{ BUCKET_SHORT[row.bucket] || row.bucket }}
                  </span>
                </td>
                <td class="p-2 align-middle hidden sm:table-cell">
                  <span
                    class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold"
                    :class="
                      row.active
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-destructive text-destructive-foreground'
                    "
                  >
                    {{ row.active ? 'Activa' : 'Cancelada' }}
                  </span>
                </td>
                <td class="p-2 align-middle text-right">
                  <div class="flex justify-end gap-1">
                    <button
                      type="button"
                      class="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent hover:text-accent-foreground"
                      aria-label="Editar"
                      @click="props.onEdit ? props.onEdit(row) : emit('edit', row)"
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
      <Plus class="h-4 w-4" /> Añadir primera suscripción
    </button>

    <Teleport to="body">
      <div v-if="toDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="toDelete = null" />
        <div
          class="relative z-50 grid max-h-[90vh] w-full max-w-lg gap-4 overflow-y-auto rounded-lg border bg-background p-4 shadow-lg sm:p-6"
        >
          <div class="flex flex-col space-y-2">
            <h2 class="text-lg font-semibold">¿Eliminar suscripción?</h2>
            <p class="text-sm text-muted-foreground">
              Se eliminará "{{ toDelete.name }}". Los gastos ya generados se mantendrán pero sin
              vinculación.
            </p>
          </div>
          <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
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
