import { useState } from 'react'
import type { TableDensity } from '@/shared/components/AppTable'

export function useTableState() {
  const [isLoading, setIsLoading]           = useState(false)
  const [showPagination, setShowPagination] = useState(true)
  const [showSearch, setShowSearch]         = useState(true)
  const [showPerPage, setShowPerPage]       = useState(true)
  const [striped, setStriped]               = useState(false)
  const [stickyHeader, setStickyHeader]     = useState(false)
  const [selectable, setSelectable]         = useState(false)
  const [exportable, setExportable]         = useState(false)
  const [density, setDensity]               = useState<TableDensity>('comfortable')
  const [currentPage, setCurrentPage]       = useState(1)
  const [perPage, setPerPage]               = useState(5)
  const [activeBg, setActiveBg]             = useState('')
  const [activeText, setActiveText]         = useState('')

  function handlePerPageChange(n: number) {
    setPerPage(n)
    setCurrentPage(1)
  }

  return {
    isLoading, setIsLoading,
    showPagination, setShowPagination,
    showSearch, setShowSearch,
    showPerPage, setShowPerPage,
    striped, setStriped,
    stickyHeader, setStickyHeader,
    selectable, setSelectable,
    exportable, setExportable,
    density, setDensity,
    currentPage, setCurrentPage,
    perPage, handlePerPageChange,
    activeBg, setActiveBg,
    activeText, setActiveText,
  }
}

export type TableState = ReturnType<typeof useTableState>
