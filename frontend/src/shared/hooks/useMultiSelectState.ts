import { useState } from 'react'

export function useMultiSelectState() {
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [error, setError]                   = useState('')
  const [showLabel, setShowLabel]   = useState(true)
  const [labelColor, setLabelColor] = useState('')
  const [labelSize, setLabelSize]   = useState<'xs' | 'sm' | 'md'>('sm')

  return {
    selectedValues, setSelectedValues,
    error, setError,
    showLabel, setShowLabel,
    labelColor, setLabelColor,
    labelSize, setLabelSize,
  }
}

export type MultiSelectState = ReturnType<typeof useMultiSelectState>
