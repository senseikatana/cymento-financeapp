<script setup lang="ts">
import type { Income } from '@/composables/useFinances';
import { reactive, ref, watch } from 'vue';
import { useFinances } from '@/composables/useFinances';
import { useToast } from '@/composables/useToast';
import { formatDateInput, FREQUENCY_LABELS, INCOME_TYPE_LABELS } from '@/utils/format';

const props = defineProps<{
  modelValue: boolean;
  editing?: Income | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const { createIncome, updateIncome } = useFinances();
const { toast } = useToast();

const typeOptions = Object.entries(INCOME_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const freqOptions = Object.entries(FREQUENCY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const form = reactive({
  type: 'salario',
  source: '',
  amount: '',
  frequency: 'mensual',
  date: formatDateInput(new Date()),
  active: true,
  notes: '',
  category: '',
});

const saving = ref(false);

watch(
  () => [props.modelValue, props.editing?.id],
  () => {
    if (!props.modelValue) return;
    const e = props.editing;
    form.type = e?.type ?? 'salario';
    form.source = e?.source ?? '';
    form.amount = e ? String(e.amount) : '';
    form.frequency = e?.frequency ?? 'mensual';
    form.date = e ? formatDateInput(e.date) : formatDateInput(new Date());
    form.active = e?.active ?? true;
    form.notes = e?.notes ?? '';
    form.category = e?.category ?? '';
  },
  { immediate: true }
);

const isEditing = computed(() => !!props.editing);

async function handleSubmit() {
  if (!form.source || !form.amount) {
    toast.error('Faltan campos obligatorios');
    return;
  }
  const payload = {
    type: form.type,
    source: form.source,
    amount: Number(form.amount),
    frequency: form.frequency,
    date: form.date,
    active: form.active,
    notes: form.notes || undefined,
    category: form.category || undefined,
  };
  saving.value = true;
  try {
    if (props.editing) {
      await updateIncome({ id: props.editing.id, ...payload });
      toast.success('Ingreso actualizado');
    } else {
      await createIncome(payload);
      toast.success('Ingreso creado');
    }
    emit('update:modelValue', false);
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || err?.message || 'Error al guardar');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black/50" @click="emit('update:modelValue', false)" />
      <div
        class="relative z-50 w-full max-w-lg grid gap-4 border bg-background p-6 shadow-lg rounded-lg sm:max-w-lg"
      >
        <button
          type="button"
          aria-label="Cerrar"
          class="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          @click="emit('update:modelValue', false)"
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

        <div class="flex flex-col space-y-1.5">
          <h2 class="text-lg font-semibold">
            {{ isEditing ? 'Editar ingreso' : 'Nuevo ingreso' }}
          </h2>
          <p class="text-sm text-muted-foreground">
            Registra ingresos recurrentes (nómina, subsidio) o puntuales (paga extra, ahorros
            previos).
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label for="inc-type" class="text-sm font-medium">Tipo</label>
              <Select id="inc-type" v-model="form.type" :options="typeOptions" />
            </div>
            <div class="space-y-1.5">
              <label for="inc-freq" class="text-sm font-medium">Frecuencia</label>
              <Select id="inc-freq" v-model="form.frequency" :options="freqOptions" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label for="inc-source" class="text-sm font-medium">Fuente / descripción *</label>
            <Input
              id="inc-source"
              v-model="form.source"
              placeholder="Ej: Nómina octubre 2026"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label for="inc-amount" class="text-sm font-medium">Importe € *</label>
              <Input
                id="inc-amount"
                v-model="form.amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="1141.63"
                required
              />
            </div>
            <div class="space-y-1.5">
              <label for="inc-date" class="text-sm font-medium">Fecha</label>
              <Input id="inc-date" v-model="form.date" type="date" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label for="inc-category" class="text-sm font-medium">Categoría</label>
            <Input
              id="inc-category"
              v-model="form.category"
              placeholder="trabajo, extra, ahorro..."
            />
          </div>

          <div class="flex items-center gap-2">
            <Switch id="inc-active" v-model="form.active" />
            <label for="inc-active" class="text-sm font-medium"
              >Activo (cuenta en los totales mensuales)</label
            >
          </div>

          <div class="space-y-1.5">
            <label for="inc-notes" class="text-sm font-medium">Notas</label>
            <Textarea
              id="inc-notes"
              v-model="form.notes"
              placeholder="Anotaciones, deducciones, contexto..."
              :rows="2"
            />
          </div>

          <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button variant="outline" type="button" @click="emit('update:modelValue', false)">
              Cancelar
            </Button>
            <Button type="submit" :disabled="saving">
              {{ isEditing ? 'Guardar cambios' : 'Crear ingreso' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
