import { useState } from 'react'

export function useTextareaState() {
  const [value, setValue]           = useState('')
  const [rows, setRows]             = useState(3)
  const [autoResize, setAutoResize] = useState(false)
  const [showCount, setShowCount]   = useState(false)
  const [useMaxLen, setUseMaxLen]   = useState(false)
  const [showLabel, setShowLabel]   = useState(true)
  const [showHint, setShowHint]     = useState(false)
  const [showError, setShowError]   = useState(false)
  const [disabled, setDisabled]     = useState(false)
  const [labelSize, setLabelSize]   = useState<'xs'|'sm'|'md'>('sm')
  const [resize, setResize]         = useState<'none'|'vertical'|'both'>('none')
  const [accentColor, setAccent]    = useState('#6366f1')
  const [widthVal, setWidthVal]         = useState('')
  const [maxHeightVal, setMaxHeightVal] = useState('')

  return {
    value, setValue,
    rows, setRows,
    autoResize, setAutoResize,
    showCount, setShowCount,
    useMaxLen, setUseMaxLen,
    showLabel, setShowLabel,
    showHint, setShowHint,
    showError, setShowError,
    disabled, setDisabled,
    labelSize, setLabelSize,
    resize, setResize,
    accentColor, setAccent,
    widthVal, setWidthVal,
    maxHeightVal, setMaxHeightVal,
  }
}

export type TextareaState = ReturnType<typeof useTextareaState>
