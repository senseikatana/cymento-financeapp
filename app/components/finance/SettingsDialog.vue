<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { Loader2 } from "@lucide/vue";
import { useFinances } from "~/composables/useFinances";
import { useToast } from "~/composables/useToast";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: "update:modelValue", value: boolean): void }>();

const { settings, loadingSettings, updateSettings } = useFinances();
const { toast } = useToast();

const RULE_BASES = [
  { value: "total", label: "Total ingresos mensuales" },
  { value: "salario", label: "Solo salario" },
  { value: "custom", label: "Personalizado (próximamente)" },
];

const form = reactive({
  pctFixed: 50,
  pctExtra: 30,
  pctSavings: 20,
  ruleBase: "total",
});

watch(
  () => [props.modelValue, settings.value],
  () => {
    if (!props.modelValue) return;
    form.pctFixed = settings.value?.pctFixed ?? 50;
    form.pctExtra = settings.value?.pctExtra ?? 30;
    form.pctSavings = settings.value?.pctSavings ?? 20;
    form.ruleBase = settings.value?.ruleBase ?? "total";
  },
  { immediate: true },
);

const total = computed(() => form.pctFixed + form.pctExtra + form.pctSavings);
const isValid = computed(() => Math.abs(total.value - 100) < 0.01);

async function handleSubmit() {
  if (!isValid.value) {
    toast.error(
      `Los porcentajes deben sumar 100 (ahora suman ${total.value.toFixed(2)})`,
    );
    return;
  }
  try {
    await updateSettings({ ...form });
    toast.success("Ajustes guardados");
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
          <h2 class="text-lg font-semibold">Ajustes de la regla financiera</h2>
          <p class="text-sm text-muted-foreground">
            Configura los porcentajes de la regla 50/30/20 y sobre qué base se
            calculan.
          </p>
        </div>

        <div
          v-if="loadingSettings"
          class="flex items-center justify-center py-8"
        >
          <Loader2 class="h-5 w-5 animate-spin" />
        </div>

        <form v-else class="space-y-4" @submit.prevent="handleSubmit">
          <div
            class="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300"
          >
            Total actual:
            <strong
              :class="
                isValid
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              "
            >
              {{ total.toFixed(2) }}%
            </strong>
            {{ isValid ? "✓" : "(debe sumar 100%)" }}
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="space-y-1.5">
              <label for="set-fixed" class="text-sm font-medium">Fijos %</label>
              <Input
                id="set-fixed"
                v-model.number="form.pctFixed"
                type="number"
                step="0.1"
                min="0"
                max="100"
              />
            </div>
            <div class="space-y-1.5">
              <label for="set-extra" class="text-sm font-medium"
                >Extras %</label
              >
              <Input
                id="set-extra"
                v-model.number="form.pctExtra"
                type="number"
                step="0.1"
                min="0"
                max="100"
              />
            </div>
            <div class="space-y-1.5">
              <label for="set-sav" class="text-sm font-medium">Ahorro %</label>
              <Input
                id="set-sav"
                v-model.number="form.pctSavings"
                type="number"
                step="0.1"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <label for="set-base" class="text-sm font-medium"
              >Aplicar regla sobre</label
            >
            <Select
              v-model="form.ruleBase"
              :options="RULE_BASES"
              id="set-base"
            />
            <p class="text-xs text-muted-foreground">
              Si seleccionas "solo salario", los objetivos se calculan
              únicamente sobre tu nómina.
            </p>
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
            <Button type="submit" :disabled="!isValid">Guardar</Button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
