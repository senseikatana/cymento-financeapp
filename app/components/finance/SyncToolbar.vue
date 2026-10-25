<script setup lang="ts">
import { Database, Download, FileSpreadsheet, Loader2, Upload } from '@lucide/vue';
import { ref } from 'vue';
import { useFinances } from '@/composables/useFinances';
import { useToast } from '@/composables/useToast';

const { exportExcel, importExcel, seed } = useFinances();
const { toast } = useToast();

const fileRef = ref<HTMLInputElement | null>(null);
const showConfirmSeed = ref(false);
const exporting = ref(false);
const importing = ref(false);
const seeding = ref(false);

async function handleExport() {
  exporting.value = true;
  try {
    await exportExcel();
    toast.success('Excel exportado correctamente');
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || e?.message || 'Error al exportar');
  } finally {
    exporting.value = false;
  }
}

async function handleFile(ev: Event) {
  const f = (ev.target as HTMLInputElement).files?.[0];
  if (!f) return;
  importing.value = true;
  try {
    const result = await importExcel(f);
    toast.success(
      `Importado: ${result.imported.incomes} ingresos, ${result.imported.expenses} gastos, ${result.imported.subscriptions} suscripciones`
    );
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || err?.message || 'Error al importar');
  } finally {
    importing.value = false;
    if (fileRef.value) fileRef.value.value = '';
  }
}

async function handleSeed() {
  seeding.value = true;
  try {
    await seed();
    toast.success('Datos de ejemplo cargados');
    showConfirmSeed.value = false;
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || e?.message || 'Error al cargar datos');
    showConfirmSeed.value = false;
  } finally {
    seeding.value = false;
  }
}
</script>

<template>
  <div class="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
    <button
      type="button"
      class="inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-xs hover:bg-accent hover:text-accent-foreground sm:w-auto"
      :disabled="exporting"
      @click="handleExport"
    >
      <Loader2 v-if="exporting" class="h-4 w-4 animate-spin" />
      <Download v-else class="h-4 w-4" />
      Exportar Excel
    </button>

    <button
      type="button"
      class="inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-xs hover:bg-accent hover:text-accent-foreground sm:w-auto"
      :disabled="importing"
      @click="fileRef?.click()"
    >
      <Loader2 v-if="importing" class="h-4 w-4 animate-spin" />
      <Upload v-else class="h-4 w-4" />
      Importar Excel
    </button>

    <input ref="fileRef" type="file" accept=".xlsx,.xls" class="hidden" @change="handleFile" />

    <div class="relative w-full sm:w-auto">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs w-full sm:w-auto"
        :disabled="seeding"
        @click="showConfirmSeed = !showConfirmSeed"
      >
        <Loader2 v-if="seeding" class="h-4 w-4 animate-spin" />
        <Database v-else class="h-4 w-4" />
        Cargar ejemplo
      </button>
      <div
        v-if="showConfirmSeed"
        class="absolute right-0 top-full mt-2 z-30 w-full max-w-xs rounded-lg border bg-popover p-3 shadow-lg"
      >
        <p class="text-xs text-muted-foreground mb-2">
          Esto
          <strong class="text-rose-600">borrará todos tus datos actuales</strong>
          y cargará el caso del usuario.
        </p>
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 h-7 text-xs inline-flex items-center justify-center border border-input bg-background hover:bg-accent rounded-md"
            @click="showConfirmSeed = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="flex-1 h-7 text-xs inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
            @click="handleSeed"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>

    <div class="ml-auto hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
      <FileSpreadsheet class="h-3.5 w-3.5" />
      Compatible con OnlyOffice / LibreOffice / Google Sheets
    </div>
  </div>
</template>
