'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Plus, ChevronRight, FileText, FlaskConical } from 'lucide-react'
import AddMemberModal from '../AddMemberModal'
import EditMemberModal from '../EditMemberModal'

export default function HouseholdScreen() {
  const { members, toggleMemberActive } = useAppStore()
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [showAddMember, setShowAddMember] = useState(false)

  return (
    <div className="px-5 pt-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-[#303333] mb-1">
          Agregado Familiar
        </h1>
        <p className="text-sm text-[#5d605f]">
          {members.filter((m) => m.isActive).length} membros ativos no planeamento
        </p>
      </div>

      {/* Member cards */}
      <div className="space-y-3 mb-5">
        <AnimatePresence>
          {members.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-3xl p-4 shadow-ambient transition-opacity duration-300 ${
                !member.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
                  style={{ backgroundColor: member.color }}
                >
                  {member.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display font-bold text-[#303333]">{member.name}</h3>
                    {/* Active toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#5d605f]">
                        {member.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => toggleMemberActive(member.id)}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                          member.isActive ? 'bg-[#446656]' : 'bg-[#e1e3e2]'
                        }`}
                      >
                        <motion.div
                          animate={{ x: member.isActive ? 22 : 2 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                        />
                      </motion.button>
                    </div>
                  </div>

                  {/* Restrictions */}
                  {(member.preferences.allergies.length > 0 || member.preferences.dietTags.length > 0 || member.preferences.dislikes.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {member.preferences.dietTags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] bg-[#f3f4f3] text-[#5d605f] px-2 py-0.5 rounded-full capitalize">
                          {tag === 'sem-glúten' ? 'Sem Glúten' : tag === 'sem-lactose' ? 'Sem Lactose' : tag === 'alto-em-proteína' ? 'Alto Proteína' : tag}
                        </span>
                      ))}
                      {member.preferences.allergies.length > 0 && (
                        <span className="text-[10px] bg-[#ffd7d6] text-[#a83836] px-2 py-0.5 rounded-full">
                          Alergia: {member.preferences.allergies[0]}
                        </span>
                      )}
                      {member.preferences.dislikes.length > 0 && (
                        <span className="text-[10px] bg-[#f3f4f3] text-[#5d605f] px-2 py-0.5 rounded-full">
                          Não gosta: {member.preferences.dislikes[0]}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-[#5d605f]">
                      <FlaskConical size={12} className="text-[#446656]" />
                      <span>{member.nutrientTargets.length} nutrientes</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#5d605f]">
                      <FileText size={12} className="text-[#446656]" />
                      <span>{member.uploadedFiles.length} {member.uploadedFiles.length === 1 ? 'ficheiro' : 'ficheiros'}</span>
                    </div>
                    <button
                      onClick={() => setSelectedMemberId(member.id)}
                      className="ml-auto flex items-center gap-0.5 text-xs text-[#446656] font-medium p-2 rounded-xl hover:bg-[#c5ebd7]/20 transition-colors"
                    >
                      Editar perfil
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add member button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowAddMember(true)}
        className="w-full flex items-center justify-center gap-2 btn-primary-gradient text-white py-4 rounded-3xl font-semibold text-sm shadow-ambient-md"
      >
        <Plus size={18} />
        Adicionar Membro
      </motion.button>

      {/* Modals */}
      {selectedMemberId && (
        <EditMemberModal
          memberId={selectedMemberId}
          onClose={() => setSelectedMemberId(null)}
        />
      )}
      {showAddMember && (
        <AddMemberModal onClose={() => setShowAddMember(false)} />
      )}
    </div>
  )
}
