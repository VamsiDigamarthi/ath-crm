import { useState } from 'react'

export function useInputState() {
  const [value, setValue]         = useState('')
  const [label, setLabel]         = useState('Email address')
  const [placeholder, setPlaceholder] = useState('you@example.com')
  const [type, setType]           = useState<'text' | 'email' | 'password' | 'number'>('text')
  const [size, setSize]           = useState<'sm' | 'md' | 'lg'>('md')
  const [error, setError]         = useState('')
  const [disabled, setDisabled]   = useState(false)
  const [showLabel, setShowLabel] = useState(true)
  const [leftIcon, setLeftIcon]     = useState(false)
  const [rightIcon, setRightIcon]   = useState(false)
  const [labelColor, setLabelColor] = useState('')
  const [labelSize, setLabelSize]   = useState<'xs' | 'sm' | 'md'>('sm')

  return {
    value, setValue,
    label, setLabel,
    placeholder, setPlaceholder,
    type, setType,
    size, setSize,
    error, setError,
    disabled, setDisabled,
    showLabel, setShowLabel,
    leftIcon, setLeftIcon,
    rightIcon, setRightIcon,
    labelColor, setLabelColor,
    labelSize, setLabelSize,
  }
}

export type InputState = ReturnType<typeof useInputState>
