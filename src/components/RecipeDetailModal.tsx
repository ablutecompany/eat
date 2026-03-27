'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { X, Clock, Plus, ChevronRight } from 'lucide-react'

interface Props {
  recipeId: string
  onClose: () => void
}

export default function RecipeDetailModal({ recipeId, onClose }: Props) {
  const { recipes, members, showToast } = useAppStore()
  const recipe = recipes.find((r) => r.id === recipeId)

  if (!recipe) return null

  const activeMembers = members.filter((m) => m.isActive)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex flex-col"
        style={{ maxWidth: 430, margin: '0 auto' }}
      >
        {/* Scrollable content */}
        <div className="bg-[#faf9f8] h-full overflow-y-auto scrollbar-hide">
          {/* Hero image */}
          <div className="relative h-64 shrink-0">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {/* Close */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm text-white"
            >
              <X size={16} />
            </motion.button>
            {/* Title */}
            <div className="absolute bottom-4 left-5 right-5">
              <div className="flex items-center gap-2 mb-1">
                {recipe.mealType.map((t) => (
                  <span key={t} className="text-[10px] text-white/80 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full capitalize">
                    {t}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl font-display font-bold text-white leading-tight">{recipe.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={13} className="text-white/70" />
                <span className="text-sm text-white/80">{recipe.durationMinutes} minutos</span>
              </div>
            </div>
          </div>

          <div className="px-5 pt-5 pb-32">
            {/* Description */}
            <p className="text-sm text-[#5d605f] leading-relaxed mb-5">{recipe.description}</p>

            {/* Compatibility */}
            <div className="bg-white rounded-3xl p-4 mb-4 shadow-ambient">
              <h3 className="font-display font-bold text-sm text-[#303333] mb-3">Compatibilidade</h3>
              <div className="space-y-2">
                {activeMembers.map((m) => {
                  const c = recipe.compatibilityByMember.find((cb) => cb.memberId === m.id)
                  return (
                    <div key={m.id} className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: m.color }}
                      >
                        {m.avatar}
                      </div>
                      <span className="text-sm font-medium text-[#303333]">{m.name}</span>
                      <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
                        c?.status === 'compatível' ? 'bg-[#c5ebd7] text-[#446656]' :
                        c?.status === 'adaptado' ? 'bg-[#b7effb] text-[#2e6771]' :
                        'bg-[#ffd7d6] text-[#a83836]'
                      }`}>
                        {c?.status === 'compatível' ? '✓ Compatível' : 
                         c?.status === 'adaptado' ? '~ Adaptado' : '✗ Incompatível'}
                      </span>
                    </div>
                  )
                })}
              </div>
              {recipe.adaptationNotes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#f3f4f3]">
                  <p className="text-xs text-[#5d605f] font-medium mb-1">Adaptações necessárias:</p>
                  {recipe.adaptationNotes.map((note, i) => (
                    <p key={i} className="text-xs text-[#2e6771]">· {note}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Ingredients */}
            <div className="bg-white rounded-3xl p-4 mb-4 shadow-ambient">
              <h3 className="font-display font-bold text-sm text-[#303333] mb-3">Ingredientes</h3>
              <div className="space-y-2">
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-[#303333]">{ing.name}</span>
                    <span className="text-[#5d605f]">{ing.quantity} {ing.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrients */}
            <div className="bg-white rounded-3xl p-4 mb-4 shadow-ambient">
              <h3 className="font-display font-bold text-sm text-[#303333] mb-3">Nutrientes principais</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.nutrients.map((n, i) => (
                  <span key={i} className="text-xs bg-[#f8dfc0] text-[#6e5c44] px-3 py-1 rounded-full font-medium">
                    {n.name}: {n.value}
                  </span>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="bg-white rounded-3xl p-4 mb-4 shadow-ambient">
              <h3 className="font-display font-bold text-sm text-[#303333] mb-3">Preparação</h3>
              <div className="space-y-3">
                {recipe.steps.map((step) => (
                  <div key={step.step} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#c5ebd7] flex items-center justify-center text-[#446656] text-xs font-bold shrink-0 mt-0.5">
                      {step.step}
                    </div>
                    <div>
                      <p className="text-sm text-[#303333] leading-relaxed">{step.description}</p>
                      {step.duration && (
                        <p className="text-xs text-[#b0b2b1] mt-0.5">{step.duration} min</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-5 glass border-t border-[#b0b2b1]/15">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { showToast(`${recipe.title} adicionada ao plano`); onClose() }}
            className="w-full flex items-center justify-center gap-2 btn-primary-gradient text-white py-4 rounded-3xl font-semibold text-sm shadow-ambient-md"
          >
            <Plus size={16} />
            Adicionar ao Plano
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
