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
import { useCreateExpense, useUpdateExpense, type Expense } from '@/lib/finance/hooks'
import { toast } from 'sonner'
import { FREQUENCY_LABELS, formatDateInput } from '@/lib/finance/format'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing?: Expense | null
  defaultBucket?: string
}

const BUCKETS = [
  { value: 'fijo', label: 'Fijos (50%)' },
  { value: 'extraordinario', label: 'Extraordinarios (30%)' },
  { value: 'ahorro', label: 'Ahorro (20%)' },
]

const CATEGORIES = [
  'vivienda', 'comida', 'transporte', 'comunicaciones', 'salud',
  'ocio', 'suscripcion', 'fondo_estabilidad', 'educacion', 'ropa',
  'regalos', 'imprevistos', 'general',
]

function emptyForm(bucket: string = 'fijo') {
  return {
    bucket,
    category: 'general',
    description: '',
    amount: '',
    frequency: 'mensual',
    date: formatDateInput(new Date()),
    notes: '',
  }
}

function ExpenseForm({
  editing, defaultBucket = 'fijo', onDone,
}: {
  editing?: Expense | null
  defaultBucket?: string
  onDone: () => void
}) {
  const create = useCreateExpense()
  const update = useUpdateExpense()
  const [form, setForm] = useState(() =>
    editing
      ? {
          bucket: editing.bucket,
          category: editing.category,
          description: editing.description,
          amount: String(editing.amount),
          frequency: editing.frequency,
          date: formatDateInput(editing.date),
          notes: editing.notes || '',
        }
      : emptyForm(defaultBucket)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description || !form.amount) {
      toast.error('Faltan campos obligatorios')
      return
    }
    const payload = {
      bucket: form.bucket,
      category: form.category,
      description: form.description,
      amount: Number(form.amount),
      frequency: form.frequency,
      date: form.date,
      notes: form.notes || undefined,
    }
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...payload })
        toast.success('Gasto actualizado')
      } else {
        await create.mutateAsync(payload)
        toast.success('Gasto creado')
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
          <Label htmlFor="exp-bucket">Bucket</Label>
          <Select value={form.bucket} onValueChange={(v) => setForm((f) => ({ ...f, bucket: v }))}>
            <SelectTrigger id="exp-bucket"><SelectValue /></SelectTrigger>
            <SelectContent>
              {BUCKETS.map((b) => (
                <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="exp-freq">Frecuencia</Label>
          <Select value={form.frequency} onValueChange={(v) => setForm((f) => ({ ...f, frequency: v }))}>
            <SelectTrigger id="exp-freq"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(FREQUENCY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="exp-desc">Descripción *</Label>
        <Input
          id="exp-desc"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Ej: Alquiler octubre"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="exp-amount">Importe € *</Label>
          <Input
            id="exp-amount"
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            placeholder="350.00"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="exp-date">Fecha</Label>
          <Input
            id="exp-date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="exp-cat">Categoría</Label>
        <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
          <SelectTrigger id="exp-cat"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="exp-notes">Notas</Label>
        <Textarea
          id="exp-notes"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Detalle, justificante, etc."
          rows={2}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>Cancelar</Button>
        <Button type="submit" disabled={create.isPending || update.isPending}>
          {editing ? 'Guardar cambios' : 'Crear gasto'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function ExpenseFormDialog({ open, onOpenChange, editing, defaultBucket = 'fijo' }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar gasto' : 'Nuevo gasto'}</DialogTitle>
          <DialogDescription>
            Clasifica el gasto en uno de los tres buckets de la regla 50/30/20.
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm
          key={editing?.id || `new-${defaultBucket}`}
          editing={editing}
          defaultBucket={defaultBucket}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
