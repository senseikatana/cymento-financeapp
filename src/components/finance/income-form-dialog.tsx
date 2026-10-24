'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useCreateIncome, useUpdateIncome, type Income } from '@/lib/finance/hooks'
import { toast } from 'sonner'
import { INCOME_TYPE_LABELS, FREQUENCY_LABELS, formatDateInput } from '@/lib/finance/format'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing?: Income | null
}

const emptyForm = {
  type: 'salario',
  source: '',
  amount: '',
  frequency: 'mensual',
  date: formatDateInput(new Date()),
  active: true,
  notes: '',
  category: '',
}

function IncomeForm({ editing, onDone }: { editing?: Income | null; onDone: () => void }) {
  const create = useCreateIncome()
  const update = useUpdateIncome()
  const [form, setForm] = useState(() =>
    editing
      ? {
          type: editing.type,
          source: editing.source,
          amount: String(editing.amount),
          frequency: editing.frequency,
          date: formatDateInput(editing.date),
          active: editing.active,
          notes: editing.notes || '',
          category: editing.category || '',
        }
      : emptyForm
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.source || !form.amount) {
      toast.error('Faltan campos obligatorios')
      return
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
    }
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...payload })
        toast.success('Ingreso actualizado')
      } else {
        await create.mutateAsync(payload)
        toast.success('Ingreso creado')
      }
      onDone()
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="inc-type">Tipo</Label>
          <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
            <SelectTrigger id="inc-type"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(INCOME_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inc-freq">Frecuencia</Label>
          <Select value={form.frequency} onValueChange={(v) => setForm((f) => ({ ...f, frequency: v }))}>
            <SelectTrigger id="inc-freq"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(FREQUENCY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inc-source">Fuente / descripción *</Label>
        <Input
          id="inc-source"
          value={form.source}
          onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
          placeholder="Ej: Nómina octubre 2026"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="inc-amount">Importe € *</Label>
          <Input
            id="inc-amount"
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            placeholder="1141.63"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inc-date">Fecha</Label>
          <Input
            id="inc-date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inc-category">Categoría</Label>
        <Input
          id="inc-category"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          placeholder="trabajo, extra, ahorro..."
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="inc-active"
          checked={form.active}
          onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
        />
        <Label htmlFor="inc-active">Activo (cuenta en los totales mensuales)</Label>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inc-notes">Notas</Label>
        <Textarea
          id="inc-notes"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Anotaciones, deducciones, contexto..."
          rows={2}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>Cancelar</Button>
        <Button type="submit" disabled={create.isPending || update.isPending}>
          {editing ? 'Guardar cambios' : 'Crear ingreso'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function IncomeFormDialog({ open, onOpenChange, editing }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar ingreso' : 'Nuevo ingreso'}</DialogTitle>
          <DialogDescription>
            Registra ingresos recurrentes (nómina, subsidio) o puntuales (paga extra, ahorros previos).
          </DialogDescription>
        </DialogHeader>
        {/* key forces remount when switching between editing targets, so form state resets cleanly */}
        <IncomeForm
          key={editing?.id || 'new'}
          editing={editing}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
