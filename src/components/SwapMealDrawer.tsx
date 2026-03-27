'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { X, Clock, ArrowLeftRight, Check } from 'lucide-react'
import { MealSlot } from '@/lib/types'

interface Props {
  slot: MealSlot | null
  onClose: () => void
}

export default function SwapMealDrawer({ slot, onClose }: Props) {
  const { recipes, members, currentPlan, swapMealSlot } = useAppStore()

  if (!slot) return null

  // Recipes already used in other slots (excluding current slot)
  const usedRecipeIds = new Set(
    currentPlan.slots
      .filter((s: MealSlot) => s.id !== slot.id)
      .map((s: MealSlot) => s.recipeId)
  )

  // Find alternatives: same meal type, different recipe, not already in plan
  const alternatives = recipes.filter(
    (r) => r.mealType.includes(slot.mealType) && r.id !== slot.recipeId && !usedRecipeIds.has(r.id)
  )

  // Fallback if all recipes are used — show same-type recipes excluding only current
  const displayAlts = alternatives.length > 0 ? alternatives : recipes.filter(
    (r) => r.mealType.includes(slot.mealType) && r.id !== slot.recipeId
  )

  const activeMembers = members.filter((m) => m.isActive)

  const handleSwap = (recipeId: string) => {
    swapMealSlot(slot.id, recipeId)
    onClose()
  }

  return (
    <AnimatePresence>
      {slot && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-3xl z-[60] max-h-[80vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-[#e1e3e2] rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#f3f4f3]">
              <div>
                <h2 className="font-display font-bold text-[#303333]">Trocar Refeição</h2>
                <p className="text-xs text-[#5d605f]">Escolhe uma alternativa compatível</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#f3f4f3] text-[#5d605f]"
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Alternatives list */}
            <div className="overflow-y-auto flex-1 p-5 space-y-3 pb-8 scrollbar-hide">
              {displayAlts.map((recipe) => {
                const compatCount = activeMembers.filter((m) => {
                  const c = recipe.compatibilityByMember.find((cb) => cb.memberId === m.id)
                  return c?.status === 'compatível'
                }).length
                const adaptedCount = activeMembers.filter((m) => {
                  const c = recipe.compatibilityByMember.find((cb) => cb.memberId === m.id)
                  return c?.status === 'adaptado'
                }).length

                return (
                  <motion.div
                    key={recipe.id}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 bg-[#f3f4f3] rounded-2xl p-3 cursor-pointer"
                    onClick={() => handleSwap(recipe.id)}
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-[#303333] mb-0.5 truncate">{recipe.title}</h3>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="flex items-center gap-1 text-xs text-[#5d605f]">
                          <Clock size={10} />
                          {recipe.durationMinutes} min
                        </span>
                        <span className="text-xs text-[#446656]">
                          {compatCount}/{activeMembers.length} compatíveis
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {activeMembers.map((m) => {
                          const c = recipe.compatibilityByMember.find((cb) => cb.memberId === m.id)
                          return (
                            <div
                              key={m.id}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                              style={{
                                backgroundColor: c?.status === 'incompatível' ? '#e1e3e2' : m.color,
                                opacity: c?.status === 'incompatível' ? 0.4 : 1,
                              }}
                            >
                              {m.name[0]}
                            </div>
                          )
                        })}
                        {adaptedCount > 0 && (
                          <span className="text-[10px] text-[#2e6771] ml-1">Adaptada</span>
                        )}
                      </div>
                    </div>

                    {/* Select icon */}
                    <div className="w-7 h-7 rounded-xl bg-[#446656]/10 flex items-center justify-center">
                      <ArrowLeftRight size={13} className="text-[#446656]" />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
