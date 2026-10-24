'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Plus } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteIncome, useDeleteExpense, useDeleteSubscription, type Income, type Expense, type Subscription } from '@/lib/finance/hooks'
import { formatEUR, formatDate, FREQUENCY_LABELS, INCOME_TYPE_LABELS, BUCKET_SHORT, toMonthly } from '@/lib/finance/format'
import { toast } from 'sonner'

type Item = Income | Expense | Subscription

type Column<T> = {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  className?: string
}

type Props<T extends { id: string }> = {
  items: T[]
  columns: Column<T>[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  emptyMessage?: string
}

function GenericTable<T extends { id: string }>({ items, columns, onEdit, onDelete, emptyMessage = 'Sin datos' }: Props<T>) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="max-h-[400px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur z-10">
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key} className={c.className}>{c.header}</TableHead>
              ))}
              {(onEdit || onDelete) && <TableHead className="text-right w-24">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((row) => (
              <TableRow key={row.id}>
                {columns.map((c) => (
                  <TableCell key={c.key} className={c.className}>{c.render(row)}</TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onEdit(row)}
                          aria-label="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-rose-600 hover:text-rose-700"
                          onClick={() => onDelete(row)}
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// ===== Tabla de ingresos =====
export function IncomesTable({ items, onEdit, onAdd }: { items: Income[]; onEdit: (i: Income) => void; onAdd: () => void }) {
  const [toDelete, setToDelete] = useState<Income | null>(null)
  const del = useDeleteIncome()
  const confirm = async () => {
    if (!toDelete) return
    try {
      await del.mutateAsync(toDelete.id)
      toast.success('Ingreso eliminado')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setToDelete(null)
    }
  }
  return (
    <>
      <GenericTable<Income>
        items={items}
        onEdit={onEdit}
        onDelete={setToDelete}
        emptyMessage="Aún no hay ingresos. Pulsa 'Añadir ingreso' para empezar."
        columns={[
          {
            key: 'source', header: 'Fuente',
            render: (r) => (
              <div className="min-w-0">
                <p className="font-medium truncate">{r.source}</p>
                {r.notes && <p className="text-xs text-muted-foreground truncate">{r.notes}</p>}
              </div>
            ),
          },
          {
            key: 'type', header: 'Tipo',
            render: (r) => <Badge variant="outline">{INCOME_TYPE_LABELS[r.type] || r.type}</Badge>,
          },
          {
            key: 'frequency', header: 'Frec.',
            render: (r) => <span className="text-xs">{FREQUENCY_LABELS[r.frequency] || r.frequency}</span>,
          },
          {
            key: 'monthly', header: 'Mensual',
            render: (r) => <span className="tabular-nums">{formatEUR(toMonthly(r.amount, r.frequency))}</span>,
            className: 'text-right tabular-nums',
          },
          {
            key: 'amount', header: 'Importe',
            render: (r) => <span className="font-medium tabular-nums">{formatEUR(r.amount)}</span>,
            className: 'text-right tabular-nums',
          },
          {
            key: 'date', header: 'Fecha',
            render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.date)}</span>,
          },
          {
            key: 'active', header: 'Estado',
            render: (r) => (
              <Badge variant={r.active ? 'secondary' : 'destructive'} className="text-xs">
                {r.active ? 'Activo' : 'Inactivo'}
              </Badge>
            ),
          },
        ]}
      />
      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar ingreso?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{toDelete?.source}&quot; de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirm}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {items.length === 0 && (
        <Button onClick={onAdd} className="mt-3 w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" /> Añadir primer ingreso
        </Button>
      )}
    </>
  )
}

// ===== Tabla de gastos =====
export function ExpensesTable({ items, onEdit, onAdd }: { items: Expense[]; onEdit: (e: Expense) => void; onAdd: () => void }) {
  const [toDelete, setToDelete] = useState<Expense | null>(null)
  const del = useDeleteExpense()
  const confirm = async () => {
    if (!toDelete) return
    try {
      await del.mutateAsync(toDelete.id)
      toast.success('Gasto eliminado')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setToDelete(null)
    }
  }
  return (
    <>
      <GenericTable<Expense>
        items={items}
        onEdit={onEdit}
        onDelete={setToDelete}
        emptyMessage="Aún no hay gastos. Pulsa 'Añadir gasto' para empezar."
        columns={[
          {
            key: 'description', header: 'Descripción',
            render: (r) => (
              <div className="min-w-0">
                <p className="font-medium truncate">{r.description}</p>
                {r.notes && <p className="text-xs text-muted-foreground truncate">{r.notes}</p>}
                {r.subscription && (
                  <p className="text-xs text-violet-600 dark:text-violet-400">↳ suscripción: {r.subscription.name}</p>
                )}
              </div>
            ),
          },
          {
            key: 'bucket', header: 'Bucket',
            render: (r) => (
              <Badge variant="outline" className="text-xs">
                {BUCKET_SHORT[r.bucket] || r.bucket}
              </Badge>
            ),
          },
          {
            key: 'category', header: 'Categoría',
            render: (r) => <span className="text-xs">{r.category}</span>,
          },
          {
            key: 'frequency', header: 'Frec.',
            render: (r) => <span className="text-xs">{FREQUENCY_LABELS[r.frequency] || r.frequency}</span>,
          },
          {
            key: 'monthly', header: 'Mensual',
            render: (r) => <span className="tabular-nums">{formatEUR(toMonthly(r.amount, r.frequency))}</span>,
            className: 'text-right tabular-nums',
          },
          {
            key: 'amount', header: 'Importe',
            render: (r) => <span className="font-medium tabular-nums">{formatEUR(r.amount)}</span>,
            className: 'text-right tabular-nums',
          },
          {
            key: 'date', header: 'Fecha',
            render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.date)}</span>,
          },
        ]}
      />
      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar gasto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{toDelete?.description}&quot; de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirm}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {items.length === 0 && (
        <Button onClick={onAdd} className="mt-3 w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" /> Añadir primer gasto
        </Button>
      )}
    </>
  )
}

