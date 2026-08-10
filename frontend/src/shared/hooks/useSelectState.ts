import { useState } from 'react'

export function useSelectState() {
  const [value, setValue]         = useState('')
  const [error, setError]         = useState('')
  const [searchable, setSearchable] = useState(false)
  const [disabled, setDisabled]   = useState(false)
  const [showLabel, setShowLabel]   = useState(true)
  const [labelColor, setLabelColor] = useState('')
  const [labelSize, setLabelSize]   = useState<'xs' | 'sm' | 'md'>('sm')

  return {
    value, setValue,
    error, setError,
    searchable, setSearchable,
    disabled, setDisabled,
    showLabel, setShowLabel,
    labelColor, setLabelColor,
    labelSize, setLabelSize,
  }
}

export type SelectState = ReturnType<typeof useSelectState>
