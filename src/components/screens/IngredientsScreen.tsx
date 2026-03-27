'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { ArrowLeftRight, ThumbsDown, Trash2 } from 'lucide-react'

const FILTERS = ['Todos', 'Comuns', 'Específicos', 'Excluídos']

export default function IngredientsScreen() {
  const { ingredients, members, showToast } = useAppStore()
  const [activeFilter, setActiveFilter] = useState('Todos')

  const filtered = useMemo(() => {
    if (activeFilter === 'Todos') return ingredients
    if (activeFilter === 'Comuns') return ingredients.filter((i) => i.compatibilityType === 'comum')
    if (activeFilter === 'Específicos') return ingredients.filter((i) => i.compatibilityType === 'específico')
    if (activeFilter === 'Excluídos') return ingredients.filter((i) => i.compatibilityType === 'excluído')
    return ingredients
  }, [ingredients, activeFilter])

  const getMemberColor = (id: string) => members.find((m) => m.id === id)?.color || '#b0b2b1'
  const getMemberName = (id: string) => members.find((m) => m.id === id)?.name || ''

  return (
    <div className="px-5 pt-4">
      <h1 className="text-2xl font-display font-bold text-[#303333] mb-1">
        Ingredientes e Nutrientes
      </h1>
      <p className="text-sm text-[#5d605f] mb-4">Selecionados para o teu agregado</p>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 pb-1">
        {FILTERS.map((f) => (
          <motion.button
            key={f}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              activeFilter === f
                ? 'bg-[#446656] text-white'
                : 'bg-white text-[#5d605f] shadow-ambient'
            }`}
          >
            {f}
          </motion.button>
        ))}
      </div>

      {/* Ingredient list */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-ambient mb-6">
        {filtered.map((ingredient, i) => (
          <div key={ingredient.id}>
            <div className="flex items-center gap-3 px-4 py-4">
              {/* Emoji icon */}
              <div className="w-12 h-12 rounded-2xl bg-[#f3f4f3] flex items-center justify-center text-2xl shrink-0">
                {ingredient.emoji}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-[#303333] text-sm">{ingredient.name}</h3>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      ingredient.compatibilityType === 'comum'
                        ? 'bg-[#c5ebd7] text-[#446656]'
                        : ingredient.compatibilityType === 'específico'
                        ? 'bg-[#b7effb] text-[#2e6771]'
                        : 'bg-[#ffd7d6] text-[#a83836]'
                    }`}
                  >
                    {ingredient.compatibilityType === 'comum' ? 'Comum' : 
                     ingredient.compatibilityType === 'específico' ? 'Específico' : 'Excluído'}
                  </span>
                </div>
                <p className="text-xs text-[#5d605f] mb-1.5">{ingredient.portionLabel} ({ingredient.quantityBase})</p>
                
                <div className="flex items-center justify-between">
                  {/* Nutrient */}
                  <span className="text-xs text-[#6e5c44] font-medium bg-[#f8dfc0] px-2 py-0.5 rounded-full">
                    {ingredient.nutrientPrimary}
                  </span>
                  
                  {/* Member dots */}
                  <div className="flex items-center gap-1">
                    {ingredient.memberIds.map((mid) => (
                      <div
                        key={mid}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                        style={{ backgroundColor: getMemberColor(mid) }}
                        title={getMemberName(mid)}
                      >
                        {getMemberName(mid)[0]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 ml-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => showToast(`${ingredient.name} marcado para substituição`)}
                  className="w-7 h-7 flex items-center justify-center rounded-xl bg-[#f3f4f3] text-[#5d605f]"
                >
                  <ArrowLeftRight size={12} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => showToast(`Não gosto de ${ingredient.name} registado`)}
                  className="w-7 h-7 flex items-center justify-center rounded-xl bg-[#f3f4f3] text-[#5d605f]"
                >
                  <ThumbsDown size={12} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => showToast(`${ingredient.name} será substituído no próximo plano`)}
                  className="w-7 h-7 flex items-center justify-center rounded-xl bg-[#f3f4f3] text-[#5d605f]"
                >
                  <Trash2 size={12} />
                </motion.button>
              </div>
            </div>
            {i < filtered.length - 1 && (
              <div className="h-px bg-[#f3f4f3] mx-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
