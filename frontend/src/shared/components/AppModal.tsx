import { useEffect, useCallback, type ReactNode, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AppModalProps {
  isOpen: boolean
  onClose: () => void
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  footerError?: string | null
  className?: string
  closeOnBackdrop?: boolean
  width?: string
  height?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string
}

export function AppModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  footerError,
  className,
  closeOnBackdrop = false,
  width,
  height,
  size = 'md',
}: AppModalProps) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
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

  if (!isOpen) return null

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  }

  const panelStyle: CSSProperties = {
    ...(width ? { width, maxWidth: width.includes('px') || width.includes('rem') || width.includes('%') ? `min(96vw, ${width})` : width } : {}),
    ...(height && { height }),
  }

  const hasFooterArea = !!(footer || footerError)

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="app-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        style={panelStyle}
        className={cn(
          'relative z-10 flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden',
          'w-full max-h-[90vh]',
          width ? 'max-w-none' : (sizeClasses[size] || 'max-w-lg'),
          className
        )}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2
              id="app-modal-title"
              className="text-lg font-bold text-gray-900 leading-tight"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-gray-500 font-medium mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5">{children}</div>

        {/* Footer area */}
        {hasFooterArea && (
          <div className="shrink-0 border-t border-gray-100">
            {footerError && (
              <div className="flex items-center gap-2 px-5 py-3 bg-rose-50 border-b border-rose-100">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-sm text-rose-600 leading-snug">{footerError}</span>
              </div>
            )}
            {footer && (
              <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50">
                {footer}
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
