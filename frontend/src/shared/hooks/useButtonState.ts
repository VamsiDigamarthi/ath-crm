import { useState } from 'react'

export function useButtonState() {
  const [variant, setVariant]     = useState<'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'>('primary')
  const [size, setSize]           = useState<'sm' | 'md' | 'lg'>('md')
  const [label, setLabel]         = useState('Click me')
  const [loading, setLoading]     = useState(false)
  const [disabled, setDisabled]   = useState(false)
  const [fullWidth, setFullWidth] = useState(false)
  const [bgColor, setBgColor]     = useState('')
  const [textColor, setTextColor] = useState('')

  return {
    variant, setVariant,
    size, setSize,
    label, setLabel,
    loading, setLoading,
    disabled, setDisabled,
    fullWidth, setFullWidth,
    bgColor, setBgColor,
    textColor, setTextColor,
  }
}

export type ButtonState = ReturnType<typeof useButtonState>
