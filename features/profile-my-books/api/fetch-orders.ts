import { fetchOrdersForUser as fetchOrdersForUserRaw } from "@/lib/api/orders"
import type { Order } from "@/features/profile-my-books/types"

export async function fetchOrdersForUser(userId: string): Promise<Order[]> {
  return fetchOrdersForUserRaw(userId) as Promise<Order[]>
}
