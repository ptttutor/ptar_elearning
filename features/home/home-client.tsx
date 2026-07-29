"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Users,
  BadgeCheck,
  Star,
  ChevronDown,
  BookOpen,
  ClipboardCheck,
  ShieldCheck,
  Smartphone,
} from "lucide-react"
import http from "@/lib/http"
import { CourseCard } from "@/features/courses-list/components/course-card"
import type { ApiCourse } from "@/features/courses-list/types"

const platformFeatures = [
  {
    icon: BookOpen,
    title: "วิดีโอคอร์สเรียนคุณภาพสูง",
    desc: "ติดตามความคืบหน้าการเรียนแบบเรียลไทม์ เรียนซ้ำได้ไม่จำกัดจำนวนครั้ง",
  },
  {
    icon: ClipboardCheck,
    title: "ระบบข้อสอบจำลอง (Mock Exam)",
    desc: "ฝึกทำโจทย์พร้อมเฉลยละเอียด ทั้งโหมดฝึกฝนและโหมดจับเวลาสอบจริง",
  },
  {
    icon: ShieldCheck,
    title: "แจ้งชำระเงินง่าย อัปโหลดสลิป",
    desc: "แจ้งโอนเงินผ่านการอัปโหลดสลิป ระบบจัดการออเดอร์และประวัติการสั่งซื้อให้ครบในที่เดียว",
  },
  {
    icon: Smartphone,
    title: "เข้าใช้งานง่ายทุกอุปกรณ์",
    desc: "ล็อกอินด้วย LINE ได้ในคลิกเดียว รองรับมือถือ แท็บเล็ต และคอมพิวเตอร์",
  },
]

const testimonials = [
  {
    text: "การเรียนที่นี่ทำให้ผมเข้าใจวิชาฟิสิกส์มากขึ้นเยอะเลยครับ การมีภาพ 3D ประกอบทำให้จำได้แม่นขึ้นมาก",
    avatar:
      "https://lh3.googleusercontent.com/aida/AP1WRLth9u4RrvZxqpqXtd8y3uqNZAam5aSBGJRvwnD-pkbo4j6neO-HMyPR_MFtRmBOK9cRIrbWDcfG9I85bJs0Quo2Uu0LWjqiWGXImCoBoRWbW3icOhivSuENuLg-w9u9m8AY6ciEMDnl52ed1vbZaXQyvamMhakfnDQ2jIQ7UJkAH-uzXTpOkr55fyw3pIvQvf2bSCjgAHkhwhsao4ukrQS4wXq2xloFlve_dUk2TUQkKmqyPkcl6Jjr0A",
    name: "น้องกิตติภพ",
    role: "นักเรียน ม.6",
    span: false,
  },
  {
    text: "ติวเตอร์ใจดีมากค่ะ อธิบายจนเข้าใจ และสามารถเลือกเวลาเรียนเองได้ สะดวกกับช่วงใกล้สอบสุดๆ",
    avatar:
      "https://lh3.googleusercontent.com/aida/AP1WRLsx2_Hl3U-qBnqwYvXGRc1Kd-HEFgD_5Ab_U96_8cdhBK_sn-wtlpPGg56pc49khAfHVkbGclSpMsVVU1i0R7K3zBXmi3yYlKY1RTZpV2b6Qu5sjtLrCcs2IfKie_a4dMU8B5VpTG1Un40xptj_HnNTJQSIs5i49XAEsRj0gtzKXDCJHirBhb2Ga58UbgDuAsYapgfCAGJ-ugd1kvHgrVm7JLCd7HNMlBS5I8fUi-fgcqrWOSaI2Z75cZU",
    name: "น้องแพรวา",
    role: "นักเรียน ม.4",
    span: false,
  },
  {
    text: "ลูกชายพัฒนาคะแนนเลขขึ้นอย่างเห็นได้ชัด ขอบคุณที่ทำให้วิชาเลขไม่น่าเบื่อสำหรับเด็ก",
    avatar:
      "https://lh3.googleusercontent.com/aida/AP1WRLsKzeIRW7-5mj8hJVcNSS55eL1VU97nM1hF06w8MouzkVYs0ZX2Exesh2yXmx7atEg_s0te1FdcP72yT4EfTX-Nswjop2cQZlnZDGW7TjftUIx6aU3DLhoMlqWE5QdUldyHShxdZZBKdcO6mnIx0Obm9e9fMPveGjzqLIkH3KoIjeBzX2sZHyzKyykaACPYcN2U72uy24y9HCQ3zSbgIneIFysx7P5TciGLBXdsbz1qdglis-mxxyVaLw",
    name: "คุณแม่นิสา",
    role: "ผู้ปกครอง",
    span: true,
  },
]

