import Image from "next/image"
import { CheckCircle2, Download } from "lucide-react"

export function PaymentSuccessBanner({ isCompleted }: { isCompleted: boolean }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-800">
              {isCompleted ? "การชำระเงินสำเร็จ!" : "อัพโหลดสลิปสำเร็จ!"}
            </h3>
            <p className="text-green-700 text-sm">
              {isCompleted ? "คำสั่งซื้อของคุณได้รับการยืนยันแล้ว" : "กำลังตรวจสอบสลิป กรุณารอสักครู่"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="relative group">
            <Image src="/line-qr.jpg" alt="Line QR Code" width={200} height={200} className="object-contain" />
            <button
              onClick={() => {
                const link = document.createElement("a")
                link.href = "/line-qr.jpg"
                link.download = "line-qr-code.png"
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
              className="absolute top-2 right-2 bg-white hover:bg-green-50 p-2 rounded-full shadow-md transition-all duration-200 border border-green-200"
              title="ดาวน์โหลด QR Code"
            >
              <Download className="h-4 w-4 text-green-700" />
            </button>
          </div>
          <div className="text-center space-y-2">
            <p className="text-green-800 text-sm">Scan QR Code หรือ</p>
            <a
              className="text-green-800 font-medium underline hover:text-green-900"
              href="https://line.me/ti/p/sjYGzkVGDL"
              target="_blank"
              rel="noopener noreferrer"
            >
              กดที่นี่เพื่อแอดไลน์เข้ากลุ่มติว!
            </a>
            <p className="text-green-700 text-xs">
              เพื่อสอบถามหรือ รับข้อมูลพิเศษสำหรับนักเรียนของเราเท่านั้น หรือแอด Line ID chemistar518
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
