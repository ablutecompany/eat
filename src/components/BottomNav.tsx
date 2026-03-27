'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import {
  CalendarDays,
  BookOpen,
  Leaf,
  ShoppingCart,
  Users,
  User,
} from 'lucide-react'

const TABS = [
  { id: 'plano', label: 'Plano', icon: CalendarDays },
  { id: 'receitas', label: 'Receitas', icon: BookOpen },
  { id: 'ingredientes', label: 'Ingredientes', icon: Leaf },
  { id: 'compras', label: 'Compras', icon: ShoppingCart },
  { id: 'agregado', label: 'Agregado', icon: Users },
  { id: 'perfil', label: 'Perfil', icon: User },
]

export default function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] glass border-t border-[#b0b2b1]/20 pb-safe z-50">
      <div className="flex items-center justify-around px-1 pt-2 pb-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.92 }}
              className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-[52px] rounded-2xl transition-all duration-200"
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#c5ebd7]'
                    : 'bg-transparent'
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.7}
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-[#446656]' : 'text-[#5d605f]'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-[#446656] font-semibold' : 'text-[#5d605f]'
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
