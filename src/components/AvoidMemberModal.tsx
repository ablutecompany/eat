'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { HouseholdMember } from '@/lib/types'

interface AvoidMemberModalProps {
  ingredientName: string
  isOpen: boolean
  onClose: () => void
  onConfirm: (memberIds: string[]) => void
}

export default function AvoidMemberModal({ ingredientName, isOpen, onClose, onConfirm }: AvoidMemberModalProps) {
  const { members } = useAppStore()
  const [selectedIds, setSelectedIds] = useState<string[]>(members.filter(m => m.isActive).map(m => m.id))

  const toggleMember = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const handleConfirm = () => {
    onConfirm(selectedIds)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
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
              <h2 className="text-xl font-display font-bold text-[#303333]">A evitar por quem?</h2>
              <button onClick={onClose} className="p-2 bg-[#f3f4f3] rounded-full text-[#5d605f]">
                <X size={18} />
              </button>
            </div>
            
            <p className="text-sm text-[#5d605f] mb-6">
              Seleciona os membros que devem evitar <strong>{ingredientName}</strong>.
            </p>

            <div className="space-y-3 mb-8">
              {members.filter(m => m.isActive).map((member) => (
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
                  <span className="flex-1 text-left font-semibold text-[#303333]">{member.name}</span>
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
              Confirmar seleção
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
