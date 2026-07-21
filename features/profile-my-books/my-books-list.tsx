"use client"

import { useAuth } from "@/components/auth-provider"
import { useOrders } from "@/features/profile-my-books/hooks/use-orders"
import { useEbookLibrary } from "@/features/profile-my-books/hooks/use-ebook-library"
import { linkKey } from "@/features/profile-my-books/selectors"
import { MyBooksSkeleton } from "@/features/profile-my-books/components/my-books-skeleton"
import { MyBookCard } from "@/features/profile-my-books/components/my-book-card"

export function MyBooksList() {
  const { user, loading: authLoading } = useAuth()
  const { orders, loading, error } = useOrders((user as any)?.id, authLoading)
  const { paidEbookEntries, links, linksLoading, ebookMeta, retryLink } = useEbookLibrary(orders)

  return (
    <>
      {(loading || linksLoading) && <MyBooksSkeleton />}

      {!loading && error && <div className="text-red-600">{error}</div>}

      {!loading && !error && paidEbookEntries.length === 0 && <div className="text-gray-600">ยังไม่มี eBook ที่ชำระเงินแล้ว</div>}

      {!loading && !error && paidEbookEntries.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paidEbookEntries.map((entry) => {
            const meta = ebookMeta[String(entry.ebookId)]
            const key = linkKey(entry.orderId, entry.ebookId)
            const fileUrl = links[key] || meta?.fileUrl || null
            const hasKey = Object.prototype.hasOwnProperty.call(links, key)
            const resolved = hasKey || !!meta?.fileUrl
            const isResolving = linksLoading && !resolved

            return (
              <MyBookCard
                key={key}
                entry={entry}
                meta={meta}
                fileUrl={fileUrl}
                isResolving={isResolving}
                resolved={resolved}
                onRetry={() => retryLink(entry.orderId, entry.ebookId)}
              />
            )
          })}
        </div>
      )}
    </>
  )
}
