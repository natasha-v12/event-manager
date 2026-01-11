"use client"

import React from 'react'

type Props = {
  containerId: string
  total: number
  defaultPerPage?: number
  perPageOptions?: number[]
}

export default function TablePagination({ containerId, total, defaultPerPage = 10, perPageOptions = [10, 20, 50] }: Props) {
  const [page, setPage] = React.useState(1)
  const [perPage, setPerPage] = React.useState(defaultPerPage)

  const totalPages = Math.max(1, Math.ceil(total / perPage))

  React.useEffect(() => {
    // when page or perPage changes, show appropriate rows
    const container = document.getElementById(containerId)
    if (!container) return
    const rows = Array.from(container.querySelectorAll('[data-row-idx]')) as HTMLElement[]
    rows.forEach((r) => {
      const idx = Number(r.getAttribute('data-row-idx') || '0')
      const start = (page - 1) * perPage
      const end = start + perPage
      if (idx >= start && idx < end) {
        r.style.display = ''
      } else {
        r.style.display = 'none'
      }
    })
  }, [page, perPage, containerId])

  React.useEffect(() => {
    // reset to first page if perPage changes
    setPage(1)
  }, [perPage])

  if (total <= 0) return null

  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-white border-t">
      <div className="flex items-center gap-2 text-sm text-gray-800">
        <span>Rows per page</span>
        <select value={String(perPage)} onChange={(e) => setPerPage(Number(e.target.value))} className="border bg-white text-gray-800 p-1 rounded">
          {perPageOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 border rounded text-gray-800 hover:bg-gray-100 disabled:opacity-50">Prev</button>
        <span className="px-2 text-gray-800">{page} / {totalPages}</span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 border rounded text-gray-800 hover:bg-gray-100 disabled:opacity-50">Next</button>
      </div>

      <div className="text-sm text-gray-800">
        <span>{Math.min((page-1)*perPage + 1, total)}–{Math.min(page*perPage, total)} of {total}</span>
      </div>
    </div>
  )
}
