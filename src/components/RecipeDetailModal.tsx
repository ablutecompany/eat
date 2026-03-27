'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { X, Clock, Plus, ChevronRight } from 'lucide-react'

interface Props {
  recipeId: string
  slotId?: string // Optional context from the plan
  onClose: () => void
}

export default function RecipeDetailModal({ recipeId, slotId, onClose }: Props) {
  const { recipes, members, currentPlan, showToast } = useAppStore()
  const recipe = recipes.find((r) => r.id === recipeId)
  const slot = slotId ? currentPlan.slots.find(s => s.id === slotId) : null

  if (!recipe) return null

  // Calculate dynamic portion factor
  // If slot context exists, use participantIds. Otherwise use all active members.
  const relevantMemberIds = slot ? slot.participantIds : members.filter(m => m.isActive).map(m => m.id)
  const relevantMembers = members.filter(m => relevantMemberIds.includes(m.id))
  const totalPortionFactor = relevantMembers.reduce((sum, m) => sum + m.portionFactor, 0)

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
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-sm text-[#303333]">Participantes e Adaptação</h3>
                <span className="text-[10px] bg-[#f3f4f3] text-[#5d605f] px-2 py-0.5 rounded-full font-bold">
                  Factor Total: {totalPortionFactor.toFixed(2)}x
                </span>
              </div>
              <div className="space-y-2">
                {relevantMembers.map((m) => {
                  const c = recipe.compatibilityByMember.find((cb) => cb.memberId === m.id)
                  const isAdapted = slot?.adaptedMemberIds.includes(m.id) || c?.status === 'adaptado'
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
                        isAdapted ? 'bg-[#b7effb] text-[#2e6771]' :
                        'bg-[#ffd7d6] text-[#a83836]'
                      }`}>
                        {c?.status === 'compatível' ? '✓ Compatível' : 
                         isAdapted ? '~ Adaptado' : '✗ Incompatível'}
                      </span>
                    </div>
                  )
                })}
              </div>
              {recipe.adaptationNotes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#f3f4f3]">
                  <p className="text-xs text-[#5d605f] font-medium mb-1">Dicas de adaptação:</p>
                  {recipe.adaptationNotes.map((note, i) => (
                    <p key={i} className="text-xs text-[#2e6771]">· {note}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Ingredients */}
            <div className="bg-white rounded-3xl p-4 mb-4 shadow-ambient">
              <h3 className="font-display font-bold text-sm text-[#303333] mb-3">Ingredientes (Ajustados)</h3>
              <div className="space-y-2">
                {recipe.ingredients.map((ing, i) => {
                  const baseQty = parseFloat(ing.quantity)
                  const displayQty = isNaN(baseQty) ? ing.quantity : (baseQty * totalPortionFactor).toFixed(0)
                  return (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-[#303333]">{ing.name}</span>
                      <span className="text-[#5d605f] font-medium">{displayQty} {ing.unit}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Nutrients Dashboard */}
            <div className="bg-white rounded-3xl p-5 mb-4 shadow-ambient overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5ebd7]/20 rounded-full -mr-16 -mt-16 blur-3xl" />
              <h3 className="font-display font-bold text-sm text-[#303333] mb-4">Perfil Nutricional</h3>
              <div className="grid grid-cols-3 gap-4">
                {recipe.nutrients.map((n, i) => (
                  <div key={i} className="flex flex-col items-center p-3 bg-[#faf9f8] rounded-2xl">
                    <span className="text-[10px] text-[#b0b2b1] uppercase tracking-wider font-bold mb-1">{n.name}</span>
                    <span className="text-sm font-display font-bold text-[#446656]">{n.value}</span>
                  </div>
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