// ===== Tabla de suscripciones =====
export function SubscriptionsTable({ items, onEdit, onAdd }: { items: Subscription[]; onEdit: (s: Subscription) => void; onAdd: () => void }) {
  const [toDelete, setToDelete] = useState<Subscription | null>(null)
  const del = useDeleteSubscription()
  const confirm = async () => {
    if (!toDelete) return
    try {
      await del.mutateAsync(toDelete.id)
      toast.success('Suscripción eliminada')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setToDelete(null)
    }
  }
  return (
    <>
      <GenericTable<Subscription>
        items={items}
        onEdit={onEdit}
        onDelete={setToDelete}
        emptyMessage="Aún no hay suscripciones. Pulsa 'Añadir suscripción' para empezar."
        columns={[
          {
            key: 'name', header: 'Nombre',
            render: (r) => (
              <div className="min-w-0">
                <p className="font-medium truncate">{r.name}</p>
                {r.provider && <p className="text-xs text-muted-foreground truncate">{r.provider}</p>}
              </div>
            ),
          },
          {
            key: 'billingCycle', header: 'Ciclo',
            render: (r) => <Badge variant="outline" className="text-xs">{FREQUENCY_LABELS[r.billingCycle] || r.billingCycle}</Badge>,
          },
          {
            key: 'amount', header: 'Importe',
            render: (r) => <span className="font-medium tabular-nums">{formatEUR(r.amount)}</span>,
            className: 'text-right tabular-nums',
          },
          {
            key: 'monthly', header: 'Mensual eq.',
            render: (r) => <span className="tabular-nums">{formatEUR(toMonthly(r.amount, r.billingCycle))}</span>,
            className: 'text-right tabular-nums',
          },
          {
            key: 'renewal', header: 'Próx. renovación',
            render: (r) => {
              if (!r.renewalDate) return <span className="text-xs text-muted-foreground">—</span>
              const days = Math.ceil((new Date(r.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <div className="text-xs">
                  <p>{formatDate(r.renewalDate)}</p>
                  <p className={days < 0 ? 'text-rose-500' : days < 7 ? 'text-amber-500' : 'text-muted-foreground'}>
                    {days < 0 ? `hace ${Math.abs(days)}d` : `en ${days}d`}
                  </p>
                </div>
              )
            },
          },
          {
            key: 'bucket', header: 'Bucket',
            render: (r) => <Badge variant="outline" className="text-xs">{BUCKET_SHORT[r.bucket] || r.bucket}</Badge>,
          },
          {
            key: 'active', header: 'Estado',
            render: (r) => (
              <Badge variant={r.active ? 'secondary' : 'destructive'} className="text-xs">
                {r.active ? 'Activa' : 'Cancelada'}
              </Badge>
            ),
          },
        ]}
      />
      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar suscripción?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{toDelete?.name}&quot;. Los gastos ya generados se mantendrán pero sin vinculación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirm}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {items.length === 0 && (
        <Button onClick={onAdd} className="mt-3 w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" /> Añadir primera suscripción
        </Button>
      )}
    </>
  )
}
