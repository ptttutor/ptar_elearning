import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySlipWithEasySlip } from "@/lib/easyslip";
import { sendPaymentSuccessNotification, sendPaymentFailureNotification } from "@/lib/email";
import { requireAdmin } from "@/lib/requireAdmin";
import { grantEntitlementsForOrder } from "@/lib/grantOrderEntitlements";

// GET - ตรวจสอบสถานะการชำระเงิน (แอดมินเท่านั้น — endpoint นี้เปิดเผยข้อมูลผู้ใช้/คำสั่งซื้อของทุกคน)
export async function GET(request) {
  try {
    const adminSession = await requireAdmin();
    if (!adminSession) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.log("Getting payment status...");

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const paymentId = searchParams.get("paymentId");

    console.log("Query parameters:", { orderId, paymentId });

    if (!orderId && !paymentId) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ orderId หรือ paymentId" },
        { status: 400 }
      );
    }

    let payment;

    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: {
            include: {
              user: true,
              course: true,
            },
          },
        },
      });
    } else {
      payment = await prisma.payment.findFirst({
        where: { orderId },
        include: {
          order: {
            include: {
              user: true,
              course: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลการชำระเงิน" },
        { status: 404 }
      );
    }

    console.log("Payment found:", payment.id, payment.status);

    return NextResponse.json({
      success: true,
      data: {
        payment,
        order: payment.order,
      },
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการตรวจสอบสถานะการชำระเงิน" },
      { status: 500 }
    );
  }
}

// POST - อัปเดตสถานะการชำระเงินและตรวจสอบ slip (แอดมินเท่านั้น — สามารถอนุมัติ/ปฏิเสธการชำระเงินและสร้าง enrollment ได้)
export async function POST(request) {
  try {
    const adminSession = await requireAdmin();
    if (!adminSession) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.log("Updating payment status...");

    const { orderId, paymentId, action, slipUrl } = await request.json();

    console.log("Request data:", {
      orderId,
      paymentId,
      action,
      hasSlipUrl: !!slipUrl,
    });

    if (!orderId && !paymentId) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ orderId หรือ paymentId" },
        { status: 400 }
      );
    }

    // ตรวจสอบการชำระเงิน
    let payment;
    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { 
          order: { 
            include: { 
              user: true, 
              course: true, 
              ebook: true,
              coupon: true 
            } 
          } 
        },
      });
    } else {
      payment = await prisma.payment.findFirst({
        where: { orderId },
        include: { 
          order: { 
            include: { 
              user: true, 
              course: true, 
              ebook: true,
              coupon: true 
            } 
          } 
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลการชำระเงิน" },
        { status: 404 }
      );
    }

    console.log("Found payment:", payment.id, payment.status);

    // ตรวจสอบ slip ด้วย EasySlip ถ้ามี URL
    let verificationResult = null;
    let confidence = 0;
    let shouldAutoApprove = false;

    if (slipUrl || payment.slipUrl) {
      const urlToVerify = slipUrl || payment.slipUrl;
      console.log("🔍 Verifying slip with EasySlip:", urlToVerify);

      try {
        verificationResult = await verifySlipWithEasySlip(urlToVerify);
        console.log("EasySlip verification result:", verificationResult);

        if (verificationResult?.success && verificationResult?.data) {
          const slipData = verificationResult.data;

          // คำนวณความเชื่อมั่น (Confidence Score)
          let confidenceScore = 0;

          // ตรวจสอบจำนวนเงิน (40 คะแนน)
          if (
            slipData.amount &&
            Math.abs(slipData.amount - payment.amount) < 1
          ) {
            confidenceScore += 40;
            console.log(
              "Amount matches:",
              slipData.amount,
              "≈",
              payment.amount
            );
          } else {
            console.log(
              "Amount mismatch:",
              slipData.amount,
              "≠",
              payment.amount
            );
          }

          // ตรวจสอบวันที่ (30 คะแนน) - ภายใน 7 วัน
          if (slipData.transDate) {
            const slipDate = new Date(slipData.transDate);
            const paymentDate = new Date(payment.createdAt);
            const daysDiff = Math.abs(
              (slipDate - paymentDate) / (1000 * 60 * 60 * 24)
            );

            if (daysDiff <= 7) {
              confidenceScore += 30;
              console.log("Date within range:", daysDiff, "days");
            } else {
              console.log("Date out of range:", daysDiff, "days");
            }
          }

          // ตรวจสอบธนาคาร (30 คะแนน)
          if (slipData.sender?.bank) {
            confidenceScore += 30;
            console.log("Bank info available:", slipData.sender.bank);
          }

          confidence = confidenceScore;
          console.log("Total confidence score:", confidence, "/100");

          // อัตโนมัติอนุมัติถ้าคะแนน >= 80
          shouldAutoApprove = confidence >= 80;

          if (shouldAutoApprove) {
            console.log("Auto-approval triggered with confidence:", confidence);
          }
        }
      } catch (verifyError) {
        console.error("EasySlip verification failed:", verifyError);
        verificationResult = {
          success: false,
          error: verifyError.message,
        };
      }
    }

    // อัปเดตสถานะตาม action
    let newStatus = payment.status;
    let adminNotes = payment.adminNotes || "";

    switch (action) {
      case "verify":
        if (shouldAutoApprove) {
          newStatus = "APPROVED";
          adminNotes +=
            "\n[AUTO] อนุมัติอัตโนมัติ - Confidence: " + confidence + "%";
        } else {
          newStatus = "PENDING";
          adminNotes +=
            "\n[MANUAL] ต้องตรวจสอบด้วยตนเอง - Confidence: " + confidence + "%";
        }
        break;

      case "approve":
        newStatus = "APPROVED";
        adminNotes += "\n[MANUAL] อนุมัติโดย Admin";
        break;

      case "reject":
        newStatus = "REJECTED";
        adminNotes += "\n[MANUAL] ปฏิเสธโดย Admin";
        break;

      default:
        if (shouldAutoApprove && newStatus === "PENDING") {
          newStatus = "APPROVED";
          adminNotes +=
            "\n[AUTO] อนุมัติอัตโนมัติ - Confidence: " + confidence + "%";
        }
    }

    // อัปเดตฐานข้อมูล
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        slipUrl: slipUrl || payment.slipUrl,
        verificationData: verificationResult
          ? JSON.stringify(verificationResult)
          : payment.verificationData,
        confidence,
        adminNotes: adminNotes.trim(),
        updatedAt: new Date(),
      },
      include: {
        order: {
          include: {
            user: true,
            course: true,
            ebook: true,
            coupon: true,
          },
        },
      },
    });

    // ถ้าอนุมัติแล้ว ให้สร้าง entitlement (enrollment / mock exam purchase / ...)
    // ต่อทุกรายการใน order — ดู lib/grantOrderEntitlements.js
    if (newStatus === "APPROVED" && payment.status !== "APPROVED") {
      console.log("🎓 Granting entitlements for approved payment...");

      try {
        await grantEntitlementsForOrder(payment.order.id);
        console.log("Entitlements granted for order:", payment.order.id);
      } catch (enrollError) {
        console.error("Failed to grant entitlements:", enrollError);
        // ไม่ throw error เพราะการชำระเงินสำเร็จแล้ว
      }
    }

    console.log("Payment updated:", updatedPayment.id, updatedPayment.status);

    // ส่ง email notification ตามสถานะ
    try {
      if (newStatus === "APPROVED" || newStatus === "COMPLETED") {
        // ส่ง email แจ้งเตือนการชำระเงินสำเร็จ
        console.log("📧 Sending payment success email notification...");
        const emailResult = await sendPaymentSuccessNotification(
          updatedPayment,
          updatedPayment.order,
          updatedPayment.order.user
        );
        
        if (emailResult.success) {
          console.log("✅ Payment success email sent successfully");
        } else {
          console.log("⚠️ Failed to send payment success email:", emailResult.error);
        }
      } else if (newStatus === "REJECTED" || newStatus === "FAILED") {
        // ส่ง email แจ้งเตือนการชำระเงินไม่สำเร็จ
        console.log("📧 Sending payment failure email notification...");
        const reason = notes || adminNotes || 'ไม่ระบุเหตุผล';
        const emailResult = await sendPaymentFailureNotification(
          updatedPayment,
          updatedPayment.order,
          updatedPayment.order.user,
          reason
        );
        
        if (emailResult.success) {
          console.log("✅ Payment failure email sent successfully");
        } else {
          console.log("⚠️ Failed to send payment failure email:", emailResult.error);
        }
      }
    } catch (emailError) {
      console.error("❌ Error sending email notification:", emailError);
      // ไม่ throw error เพราะไม่ต้องการให้การส่ง email ล้มเหลวส่งผลกระทบต่อการอัปเดตสถานะ
    }

    return NextResponse.json({
      success: true,
      data: {
        payment: updatedPayment,
        verification: verificationResult,
        confidence,
        autoApproved: shouldAutoApprove,
        message: shouldAutoApprove
          ? "อนุมัติการชำระเงินอัตโนมัติ (" + confidence + "% confidence)"
          : "อัปเดตสถานะการชำระเงินเรียบร้อย",
      },
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการอัปเดตสถานะการชำระเงิน" },
      { status: 500 }
    );
  }
}
