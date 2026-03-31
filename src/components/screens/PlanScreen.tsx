'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { RefreshCw, Lock, Unlock, ArrowLeftRight, Eye, ChevronRight, Settings, Link } from 'lucide-react'
import SwapMealDrawer from '../SwapMealDrawer'
import RecipeDetailModal from '../RecipeDetailModal'
import MealParticipantsModal from '../MealParticipantsModal'
import { MealSlot } from '@/lib/types'

const MEAL_LABELS: Record<string, string> = {
  'pequeno-almoço': 'Pequeno-almoço',
  almoço: 'Almoço',
  jantar: 'Jantar',
  snack: 'Snack',
}

const COMPAT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  todos: { label: 'Comum a todos', color: '#446656', bg: '#c5ebd7' },
  alguns: { label: 'Compatível com alguns', color: '#6e5c44', bg: '#f8dfc0' },
  adaptada: { label: 'Adaptada', color: '#2e6771', bg: '#b7effb' },
  bloqueada: { label: 'Bloqueada', color: '#a83836', bg: '#ffd7d6' },
}

export default function PlanScreen() {
  const {
    currentPlan,
    activeDayIndex,
    setActiveDayIndex,
    members,
    recipes,
    toggleSlotLock,
    regeneratePlan,
    isRegenerating,
    setSettingsOpen,
    subscription,
  } = useAppStore()

  const [swapSlot, setSwapSlot] = useState<MealSlot | null>(null)
  const [viewRecipe, setViewRecipe] = useState<{ id: string, slotId?: string } | null>(null)
  const [participantSlot, setParticipantSlot] = useState<MealSlot | null>(null)

  const daySlots = currentPlan.slots.filter((s) => s.day === activeDayIndex)
  const activeMembers = members.filter((m) => m.isActive)
  const today = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

  const startDate = new Date(subscription?.startsAt || new Date())
  
  const getDayLabel = (index: number) => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + index)
    return d.getDate()
  }

  const isExpired = subscription ? new Date() > new Date(subscription.endsAt) : false

  useEffect(() => {
    if (subscription && !isExpired) {
      const now = new Date()
      const end = new Date(subscription.endsAt)
      const start = new Date(subscription.startsAt)
      if (now <= end && now >= start) {
        const startDay = new Date(subscription.startsAt)
        startDay.setHours(0,0,0,0)
        const diffTime = now.getTime() - startDay.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays >= 0 && diffDays < 7) {
          setActiveDayIndex(diffDays)
        }
      }
    }
  }, [subscription, isExpired, setActiveDayIndex])

  return (
    <div className="px-5 pt-4">
      {/* Coverage Hero */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#303333] mb-1">
            {(() => {
              if (!subscription) return 'Plano desta semana'
              const start = new Date(subscription.startsAt)
              const end = new Date(subscription.endsAt)
              const fmt = (d: Date) => d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })
              return `${fmt(start)} — ${fmt(end)}`
            })()}
          </h1>
          <p className="text-sm text-[#5d605f]">
            {subscription?.planType === 'mensal' ? 'Plano mensal' : 'Plano semanal'}
            {' · '}{activeMembers.length} membros ativos
            {' · '}{currentPlan.slots.filter(s => s.isLocked).length} bloqueadas
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setSettingsOpen(true)}
          className="w-10 h-10 rounded-2xl bg-white shadow-ambient-sm flex items-center justify-center text-[#5d605f]"
        >
          <Settings size={20} />
        </motion.button>
      </div>

      {/* Coverage Card */}
      <div className="bg-white rounded-3xl p-5 shadow-ambient mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-[#5d605f] uppercase tracking-wider font-medium mb-1">Cobertura nutricional</p>
            <p className="text-3xl font-display font-bold text-[#446656]">{currentPlan.coveragePercent}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#5d605f] uppercase tracking-wider font-medium mb-1">Sincronização</p>
            <p className="text-3xl font-display font-bold text-[#2e6771]">{currentPlan.nutrientSyncPercent}%</p>
          </div>
        </div>
        {/* Coverage bar */}
        <div className="h-3 bg-[#f3f4f3] rounded-full overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${currentPlan.coveragePercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #446656, #2e6771)' }}
          />
        </div>
        {/* Member dots */}
        <div className="flex items-center gap-2">
          {activeMembers.map((m) => (
            <div key={m.id} className="flex items-center gap-1">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                style={{ backgroundColor: m.color }}
              >
                {m.name[0]}
              </div>
            </div>
          ))}
          <span className="text-xs text-[#5d605f] ml-1">sincronizados</span>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
        {Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(startDate)
          d.setDate(d.getDate() + i)
          let day = d.toLocaleDateString('pt-PT', { weekday: 'short' }).replace('.', '').replace('-feira', '')
          day = day.charAt(0).toUpperCase() + day.slice(1)
          const now = new Date()
          const isToday = d.toDateString() === now.toDateString()
          const isPast = d < new Date(now.setHours(0,0,0,0))
          const isActive = i === activeDayIndex
          const hasSlots = currentPlan.slots.some((s) => s.day === i)
          
          return (
            <motion.button
              key={`day-${i}`}
              onClick={() => setActiveDayIndex(i)}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center min-w-[52px] py-2.5 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-[#446656] text-white shadow-ambient-md'
                  : isPast 
                    ? 'bg-[#f3f4f3] text-[#b0b2b1] opacity-60' 
                    : 'bg-white text-[#5d605f]'
              }`}
            >
              <span className={`text-[10px] font-medium mb-0.5 ${isActive ? 'text-white/80' : 'text-[#b0b2b1]'}`}>
                {day}
              </span>
              <span className="text-base font-display font-bold">{getDayLabel(i)}</span>
              {isToday && !isActive && (
                <div className="w-1 h-1 rounded-full bg-[#446656] mt-0.5" />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Meal Cards */}
      {isExpired && (
        <div className="bg-[#ffd7d6] text-[#a83836] rounded-2xl p-4 mb-5 shadow-ambient flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center shrink-0">
            <Lock size={16} />
          </div>
          <div>
            <p className="text-sm font-bold">Plano Expirado</p>
            <p className="text-xs opacity-90">Renova o teu plano para organizares as próximas semanas.</p>
          </div>
        </div>
      )}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {daySlots.map((slot) => {
            const recipe = recipes.find((r) => r.id === slot.recipeId)
            if (!recipe) return null
            const isExplicitEmpty = slot.participantIds !== undefined && slot.participantIds.length === 0
            const activeParticipants = isExplicitEmpty ? [] : (slot.participantIds ? members.filter((m) => slot.participantIds.includes(m.id)) : activeMembers)
            
            let incompatibleCount = 0
            const recipeIngredients = recipe.ingredients.map(i => i.name.toLowerCase())
            for (const p of activeParticipants) {
              const allergies = [...(p.preferences.allergies || []), ...(p.preferences.excludedIngredients || [])].map(a => a.toLowerCase())
              if (allergies.some(a => recipeIngredients.some(ing => ing.includes(a)))) {
                incompatibleCount++
              }
            }

            const isSubgroup = slot.participantIds && slot.participantIds.length < activeMembers.length && slot.participantIds.length > 0;
            let compat = COMPAT_CONFIG[slot.compatibilityStatus] || COMPAT_CONFIG['todos']

            if (incompatibleCount > 0) {
              compat = { 
                label: `Incompatível (${incompatibleCount} perfil${incompatibleCount > 1 ? 's' : ''})`, 
                color: '#a83836', 
                bg: '#ffd7d6' 
              }
            } else if (isSubgroup && slot.compatibilityStatus === 'todos') {
              compat = { label: 'Subgrupo', color: '#6e5c44', bg: '#f8dfc0' }
            }

            return (
              <motion.div
                key={slot.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl overflow-hidden shadow-ambient"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Meal type badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-medium text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      {MEAL_LABELS[slot.mealType]}
                    </span>
                  </div>

                  {/* Lock button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleSlotLock(slot.id)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white"
                  >
                    {slot.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                  </motion.button>

                  {/* Title overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-display font-bold text-lg leading-tight">
                      {recipe.title}
                    </h3>
                    <p className="text-white/80 text-xs mt-0.5">{recipe.durationMinutes} min</p>
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-4 py-3">
                  {/* Compatibility */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ color: compat.color, backgroundColor: compat.bg }}
                    >
                      {compat.label}
                    </span>
                    <motion.div 
                      key={slot.id + '-members'}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        setParticipantSlot(slot)
                      }}
                      className="flex items-center gap-1.5 ml-auto cursor-pointer p-1 rounded-xl hover:bg-[#f3f4f3] transition-colors"
                    >
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1">
                           {activeParticipants.length === 0 ? (
                             <span className="text-[9px] font-bold text-[#a83836] bg-[#ffd7d6] px-1.5 py-0.5 rounded shadow-sm">Nenhum</span>
                           ) : isSubgroup ? (
                             <span className="text-[9px] font-bold text-[#6e5c44] bg-[#f8dfc0] px-1.5 py-0.5 rounded shadow-sm">Subgrupo</span>
                           ) : (
                             <span className="text-[9px] font-bold text-[#446656] bg-[#c5ebd7]/60 px-1.5 py-0.5 rounded shadow-sm">Todos ativos</span>
                           )}
                           {activeParticipants.some(m => m.sourceOrigin === 'ablute_wellness') && (
                             <span className="text-[#2e6771] bg-[#b7effb]/40 w-4 h-4 rounded-full flex items-center justify-center shadow-sm" title="Inclui perfis ligados à source">
                               <Link size={8} />
                             </span>
                           )}
                        </div>
                        <div className="flex items-center gap-0.5">
                          {activeParticipants.map((m) => (
                            <div
                              key={m.id}
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-sm ${
                                slot.adaptedMemberIds.includes(m.id) ? 'ring-[1.5px] ring-[#2e6771] ring-offset-1' : ''
                              }`}
                              style={{ backgroundColor: m.color }}
                              title={m.name + (slot.adaptedMemberIds.includes(m.id) ? ' (adaptado)' : '')}
                            >
                              {m.name[0]}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setSwapSlot(slot)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#f3f4f3] text-[#446656] py-2.5 rounded-2xl text-sm font-medium"
                    >
                      <ArrowLeftRight size={14} />
                      Trocar
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setViewRecipe({ id: recipe.id, slotId: slot.id })}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#f3f4f3] text-[#5d605f] py-2.5 rounded-2xl text-sm font-medium"
                    >
                      <Eye size={14} />
                      Ver receita
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Regenerate CTA */}
      <div className="mt-6 mb-6">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={regeneratePlan}
          disabled={isRegenerating}
          className="w-full flex items-center justify-center gap-2 btn-primary-gradient text-white py-4 rounded-3xl font-semibold text-sm shadow-ambient-md disabled:opacity-70"
        >
          <motion.div
            animate={{ rotate: isRegenerating ? 360 : 0 }}
            transition={{ duration: 1, repeat: isRegenerating ? Infinity : 0, ease: 'linear' }}
          >
            <RefreshCw size={16} />
          </motion.div>
          {isRegenerating ? 'A regenerar semana...' : 'Regerar semana'}
        </motion.button>
      </div>

      {/* Drawers & Modals */}
      <SwapMealDrawer
        slot={swapSlot}
        onClose={() => setSwapSlot(null)}
      />
      {viewRecipe && (
        <RecipeDetailModal
          recipeId={viewRecipe.id}
          slotId={viewRecipe.slotId}
          onClose={() => setViewRecipe(null)}
        />
      )}
      <MealParticipantsModal
        key={participantSlot?.id || 'none'}
        slot={participantSlot}
        onClose={() => setParticipantSlot(null)}
      />
    </div>
  )
}
