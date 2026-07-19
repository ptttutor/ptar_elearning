import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/requireUser"

// Cart items are fixed at quantity 1 by design (see app/api/cart/route.js POST,
// which rejects quantity !== 1) — there is nothing to adjust, so this just
// returns the current cart unchanged instead of erroring the UI's stepper.
export async function PATCH(req: Request) {
  try {
    const session = requireUser(req)
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    const cart = await prisma.cart.findFirst({ where: { userId: session.userId }, include: { items: true } })
    return NextResponse.json({ success: true, data: cart })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to adjust cart item" }, { status: 500 })
  }
}

// Fallback removal path — the primary path is DELETE /api/cart with
// { itemType, itemId } in the body (see components/cart-provider.tsx),
// this only runs if that ever 404s/405s.
export async function DELETE(req: Request, ctx: { params: { itemId: string } }) {
  try {
    const session = requireUser(req)
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    const cart = await prisma.cart.findFirst({ where: { userId: session.userId } })
    if (!cart) {
      return NextResponse.json({ success: false, error: "ไม่พบตะกร้า" }, { status: 404 })
    }
    const deleted = await prisma.cartItem.deleteMany({
      where: { id: ctx.params.itemId, cartId: cart.id },
    })
    if (deleted.count === 0) {
      return NextResponse.json({ success: false, error: "ไม่พบสินค้านี้ในตะกร้า" }, { status: 404 })
    }
    const updatedCart = await prisma.cart.findFirst({ where: { id: cart.id }, include: { items: true } })
    return NextResponse.json({ success: true, data: updatedCart })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to remove cart item" }, { status: 500 })
  }
}
