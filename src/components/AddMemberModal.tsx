'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { X, Check } from 'lucide-react'
import { HouseholdMember, MemberPreferences } from '@/lib/types'

interface Props {
  onClose: () => void
}

const MEMBER_COLORS = [
  { name: 'coral', hex: '#E07B6A', emoji: '🧡' },
  { name: 'azul', hex: '#4A7DB5', emoji: '💙' },
  { name: 'verde', hex: '#5aaa7a', emoji: '💚' },
  { name: 'dourado', hex: '#D4A847', emoji: '💛' },
  { name: 'roxo', hex: '#9B7CC4', emoji: '💜' },
  { name: 'rosa', hex: '#E17BAE', emoji: '🩷' },
]

const DIET_TAGS = ['sem-glúten', 'sem-lactose', 'vegetariano', 'vegan', 'alto-em-proteína', 'kids']
const ALLERGY_OPTIONS = ['amendoim', 'glúten', 'lactose', 'ovos', 'frutos do mar', 'nozes', 'soja']

export default function AddMemberModal({ onClose }: Props) {
  const { addMember, members, showToast } = useAppStore()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [type, setType] = useState<'adulto' | 'criança' | 'outro'>('adulto')
  const [selectedColor, setSelectedColor] = useState(MEMBER_COLORS[0])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }
  const toggleAllergy = (a: string) => {
    setSelectedAllergies(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  const handleSave = () => {
    if (!name) return
    const newMember: HouseholdMember = {
      id: `m-${Date.now()}`,
      householdId: 'hh-001',
      name,
      avatar: type === 'adulto' ? (members.filter(m => m.type === 'adulto').length % 2 === 0 ? '👩' : '👨') : '👦',
      color: selectedColor.hex,
      colorName: selectedColor.name,
      type,
      isActive: true,
      preferences: {
        memberId: `m-${Date.now()}`,
        dietTags: selectedTags,
        allergies: selectedAllergies,
        excludedIngredients: [...selectedAllergies],
        dislikes: [],
        avoidTemporarily: [],
        preferredMeals: [],
      },
      nutrientTargets: [],
      uploadedFiles: [],
    }
    addMember(newMember)
    showToast(`${name} adicionado ao agregado!`)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[70] flex items-end justify-center"
        style={{ maxWidth: 430, margin: '0 auto' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto scrollbar-hide"
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-[#e1e3e2] rounded-full" />
          </div>

          <div className="px-5 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between py-4">
              <h2 className="font-display font-bold text-xl text-[#303333]">
                {step === 1 ? 'Novo Membro' : 'Preferências'}
              </h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#f3f4f3] text-[#5d605f]"
              >
                <X size={16} />
              </motion.button>
            </div>

            {step === 1 && (
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-[#5d605f] mb-2 block">Nome</label>
                  <input
                    type="text"
                    placeholder="Nome do membro"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#f3f4f3] rounded-2xl px-4 py-3 text-sm text-[#303333] outline-none focus:bg-white focus:ring-2 focus:ring-[#c5ebd7] transition-all"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="text-sm font-medium text-[#5d605f] mb-2 block">Tipo</label>
                  <div className="flex gap-2">
                    {(['adulto', 'criança', 'outro'] as const).map((t) => (
                      <motion.button
                        key={t}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setType(t)}
                        className={`flex-1 py-2.5 rounded-2xl text-sm font-medium capitalize transition-all ${
                          type === t
                            ? 'bg-[#446656] text-white'
                            : 'bg-[#f3f4f3] text-[#5d605f]'
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="text-sm font-medium text-[#5d605f] mb-2 block">Cor</label>
                  <div className="flex gap-3">
                    {MEMBER_COLORS.map((c) => (
                      <motion.button
                        key={c.name}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedColor(c)}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all"
                        style={{ backgroundColor: c.hex }}
                      >
                        {selectedColor.name === c.name && (
                          <Check size={16} className="text-white" strokeWidth={2.5} />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => name && setStep(2)}
                  disabled={!name}
                  className="w-full btn-primary-gradient text-white py-4 rounded-3xl font-semibold text-sm disabled:opacity-50"
                >
                  Continuar
                </motion.button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                {/* Diet tags */}
                <div>
                  <label className="text-sm font-medium text-[#5d605f] mb-2 block">Preferências alimentares</label>
                  <div className="flex flex-wrap gap-2">
                    {DIET_TAGS.map((tag) => (
                      <motion.button
                        key={tag}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-[#446656] text-white'
                            : 'bg-[#f3f4f3] text-[#5d605f]'
                        }`}
                      >
                        {tag === 'sem-glúten' ? 'Sem Glúten' : tag === 'sem-lactose' ? 'Sem Lactose' : tag === 'alto-em-proteína' ? 'Alto Proteína' : tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <label className="text-sm font-medium text-[#5d605f] mb-2 block">Alergias</label>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGY_OPTIONS.map((a) => (
                      <motion.button
                        key={a}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleAllergy(a)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          selectedAllergies.includes(a)
                            ? 'bg-[#ffd7d6] text-[#a83836]'
                            : 'bg-[#f3f4f3] text-[#5d605f]'
                        }`}
                      >
                        {selectedAllergies.includes(a) ? '⚠ ' : ''}{a.charAt(0).toUpperCase() + a.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep(1)}
                    className="flex-1 bg-[#f3f4f3] text-[#5d605f] py-4 rounded-3xl font-semibold text-sm"
                  >
                    Voltar
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    className="flex-1 btn-primary-gradient text-white py-4 rounded-3xl font-semibold text-sm"
                  >
                    Guardar
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
