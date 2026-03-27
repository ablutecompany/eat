'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Search, SlidersHorizontal, Plus } from 'lucide-react'
import RecipeDetailModal from '../RecipeDetailModal'

const FILTERS = ['Todos', 'Rápido', 'Vegetariano', 'Kids', 'Baixo Carboidrato', 'Sem Glúten', 'Alto em Proteína', 'Económico']
const FILTER_TAGS: Record<string, string> = {
  'Rápido': 'rápido',
  'Vegetariano': 'vegetariano',
  'Kids': 'kids',
  'Baixo Carboidrato': 'baixo-carboidrato',
  'Sem Glúten': 'sem-glúten',
  'Alto em Proteína': 'alto-em-proteína',
  'Económico': 'económico',
}

const COMPAT_colors: Record<string, string> = {
  'compatível': '#5aaa7a',
  'adaptado': '#2e6771',
  'incompatível': '#a83836',
}

export default function RecipesScreen() {
  const { recipes, members, currentPlan, showToast, addRecipeToNextFreeSlot } = useAppStore()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('Todos')
  const [viewRecipeId, setViewRecipeId] = useState<string | null>(null)

  const activeMembers = members.filter((m) => m.isActive)

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      const matchFilter = activeFilter === 'Todos' || r.tags.includes(FILTER_TAGS[activeFilter] || '')
      return matchSearch && matchFilter
    })
  }, [recipes, search, activeFilter])

  return (
    <div className="px-5 pt-4">
      <h1 className="text-2xl font-display font-bold text-[#303333] mb-1">Receitas</h1>
      <p className="text-sm text-[#5d605f] mb-4">Compatíveis com o teu agregado</p>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-3 py-2.5 shadow-ambient">
          <Search size={16} className="text-[#b0b2b1]" />
          <input
            type="text"
            placeholder="Procurar receitas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-[#303333] placeholder-[#b0b2b1]"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.94 }}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-2xl shadow-ambient text-[#5d605f]"
        >
          <SlidersHorizontal size={16} />
        </motion.button>
      </div>

      {/* Filter chips */}
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

      {/* Recipe grid */}
      <div className="grid grid-cols-2 gap-3 pb-6">
        {filtered.map((recipe, i) => {
          const compatCount = activeMembers.filter((m) => {
            const c = recipe.compatibilityByMember.find((cb) => cb.memberId === m.id)
            return c?.status === 'compatível'
          }).length
          const allCompat = compatCount === activeMembers.length
          const someCompat = compatCount > 0

          return (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-3xl overflow-hidden shadow-ambient cursor-pointer"
              onClick={() => setViewRecipeId(recipe.id)}
            >
              {/* Image */}
              <div className="relative h-36 overflow-hidden">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white font-display font-bold text-sm leading-tight">{recipe.title}</p>
                  <p className="text-white/70 text-xs">{recipe.durationMinutes} min</p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-3 py-2.5">
                {/* Member dots */}
                <div className="flex items-center gap-1 mb-2">
                  {activeMembers.map((m) => {
                    const c = recipe.compatibilityByMember.find((cb) => cb.memberId === m.id)
                    return (
                      <div
                        key={m.id}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold ring-2 ring-white"
                        style={{
                          backgroundColor: c?.status === 'incompatível' ? '#e1e3e2' : m.color,
                          opacity: c?.status === 'incompatível' ? 0.5 : 1,
                        }}
                        title={`${m.name}: ${c?.status || 'desconhecido'}`}
                      >
                        {m.name[0]}
                      </div>
                    )
                  })}
                </div>
                <p className="text-[10px] text-[#5d605f] mb-2">
                  {compatCount} de {activeMembers.length} compatíveis
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    addRecipeToNextFreeSlot(recipe.id)
                  }}
                  className="w-full flex items-center justify-center gap-1 bg-[#c5ebd7] text-[#446656] rounded-xl py-1.5 text-xs font-semibold"
                >
                  <Plus size={12} />
                  Adicionar ao plano
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {viewRecipeId && (
        <RecipeDetailModal
          recipeId={viewRecipeId}
          onClose={() => setViewRecipeId(null)}
        />
      )}
    </div>
  )
}
