import Link from 'next/link'

interface PaginationProps {
  page: number
  totalPages: number
  totalCount: number
  entityLabel: string
  buildUrl: (overrides: Record<string, string>) => string
}

export function Pagination({ page, totalPages, totalCount, entityLabel, buildUrl }: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
      <span className="text-[11px] text-gray-400">{totalCount} {entityLabel}</span>
      <div className="flex items-center gap-2">
        {page > 1 && (
          <Link href={buildUrl({ page: String(page - 1) })} className="text-[11px] font-medium text-brand-600 hover:underline">
            ← Previous
          </Link>
        )}
        <span className="text-[11px] text-gray-400">Page {page} of {totalPages}</span>
        {page < totalPages && (
          <Link href={buildUrl({ page: String(page + 1) })} className="text-[11px] font-medium text-brand-600 hover:underline">
            Next →
          </Link>
        )}
      </div>
    </div>
  )
}
