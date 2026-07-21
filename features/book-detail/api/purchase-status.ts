export async function fetchHasPurchasedEbook(userId: string, ebookId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/orders?userId=${encodeURIComponent(userId)}`, { cache: "no-store" })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || !Array.isArray(json?.data)) return false

    return json.data.some((order: any) => {
      const type = String(order?.orderType || "").toUpperCase()
      if (type !== "EBOOK") return false
      const orderStatus = String(order?.status || "").toUpperCase()
      const paymentStatus = String(order?.payment?.status || "").toUpperCase()
      const paid = orderStatus === "COMPLETED" || paymentStatus === "COMPLETED"
      if (!paid) return false
      const orderEbookId = order?.ebookId ?? order?.ebook?.id ?? null
      return String(orderEbookId || "") === String(ebookId)
    })
  } catch {
    return false
  }
}
