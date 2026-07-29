// Central branding config for this template.
// Change the values here to re-brand the whole site for a new tutor/school —
// do not hardcode names, contact info, or social links anywhere else.

export const siteConfig = {
  // Short name used in nav/footer headings and page title suffixes
  siteName: "Tawan.dev",
  // Full institute name shown in footer / about / metadata descriptions
  fullName: "White-Label E-Learning Platform",
  englishName: "Tawan.dev",
  tagline: "White-Label E-Learning Platform",
  subtitle: "(เดโมเว็บไซต์เรียนออนไลน์สำหรับติวเตอร์/โรงเรียนกวดวิชา)",
  defaultDescription: "ตัวอย่างเว็บไซต์เรียนออนไลน์ (Template Demo) พัฒนาโดย Tawan.dev พร้อมระบบคอร์สเรียน ข้อสอบจำลอง และร้านหนังสือออนไลน์",
  keywords: "Tawan.dev, เว็บไซต์เรียนออนไลน์, e-learning template, ระบบคอร์สเรียนออนไลน์",

  logo: "/tawan-logo.png",

  contact: {
    email: "khumta15176@gmail.com",
    address: "กรุงเทพมหานคร ประเทศไทย",
    hours: {
      vacation: "เปิดให้บริการ 24/7 ออนไลน์",
      semester: "เปิดให้บริการ 24/7 ออนไลน์",
    },
  },

  social: {
    lineUrl: "https://line.me/ti/p/~jykkb123",
    links: [
      {
        platform: "Website",
        username: "tawan.dev",
        url: "https://www.tawan.dev",
      },
      {
        platform: "Line",
        username: "jykkb123",
        url: "https://line.me/ti/p/~jykkb123",
      },
    ],
  },

  copyrightHolder: "tawan.dev",
} as const

// Convenience helper for page metadata: "หัวข้อ | ชื่อไซต์"
export function pageTitle(title: string) {
  return `${title} | ${siteConfig.siteName}`
}
