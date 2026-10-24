'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Upload, Loader2, FileSpreadsheet, Database, RefreshCw } from 'lucide-react'
import { useExportExcel, useImportExcel, useSeed } from '@/lib/finance/hooks'
import { toast } from 'sonner'

export function SyncToolbar() {
  const fileRef = useRef<HTMLInputElement>(null)
  const exportX = useExportExcel()
  const importX = useImportExcel()
  const seed = useSeed()
  const [showConfirmSeed, setShowConfirmSeed] = useState(false)

  const handleExport = async () => {
    try {
      await exportX.mutateAsync()
      toast.success('Excel exportado correctamente')
    } catch (e: any) {
      toast.error(e.message || 'Error al exportar')
    }
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const result = await importX.mutateAsync(f)
      toast.success(
        `Importado: ${result.imported.incomes} ingresos, ${result.imported.expenses} gastos, ${result.imported.subscriptions} suscripciones`
      )
    } catch (err: any) {
      toast.error(err.message || 'Error al importar')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleSeed = async () => {
    try {
      await seed.mutateAsync()
      toast.success('Datos de ejemplo cargados')
      setShowConfirmSeed(false)
    } catch (e: any) {
      toast.error(e.message || 'Error al cargar datos')
      setShowConfirmSeed(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={exportX.isPending}
      >
        {exportX.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
        Exportar Excel
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => fileRef.current?.click()}
        disabled={importX.isPending}
      >
        {importX.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
        Importar Excel
      </Button>

      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFile}
      />

      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirmSeed((v) => !v)}
          disabled={seed.isPending}
        >
          {seed.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
          Cargar ejemplo
        </Button>
        {showConfirmSeed && (
          <div className="absolute right-0 top-full mt-1 z-30 w-72 rounded-lg border bg-popover p-3 shadow-lg">
            <p className="text-xs text-muted-foreground mb-2">
              Esto <strong className="text-rose-600">borrará todos tus datos actuales</strong> y cargará el caso del usuario (SMI 1.221 €, 14 pagas, suscripciones comunes).
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => setShowConfirmSeed(false)}>Cancelar</Button>
              <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleSeed}>Confirmar</Button>
            </div>
          </div>
        )}
      </div>

      <div className="ml-auto hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
        <FileSpreadsheet className="h-3.5 w-3.5" />
        Compatible con OnlyOffice / LibreOffice / Google Sheets
      </div>
    </div>
  )
}
