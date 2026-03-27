'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'

export default function TopAppBar() {
  const { activeTab, household, setActiveTab } = useAppStore()

  const initials = household.name
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Hide the top bar on the Perfil screen (it has its own header feel)
  if (activeTab === 'perfil') return null

  return (
    <header className="sticky top-0 z-40 glass border-b border-[#b0b2b1]/15 px-5 pt-safe">
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-display font-bold text-[#446656] tracking-tight">eat</span>
          <span className="text-xs text-[#5d605f] bg-[#c5ebd7] px-2 py-0.5 rounded-full font-medium">
            {household.name}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setActiveTab('perfil')}
          className="w-9 h-9 rounded-2xl bg-[#c5ebd7] flex items-center justify-center text-[#446656] font-bold text-sm shadow-ambient-sm"
        >
          {initials}
        </motion.button>
      </div>
    </header>
  )
}
