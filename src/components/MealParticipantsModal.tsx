'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Users } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { MealSlot, HouseholdMember } from '@/lib/types'

interface MealParticipantsModalProps {
  slot: MealSlot | null
  onClose: () => void
}

export default function MealParticipantsModal({ slot, onClose }: MealParticipantsModalProps) {
  const { members, updateMealParticipants } = useAppStore()
  const [selectedIds, setSelectedIds] = useState<string[]>(slot?.participantIds || [])

  if (!slot) return null

  const toggleMember = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const handleConfirm = () => {
    updateMealParticipants(slot.id, selectedIds)
    onClose()
  }

  const activeMembers = members.filter(m => m.isActive)

  return (
    <AnimatePresence>
      {slot && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[70] backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-5 top-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-[80] p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="text-[#446656]" size={24} />
                <h2 className="text-xl font-display font-bold text-[#303333]">Participantes</h2>
              </div>
              <button onClick={onClose} className="p-2 bg-[#f3f4f3] rounded-full text-[#5d605f]">
                <X size={18} />
              </button>
            </div>
            
            <p className="text-sm text-[#5d605f] mb-6">
              Seleciona quem vai participar nesta refeição. O planeamento e a lista de compras serão ajustados automaticamente.
            </p>

            <div className="space-y-3 mb-8">
              {activeMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    selectedIds.includes(member.id)
                      ? 'border-[#446656] bg-[#c5ebd7]/10'
                      : 'border-[#f3f4f3] bg-[#f3f4f3]/5'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name[0]}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-[#303333]">{member.name}</p>
                    <p className="text-[10px] text-[#5d605f] uppercase tracking-wider">
                      Factor de porção: {member.portionFactor}
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                    selectedIds.includes(member.id)
                      ? 'bg-[#446656] border-[#446656] text-white'
                      : 'border-[#b0b2b1]'
                  }`}>
                    {selectedIds.includes(member.id) && <Check size={14} />}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleConfirm}
              className="w-full btn-primary-gradient text-white py-4 rounded-3xl font-bold shadow-ambient-md active:scale-[0.98] transition-all"
            >
              Guardar participantes
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
