import { LiveScheduleClient } from "@/features/live-schedule/live-schedule-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("ตารางรอบสด, ถ่ายทอดสด"),
  description: "รอบเรียนสด (Onsite/Online) และรายละเอียดการสมัคร พร้อมติดตามการเรียนแบบเรียลไทม์",
}

export default function LiveSchedulePage() {
  return <LiveScheduleClient />
}
