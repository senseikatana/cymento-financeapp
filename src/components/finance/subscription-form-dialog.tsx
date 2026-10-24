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
import { Checkbox } from '@/components/ui/checkbox'
import { useCreateSubscription, useUpdateSubscription, type Subscription } from '@/lib/finance/hooks'
import { toast } from 'sonner'
import { formatDateInput } from '@/lib/finance/format'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing?: Subscription | null
}

const BILLING_CYCLES = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'anual', label: 'Anual' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
]

const BUCKETS = [
  { value: 'fijo', label: 'Fijos (50%)' },
  { value: 'extraordinario', label: 'Extraordinarios (30%)' },
  { value: 'ahorro', label: 'Ahorro (20%)' },
]

const CATS = ['streaming', 'musica', 'cloud', 'software', 'gaming', 'salud', 'otro']

const emptyForm = {
  name: '',
  provider: '',
  billingCycle: 'mensual',
  amount: '',
  startDate: formatDateInput(new Date()),
  renewalDate: '',
  active: true,
  bucket: 'extraordinario',
  category: 'suscripcion',
  notes: '',
  createExpense: true,
}

function SubscriptionForm({ editing, onDone }: { editing?: Subscription | null; onDone: () => void }) {
  const create = useCreateSubscription()
  const update = useUpdateSubscription()
  const [form, setForm] = useState(() =>
    editing
      ? {
          name: editing.name,
          provider: editing.provider || '',
          billingCycle: editing.billingCycle,
          amount: String(editing.amount),
          startDate: formatDateInput(editing.startDate),
          renewalDate: editing.renewalDate ? formatDateInput(editing.renewalDate) : '',
          active: editing.active,
          bucket: editing.bucket,
          category: editing.category,
          notes: editing.notes || '',
          createExpense: false,
        }
      : emptyForm
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.amount) {
      toast.error('Faltan campos obligatorios')
      return
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
      ...(editing ? {} : { createExpense: form.createExpense }),
    }
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...payload })
        toast.success('Suscripción actualizada')
      } else {
        await create.mutateAsync(payload)
        toast.success('Suscripción creada')
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
          <Label htmlFor="sub-name">Nombre *</Label>
          <Input
            id="sub-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Netflix, Spotify..."
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sub-provider">Proveedor</Label>
          <Input
            id="sub-provider"
            value={form.provider}
            onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
            placeholder="Netflix Inc."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="sub-cycle">Ciclo de facturación</Label>
          <Select value={form.billingCycle} onValueChange={(v) => setForm((f) => ({ ...f, billingCycle: v }))}>
            <SelectTrigger id="sub-cycle"><SelectValue /></SelectTrigger>
            <SelectContent>
              {BILLING_CYCLES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sub-amount">Importe € *</Label>
          <Input
            id="sub-amount"
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            placeholder="12.99"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="sub-start">Fecha de alta</Label>
          <Input
            id="sub-start"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sub-renewal">Próxima renovación</Label>
          <Input
            id="sub-renewal"
            type="date"
            value={form.renewalDate}
            onChange={(e) => setForm((f) => ({ ...f, renewalDate: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="sub-bucket">Bucket destino</Label>
          <Select value={form.bucket} onValueChange={(v) => setForm((f) => ({ ...f, bucket: v }))}>
            <SelectTrigger id="sub-bucket"><SelectValue /></SelectTrigger>
            <SelectContent>
              {BUCKETS.map((b) => (
                <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sub-cat">Categoría</Label>
          <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
            <SelectTrigger id="sub-cat"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATS.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="sub-active"
          checked={form.active}
          onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
        />
        <Label htmlFor="sub-active">Activa</Label>
      </div>

      {!editing && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="sub-create-exp"
            checked={form.createExpense}
            onCheckedChange={(v) => setForm((f) => ({ ...f, createExpense: Boolean(v) }))}
          />
          <Label htmlFor="sub-create-exp" className="text-sm">
            Crear gasto mensual/anual asociado automáticamente
          </Label>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="sub-notes">Notas</Label>
        <Textarea
          id="sub-notes"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Cuenta compartida, planes..."
          rows={2}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>Cancelar</Button>
        <Button type="submit" disabled={create.isPending || update.isPending}>
          {editing ? 'Guardar cambios' : 'Crear suscripción'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function SubscriptionFormDialog({ open, onOpenChange, editing }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar suscripción' : 'Nueva suscripción'}</DialogTitle>
          <DialogDescription>
            Gestiona tus suscripciones mensuales y anuales. Si marcas &quot;crear gasto&quot; se añade automáticamente al bucket seleccionado.
          </DialogDescription>
        </DialogHeader>
        <SubscriptionForm
          key={editing?.id || 'new'}
          editing={editing}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
