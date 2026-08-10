import { useState } from 'react'

export function usePaginationState() {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages]   = useState(10)
  const [activeBg, setActiveBg]       = useState('')
  const [activeText, setActiveText]   = useState('')

  return {
    currentPage, setCurrentPage,
    totalPages, setTotalPages,
    activeBg, setActiveBg,
    activeText, setActiveText,
  }
}

export type PaginationState = ReturnType<typeof usePaginationState>
