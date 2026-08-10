import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Info, Trash2, CheckCircle2, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from './Button'

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success'

export interface AppConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  isLoading?: boolean
}

type VariantConfig = {
  Icon: typeof Trash2
  iconBg: string
  iconColor: string
  btnVariant: 'primary' | 'danger'
  bgColor?: string
}

const VARIANTS: Record<ConfirmVariant, VariantConfig> = {
  danger: {
    Icon: Trash2,
    iconBg: 'bg-rose-50 border border-rose-100',
    iconColor: 'text-rose-500',
    btnVariant: 'danger',
  },
  warning: {
    Icon: AlertTriangle,
    iconBg: 'bg-amber-50 border border-amber-100',
    iconColor: 'text-amber-500',
    btnVariant: 'primary',
    bgColor: '#f59e0b',
  },
  info: {
    Icon: Info,
    iconBg: 'bg-indigo-50 border border-indigo-100',
    iconColor: 'text-indigo-500',
    btnVariant: 'primary',
  },
  success: {
    Icon: CheckCircle2,
    iconBg: 'bg-emerald-50 border border-emerald-100',
    iconColor: 'text-emerald-500',
    btnVariant: 'primary',
    bgColor: '#059669',
  },
}

export function AppConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'info',
  isLoading    = false,
}: AppConfirmDialogProps) {

  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose()
    },
    [onClose, isLoading]
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleEsc)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = prev
    }
  }, [isOpen, handleEsc])

  const handleConfirm = async () => {
    try {
      await onConfirm()
      onClose()
    } catch {
      // error handling is the consumer's responsibility
    }
  }

  if (!isOpen) return null

  const cfg    = VARIANTS[variant]
  const IconEl = cfg.Icon

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="alertdialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isLoading ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-[400px] bg-white rounded-2xl shadow-2xl p-6">

        {/* Close button */}
        <button
          type="button"
          onClick={isLoading ? undefined : onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-0 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon + text */}
        <div className="flex flex-col items-center text-center">
          <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mb-4', cfg.iconBg)}>
            <IconEl className={cn('w-5 h-5', cfg.iconColor)} />
          </div>
          <h2
            id="confirm-dialog-title"
            className="text-[17px] font-bold text-gray-900 leading-tight mb-2"
          >
            {title}
          </h2>
          <p
            id="confirm-dialog-desc"
            className="text-sm text-gray-500 leading-relaxed"
          >
            {description}
          </p>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex gap-2.5">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            disabled={isLoading}
            onClick={isLoading ? undefined : onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={cfg.btnVariant}
            size="md"
            fullWidth
            loading={isLoading}
            bgColor={cfg.bgColor}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>

      </div>
    </div>,
    document.body
  )
}
