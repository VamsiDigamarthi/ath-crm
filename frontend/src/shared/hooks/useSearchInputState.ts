import { useState } from 'react'

export function useSearchInputState() {
  const [value, setValue]                   = useState('')
  const [error, setError]                   = useState('')
  const [isLoading, setIsLoading]           = useState(false)
  const [enableShortcut, setEnableShortcut] = useState(true)
  const [showLabel, setShowLabel]           = useState(true)
  const [labelColor, setLabelColor]         = useState('')
  const [labelSize, setLabelSize]           = useState<'xs' | 'sm' | 'md'>('sm')

  return {
    value, setValue,
    error, setError,
    isLoading, setIsLoading,
    enableShortcut, setEnableShortcut,
    showLabel, setShowLabel,
    labelColor, setLabelColor,
    labelSize, setLabelSize,
  }
}

export type SearchInputState = ReturnType<typeof useSearchInputState>
