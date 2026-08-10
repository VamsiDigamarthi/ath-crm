import { useState } from 'react'
import type { ConfirmVariant } from '@/shared/components/AppConfirmDialog'

export function useConfirmDialogState() {
  const [activeVariant, setActiveVariant] = useState<ConfirmVariant | null>(null)
  const [title, setTitle]                 = useState('Are you absolutely sure?')
  const [description, setDescription]     = useState('This action cannot be undone and will permanently affect the record.')
  const [confirmLabel, setConfirmLabel]   = useState('Confirm')
  const [cancelLabel, setCancelLabel]     = useState('Cancel')
  const [isLoading, setIsLoading]         = useState(false)

  return {
    activeVariant, setActiveVariant,
    title, setTitle,
    description, setDescription,
    confirmLabel, setConfirmLabel,
    cancelLabel, setCancelLabel,
    isLoading, setIsLoading,
  }
}

export type ConfirmDialogState = ReturnType<typeof useConfirmDialogState>
