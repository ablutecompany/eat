'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, AlertTriangle } from 'lucide-react'
import { useAppStore } from '@/lib/store'

import { useEffect } from 'react'

interface ExcludeIngredientModalProps {
  ingredientName: string
  isOpen: boolean
  initialSelectedIds?: string[]
  onClose: () => void
  onConfirm: (memberIds: string[]) => void
}

export default function ExcludeIngredientModal({ ingredientName, isOpen, initialSelectedIds = [], onClose, onConfirm }: ExcludeIngredientModalProps) {
  const { members } = useAppStore()
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds)

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialSelectedIds)
    }
  }, [isOpen, initialSelectedIds])

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
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ffd7d6] flex items-center justify-center">
                  <AlertTriangle size={18} className="text-[#a83836]" />
                </div>
                <h2 className="text-xl font-display font-bold text-[#303333]">Excluir totalmente</h2>
              </div>
              <button onClick={onClose} className="p-2 bg-[#f3f4f3] rounded-full text-[#5d605f]">
                <X size={18} />
              </button>
            </div>

            <div className="bg-[#fff5f5] border border-[#ffd7d6] rounded-2xl p-3 mb-5">
              <p className="text-xs text-[#a83836] font-medium leading-relaxed">
                <strong>Alérgico ou totalmente excluído.</strong> {ingredientName} nunca entrará em receitas, sugestões, substituições ou compras para os membros selecionados.
              </p>
            </div>

            <p className="text-sm text-[#5d605f] mb-5">
              Seleciona quem <strong>nunca</strong> deve consumir <strong>{ingredientName}</strong>.
            </p>

            <div className="space-y-3 mb-8">
              {members.filter(m => m.isActive).map((member) => (
                <button
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    selectedIds.includes(member.id)
                      ? 'border-[#a83836] bg-[#ffd7d6]/20'
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
                    <p className="text-[10px] text-[#b0b2b1]">
                      {member.preferences.allergies.length} excluídos atuais
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                    selectedIds.includes(member.id)
                      ? 'bg-[#a83836] border-[#a83836] text-white'
                      : 'border-[#b0b2b1]'
                  }`}>
                    {selectedIds.includes(member.id) && <Check size={14} />}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleConfirm}
              className="w-full bg-[#a83836] text-white py-4 rounded-3xl font-bold shadow-ambient-md active:scale-[0.98] transition-all"
            >
              Confirmar exclusão total
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
