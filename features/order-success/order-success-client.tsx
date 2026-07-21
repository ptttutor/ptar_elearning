"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useSchoolField } from "@/hooks/use-school-field"
import { useOrder } from "@/features/order-success/hooks/use-order"
import { useCourseEnrollment } from "@/features/order-success/hooks/use-course-enrollment"
import { useEbookLink } from "@/features/order-success/hooks/use-ebook-link"
import { useSlipUpload } from "@/features/order-success/hooks/use-slip-upload"
import {
  getDisplayItems,
  getItemTypeSummary,
  getNeedsShipping,
  getNormalizedShipping,
  getPaymentStatus,
  getSafeUserId,
  getSlipInfo,
  getSummaryRows,
  isPaidLikeStatus,
} from "@/features/order-success/selectors"
import { OrderHeader } from "@/features/order-success/components/order-header"
import { OrderProgressSteps } from "@/features/order-success/components/order-progress-steps"
import { OrderDetailsCard } from "@/features/order-success/components/order-details-card"
import { PaymentSuccessBanner } from "@/features/order-success/components/payment-success-banner"
import { SlipStatusCard } from "@/features/order-success/components/slip-status-card"
import { BankTransferCard } from "@/features/order-success/components/bank-transfer-card"
import { UploadSlipDialog } from "@/features/order-success/components/upload-slip-dialog"

export function OrderSuccessClient({ id }: { id: string }) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { school, schoolInput, setSchoolInput, validateSchool, onSaved: onSchoolSaved } = useSchoolField()

  const { order, loading, error, refreshOrder } = useOrder(id)
  const { enrollErrByCourse, enrollmentStatus, retryEnroll } = useCourseEnrollment(order, user)

  const displayItems = useMemo(() => getDisplayItems(order), [order])
  const normalizedShipping = useMemo(() => getNormalizedShipping(order), [order])
  const paymentStatus = getPaymentStatus(order)
  const isPending = ["PENDING", "PENDING_VERIFICATION"].includes(paymentStatus)
  const isCompleted = isPaidLikeStatus(paymentStatus) || isPaidLikeStatus(order?.status)

  const courseItems = useMemo(() => displayItems.filter((item) => (item.itemType || "").toUpperCase() === "COURSE"), [displayItems])
  const courseTitle = courseItems[0]?.title || order?.course?.title

  const ebookItems = useMemo(() => displayItems.filter((item) => (item.itemType || "").toUpperCase() === "EBOOK"), [displayItems])
  const primaryEbookItem = ebookItems[0]
  const ebookTitle = order?.ebook?.title || primaryEbookItem?.title
  const ebookFileUrl = useMemo(() => {
    if (order?.ebook?.fileUrl || order?.ebook?.previewUrl) return order.ebook.fileUrl || order.ebook.previewUrl || null
    return (primaryEbookItem as any)?.fileUrl || (primaryEbookItem as any)?.previewUrl || null
  }, [order?.ebook?.fileUrl, order?.ebook?.previewUrl, primaryEbookItem])
  const ebookLink = useEbookLink(order, ebookFileUrl, primaryEbookItem)

  const slipUrl = order?.payment?.slipUrl
  const hasUploadedSlip = !!slipUrl
  const itemTypeSummary = useMemo(() => getItemTypeSummary(order, displayItems), [order, displayItems])
  const orderDisplayId = order?.orderNumber || order?.id || ""
  const summaryRows = useMemo(() => getSummaryRows(order), [order])
  const needsShipping = useMemo(() => getNeedsShipping(order, normalizedShipping, displayItems), [order, normalizedShipping, displayItems])
  const slipInfo = useMemo(() => getSlipInfo(order), [order?.payment?.notes])
  const canManualEnroll = isCompleted && isAuthenticated && !!getSafeUserId(user)

  const slipUpload = useSlipUpload({ order, normalizedShipping, refreshOrder, validateSchool, onSchoolSaved })

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
      <OrderHeader
        loading={loading}
        error={error}
        onRefresh={refreshOrder}
        onBackToOrders={() => router.push("/profile/orders")}
      />

      {!loading && order && (
        <>
          <OrderProgressSteps order={order} hasUploadedSlip={hasUploadedSlip} />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <OrderDetailsCard
                order={order}
                paymentStatus={paymentStatus}
                isCompleted={isCompleted}
                isPending={isPending}
                isAuthenticated={isAuthenticated}
                hasUploadedSlip={hasUploadedSlip}
                orderDisplayId={orderDisplayId}
                itemTypeSummary={itemTypeSummary}
                displayItems={displayItems}
                summaryRows={summaryRows}
                needsShipping={needsShipping}
                normalizedShipping={normalizedShipping}
                courseItems={courseItems}
                courseTitle={courseTitle}
                canManualEnroll={canManualEnroll}
                enrollmentStatus={enrollmentStatus}
                enrollErrByCourse={enrollErrByCourse}
                onRetryEnroll={retryEnroll}
                ebookItems={ebookItems}
                ebookTitle={ebookTitle}
                ebookFileUrl={ebookFileUrl}
                ebookLink={ebookLink}
              />
            </div>

            <div>
              {(isCompleted || hasUploadedSlip) && <PaymentSuccessBanner isCompleted={isCompleted} />}
              <SlipStatusCard order={order} paymentStatus={paymentStatus} slipInfo={slipInfo} />
              {(isPending || paymentStatus === "PENDING_VERIFICATION") && (
                <BankTransferCard order={order} onUploadClick={() => slipUpload.setOpenUpload(true)} />
              )}
            </div>
          </div>

          <UploadSlipDialog
            open={slipUpload.openUpload}
            onOpenChange={slipUpload.setOpenUpload}
            school={school}
            schoolInput={schoolInput}
            onSchoolInputChange={setSchoolInput}
            normalizedShipping={normalizedShipping}
            shipping={slipUpload.shipping}
            onShippingChange={slipUpload.setShipping}
            file={slipUpload.file}
            onFileChange={slipUpload.setFile}
            filePreview={slipUpload.filePreview}
            uploadMsg={slipUpload.uploadMsg}
            uploading={slipUpload.uploading}
            onUpload={slipUpload.uploadSlip}
          />
        </>
      )}
    </div>
  )
}
