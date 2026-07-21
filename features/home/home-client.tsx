"use client"

import { motion } from "framer-motion"
import HeroBanner from "@/components/sections/hero-banner"
import AboutTeacher from "@/components/sections/about-teacher"
import StudentSuccess from "@/components/sections/student-success"
import CourseStripes from "@/components/sections/course-stripes"
import Reviews from "@/components/sections/reviews"
import Articles from "@/components/sections/articles"
import TeachingVideos from "@/components/sections/teaching-videos"
import ViewOfTeaching from "@/components/sections/view-of-teaching"
import RecommendedCourses from "@/components/sections/recommended-courses"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
}

export function HomeClient() {
  return (
    <motion.div
      className="min-h-screen bg-white"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <HeroBanner />

      <motion.div variants={fadeInUp}>
        <AboutTeacher />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <ViewOfTeaching />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <StudentSuccess />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <CourseStripes />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Reviews />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <RecommendedCourses />
      </motion.div>
      <motion.div variants={fadeInUp}>
        <Articles />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <TeachingVideos />
      </motion.div>
    </motion.div>
  )
}
