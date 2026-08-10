import { type ButtonHTMLAttributes, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  bgColor?: string
  textColor?: string
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'bg-[#16A34A] text-white hover:bg-[#15803D] border border-[#16A34A] shadow-sm shadow-emerald-600/20',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200',
  outline:   'bg-transparent text-[#16A34A] border border-[#16A34A] hover:bg-emerald-50',
  ghost:     'bg-transparent text-gray-700 hover:bg-gray-100 border border-transparent',
  danger:    'bg-red-600 text-white hover:bg-red-700 border border-red-600 shadow-sm',
}

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs font-medium h-8',
  md: 'px-4 py-2 text-xs font-semibold h-10',
  lg: 'px-5 py-2.5 text-sm font-semibold h-11',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  bgColor,
  textColor,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const customStyle: CSSProperties = {}
  if (bgColor && variant !== 'danger') {
    if (variant === 'outline') {
      customStyle.borderColor = bgColor
      customStyle.color = bgColor
    } else if (variant === 'ghost') {
      customStyle.color = bgColor
    } else {
      customStyle.backgroundColor = bgColor
      customStyle.borderColor = bgColor
    }
  }
  if (textColor && variant !== 'danger') {
    customStyle.color = textColor
  }

  return (
    <button
      disabled={disabled || loading}
      style={customStyle}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-150 cursor-pointer select-none',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
