'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { X, FileText, FlaskConical, Upload, Trash2, ChevronRight } from 'lucide-react'

interface Props {
  memberId: string
  onClose: () => void
}

export default function MemberDetailModal({ memberId, onClose }: Props) {
  const { members, toggleMemberActive, showToast } = useAppStore()
  const member = members.find((m) => m.id === memberId)

  if (!member) return null

  const allRestrictions = [
    ...member.preferences.allergies.map(a => ({ label: a, type: 'alergia' })),
    ...member.preferences.dislikes.map(d => ({ label: d, type: 'não-gosto' })),
    ...member.preferences.excludedIngredients.slice(0, 3).map(e => ({ label: e, type: 'excluído' })),
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex flex-col"
        style={{ maxWidth: 430, margin: '0 auto' }}
      >
        <div className="bg-[#faf9f8] h-full overflow-y-auto scrollbar-hide">
          {/* Header */}
          <div
            className="relative h-48 flex flex-col justify-end px-5 pb-5"
            style={{ background: `linear-gradient(135deg, ${member.color}30, ${member.color}60)` }}
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm text-[#303333]"
            >
              <X size={16} />
            </motion.button>

            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-3 shadow-ambient"
              style={{ backgroundColor: member.color }}
            >
              {member.avatar}
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold text-[#303333]">{member.name}</h1>
                <p className="text-sm text-[#5d605f] capitalize">
                  {member.type === 'adulto' ? 'Adulto' : member.type === 'criança' ? 'Criança' : 'Outro'}
                  {member.age ? ` · ${member.age} anos` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5d605f]">{member.isActive ? 'Ativo' : 'Inativo'}</span>
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
          </div>

          <div className="px-5 pt-5 pb-10 space-y-4">
            {/* Restrictions */}
            <div className="bg-white rounded-3xl p-4 shadow-ambient">
              <h3 className="font-display font-bold text-sm text-[#303333] mb-3">Restrições</h3>
              {allRestrictions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allRestrictions.map((r, i) => (
                    <span
                      key={i}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        r.type === 'alergia' ? 'bg-[#ffd7d6] text-[#a83836]' :
                        r.type === 'não-gosto' ? 'bg-[#f3f4f3] text-[#5d605f]' :
                        'bg-[#f8dfc0] text-[#6e5c44]'
                      }`}
                    >
                      {r.type === 'alergia' ? '⚠ ' : ''}{r.label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#b0b2b1]">Nenhuma restrição definida</p>
              )}
              <div className="mt-3 pt-3 border-t border-[#f3f4f3]">
                <h4 className="text-xs font-medium text-[#5d605f] mb-2">Preferências alimentares</h4>
                <div className="flex flex-wrap gap-1.5">
                  {member.preferences.dietTags.map((tag) => (
                    <span key={tag} className="text-xs bg-[#c5ebd7] text-[#446656] px-2.5 py-1 rounded-full font-medium capitalize">
                      {tag === 'sem-glúten' ? 'Sem Glúten' : tag === 'sem-lactose' ? 'Sem Lactose' : tag === 'alto-em-proteína' ? 'Alto Proteína' : tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Nutrients */}
            <div className="bg-white rounded-3xl p-4 shadow-ambient">
              <h3 className="font-display font-bold text-sm text-[#303333] mb-3">
                Nutrientes monitorizados
                <span className="ml-2 text-xs text-[#b0b2b1] font-normal">{member.nutrientTargets.length} ativos</span>
              </h3>
              <div className="space-y-3">
                {member.nutrientTargets.map((nt) => {
                  const pct = nt.currentValue ? Math.round((nt.currentValue / nt.targetValue) * 100) : 0
                  return (
                    <div key={nt.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[#303333]">{nt.name}</span>
                        <span className="text-xs text-[#5d605f]">
                          {nt.currentValue ?? '—'} / {nt.targetValue} {nt.unit}
                        </span>
                      </div>
                      <div className="h-2 bg-[#f3f4f3] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(pct, 100)}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: pct >= 80 ? '#446656' : pct >= 50 ? '#2e6771' : '#6e5c44',
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-[#b0b2b1] mt-0.5">{nt.source}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Files */}
            <div className="bg-white rounded-3xl p-4 shadow-ambient">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-sm text-[#303333]">
                  Ficheiros enviados
                </h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => showToast('Carregar ficheiro (brevemente disponível)')}
                  className="flex items-center gap-1 text-xs text-[#446656] font-medium"
                >
                  <Upload size={12} />
                  Carregar
                </motion.button>
              </div>
              {member.uploadedFiles.length > 0 ? (
                <div className="space-y-2">
                  {member.uploadedFiles.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 bg-[#f3f4f3] rounded-2xl p-3">
                      <div className="w-8 h-8 rounded-xl bg-[#c5ebd7] flex items-center justify-center">
                        <FileText size={14} className="text-[#446656]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#303333] truncate">{f.fileName}</p>
                        <p className="text-[10px] text-[#b0b2b1]">
                          {new Date(f.uploadedAt).toLocaleDateString('pt-PT')} · {
                            f.processingStatus === 'concluído' ? '✓ Processado' : 
                            f.processingStatus === 'processando' ? '⟳ A processar' : 'Pendente'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FlaskConical size={24} className="text-[#e1e3e2] mx-auto mb-2" />
                  <p className="text-sm text-[#b0b2b1]">Nenhum ficheiro carregado</p>
                </div>
              )}
            </div>

            {/* Notes */}
            {member.notes && (
              <div className="bg-white rounded-3xl p-4 shadow-ambient">
                <h3 className="font-display font-bold text-sm text-[#303333] mb-2">Notas</h3>
                <p className="text-sm text-[#5d605f] leading-relaxed">{member.notes}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
