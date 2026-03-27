'use client'

import { useAppStore } from '@/lib/store'

const TAB_TITLES: Record<string, string> = {
  plano: 'Plano desta semana',
  receitas: 'Receitas',
  ingredientes: 'Ingredientes',
  compras: 'Lista de Compras',
  agregado: 'Agregado',
  perfil: 'Perfil',
}

export default function TopAppBar() {
  const { activeTab, household } = useAppStore()

  return (
    <header className="sticky top-0 z-40 glass border-b border-[#b0b2b1]/15 px-5 pt-safe">
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-display font-bold text-[#446656] tracking-tight">eat</span>
          <span className="text-xs text-[#5d605f] bg-[#c5ebd7] px-2 py-0.5 rounded-full font-medium">
            {household.name}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#c5ebd7] flex items-center justify-center text-[#446656] font-bold text-sm">
          CS
        </div>
      </div>
    </header>
  )
}
