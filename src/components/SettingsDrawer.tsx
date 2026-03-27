'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Users, CreditCard, ChevronRight, LogOut } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export default function SettingsDrawer() {
  const { isSettingsOpen, setSettingsOpen, household, setActiveTab } = useAppStore()

  if (!isSettingsOpen) return null

  const menuItems = [
    { id: 'perfil', label: 'Perfil Pessoal', icon: <User size={20} />, tab: 'perfil' },
    { id: 'agregado', label: 'Agregado Familiar', icon: <Users size={20} />, tab: 'agregado' },
    { id: 'pagamentos', label: 'Pagamentos e Subscrição', icon: <CreditCard size={20} />, tab: 'perfil' }, // For now redir to profile or payment tab if exists
  ]

  const handleNavigate = (tab: string) => {
    setActiveTab(tab)
    setSettingsOpen(false)
  }

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSettingsOpen(false)}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[300px] bg-[#faf9f8] z-[60] shadow-2xl flex flex-col"
          >
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-display font-bold text-[#303333]">Definições</h2>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f3f4f3] text-[#5d605f]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* User summary */}
              <div className="bg-white rounded-3xl p-4 shadow-ambient mb-8 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#c5ebd7] flex items-center justify-center text-[#446656] font-bold text-sm">
                  {household.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-[#303333] leading-none mb-1">{household.name}</p>
                  <p className="text-xs text-[#5d605f]">ablute_ wellness · Ativo</p>
                </div>
              </div>

              {/* Menu */}
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.tab)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white shadow-ambient-sm active:scale-[0.98] transition-all"
                  >
                    <div className="text-[#446656]">{item.icon}</div>
                    <span className="flex-1 text-left font-medium text-[#303333] text-sm">{item.label}</span>
                    <ChevronRight size={16} className="text-[#b0b2b1]" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-[#b0b2b1]/15">
              <button className="w-full flex items-center gap-4 p-4 rounded-2xl text-[#a83836] font-medium text-sm active:scale-[0.98] transition-all">
                <LogOut size={20} />
                <span>Terminar sessão</span>
              </button>
              <p className="text-center text-[10px] text-[#b0b2b1] mt-4">
                eat v1.2.0 · ablute docs
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