const faqItems = [
  {
    q: "เรียนผ่านช่องทางไหนได้บ้าง?",
    a: "เรียนผ่านเบราว์เซอร์ได้ทั้งคอมพิวเตอร์ แท็บเล็ต และสมาร์ทโฟน โดยไม่ต้องติดตั้งโปรแกรมเพิ่มเติม",
  },
  {
    q: "ดูตัวอย่างคอร์สก่อนตัดสินใจซื้อได้ไหม?",
    a: "ได้ ทุกคอร์สมีวิดีโอแนะนำให้รับชมก่อน เพื่อดูสไตล์การสอนและเนื้อหาก่อนตัดสินใจ",
  },
  {
    q: "เรียนซ้ำได้กี่ครั้ง มีวันหมดอายุไหม?",
    a: "เข้าถึงบทเรียนได้ตามระยะเวลาที่กำหนดในแต่ละคอร์ส ดูวิดีโอซ้ำได้ไม่จำกัดจำนวนครั้งภายในช่วงเวลานั้น",
  },
  {
    q: "มีข้อสอบให้ฝึกทำไหม?",
    a: "มีระบบข้อสอบจำลอง (Mock Exam) ทั้งโหมดฝึกฝนพร้อมเฉลยและโหมดจับเวลาสอบจริง ให้ฝึกก่อนสอบจริงได้",
  },
  {
    q: "ชำระเงินอย่างไร ใช้เวลานานแค่ไหน?",
    a: "ชำระผ่านการโอนเงินแล้วอัปโหลดสลิป ระบบจะดำเนินการตรวจสอบและปลดล็อกคอร์สให้หลังยืนยันการชำระเงิน",
  },
]

