"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { ArrowLeft, Mail, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/authContext"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"email" | "otp" | "success">("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const { user, profile, loading: authLoading, signInWithOtp, verifyOtp, getDashboardPath } = useAuth()

  // Check if user is already signed in
  // useEffect(() => {
  //   if (!authLoading && user && profile) {
  //     router.push(getDashboardPath(profile.role))
  //   }
  // }, [user, profile, authLoading, router, getDashboardPath])

  useEffect(() => {
  if (!authLoading && user && profile) {
    // Only redirect if we are on success step (after OTP verification)
    if (step === "success") {
      router.push(getDashboardPath(profile.role))
    } else if (user){
      // If user is already logged in and not on success step, redirect to dashboard
      router.push(getDashboardPath(profile.role))
    }
  }
}, [user, profile, authLoading, step, router, getDashboardPath])


  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signInWithOtp(email)
    setLoading(false)

    if (result.success) {
      setStep("otp")
      // setLoading(false)
    } else {
      setError(result.error || "Failed to send OTP")
      // setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await verifyOtp(email, otp)
    setLoading(false)

    if (result.success) {
      setStep("success")
      // setLoading(false)
      // Redirect will be handled by the auth state change
      // setTimeout(() => {
      //   if (user && profile) {
      //     router.push(getDashboardPath(profile.role))
      //   }
      // }, 2000)
    } else {
      setError(result.error || "Authentication failed. Please try again.")
      // setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              {step === "email" && <Mail className="h-8 w-8 text-white" />}
              {step === "otp" && <Shield className="h-8 w-8 text-white" />}
              {step === "success" && <CheckCircle className="h-8 w-8 text-white" />}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
              {step === "email" && "Sign In"}
              {step === "otp" && "Verify Code"}
              {step === "success" && "Success!"}
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              {step === "email" && "Enter your email to receive a verification code"}
              {step === "otp" && "Enter the 6-digit code sent to your email"}
              {step === "success" && "Authentication successful! Redirecting..."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-4"
              >
                {error}
              </motion.div>
            )}

            {step === "email" && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="dark:text-white">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Test Accounts:</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">• admin@drjohnson.com (Admin access)</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">• doctor@drjohnson.com (Doctor access)</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">• Any other email (Patient access)</p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </Button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <Label htmlFor="otp" className="dark:text-white">
                    Verification Code
                  </Label>
                  <div className="mt-2 flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">Code sent to {email}</p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </Button>

                <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("email")}>
                  Use different email
                </Button>
              </form>
            )}

            {step === "success" && (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                </div>
                <p className="text-gray-600 dark:text-gray-300">Redirecting to your dashboard...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
