import { LiveScheduleClient } from "@/features/live-schedule/live-schedule-client"

export const metadata = {
  title: "ตารางรอบสด, ถ่ายทอดสด | เคมีพี่ต้า",
  description: "รอบเรียนสด (Onsite/Online) และรายละเอียดการสมัคร พร้อมติดตามการเรียนแบบเรียลไทม์",
}

export default function LiveSchedulePage() {
  return <LiveScheduleClient />
}
