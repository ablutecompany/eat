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
  const activeMembers = members.filter(m => m.isActive)
  const isExplicitEmpty = slot?.participantIds !== undefined && slot?.participantIds?.length === 0
  const initialSelection = slot?.participantIds === undefined ? activeMembers.map(m => m.id) : (slot.participantIds || [])
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelection)

  const sortedMembers = [...members].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1
    if (!a.isActive && b.isActive) return 1
    if (a.isActive && b.isActive) {
      if (a.sourceOrigin === 'ablute_wellness' && b.sourceOrigin !== 'ablute_wellness') return -1
      if (a.sourceOrigin !== 'ablute_wellness' && b.sourceOrigin === 'ablute_wellness') return 1
    }
    return 0
  })

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

  let summaryText = ''
  if (selectedIds.length === 0) {
    summaryText = 'Sem participantes'
  } else if (selectedIds.length === activeMembers.length && activeMembers.every(m => selectedIds.includes(m.id))) {
    summaryText = 'Todos os ativos'
  } else {
    summaryText = `Subgrupo: ${selectedIds.length} participante${selectedIds.length > 1 ? 's' : ''}`
  }

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
            className="fixed inset-x-5 top-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-[80] p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="text-[#446656]" size={22} />
                <h2 className="text-xl font-display font-bold text-[#303333]">Participantes</h2>
              </div>
              <button onClick={onClose} className="p-2 bg-[#f3f4f3] rounded-full text-[#5d605f] hover:bg-[#e1e3e2] transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex items-center justify-between mb-5 bg-[#f9fdfa] border border-[#e1e3e2]/40 p-2.5 rounded-xl">
              <span className="text-[11px] font-bold text-[#446656] uppercase tracking-wider">{summaryText}</span>
              <div className="flex gap-2">
                <button onClick={() => setSelectedIds(activeMembers.map(m => m.id))} className="text-[9px] text-[#5d605f] font-medium hover:text-[#303333] transition-colors bg-white px-2 py-1.5 rounded shadow-sm border border-[#e1e3e2]/50">
                  Selecionar ativos
                </button>
                <button onClick={() => setSelectedIds([])} className="text-[9px] text-[#8b8d8c] font-medium hover:text-[#a83836] transition-colors bg-white px-2 py-1.5 rounded shadow-sm border border-[#e1e3e2]/50">
                  Limpar
                </button>
              </div>
            </div>

            <div className="space-y-2.5 mb-6">
              {sortedMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    selectedIds.includes(member.id)
                      ? 'border-[#a6d9be] bg-[#c5ebd7]/20 shadow-sm'
                      : 'border-transparent bg-[#f3f4f3]/60 hover:bg-[#e1e3e2]/40'
                  } ${!member.isActive ? 'opacity-60 grayscale' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.name[0]}
                    </div>
                    <div className="flex-1 text-left flex flex-col items-start gap-0.5">
                      <div className="flex items-center gap-1.5">
                         <p className="font-bold text-[#303333] text-sm leading-none">{member.name}</p>
                         {member.sourceOrigin === 'ablute_wellness' && (
                           <span className="text-[8px] bg-[#c5ebd7] text-[#2e6771] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Ligado</span>
                         )}
                         {!member.isActive && (
                           <span className="text-[8px] bg-[#e1e3e2] text-[#8b8d8c] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Inativo</span>
                         )}
                      </div>
                      <p className="text-[10px] text-[#8b8d8c] font-medium capitalize mt-1">
                         {member.type === 'criança' ? 'Criança' : 'Adulto'} · Porção {member.portionFactor}x
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-all shrink-0 ml-3 ${
                    selectedIds.includes(member.id)
                      ? 'bg-[#446656] border-none text-white shadow-sm'
                      : 'border border-[#b0b2b1] bg-white'
                  }`}>
                    {selectedIds.includes(member.id) && <Check size={14} strokeWidth={3} />}
                  </div>
                </button>
              ))}
              {selectedIds.length === 0 && (
                 <p className="text-[10px] text-center text-[#a83836] font-medium mt-3 italic mb-1">Este slot ficará sem participantes. A receita poderá não ser considerada para compras.</p>
              )}
            </div>

            <button
              onClick={handleConfirm}
              className="w-full btn-primary-gradient text-white py-3.5 rounded-3xl font-bold text-sm shadow-ambient-md active:scale-[0.98] transition-all"
            >
              Guardar participantes
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
