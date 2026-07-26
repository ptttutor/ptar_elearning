// Central branding config for this template.
// Change the values here to re-brand the whole site for a new tutor/school —
// do not hardcode names, contact info, or social links anywhere else.

export const siteConfig = {
  // Short name used in nav/footer headings and page title suffixes
  siteName: "เคมีพี่ต้า",
  // Full institute name shown in footer / about / metadata descriptions
  fullName: "โรงเรียนกวดวิชาเคมีพี่ต้า",
  englishName: "Chemistry P'Tar",
  tagline: "แพลตฟอร์มการเรียนรู้ออนไลน์",
  subtitle: "(แพลตฟอร์มการเรียนรู้สำหรับทุกคน)",
  defaultDescription: "โรงเรียนกวดวิชาเคมีพี่ต้า คอร์สเรียนเคมี ม.ต้น-ม.ปลาย พร้อมข้อสอบและบทความ",
  keywords: "โรงเรียนกวดวิชาเคมีพี่ต้า",

  logo: "/new-logo.png",

  contact: {
    email: "tihcuna888@gmail.com",
    address: "สำนักงานใหญ่ : กรุงเทพมหานคร ประเทศไทย",
    hours: {
      vacation: "เปิดให้บริการ 24/7 ออนไลน์",
      semester: "เปิดให้บริการ 24/7 ออนไลน์",
    },
  },

  social: {
    lineUrl: "https://line.me/ti/p/sjYGzkVGDL",
    links: [
      {
        platform: "YouTube",
        username: "เคมี พี่ต้า",
        url: "https://www.youtube.com/@Chemistar",
      },
      {
        platform: "Instagram",
        username: "Chem_istar",
        url: "https://www.instagram.com/chem_istar?igsh=eXRrMzA3c3N6bnV4",
      },
      {
        platform: "Facebook",
        username: "เคมี พี่ต้า online",
        url: "https://www.facebook.com/komkaiChemistry/?locale=th_TH",
      },
      {
        platform: "Line",
        username: "chemistar518",
        url: "https://line.me/ti/p/sjYGzkVGDL",
      },
    ],
  },

  copyrightHolder: "โรงเรียนกวดวิชาเคมีพี่ต้า",
} as const

// Convenience helper for page metadata: "หัวข้อ | ชื่อไซต์"
export function pageTitle(title: string) {
  return `${title} | ${siteConfig.siteName}`
}
