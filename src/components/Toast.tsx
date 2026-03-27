'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { CheckCircle } from 'lucide-react'

export default function Toast() {
  const { toastMessage } = useAppStore()

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] max-w-[360px] w-[calc(100%-2rem)]"
        >
          <div className="flex items-center gap-3 bg-[#303333] text-white px-4 py-3 rounded-2xl shadow-ambient-md">
            <CheckCircle size={18} className="text-[#c5ebd7] shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
