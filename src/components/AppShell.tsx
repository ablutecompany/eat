'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import BottomNav from './BottomNav'
import TopAppBar from './TopAppBar'
import Toast from './Toast'

// Screens
import PlanScreen from './screens/PlanScreen'
import RecipesScreen from './screens/RecipesScreen'
import IngredientsScreen from './screens/IngredientsScreen'
import ShoppingScreen from './screens/ShoppingScreen'
import HouseholdScreen from './screens/HouseholdScreen'
import ProfileScreen from './screens/ProfileScreen'

const SCREENS: Record<string, React.ComponentType> = {
  plano: PlanScreen,
  receitas: RecipesScreen,
  ingredientes: IngredientsScreen,
  compras: ShoppingScreen,
  agregado: HouseholdScreen,
  perfil: ProfileScreen,
}

export default function AppShell() {
  const { activeTab } = useAppStore()
  const ActiveScreen = SCREENS[activeTab] || PlanScreen

  return (
    <div className="fixed inset-0 flex flex-col bg-[#faf9f8]" style={{ maxWidth: 430, margin: '0 auto' }}>
      <TopAppBar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="min-h-full pb-28"
          >
            <ActiveScreen />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
      <Toast />
    </div>
  )
}
