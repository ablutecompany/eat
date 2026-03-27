'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import AppShell from '@/components/AppShell'
import Onboarding from '@/components/Onboarding'

export default function HomePage() {
  const { onboardingComplete } = useAppStore()

  useEffect(() => {
    // Prevent body scroll on mobile
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!onboardingComplete) {
    return <Onboarding />
  }

  return <AppShell />
}
