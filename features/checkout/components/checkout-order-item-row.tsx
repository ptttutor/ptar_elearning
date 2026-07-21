import Image from "next/image"

type CheckoutOrderItemRowProps = {
  item: any
  coverUrl: string
}

export function CheckoutOrderItemRow({ item, coverUrl }: CheckoutOrderItemRowProps) {
  const isCourse = String(item.itemType).toUpperCase() === "COURSE"

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center">
      <div
        className={`relative w-full max-w-[128px] overflow-hidden rounded-md bg-gray-100 ring-1 ring-black/5 ${
          isCourse ? "aspect-video" : "aspect-[3/4]"
        }`}
      >
        <Image src={coverUrl} alt={item.title} fill className="object-cover" sizes="128px" />
      </div>
      <div className="flex-1">
        <p className="text-sm uppercase tracking-wide text-gray-400">{item.itemType}</p>
        <h2 className="text-base font-semibold text-gray-800">{item.title}</h2>
        <p className="mt-1 text-sm text-gray-500">
          จำนวน {item.quantity} × ฿{(item.unitPrice || 0).toLocaleString()}
        </p>
      </div>
      <div className="text-right text-base font-semibold text-gray-800">
        ฿{((item.unitPrice || 0) * (item.quantity || 1) || 0).toLocaleString()}
      </div>
    </div>
  )
}
