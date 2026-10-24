<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { useFinances, type Subscription } from "~/composables/useFinances";
import { useToast } from "~/composables/useToast";
import { formatDateInput } from "~/utils/format";

const props = defineProps<{
  modelValue: boolean;
  editing?: Subscription | null;
}>();

const emit = defineEmits<{ (e: "update:modelValue", value: boolean): void }>();

const { createSubscription, updateSubscription } = useFinances();
const { toast } = useToast();

const BILLING_CYCLES = [
  { value: "mensual", label: "Mensual" },
  { value: "anual", label: "Anual" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
];

const BUCKETS = [
  { value: "fijo", label: "Fijos (50%)" },
  { value: "extraordinario", label: "Extraordinarios (30%)" },
  { value: "ahorro", label: "Ahorro (20%)" },
];

const CATS = [
  "streaming",
  "musica",
  "cloud",
  "software",
  "gaming",
  "salud",
  "otro",
];
const catOptions = CATS.map((c) => ({ value: c, label: c }));

const form = reactive({
  name: "",
  provider: "",
  billingCycle: "mensual",
  amount: "",
  startDate: formatDateInput(new Date()),
  renewalDate: "",
  active: true,
  bucket: "extraordinario",
  category: "suscripcion",
  notes: "",
  createExpense: true,
});

watch(
  () => [props.modelValue, props.editing?.id],
  () => {
    if (!props.modelValue) return;
    const e = props.editing;
    form.name = e?.name ?? "";
    form.provider = e?.provider ?? "";
    form.billingCycle = e?.billingCycle ?? "mensual";
    form.amount = e ? String(e.amount) : "";
    form.startDate = e
      ? formatDateInput(e.startDate)
      : formatDateInput(new Date());
    form.renewalDate = e?.renewalDate ? formatDateInput(e.renewalDate) : "";
    form.active = e?.active ?? true;
    form.bucket = e?.bucket ?? "extraordinario";
    form.category = e?.category ?? "suscripcion";
    form.notes = e?.notes ?? "";
    form.createExpense = false;
  },
  { immediate: true },
);

const isEditing = computed(() => !!props.editing);

async function handleSubmit() {
  if (!form.name || !form.amount) {
    toast.error("Faltan campos obligatorios");
    return;
  }
  const payload = {
    name: form.name,
    provider: form.provider || undefined,
    billingCycle: form.billingCycle,
    amount: Number(form.amount),
    startDate: form.startDate,
    renewalDate: form.renewalDate || undefined,
    active: form.active,
    bucket: form.bucket,
    category: form.category,
    notes: form.notes || undefined,
    ...(props.editing ? {} : { createExpense: form.createExpense }),
  };
  try {
    if (props.editing) {
      await updateSubscription({ id: props.editing.id, ...payload });
      toast.success("Suscripción actualizada");
    } else {
      await createSubscription(payload);
      toast.success("Suscripción creada");
    }
    emit("update:modelValue", false);
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || err?.message || "Error al guardar");
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        class="fixed inset-0 bg-black/50"
        @click="emit('update:modelValue', false)"
      />
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
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div class="flex flex-col space-y-1.5">
          <h2 class="text-lg font-semibold">
            {{ isEditing ? "Editar suscripción" : "Nueva suscripción" }}
          </h2>
          <p class="text-sm text-muted-foreground">
            Gestiona tus suscripciones mensuales y anuales. Si marcas "crear
            gasto" se añade automáticamente al bucket seleccionado.
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label for="sub-name" class="text-sm font-medium">Nombre *</label>
              <Input
                id="sub-name"
                v-model="form.name"
                placeholder="Netflix, Spotify..."
                required
              />
            </div>
            <div class="space-y-1.5">
              <label for="sub-provider" class="text-sm font-medium"
                >Proveedor</label
              >
              <Input
                id="sub-provider"
                v-model="form.provider"
                placeholder="Netflix Inc."
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label for="sub-cycle" class="text-sm font-medium"
                >Ciclo de facturación</label
              >
              <Select
                v-model="form.billingCycle"
                :options="BILLING_CYCLES"
                id="sub-cycle"
              />
            </div>
            <div class="space-y-1.5">
              <label for="sub-amount" class="text-sm font-medium"
                >Importe € *</label
              >
              <Input
                id="sub-amount"
                v-model="form.amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="12.99"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label for="sub-start" class="text-sm font-medium"
                >Fecha de alta</label
              >
              <Input id="sub-start" v-model="form.startDate" type="date" />
            </div>
            <div class="space-y-1.5">
              <label for="sub-renewal" class="text-sm font-medium"
                >Próxima renovación</label
              >
              <Input id="sub-renewal" v-model="form.renewalDate" type="date" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label for="sub-bucket" class="text-sm font-medium"
                >Bucket destino</label
              >
              <Select
                v-model="form.bucket"
                :options="BUCKETS"
                id="sub-bucket"
              />
            </div>
            <div class="space-y-1.5">
              <label for="sub-cat" class="text-sm font-medium">Categoría</label>
              <Select
                v-model="form.category"
                :options="catOptions"
                id="sub-cat"
              />
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Switch v-model="form.active" id="sub-active" />
            <label for="sub-active" class="text-sm font-medium">Activa</label>
          </div>

          <div v-if="!isEditing" class="flex items-center gap-2">
            <Checkbox v-model="form.createExpense" id="sub-create-exp" />
            <label for="sub-create-exp" class="text-sm"
              >Crear gasto mensual/anual asociado automáticamente</label
            >
          </div>

          <div class="space-y-1.5">
            <label for="sub-notes" class="text-sm font-medium">Notas</label>
            <Textarea
              id="sub-notes"
              v-model="form.notes"
              placeholder="Cuenta compartida, planes..."
              :rows="2"
            />
          </div>

          <div
            class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
          >
            <Button
              variant="outline"
              type="button"
              @click="emit('update:modelValue', false)"
              >Cancelar</Button
            >
            <Button type="submit">{{
              isEditing ? "Guardar cambios" : "Crear suscripción"
            }}</Button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
