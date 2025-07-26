// app/dashboard/patient/layout.tsx
import { Suspense } from 'react'
import LoadingSkeleton from '@/components/LoadingSkeleton'

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      {children}
    </Suspense>
  )
}