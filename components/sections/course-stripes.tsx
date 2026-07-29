"use client";

import Link from "next/link";
import { ArrowRight, Atom, FlaskConical, Beaker } from "lucide-react";

type Stripe = {
  title: string;
  highlight?: string;
  subtitle: string;
  paramTage: string;
  bg: string;

  ctaClass: string;

  accent: string;
};

const stripes: Stripe[] = [
  {
    title: "คอร์สเคมี",
    highlight: "NETSAT",
    paramTage: "NETSAT",
    subtitle: "(เตรียมสอบ NETSAT เคมี)",
    bg: "from-blue-50 via-white to-blue-50",
    ctaClass: "bg-[#2688DF] hover:bg-[#1f6fba] text-white",
    accent: "bg-[#2688DF]",
  },
  {
    title: "คอร์ส",
    highlight: "สอวน.เคมี",
    paramTage: "สอวน.เคมี",
    subtitle: "(โอลิมปิกวิชาการเคมี)",
    bg: "from-blue-50 via-white to-blue-50",
    ctaClass: "bg-[#2688DF] hover:bg-[#1f6fba] text-white",
    accent: "bg-[#2688DF]",
  },
  {
    title: "คอร์ส",
    highlight: "เนื้อหาเคมี",
    paramTage: "เนื้อหาเคมี",
    subtitle: "(เก็บเกรดและสอบเข้ามหาวิทยาลัย)",
    bg: "from-blue-50 via-white to-blue-50",
    ctaClass: "bg-[#2688DF] hover:bg-[#1f6fba] text-white",
    accent: "bg-[#2688DF]",
  },
];

export default function CourseStripes() {
  return (
    <section className="pt-0 pb-10 lg:pt-20 lg:pb-5 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl lg:text-2xl font-bold text-primary-foreground mb-2 text-balance bg-primary px-8 py-4 w-fit mx-auto rounded-full shadow-sm mb-4">
            คอร์สเรียนออนไลน์
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            เลือกแผนการเรียนให้เหมาะกับเป้าหมายของคุณ
          </p>
        </div>

        <div className="grid gap-5 md:gap-6">
          {stripes.map((s, idx) => (
            <Link
              key={idx}
              href={
                s.paramTage === "NETSAT"
                  ? "/courses/netsat-course"
                  : s.paramTage === "สอวน.เคมี"
                    ? "/courses/chemistry-olympiad-course"
                    : "/courses/chemistry-content-course"
              }
              aria-label={`${s.title} ${s.subtitle}`}
              className={`group relative overflow-hidden rounded-[28px] ring-1 ring-border bg-gradient-to-br ${s.bg} px-5 py-6 md:px-8 md:py-7 flex items-center justify-between hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center gap-4 md:gap-6">
                <div className="relative hidden sm:flex items-center justify-center h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-card/70 ring-1 ring-border shadow-sm">
                  <Atom className="h-7 w-7 text-primary" />
                  <FlaskConical className="h-5 w-5 text-accent-foreground absolute -bottom-1 -right-1" />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                    {s.title}{" "}
                    {s.highlight && (
                      <span
                        className={
                          s.accent === "bg-[#FEBE01]"
                            ? "text-accent-foreground"
                            : "text-primary"
                        }
                      >
                        {s.highlight}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-muted-foreground text-sm md:text-base">
                    {s.subtitle}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-colors ${s.ctaClass}`}
                >
                  คลิก
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>

              <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-card/40 blur-2xl opacity-60" />
              <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-card/30 blur-2xl opacity-40" />

              <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
                <svg
                  className="absolute right-6 top-1/2 -translate-y-1/2"
                  width="220"
                  height="120"
                  viewBox="0 0 220 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted-foreground"
                  >
                    <circle cx="30" cy="60" r="16" />
                    <path d="M28 44v-10M32 44v-10M22 72h16" />
                    <rect x="80" y="40" width="30" height="30" rx="4" />
                    <path d="M95 40v-14m0 44v14" />
                    <path d="M140 44l16 32 16-32" />
                    <circle cx="172" cy="78" r="6" />
                  </g>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
