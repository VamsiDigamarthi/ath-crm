import { useState } from 'react'

export function useModalState() {
  const [open, setOpen]                         = useState(false)
  const [title, setTitle]                       = useState('Modal Title')
  const [widthVal, setWidthVal]                 = useState('600px')
  const [heightVal, setHeightVal]               = useState('')
  const [closeOnBackdrop, setCloseOnBackdrop]   = useState(false)
  const [hasFooter, setHasFooter]               = useState(true)
  const [scrollable, setScrollable]             = useState(false)
  const [showError, setShowError]               = useState(false)

  return {
    open, setOpen,
    title, setTitle,
    widthVal, setWidthVal,
    heightVal, setHeightVal,
    closeOnBackdrop, setCloseOnBackdrop,
    hasFooter, setHasFooter,
    scrollable, setScrollable,
    showError, setShowError,
  }
}

export type ModalState = ReturnType<typeof useModalState>
