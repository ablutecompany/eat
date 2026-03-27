'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { X, Check, Trash2, Plus } from 'lucide-react'
import { HouseholdMember, MemberType } from '@/lib/types'

interface EditMemberModalProps {
  memberId: string
  onClose: () => void
}

export default function EditMemberModal({ memberId, onClose }: EditMemberModalProps) {
  const { members, updateMember, showToast } = useAppStore()
  const member = members.find((m) => m.id === memberId)

  const [name, setName] = useState(member?.name || '')
  const [type, setType] = useState<MemberType>(member?.type || 'adulto')
  const [portionFactor, setPortionFactor] = useState(member?.portionFactor || 1.0)
  const [newAllergy, setNewAllergy] = useState('')
  const [allergies, setAllergies] = useState(member?.preferences.allergies || [])
  const [dislikes, setDislikes] = useState(member?.preferences.dislikes || [])
  const [age, setAge] = useState(member?.age || 0)
  const [notes, setNotes] = useState(member?.notes || '')

  if (!member) return null

  const handleSave = () => {
    updateMember(memberId, {
      name,
      type,
      portionFactor,
      age: age || undefined,
      notes,
      preferences: {
        ...member.preferences,
        allergies,
        dislikes,
      }
    })
    showToast('Perfil de membro atualizado')
    onClose()
  }

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setAllergies([...allergies, newAllergy.trim()])
      setNewAllergy('')
    }
  }

  const removeAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index))
  }

  return (
    <AnimatePresence>
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
        className="fixed inset-x-5 top-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-[80] p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-[#303333]">Editar Perfil</h2>
          <button onClick={onClose} className="p-2 bg-[#f3f4f3] rounded-full text-[#5d605f]">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-ambient"
              style={{ backgroundColor: member.color }}
            >
              {member.avatar}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-[#5d605f] uppercase tracking-wider mb-1">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#f3f4f3] border-none rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-[#446656] outline-none"
              />
            </div>
          </div>

          {/* Type, Age & Portion Factor */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5d605f] uppercase tracking-wider mb-1">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MemberType)}
                className="w-full bg-[#f3f4f3] border-none rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-[#446656] outline-none appearance-none"
              >
                <option value="adulto">Adulto</option>
                <option value="criança">Criança</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5d605f] uppercase tracking-wider mb-1">Idade</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                className="w-full bg-[#f3f4f3] border-none rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-[#446656] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5d605f] uppercase tracking-wider mb-1">Porção</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="3"
                value={portionFactor}
                onChange={(e) => setPortionFactor(parseFloat(e.target.value))}
                className="w-full bg-[#f3f4f3] border-none rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-[#446656] outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#5d605f] uppercase tracking-wider mb-1">Notas e Recomendações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Prefere refeições leves, acompanhamento médico..."
              className="w-full bg-[#f3f4f3] border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#446656] outline-none min-h-[80px]"
            />
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-xs font-bold text-[#5d605f] uppercase tracking-wider mb-2">Alergias / Restrições Totais</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {allergies.map((a, i) => (
                <span key={i} className="flex items-center gap-1 bg-[#ffd7d6] text-[#a83836] px-3 py-1.5 rounded-full text-xs font-bold">
                  {a}
                  <button onClick={() => removeAllergy(i)} className="p-0.5 hover:bg-white/20 rounded-full">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Amendoim, Glúten..."
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                className="flex-1 bg-[#f3f4f3] border-none rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-[#446656] outline-none"
              />
              <button
                onClick={addAllergy}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#446656] text-white shadow-ambient"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Dislikes (Quick reference) */}
          <div>
            <label className="block text-xs font-bold text-[#5d605f] uppercase tracking-wider mb-2">A evitar (Ingredientes)</label>
            <p className="text-[10px] text-[#b0b2b1] mb-2 uppercase tracking-wide">
              Estes são sincronizados com a página de Ingredientes
            </p>
            <div className="flex flex-wrap gap-2">
              {dislikes.map((d, i) => (
                <span key={i} className="bg-[#f3f4f3] text-[#5d605f] px-3 py-1.5 rounded-full text-xs font-semibold">
                  {d}
                </span>
              ))}
              {dislikes.length === 0 && <p className="text-xs text-[#b0b2b1] italic">Nenhum ingrediente marcado a evitar.</p>}
            </div>
          </div>

          {/* Health Files */}
          <div>
            <label className="block text-xs font-bold text-[#5d605f] uppercase tracking-wider mb-2">Ficheiros e Exames</label>
            <div className="space-y-2 mb-3">
              {member.uploadedFiles.map((f) => (
                <div key={f.id} className="flex items-center gap-3 p-3 bg-[#f3f4f3] rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#446656]">
                    <Check size={16} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-[#303333] truncate">{f.fileName}</p>
                    <p className="text-[10px] text-[#b0b2b1]">{f.processingStatus}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-3 border-2 border-dashed border-[#e1e3e2] rounded-2xl text-[#b0b2b1] text-xs font-bold flex items-center justify-center gap-2">
              <Plus size={14} />
              Carregar PDF / Exame
            </button>
          </div>

          <button
            onClick={handleSave}
            className="w-full btn-primary-gradient text-white py-4 rounded-3xl font-bold shadow-ambient-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Check size={20} />
            Guardar Alterações
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
