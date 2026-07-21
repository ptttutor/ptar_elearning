import { HomeClient } from "@/features/home/home-client"

export const metadata = {
  title: "เคมีพี่ต้า โรงเรียนกวดวิชาเคมี",
  description: "โรงเรียนกวดวิชาเคมีพี่ต้า คอร์สเรียนเคมี ม.ต้น-ม.ปลาย พร้อมข้อสอบและบทความ",
}

export default function HomePage() {
  return <HomeClient />
}
