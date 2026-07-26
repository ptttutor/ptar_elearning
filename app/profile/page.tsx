import { ProfileHomeClient } from "@/features/profile-home/profile-home-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("โปรไฟล์"),
}

export default function ProfilePage() {
  return <ProfileHomeClient />
}
