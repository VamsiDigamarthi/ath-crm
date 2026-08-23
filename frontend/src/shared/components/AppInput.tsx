import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface AppInputProps {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  placeholder?: string
  label?: string
  labelColor?: string
  labelSize?: 'xs' | 'sm' | 'md'
  error?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  readOnly?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  id?: string
  name?: string
  className?: string
}

const SIZE_CLS = {
  sm: 'h-8 text-xs',
  md: 'h-10 text-xs',
  lg: 'h-11 text-sm',
}

const LABEL_SIZE = {
  xs: 'text-[11px] font-medium text-gray-600',
  sm: 'text-xs font-semibold text-gray-700',
  md: 'text-sm font-semibold text-gray-800',
}

export function AppInput({
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  labelColor,
  labelSize = 'sm',
  error,
  type = 'text',
  size = 'md',
  disabled = false,
  readOnly = false,
  leftIcon,
  rightIcon,
  id,
  name,
  className,
}: AppInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={cn('flex flex-col gap-1 w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className={cn('tracking-tight', LABEL_SIZE[labelSize])}
          style={labelColor ? { color: labelColor } : undefined}
        >
          {label}
        </label>
      )}

      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none z-10">
            {leftIcon}
          </div>
        )}

        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className={cn(
            'w-full rounded-xl border-[1.5px] bg-white px-3.5 transition-all duration-200 outline-none',
            'placeholder:text-slate-300 placeholder:font-normal placeholder:italic text-slate-900 font-semibold',
            'hover:border-gray-300',
            'focus:ring-2 focus:ring-emerald-500/15 focus:border-[#16A34A]',
            SIZE_CLS[size],
            leftIcon && 'pl-10',
            (rightIcon || type === 'password') && 'pr-10',
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
              : 'border-gray-200',
            (disabled || readOnly) && 'opacity-50 cursor-not-allowed bg-gray-50',
          )}
        />

        {type === 'password' ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-[#16A34A] transition-colors z-10 cursor-pointer"
            title={showPassword ? 'Hide value' : 'Show value'}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        ) : rightIcon ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 z-10">
            {rightIcon}
          </div>
        ) : null}
      </div>

      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  )
}
