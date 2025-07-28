"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Clock,
  Shield,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Award,
  GraduationCap,
  Building2,
  Play,
  MessageCircle,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useAuth } from "@/providers/authContext"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import dynamic from "next/dynamic"
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false })

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speedDialOpen, setSpeedDialOpen] = useState(true)
  const { user, profile, loading, signOut, getDashboardPath } = useAuth()
  const router = useRouter();

  // Phone number for Pakistan (replace with actual number)
  const phoneNumber = "923001234567" // Format: 92 (Pakistan code) + 300 (mobile prefix) + 1234567
  const whatsappMessage = encodeURIComponent("Hello Dr. Tariq Ahmed, I would like to book an appointment.")

  const handlePhoneCall = () => {
    window.open(`tel:+${phoneNumber}`, "_self")
    setSpeedDialOpen(false)
  }

  const handleWhatsAppChat = () => {
    window.open(`https://wa.me/${phoneNumber}?text=${whatsappMessage}`, "_blank")
    setSpeedDialOpen(false)
  }

  console.log("Inside header loading", loading, "user", user, "profile", profile);

  // const handleSignOut = async () => {
  //   await signOut()
  //   setMobileMenuOpen(false)
  // }
  const handleSignOut = async () => {
    const { success } = await signOut();

    if (success) {
      router.refresh(); // Important for Next.js client cache
      router.push('/auth'); // Redirect to login
      toast.success("Signed out successfully");
    } else {
      toast.error("Sign out failed");
    }

    setMobileMenuOpen(false);
  };

  const getDashboardLabel = () => {
    switch (profile?.role) {
      case "admin":
        return "Admin Dashboard"
      case "doctor":
        return "Doctor Dashboard"
      default:
        return "My Dashboard"
    }
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const availability = [
    { day: "Monday", time: "9:00 AM - 12:00 PM, 4:00 PM - 7:00 PM" },
    { day: "Tuesday", time: "9:00 AM - 12:00 PM, 4:00 PM - 7:00 PM" },
    { day: "Wednesday", time: "9:00 AM - 12:00 PM, 4:00 PM - 7:00 PM" },
    { day: "Thursday", time: "9:00 AM - 12:00 PM, 4:00 PM - 7:00 PM" },
    { day: "Friday", time: "9:00 AM - 12:00 PM, 4:00 PM - 7:00 PM" },
    { day: "Saturday", time: "9:00 AM - 1:00 PM" },
    { day: "Sunday", time: "Closed" },
  ]


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}

      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-blue-100 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-4 xl:px-8 mx-auto">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <motion.div
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Dr</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Dr. Tariq Ahmed</h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Pediatric Specialist</p>
                </div>
              </motion.div>

              {/* Desktop Navigation */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="hidden md:flex items-center space-x-4"
              >
                <ThemeToggle />
                {loading ? (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-32 rounded"></div>
                ) : user && profile ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 dark:text-gray-300 hidden lg:block">
                      Welcome, {user.email?.split("@")[0]}
                    </span>
                    <Link href={getDashboardPath(profile.role)}>
                      <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-sm">
                        {getDashboardLabel()}
                      </Button>
                    </Link>
                    <Button variant="outline" onClick={handleSignOut} size="sm">
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/auth">
                      <Button variant="outline" size="sm" className="bg-transparent">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/book">
                      <Button
                        className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                        size="sm"
                      >
                        Book Now
                      </Button>
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center space-x-2">
                <ThemeToggle />
                <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-6 w-5" />}
                </Button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="pt-4 space-y-3">
                  {user && profile ? (
                    <>
                      <div className="text-sm text-gray-600 dark:text-gray-300 px-2">
                        Welcome, {user.email?.split("@")[0]}
                      </div>
                      <Link href={getDashboardPath(profile.role)} onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 my-1.5">
                          {getDashboardLabel()}
                        </Button>
                      </Link>
                      <Button variant="outline" onClick={handleSignOut} className="w-full bg-transparent my-1.5">
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full bg-transparent my-1.5">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/book" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 my-1.5">
                          Book Now
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center justify-items-center max-w-7xl mx-auto lg:px-8">
            {/* Content */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="order-1 text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="mb-4">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-700">
                  Pediatric Specialist
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white mb-6"
              >
                Your Child&apos;s Health,
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  {" "}
                  Our Priority
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6">
                Expert pediatric care with compassion and dedication. Book a consultation with Dr. Tariq Ahmed for your
                child&apos;s health needs.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex items-center space-x-2 mb-8 text-green-600 dark:text-green-400 justify-center lg:justify-start"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Available for appointments</span>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex justify-center lg:justify-start">
                {user && profile ? (
                  <Link href={profile.role === "patient" ? "/book" : getDashboardPath(profile.role)}>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      {profile.role === "patient" ? "Book Appointment" : getDashboardLabel()}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/book">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      Book Appointment
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                )}
              </motion.div>
            </motion.div>

            {/* Doctor Profile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="order-2 text-center"
            >
              {/* Animated Doctor Avatar */}
              <div className="relative mb-6">
                <div className="w-64 h-64 sm:w-80 sm:h-80 mx-auto bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-full flex items-center justify-center relative overflow-hidden">
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="text-8xl sm:text-9xl"
                  >
                    {/* 👨‍⚕️ */}
                    <Image
                      src="/dr-tariq-ahmad200200.png"
                      alt="Doctor Avatar"
                      width={200}
                      height={200}
                      className="rounded-full object-cover"
                      priority
                    />
                  </motion.div>

                  {/* Floating elements */}
                  <motion.div
                    animate={{
                      y: [0, -20, 0],
                      x: [0, 10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                    className="absolute top-4 right-4 text-2xl"
                  >
                    🩺
                  </motion.div>

                  <motion.div
                    animate={{
                      y: [0, 15, 0],
                      x: [0, -8, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                    className="absolute bottom-8 left-8 text-2xl"
                  >
                    💊
                  </motion.div>
                </div>
              </div>

              {/* Doctor Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="space-y-3 text-center"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Dr. Tariq Ahmed</h2>

                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">MBBS (Peshawar), FRCP (Glasgow)</span>
                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    <Award className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Assistant Professor of Pediatrics</span>
                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    <Building2 className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Khyber Teaching Hospital</span>
                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">15+ Years Experience</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How to Use Video Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              How to Book Your Appointment
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Watch this quick guide to learn how easy it is to book an appointment with Dr. Tariq Ahmed
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-3">
              {/* Video Container */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                
                <ReactPlayer
                  url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  width="100%"
                  height="100%"
                  playing={isPlaying}
                  controls
                  light={true}
                  pip
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  style={{ borderRadius: '16px' }}
                  config={{
                    youtube: {
                      playerVars: {
                        showinfo: 0,
                        modestbranding: 1,
                        rel: 0,
                        iv_load_policy: 3,
                        cc_load_policy: 0,
                        fs: 1,
                        disablekb: 0,
                        autoplay: 0,
                        mute: 0,
                        loop: 0,
                        controls: 1,
                        playsinline: 1,
                        origin: 'https://appointment-ms-xi.vercel.app',
                      },
                    },
                  }}
                />
                {!isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                    onClick={() => setIsPlaying(true)}
                  >
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="group relative">
                      {/* Outer ring */}
                      <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                        {/* Inner circle */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <Play className="h-6 w-6 text-white ml-1" fill="currentColor" />
                        </div>
                      </div>

                      {/* Pulse animation */}
                      <div className="absolute inset-0 rounded-full bg-white/10 animate-ping"></div>
                    </motion.button>
                  </motion.div>
                )}
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-2 -left-2 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-green-400/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-2 -right-2 w-32 h-32 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-xl"></div>
            </div>

            {/* Video features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
            >
              {[
                {
                  icon: "🎯",
                  title: "Step-by-Step Guide",
                  description: "Easy to follow instructions for booking",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  icon: "⚡",
                  title: "Quick Process",
                  description: "Book your appointment in under 2 minutes",
                  color: "from-green-500 to-green-600",
                },
                {
                  icon: "📱",
                  title: "Mobile Friendly",
                  description: "Works perfectly on all devices",
                  color: "from-purple-500 to-purple-600",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="relative mb-4">
                    <div
                      className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
                    >
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Why Choose Dr. Tariq Ahmed?</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Specialized pediatric care with years of experience and dedication to children&apos;s health and wellbeing.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Easy Booking",
                description: "Book appointments for your children quickly and conveniently",
              },
              {
                icon: Clock,
                title: "Flexible Hours",
                description: "Extended clinic hours to accommodate busy family schedules",
              },
              {
                icon: Shield,
                title: "Expert Care",
                description: "Specialized pediatric expertise with compassionate treatment",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Availability Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Clinic Hours</h2>
            <p className="text-gray-600 dark:text-gray-300">Our weekly availability for appointments</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {availability.map((slot, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          <td className="py-4 px-6 font-medium text-gray-800 dark:text-white">{slot.day}</td>
                          <td
                            className={`py-4 px-6 text-right text-sm ${slot.time === "Closed" ? "text-red-500" : "text-gray-600 dark:text-gray-300"}`}
                          >
                            {slot.time}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Speed Dial Buttons */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex flex-col items-end space-y-2">
          {/* Speed Dial Options */}
          <AnimatePresence>
            {speedDialOpen && (
              <>
                {/* WhatsApp Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0, y: 20 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  onClick={handleWhatsAppChat}
                  className="group relative"
                >
                  <div className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute right-14 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    WhatsApp
                  </div>
                </motion.button>

                {/* Phone Call Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0, y: 20 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  onClick={handlePhoneCall}
                  className="group relative"
                >
                  <div className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                    <Phone className="h-5 w-5" />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute right-14 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Call Now
                  </div>
                </motion.button>
              </>
            )}
          </AnimatePresence>

          {/* Main Speed Dial Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSpeedDialOpen(!speedDialOpen)}
            className={`w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${speedDialOpen
              ? "bg-red-500 hover:bg-red-600 rotate-45"
              : "bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              }`}
          >
            <Plus className="h-5 w-5 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Grid with left-aligned content on large screens */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
              {/* Doctor Info */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">Dr</span>
                  </div>
                  <span className="text-xl font-bold">Dr. Tariq Ahmed</span>
                </div>
                <p className="text-gray-400 max-w-xs">
                  Providing specialized pediatric care with over 15 years of experience at Khyber Teaching Hospital.
                </p>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
                <div className="space-y-2 text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>(091) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span>dr.tariq@kth.edu.pk</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="max-w-xs">
                      Khyber Teaching Hospital, Peshawar
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <div className="space-y-2">
                  {user && profile ? (
                    <>
                      <Link
                        href={getDashboardPath(profile.role)}
                        className="block text-gray-400 hover:text-white transition-colors"
                      >
                        {getDashboardLabel()}
                      </Link>
                      {profile.role === "patient" && (
                        <Link
                          href="/book"
                          className="block text-gray-400 hover:text-white transition-colors"
                        >
                          Book Appointment
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="block text-gray-400 hover:text-white transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/book"
                        className="block text-gray-400 hover:text-white transition-colors"
                      >
                        Book Appointment
                      </Link>
                      <Link
                        href="/auth"
                        className="block text-gray-400 hover:text-white transition-colors"
                      >
                        Patient Portal
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400 text-sm">
              <p>&copy; 2024 Dr. Tariq Ahmed - Pediatric Specialist. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>



    </div>
  )
}
