import Link from "next/link";
import { Mail, MapPin, Clock } from "lucide-react";
import { SiFacebook, SiInstagram, SiTiktok, SiLine, SiYoutube } from "react-icons/si";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <SiFacebook className="w-6 h-6" />;
      case "instagram":
        return <SiInstagram className="w-6 h-6" />;
      case "line":
        return <SiLine className="w-6 h-6" />;
      case "tiktok":
        return <SiTiktok className="w-6 h-6" />;
        case "youtube":
        return <SiYoutube className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const socialLinks = siteConfig.social.links;

  const contactInfo = {
    email: siteConfig.contact.email,
    schoolName: siteConfig.fullName,
    subtitle: siteConfig.subtitle,
    address: siteConfig.contact.address,
    hours: siteConfig.contact.hours,
  };

  return (
    <footer className="bg-background text-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                <img src={siteConfig.logo} alt="Logo" className="w-full h-full" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {siteConfig.fullName}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {siteConfig.tagline}
                </p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed max-w-md">
              {contactInfo.schoolName} <br /> {contactInfo.subtitle} <br />{" "}
              พร้อมให้บริการการเรียนการสอนออนไลน์ที่มีคุณภาพ
              เพื่อให้ผู้เรียนประสบความสำเร็จในการศึกษา
            </p>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-foreground">
                ติดตามเราได้ที่
              </h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <Link
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-muted hover:bg-primary text-muted-foreground hover:text-primary-foreground rounded-lg flex items-center justify-center transition-colors duration-200 group"
                  >
                    <span>{getSocialIcon(social.platform)}</span>
                  </Link>
                ))}
              </div>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                {socialLinks.map((social) => (
                  <div key={social.platform}>
                    <span className="font-medium">{social.platform}:</span>{" "}
                    {social.username}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-foreground">
              ข้อมูลติดต่อ
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">อีเมล</p>
                  <p className="text-muted-foreground text-sm">
                    {contactInfo.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">ที่อยู่</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {contactInfo.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-foreground">
              เวลาให้บริการ
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-foreground">ออนไลน์</p>
                  <p className="text-muted-foreground text-sm">
                    {contactInfo.hours.vacation}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-foreground">
                    สนับสนุน
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {contactInfo.hours.semester}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-medium transition-colors duration-200 cursor-pointer hover:font-bold">
                <Link href={siteConfig.social.lineUrl} target="_blank" rel="noopener noreferrer">
                  ติดต่อเราเลย
                </Link>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm">
              Copyright © 2025 {contactInfo.schoolName} | All Rights Reserved
            </p>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors duration-200"
              >
                นโยบายความเป็นส่วนตัว
              </Link>
              <Link
                href="/terms"
                className="hover:text-primary transition-colors duration-200"
              >
                ข้อกำหนดการใช้งาน
              </Link>
              <Link
                href="/admin"
                className="hover:text-primary transition-colors duration-200"
              >
                จัดการหลังบ้าน
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
