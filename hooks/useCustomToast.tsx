// hooks/useCompatibleToast.ts
"use client"

import { toast } from "sonner"

type ToastStatus = "success" | "error" | "info" | "warning"

interface CompatibleToastOptions {
  title: string
  description?: string
  status?: ToastStatus
  duration?: number
  isClosable?: boolean
}

export const useCustomToast = () => {
  return (options: CompatibleToastOptions) => {
    const { title, description, status = "info" } = options

    const toastFn = toast[status] || toast

    toastFn(title, {
      description,
      duration: options.duration,
    })
  }
}
