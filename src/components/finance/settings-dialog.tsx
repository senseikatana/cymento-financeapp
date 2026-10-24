'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useSettings, useUpdateSettings } from '@/lib/finance/hooks'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
}

const DEFAULT_FORM = {
  pctFixed: 50,
  pctExtra: 30,
  pctSavings: 20,
  ruleBase: 'total',
}

function SettingsForm({ onDone }: { onDone: () => void }) {
  const { data: settings } = useSettings()
  const update = useUpdateSettings()
  const [form, setForm] = useState(() => ({
    pctFixed: settings?.pctFixed ?? DEFAULT_FORM.pctFixed,
    pctExtra: settings?.pctExtra ?? DEFAULT_FORM.pctExtra,
    pctSavings: settings?.pctSavings ?? DEFAULT_FORM.pctSavings,
    ruleBase: settings?.ruleBase ?? DEFAULT_FORM.ruleBase,
  }))

  const total = form.pctFixed + form.pctExtra + form.pctSavings
  const isValid = Math.abs(total - 100) < 0.01

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) {
      toast.error(`Los porcentajes deben sumar 100 (ahora suman ${total.toFixed(2)})`)
      return
    }
    try {
      await update.mutateAsync(form)
      toast.success('Ajustes guardados')
      onDone()
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
        Total actual: <strong className={isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
          {total.toFixed(2)}%
        </strong> {isValid ? '✓' : '(debe sumar 100%)'}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="set-fixed">Fijos %</Label>
          <Input
            id="set-fixed"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={form.pctFixed}
            onChange={(e) => setForm((f) => ({ ...f, pctFixed: Number(e.target.value) }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="set-extra">Extras %</Label>
          <Input
            id="set-extra"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={form.pctExtra}
            onChange={(e) => setForm((f) => ({ ...f, pctExtra: Number(e.target.value) }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="set-sav">Ahorro %</Label>
          <Input
            id="set-sav"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={form.pctSavings}
            onChange={(e) => setForm((f) => ({ ...f, pctSavings: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="set-base">Aplicar regla sobre</Label>
        <Select value={form.ruleBase} onValueChange={(v) => setForm((f) => ({ ...f, ruleBase: v }))}>
          <SelectTrigger id="set-base"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="total">Total ingresos mensuales</SelectItem>
            <SelectItem value="salario">Solo salario</SelectItem>
            <SelectItem value="custom">Personalizado (próximamente)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Si seleccionas &quot;solo salario&quot;, los objetivos se calculan únicamente sobre tu nómina.
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>Cancelar</Button>
        <Button type="submit" disabled={update.isPending || !isValid}>Guardar</Button>
      </DialogFooter>
    </form>
  )
}

export function SettingsDialog({ open, onOpenChange }: Props) {
  const { isLoading } = useSettings()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajustes de la regla financiera</DialogTitle>
          <DialogDescription>
            Configura los porcentajes de la regla 50/30/20 y sobre qué base se calculan.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <SettingsForm key={open ? 'open' : 'closed'} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}