export function HomeClient() {
  const [popularCourses, setPopularCourses] = useState<ApiCourse[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await http.get("/api/courses?limit=3")
        const list: ApiCourse[] = res.data?.data || []
        if (!cancelled) setPopularCourses(list)
      } catch {
        if (!cancelled) setPopularCourses([])
      } finally {
        if (!cancelled) setLoadingCourses(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative px-4 md:px-16 py-20 max-w-7xl mx-auto overflow-visible">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative z-10">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs tracking-wide mb-6 border border-primary/20">
              เรียน ฝึกโจทย์ และสอบ ครบในระบบเดียว
            </span>
            <h1 className="font-black text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-8 text-foreground">
              เรียนรู้ <span className="text-primary">ก้าวกระโดด</span>
              <br />
              ไปกับระบบเรียนออนไลน์ครบวงจร
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
              เรียนผ่านวิดีโอคุณภาพสูง ฝึกทำโจทย์ด้วยข้อสอบจำลองไม่จำกัดจำนวนครั้ง
              พร้อมระบบจัดการคอร์สเรียนและออเดอร์ครบในที่เดียว
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/courses"
                className="btn-3d-primary text-white px-8 py-4 rounded-2xl text-lg font-semibold flex items-center gap-2"
              >
                เริ่มเรียนเลยวันนี้
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/courses"
                className="glass-card px-8 py-4 rounded-2xl text-lg font-semibold flex items-center gap-2 border border-border/30 hover:bg-white transition-all shadow-sm"
              >
                ดูคอร์สเรียน
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-20 floating-anim">
              <div className="p-4 bg-white rounded-[2rem] shadow-2xl rotate-3 card-3d">
                <img
                  className="w-full h-[500px] object-cover rounded-[1.5rem]"
                  alt="ติวเตอร์ tawan.dev กำลังสอนเขียนโปรแกรม JavaScript ให้นักเรียน"
                  src="/a314377b-6cf4-42f4-9004-f71d59ea6d70.png"
                />
              </div>

              <div className="absolute -top-10 -left-10 glass-card p-6 rounded-2xl shadow-xl z-30 card-3d">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">2,500+</div>
                    <div className="text-xs text-muted-foreground">นักเรียนไว้วางใจ</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 glass-card p-6 rounded-2xl shadow-xl z-30 card-3d">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <BadgeCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">95%</div>
                    <div className="text-xs text-muted-foreground">ความพึงพอใจ</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted py-20 px-4 md:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-3d bg-white p-10 rounded-3xl text-center border border-border/50">
            <h3 className="text-5xl font-black text-primary mb-2">2,500+</h3>
            <p className="text-lg text-muted-foreground">นักเรียนที่ไว้วางใจเรียนกับเรา</p>
          </div>
          <div className="card-3d bg-white p-10 rounded-3xl text-center border border-border/50">
            <h3 className="text-5xl font-black text-primary mb-2">10+</h3>
            <p className="text-lg text-muted-foreground">วิชาที่ครอบคลุมทุกระดับชั้น</p>
          </div>
          <div className="card-3d bg-white p-10 rounded-3xl text-center border border-border/50">
            <h3 className="text-5xl font-black text-primary mb-2">95%</h3>
            <p className="text-lg text-muted-foreground">นักเรียนพึงพอใจกับระบบเรียนของเรา</p>
          </div>
        </div>
      </section>

      {/* Platform Intro / Features */}
      <section className="py-20 px-4 md:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-black text-3xl md:text-4xl mb-4 text-foreground">
            ทำไมต้องเรียนกับ<span className="text-primary">ระบบของเรา</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            แพลตฟอร์มที่ออกแบบมาเพื่อการเรียนออนไลน์โดยเฉพาะ ใช้งานง่าย ครบทุกฟีเจอร์ที่นักเรียนต้องการ
          </p>
        </div>
        <div className="card-3d bg-white rounded-[3rem] border border-border/20 shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-2 items-center">
            <div className="relative h-full min-h-[400px] overflow-hidden">
              <img
                src="/a314377b-6cf4-42f4-9004-f71d59ea6d70.png"
                alt="ภาพรวมระบบเรียนออนไลน์ tawan.dev"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            <div className="p-10 lg:p-16 flex flex-col gap-6">
              <div>
                <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs mb-4 border border-primary/20">
                  ระบบเรียนออนไลน์ครบวงจร
                </span>
                <h3 className="font-black text-3xl mb-2 text-foreground">พร้อมทุกเครื่องมือ ในที่เดียว</h3>
                <p className="text-primary font-bold text-lg">
                  ตั้งแต่เรียน ฝึกทำโจทย์ ไปจนถึงชำระเงิน จบในระบบเดียว
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                {platformFeatures.map((f) => (
                  <div key={f.title} className="flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-sm">{f.title}</div>
                      <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  href="/courses"
                  className="btn-3d-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 w-fit"
                >
                  เริ่มต้นใช้งานฟรี
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses - Bento Grid Style */}
      <section className="py-20 px-4 md:px-16 bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-black text-3xl md:text-4xl mb-4 text-foreground">คอร์สยอดนิยม</h2>
              <p className="text-lg text-muted-foreground">เริ่มต้นเส้นทางความสำเร็จกับวิชาหลักที่เข้มข้น</p>
            </div>
            <Link href="/courses" className="font-bold text-primary flex items-center gap-2 group">
              ดูทั้งหมด
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loadingCourses ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl bg-white border border-border/20 h-[420px] animate-pulse" />
              ))}
            </div>
          ) : popularCourses.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">ยังไม่มีคอร์สในระบบขณะนี้</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {popularCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 md:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-black text-3xl md:text-4xl mb-4 text-foreground">
            เสียงตอบรับจาก <span className="text-primary">นักเรียน</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className={`card-3d bg-white p-8 rounded-3xl border border-border/10 shadow-lg flex flex-col gap-4 ${
                t.span ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="flex gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground italic flex-grow">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-4 pt-4 border-t border-border/10">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 md:px-16 bg-muted">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-black text-2xl md:text-3xl mb-12 text-center text-foreground">
            คำถามที่พบบ่อย (FAQ)
          </h2>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.q}
                className="group bg-white rounded-2xl border border-border/20 shadow-sm overflow-hidden"
              >
                <summary className="flex justify-between items-center gap-4 p-6 cursor-pointer font-bold text-foreground list-none hover:bg-muted/60 transition-colors">
                  {item.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-180" />
                </summary>
                <div className="p-6 pt-0 text-muted-foreground border-t border-border/10">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-16">
        <div className="max-w-5xl mx-auto bg-[#1a1c1c] rounded-[3rem] p-12 text-center relative overflow-hidden card-3d">
          <div className="relative z-10">
            <h2 className="font-black text-3xl md:text-4xl text-white mb-6">พร้อมเริ่มเรียนหรือยัง?</h2>
            <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
              สมัครวันนี้ รับส่วนลด 20% สำหรับคอร์สแรกของคุณ
            </p>
            <Link
              href="/courses"
              className="btn-3d-primary text-white px-12 py-5 rounded-2xl text-2xl font-black inline-block"
            >
              สมัครสมาชิกฟรี
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
