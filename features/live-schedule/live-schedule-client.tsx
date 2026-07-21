"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Users, Clock, Video, ImageIcon, Radio } from "lucide-react"
import { useIntroVideo } from "@/hooks/use-intro-video"
import { usePostSummaries } from "@/hooks/use-post-summaries"
import { ContactLineButton } from "@/components/contact-line-button"

export function LiveScheduleClient() {
  const { videoSrc, loadingVideo, videoEnded, videoReloadKey, iframeRef, showVideoSection, handleRetryVideo } = useIntroVideo(
    "วิดีโอรอบสด",
    { autoplay: true }
  )
  const { summaries, loadingSummaries } = usePostSummaries("ภาพสรุป-รอบสด")

  return (
    <section className="min-h-screen bg-gradient-to-br from-background to-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
            ตารางรอบสด
            <span className="text-primary">, ถ่ายทอดสด</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            รอบเรียนสด (Onsite/Online) และรายละเอียดการสมัคร พร้อมติดตามการเรียนแบบเรียลไทม์
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Video className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">ถ่ายทอดสดคุณภาพ HD</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">เรียนแบบ Interactive</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">ตารางเรียนยืดหยุ่น</span>
            </div>
          </div>
        </div>

        {showVideoSection && (
          <div className="mb-12 flex items-center justify-center">
            <div className="bg-card w-200 rounded-2xl shadow-lg p-0 border border-border">
              <div className="aspect-video rounded-xl overflow-hidden ">
                {loadingVideo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      <p className="text-white/80 text-sm">กำลังโหลดวิดีโอ...</p>
                    </div>
                  </div>
                )}
                {videoSrc && (
                  <iframe
                    key={videoReloadKey}
                    ref={iframeRef}
                    src={videoSrc}
                    className="w-full h-full transition-opacity duration-300"
                    allowFullScreen
                    referrerPolicy="no-referrer"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    title="วิดีโอรอบสด"
                  />
                )}
                {videoSrc && videoEnded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/85 text-white px-6 text-center">
                    <div className="space-y-2">
                      <p className="text-lg font-semibold">ชมวิดีโอตัวอย่างจบแล้ว</p>
                      <p className="text-sm text-white/80">กดปุ่มด้านล่างเพื่อชมซ้ำ</p>
                    </div>
                    <Button onClick={handleRetryVideo} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      ดูอีกครั้ง
                    </Button>
                  </div>
                )}
                {!videoSrc && !loadingVideo && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/90 text-center">
                    <div>
                      <Video className="w-16 h-16 text-white/70 mx-auto mb-4" />
                      <p className="text-lg font-medium">ไม่พบวิดีโอแนะนำรอบสด</p>
                      <p className="text-sm text-white/70 mt-2">กรุณาลองใหม่อีกครั้งในภายหลัง</p>
                    </div>
                  </div>
                )}
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 mt-2">
                  <Radio className="w-4 h-4" />
                  ถ่ายทอดสดจากโรงเรียน
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-12">
          {loadingSummaries ? (
            <div className="relative w-full aspect-[283/400] bg-gradient-to-br from-muted to-muted rounded-2xl animate-pulse border border-border" />
          ) : summaries.length ? (
            <div className="grid grid-cols-1 gap-6">
              {summaries.map((item) => (
                <Card key={item.id} className="overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl py-0">
                  <CardContent className="p-0">
                    <div className="relative w-full aspect-[283/400] bg-background">
                      {item.desktop && (
                        <Image
                          src={item.desktop}
                          alt={item.title || "summary"}
                          fill
                          className="object-contain hidden md:block"
                        />
                      )}
                      {item.mobile ? (
                        <Image
                          src={item.mobile}
                          alt={item.title || "summary"}
                          fill
                          className="object-contain md:hidden"
                        />
                      ) : !item.desktop ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted">
                          <ImageIcon className="w-12 h-12 text-muted-foreground" />
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg font-medium">ไม่มีภาพสรุปรอบสด</p>
              <p className="text-muted-foreground text-sm mt-2">กรุณาลองใหม่อีกครั้งในภายหลัง</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-2xl p-8 text-primary-foreground shadow-xl">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-2">พร้อมเริ่มเรียนแล้วใช่ไหม?</h3>
              <p className="text-primary-foreground/90 mb-6 text-lg">
                ติดต่อสมัครเรียนผ่าน LINE ได้เลย ทีมงานพร้อมให้คำปรึกษาและแนะนำคอร์สที่เหมาะกับคุณ
              </p>
              <ContactLineButton
                label="ติดต่อสมัครเรียนทาง LINE"
                className="cursor-pointer bg-[#06C755] hover:bg-[#05b24c] text-white rounded-2xl px-10 py-4 font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              />
              <div className="flex flex-wrap justify-center gap-6 mt-6 text-primary-foreground/90 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>ตอบกลับเร็ว</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>คำปรึกษาฟรี</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>บริการตลอดเวลา</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
