'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type Income = {
  id: string
  type: string
  source: string
  amount: number
  frequency: string
  date: string
  active: boolean
  notes: string | null
  category: string | null
}

export type Expense = {
  id: string
  bucket: string
  category: string
  description: string
  amount: number
  frequency: string
  date: string
  notes: string | null
  subscriptionId: string | null
  subscription?: Subscription | null
}

export type Subscription = {
  id: string
  name: string
  provider: string | null
  billingCycle: string
  amount: number
  startDate: string
  renewalDate: string | null
  active: boolean
  bucket: string
  category: string
  notes: string | null
  expenses?: Expense[]
}

export type Settings = {
  id: string
  pctFixed: number
  pctExtra: number
  pctSavings: number
  ruleBase: string
  currency: string
  locale: string
}

export type Summary = {
  totals: {
    incomeMonthly: number
    incomeUnique: number
    incomeYearly: number
    expensesMonthly: number
    balanceMonthly: number
    subsMonthly: number
    subsYearly: number
  }
  buckets: {
    monthly: Record<string, number>
    unique: Record<string, number>
    targets: { fixed: number; extra: number; savings: number }
    pct: { fixed: number; extra: number; savings: number }
    base: string
    baseAmount: number
  }
  byCategory: Record<string, number>
  subscriptions: {
    count: number
    monthly: number
    yearly: number
    upcomingRenewals: Array<{
      id: string
      name: string
      amount: number
      billingCycle: string
      renewalDate: string
      daysUntil: number
    }>
  }
  counts: {
    incomes: number
    expenses: number
    subscriptions: number
  }
}

// ---------- Incomes ----------
export function useIncomes() {
  return useQuery({
    queryKey: ['incomes'],
    queryFn: async () => {
      const res = await fetch('/api/incomes')
      const data = await res.json()
      return data.items as Income[]
    },
  })
}

export function useCreateIncome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Partial<Income>) => {
      const res = await fetch('/api/incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data.item as Income
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useUpdateIncome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Income> & { id: string }) => {
      const res = await fetch(`/api/incomes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data.item as Income
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useDeleteIncome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/incomes/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

// ---------- Expenses ----------
export function useExpenses(bucket?: string) {
  return useQuery({
    queryKey: ['expenses', bucket],
    queryFn: async () => {
      const url = bucket ? `/api/expenses?bucket=${bucket}` : '/api/expenses'
      const res = await fetch(url)
      const data = await res.json()
      return data.items as Expense[]
    },
  })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Partial<Expense>) => {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data.item as Expense
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useUpdateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Expense> & { id: string }) => {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data.item as Expense
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

// ---------- Subscriptions ----------
export function useSubscriptions() {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions')
      const data = await res.json()
      return data.items as Subscription[]
    },
  })
}

export function useCreateSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Partial<Subscription> & { createExpense?: boolean }) => {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data.item as Subscription
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useUpdateSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Subscription> & { id: string }) => {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data.item as Subscription
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useDeleteSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

// ---------- Settings ----------
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings')
      const data = await res.json()
      return data.settings as Settings
    },
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Partial<Settings>) => {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data.settings as Settings
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

// ---------- Summary ----------
export function useSummary() {
  return useQuery({
    queryKey: ['summary'],
    queryFn: async () => {
      const res = await fetch('/api/summary')
      const data = await res.json()
      return data as Summary
    },
    refetchOnWindowFocus: false,
  })
}

// ---------- Sync ----------
export function useExportExcel() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/sync')
      if (!res.ok) throw new Error('Error al exportar')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `finanzas_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })
}

export function useImportExcel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/sync', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data as { ok: boolean; imported: { incomes: number; expenses: number; subscriptions: number } }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes'] })
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
      qc.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

export function useSeed() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes'] })
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
      qc.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}
