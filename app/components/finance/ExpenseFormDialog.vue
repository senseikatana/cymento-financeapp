<script setup lang="ts">
import type { Expense } from '@/composables/useFinances';
import { computed, reactive, watch } from 'vue';
import { useFinances } from '@/composables/useFinances';
import { useToast } from '@/composables/useToast';
import { formatDateInput, FREQUENCY_LABELS } from '@/utils/format';

const props = defineProps<{
  modelValue: boolean;
  editing?: Expense | null;
  defaultBucket?: string;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const { createExpense, updateExpense } = useFinances();
const { toast } = useToast();

const BUCKETS = [
  { value: 'fijo', label: 'Fijos (50%)' },
  { value: 'extraordinario', label: 'Extraordinarios (30%)' },
  { value: 'ahorro', label: 'Ahorro (20%)' },
];

const CATEGORIES = [
  'vivienda',
  'comida',
  'transporte',
  'comunicaciones',
  'salud',
  'ocio',
  'suscripcion',
  'fondo_estabilidad',
  'educacion',
  'ropa',
  'regalos',
  'imprevistos',
  'general',
];

const freqOptions = Object.entries(FREQUENCY_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const catOptions = CATEGORIES.map((c) => ({ value: c, label: c }));

const form = reactive({
  bucket: 'fijo',
  category: 'general',
  description: '',
  amount: '',
  frequency: 'mensual',
  date: formatDateInput(new Date()),
  notes: '',
});

watch(
  () => [props.modelValue, props.editing?.id, props.defaultBucket],
  () => {
    if (!props.modelValue) return;
    const e = props.editing;
    form.bucket = e?.bucket ?? props.defaultBucket ?? 'fijo';
    form.category = e?.category ?? 'general';
    form.description = e?.description ?? '';
    form.amount = e ? String(e.amount) : '';
    form.frequency = e?.frequency ?? 'mensual';
    form.date = e ? formatDateInput(e.date) : formatDateInput(new Date());
    form.notes = e?.notes ?? '';
  },
  { immediate: true }
);

const isEditing = computed(() => !!props.editing);

async function handleSubmit() {
  if (!form.description || !form.amount) {
    toast.error('Faltan campos obligatorios');
    return;
  }
  const payload = {
    bucket: form.bucket,
    category: form.category,
    description: form.description,
    amount: Number(form.amount),
    frequency: form.frequency,
    date: form.date,
    notes: form.notes || undefined,
  };
  try {
    if (props.editing) {
      await updateExpense({ id: props.editing.id, ...payload });
      toast.success('Gasto actualizado');
    } else {
      await createExpense(payload);
      toast.success('Gasto creado');
    }
    emit('update:modelValue', false);
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || err?.message || 'Error al guardar');
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="emit('update:modelValue', false)" />
      <div
        class="relative z-50 grid max-h-[90vh] w-full max-w-lg gap-4 overflow-y-auto rounded-lg border bg-background p-4 shadow-lg sm:max-w-lg sm:p-6"
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
            {{ isEditing ? 'Editar gasto' : 'Nuevo gasto' }}
          </h2>
          <p class="text-sm text-muted-foreground">
            Clasifica el gasto en uno de los tres buckets de la regla 50/30/20.
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label for="exp-bucket" class="text-sm font-medium">Bucket</label>
              <Select id="exp-bucket" v-model="form.bucket" :options="BUCKETS" />
            </div>
            <div class="space-y-1.5">
              <label for="exp-freq" class="text-sm font-medium">Frecuencia</label>
              <Select id="exp-freq" v-model="form.frequency" :options="freqOptions" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label for="exp-desc" class="text-sm font-medium">Descripción *</label>
            <Input
              id="exp-desc"
              v-model="form.description"
              placeholder="Ej: Alquiler octubre"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label for="exp-amount" class="text-sm font-medium">Importe € *</label>
              <Input
                id="exp-amount"
                v-model="form.amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="350.00"
                required
              />
            </div>
            <div class="space-y-1.5">
              <label for="exp-date" class="text-sm font-medium">Fecha</label>
              <Input id="exp-date" v-model="form.date" type="date" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label for="exp-cat" class="text-sm font-medium">Categoría</label>
            <Select id="exp-cat" v-model="form.category" :options="catOptions" />
          </div>

          <div class="space-y-1.5">
            <label for="exp-notes" class="text-sm font-medium">Notas</label>
            <Textarea
              id="exp-notes"
              v-model="form.notes"
              placeholder="Detalle, justificante, etc."
              :rows="2"
            />
          </div>

          <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button variant="outline" type="button" @click="emit('update:modelValue', false)">
              Cancelar
            </Button>
            <Button type="submit">
              {{ isEditing ? 'Guardar cambios' : 'Crear gasto' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
