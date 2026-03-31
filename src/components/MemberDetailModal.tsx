'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { X, FileText, FlaskConical, Upload, Trash2, ChevronRight, Check, Link, Link2Off } from 'lucide-react'

interface Props {
  memberId: string
  openContext?: 'link' | 'swap'
  suggestedProfileId?: string
  onClose: () => void
  onLinkedSuccess?: () => void
}

export default function MemberDetailModal({ memberId, openContext, suggestedProfileId, onClose, onLinkedSuccess }: Props) {
  const { members, updateMember, showToast, availableSourceProfiles, linkMemberToSourceProfile, unlinkMemberFromSource, dataSource } = useAppStore()
  const member = members.find((m) => m.id === memberId)

  const [name, setName] = useState(member?.name || '')
  const [type, setType] = useState(member?.type || 'adulto')
  const [age, setAge] = useState<number | undefined>(member?.age)
  const [avatar, setAvatar] = useState(member?.avatar || '')
  const [color, setColor] = useState(member?.color || '')
  const [isActive, setIsActive] = useState(member?.isActive ?? true)

  const [allergies, setAllergies] = useState(member?.preferences.allergies || [])
  const [dislikes, setDislikes] = useState(member?.preferences.dislikes || [])
  const [dietTags, setDietTags] = useState(member?.preferences.dietTags || [])
  const [notes, setNotes] = useState(member?.notes || '')
  const [uploadedFiles, setUploadedFiles] = useState(member?.uploadedFiles || [])
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null)
  const [showSourceProfiles, setShowSourceProfiles] = useState(false)
  const [confirmUnlink, setConfirmUnlink] = useState(false)
  const [confirmLinkProfileId, setConfirmLinkProfileId] = useState<string | null>(null)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const [highlightSection, setHighlightSection] = useState(false)
  const [dismissSuggestion, setDismissSuggestion] = useState(false)

  useEffect(() => {
    setDismissSuggestion(false)
  }, [suggestedProfileId, memberId])

  useEffect(() => {
    if (openContext === 'link' || openContext === 'swap') {
      setHighlightSection(true)
      
      const isReady = dataSource?.isActive && dataSource?.syncStatus === 'sincronizado'
      const shouldOpenLink = openContext === 'link' && member?.sourceOrigin !== 'ablute_wellness'
      const shouldOpenSwap = openContext === 'swap' && member?.sourceOrigin === 'ablute_wellness'
      
      if (isReady && (shouldOpenLink || shouldOpenSwap)) {
        setShowSourceProfiles(true)
      }

      const t = setTimeout(() => setHighlightSection(false), 2500)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openContext])

  const unlinkedProfiles = availableSourceProfiles.filter(p => !members.some(m => m.sourceProfileId === p.id))
  
  const activeSuggestedId = dismissSuggestion ? null : suggestedProfileId

  const sortedProfiles = [...unlinkedProfiles].sort((a, b) => {
    if (a.id === activeSuggestedId) return -1
    if (b.id === activeSuggestedId) return 1
    return 0
  })

  const triggerFeedback = (msg: string) => {
    setActionFeedback(msg)
    setTimeout(() => setActionFeedback(null), 3000)
  }

  const handleSave = () => {
    if (member) {
      updateMember(member.id, {
        name,
        type: type as any,
        age,
        avatar,
        color,
        isActive,
        notes,
        preferences: {
          ...member.preferences,
          allergies,
          dislikes,
          dietTags,
        },
        uploadedFiles,
      })
      showToast('Perfil atualizado com sucesso')
      onClose()
    }
  }

  if (!member) return null

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
            style={{ background: `linear-gradient(135deg, ${color}30, ${color}60)` }}
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm text-[#303333]"
            >
              <X size={16} />
            </motion.button>

            <div className="flex gap-2 mb-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-ambient relative overflow-hidden"
                style={{ backgroundColor: color }}
              >
                <input 
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full h-full text-center bg-transparent border-none outline-none absolute inset-0 z-10"
                  maxLength={2}
                />
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute bottom-0 right-0 w-4 h-4 opacity-0 cursor-pointer z-20"
                />
              </div>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex-1 mr-4">
                {member.sourceOrigin === 'ablute_wellness' ? (
                  <div className="flex flex-col gap-0.5 mt-2">
                    <h2 className="text-2xl font-display font-bold text-[#303333] drop-shadow-sm leading-tight">{name}</h2>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[11px] font-medium capitalize text-[#446656] bg-white/70 px-1.5 py-0.5 rounded shadow-sm">{type}</span>
                      {age && <span className="text-[11px] font-medium text-[#5d605f] bg-white/70 px-1.5 py-0.5 rounded shadow-sm">{age} anos</span>}
                    </div>
                    <span className="text-[9px] text-[#446656] font-bold mt-1.5 uppercase tracking-wider flex items-center gap-1 opacity-80"><Link size={9} /> Gerido pelo perfil ligado</span>
                  </div>
                ) : (
                  <>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-2xl font-display font-bold text-[#303333] bg-transparent border-none outline-none p-0 m-0 focus:ring-2 focus:ring-white/50 rounded drop-shadow-sm"
                    />
                    <div className="flex items-center gap-1 text-sm text-[#5d605f] mt-1 font-medium">
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="bg-transparent border-none outline-none p-0 m-0 capitalize focus:ring-2 focus:ring-white/50 rounded cursor-pointer appearance-none"
                      >
                        <option value="adulto">Adulto</option>
                        <option value="criança">Criança</option>
                        <option value="outro">Outro</option>
                      </select>
                      <span>·</span>
                      <input
                        type="number"
                        value={age || ''}
                        onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Idade"
                        className="w-12 bg-transparent border-none outline-none p-0 m-0 focus:ring-2 focus:ring-white/50 rounded text-center"
                      />
                      <span>anos</span>
                      <span className="text-[9px] bg-white/60 text-[#8b8d8c] px-1.5 py-0.5 rounded ml-1 font-medium shadow-sm">Membro local</span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[#5d605f]">{isActive ? 'Ativo' : 'Inativo'}</span>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsActive(!isActive)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                    isActive ? 'bg-[#446656]' : 'bg-[#e1e3e2]'
                  }`}
                >
                  <motion.div
                    animate={{ x: isActive ? 22 : 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </motion.button>
              </div>
            </div>
          </div>

            {/* Ligação de Perfil */}
            <div className={`rounded-2xl p-3 flex flex-col mb-1 mx-5 transition-colors duration-1000 ${
              highlightSection ? 'bg-[#c5ebd7] shadow-sm' : 'bg-[#f3f4f3]/60'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${member.sourceOrigin === 'ablute_wellness' ? 'bg-[#c5ebd7] text-[#446656]' : 'bg-white text-[#b0b2b1] shadow-sm'}`}>
                    <Link size={14} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-[#303333]">Ligação de perfil</h3>
                      <AnimatePresence>
                        {actionFeedback && (
                          <motion.span
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-[9px] font-bold text-[#446656] bg-[#c5ebd7] px-1.5 py-0.5 rounded shadow-sm"
                          >
                            ✓ {actionFeedback}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className="text-[10px] text-[#5d605f] mt-0.5">
                      {member.sourceOrigin === 'ablute_wellness' ? (
                        availableSourceProfiles.find(p => p.id === member.sourceProfileId) ? (
                          <>Ligado a <span className="font-semibold text-[#446656]">{availableSourceProfiles.find(p => p.id === member.sourceProfileId)?.displayName}</span></>
                        ) : 'Ligado'
                      ) : 'Apenas neste dispositivo'}
                    </p>
                  </div>
                </div>
                {member.sourceOrigin === 'ablute_wellness' ? (
                  <div className="flex items-center gap-1">
                    {confirmUnlink ? (
                      <div className="flex items-center gap-1.5 bg-[#fff2f2] px-2 py-1.5 rounded-lg border border-[#ffd7d6]">
                        <span className="text-[9px] text-[#a83836] font-medium leading-tight">Desligar este perfil?</span>
                        <button
                          onClick={() => {
                            unlinkMemberFromSource(member.id)
                            setConfirmUnlink(false)
                            triggerFeedback('Perfil desligado. Pode agora editar os dados.')
                          }}
                          className="text-[9px] bg-[#ffd7d6] text-[#a83836] hover:bg-[#eebfc0] px-2 py-1 rounded-md font-bold transition-colors"
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setConfirmUnlink(false)}
                          className="text-[9px] bg-white border border-[#e1e3e2] text-[#5d605f] px-2 py-1 rounded-md font-medium"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setConfirmUnlink(true)}
                          className="text-[10px] text-[#8b8d8c] hover:text-[#a83836] transition-colors px-2"
                        >
                          Desligar
                        </button>
                        <button
                          onClick={() => {
                            setShowSourceProfiles(!showSourceProfiles)
                            setConfirmLinkProfileId(null)
                          }}
                          className="text-[10px] font-medium text-[#446656] bg-white px-2.5 py-1.5 rounded-lg shadow-sm border border-[#e1e3e2]/50 hover:bg-[#f3f4f3] transition-colors"
                        >
                          {showSourceProfiles ? 'Cancelar' : 'Trocar perfil'}
                        </button>
                      </>
                    )}
                  </div>
                ) : (!dataSource?.isActive || dataSource?.syncStatus !== 'sincronizado') ? (
                  <span className="text-[9px] text-[#8b8d8c] px-2 py-1 rounded bg-white shadow-sm border border-[#e1e3e2]/40 hidden sm:inline-block">
                    Sincronize primeiro para ligar um perfil
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setShowSourceProfiles(!showSourceProfiles)
                    }}
                    className="text-[10px] font-medium text-[#446656] bg-white px-2.5 py-1.5 rounded-lg shadow-sm border border-[#e1e3e2]/50 hover:bg-[#f3f4f3] transition-colors"
                  >
                    {showSourceProfiles ? 'Cancelar' : 'Associar conta'}
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showSourceProfiles && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 mt-3 border-t border-[#e1e3e2]/60">
                      {unlinkedProfiles.length > 0 ? (
                        <>
                          {activeSuggestedId && unlinkedProfiles.some(p => p.id === activeSuggestedId) ? (
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-medium text-[#8b8d8c]">Perfil sugerido para este membro:</p>
                              <button 
                                onClick={() => setDismissSuggestion(true)} 
                                className="text-[9px] font-medium text-[#5d605f] underline decoration-[#e1e3e2] hover:text-[#303333] transition-colors"
                              >
                                Ver outros perfis
                              </button>
                            </div>
                          ) : (
                            <p className="text-[10px] font-medium text-[#8b8d8c] mb-2">Contas disponíveis para ligar:</p>
                          )}
                          <div className="space-y-1.5">
                            {sortedProfiles.map(p => {
                              const isSuggested = p.id === activeSuggestedId
                              const hasSameName = member && p.displayName ? member.name.split(' ')[0].toLowerCase() === p.displayName.split(' ')[0].toLowerCase() : false
                              const hasSameType = member && member.type === p.memberType
                              const hasSameAge = member && p.age !== undefined && member.age === p.age

                              return (
                                <div key={p.id} className={`flex items-center justify-between p-2.5 bg-white shadow-sm border rounded-xl gap-2 ${isSuggested ? 'border-[#a6d9be] bg-[#f9fdfa]' : 'border-[#e1e3e2]/30'}`}>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-xs font-bold text-[#303333]">{p.displayName}</p>
                                      {isSuggested && (
                                        <span className="text-[9px] font-bold text-[#446656] bg-[#c5ebd7] px-1.5 py-0.5 rounded shadow-sm">Sugerido</span>
                                      )}
                                    </div>
                                    <p className="text-[9px] text-[#8b8d8c] capitalize mt-0.5">{p.memberType} {p.age ? `· ${p.age} anos` : ''}</p>
                                    {isSuggested && (hasSameName || hasSameType || hasSameAge) && (
                                      <div className="flex flex-wrap gap-1 mt-1.5">
                                        {hasSameName && <span className="text-[8px] px-1.5 py-0.5 rounded-sm bg-[#c5ebd7]/40 text-[#446656] font-medium border border-[#c5ebd7]/60">Nome correspondente</span>}
                                        {hasSameType && <span className="text-[8px] px-1.5 py-0.5 rounded-sm bg-[#e1e3e2]/40 text-[#5d605f] font-medium">Mesmo tipo</span>}
                                        {hasSameAge && <span className="text-[8px] px-1.5 py-0.5 rounded-sm bg-[#e1e3e2]/40 text-[#5d605f] font-medium">Idade igual</span>}
                                      </div>
                                    )}
                                  </div>
                                  {confirmLinkProfileId === p.id ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => {
                                          const isSwap = member?.sourceOrigin === 'ablute_wellness'
                                          if (member) linkMemberToSourceProfile(member.id, p.id)
                                          setShowSourceProfiles(false)
                                          setConfirmLinkProfileId(null)
                                          triggerFeedback(isSwap ? 'Perfil trocado' : p.displayName ? `Perfil ligado a ${p.displayName}` : 'Perfil ligado')
                                          
                                          if (isSuggested) {
                                            setTimeout(() => {
                                              if (onLinkedSuccess) onLinkedSuccess()
                                              onClose()
                                            }, 1200)
                                          }
                                        }}
                                        className="text-[10px] font-bold text-[#446656] bg-[#c5ebd7] px-2.5 py-1 rounded-md shadow-sm hover:bg-[#a6d9be] transition-colors"
                                      >
                                        Confirmar
                                      </button>
                                      <button
                                        onClick={() => setConfirmLinkProfileId(null)}
                                        className="text-[10px] px-2 py-1 hover:bg-[#e1e3e2] text-[#8b8d8c] rounded-md transition-colors"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    isSuggested ? (
                                      <button
                                        onClick={() => setConfirmLinkProfileId(p.id)}
                                        className="text-[10px] font-medium text-white bg-[#446656] px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#2e6771] transition-colors"
                                      >
                                        Ligar este perfil
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setConfirmLinkProfileId(p.id)}
                                        className="text-[10px] font-medium text-[#446656] bg-[#f3f4f3] px-3 py-1.5 rounded-lg hover:bg-[#e1e3e2] transition-colors"
                                      >
                                        Escolher
                                      </button>
                                    )
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </>
                      ) : (
                        <p className="text-[10px] font-medium text-[#8b8d8c] text-center py-2">
                          {member.sourceOrigin === 'ablute_wellness' ? 'Sem outro perfil disponível' : 'Sem perfis disponíveis para ligar'}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          <div className="px-5 pt-5 pb-10 space-y-4">
            {member.sourceOrigin === 'ablute_wellness' && (
              <div className="flex flex-col mb-1 ml-1">
                <h3 className="text-[10px] font-bold text-[#8b8d8c] uppercase tracking-wider mb-0.5">Dados locais do agregado</h3>
                <p className="text-[9px] text-[#b0b2b1] font-medium italic">Pode ajustar localmente</p>
              </div>
            )}

            {/* Restrictions */}
            <div className="bg-white rounded-3xl p-4 shadow-ambient space-y-4">
              <div>
                <h3 className="font-display font-bold text-sm text-[#303333] mb-2">Alérgico ou totalmente excluído</h3>
                <div className="flex flex-wrap gap-2">
                  {member.preferences.excludedIngredients?.map((e, i) => (
                    <span key={`ex-${i}`} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[#f8dfc0] text-[#6e5c44]" title="Excluído do plano geral">
                      {e}
                    </span>
                  ))}
                  {allergies.map((a, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[#ffd7d6] text-[#a83836]">
                      ⚠ {a}
                      <button onClick={(e) => { e.preventDefault(); setAllergies(allergies.filter((_, idx) => idx !== i))}}><X size={12} /></button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Adicionar e Enter..."
                    className="flex-1 min-w-[120px] text-xs bg-[#f3f4f3] rounded-full px-3 py-1 outline-none focus:ring-1 focus:ring-[#446656]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        e.preventDefault();
                        setAllergies([...allergies, e.currentTarget.value.trim()]);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-display font-bold text-sm text-[#303333] mb-2">A evitar</h3>
                <div className="flex flex-wrap gap-2">
                  {dislikes.map((d, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[#f3f4f3] text-[#5d605f]">
                      {d}
                      <button onClick={(e) => { e.preventDefault(); setDislikes(dislikes.filter((_, idx) => idx !== i))}}><X size={12} /></button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Adicionar e Enter..."
                    className="flex-1 min-w-[120px] text-xs bg-[#f3f4f3] rounded-full px-3 py-1 outline-none focus:ring-1 focus:ring-[#446656]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        e.preventDefault();
                        setDislikes([...dislikes, e.currentTarget.value.trim()]);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#f3f4f3]">
                <h4 className="text-xs font-medium text-[#5d605f] mb-2">Preferências alimentares</h4>
                <div className="flex flex-wrap gap-1.5">
                  {dietTags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs bg-[#c5ebd7] text-[#446656] px-2.5 py-1 rounded-full font-medium capitalize">
                      {tag === 'sem-glúten' ? 'Sem Glúten' : tag === 'sem-lactose' ? 'Sem Lactose' : tag === 'alto-em-proteína' ? 'Alto Proteína' : tag}
                      <button onClick={(e) => { e.preventDefault(); setDietTags(dietTags.filter((_, idx) => idx !== i))}}><X size={12} /></button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Adicionar preferência..."
                    className="flex-1 min-w-[120px] text-xs bg-[#f3f4f3] rounded-full px-3 py-1 outline-none focus:ring-1 focus:ring-[#446656]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        e.preventDefault();
                        setDietTags([...dietTags, e.currentTarget.value.trim()]);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
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
                <label className="flex items-center gap-1 text-xs text-[#446656] font-medium cursor-pointer active:scale-[0.98] transition-all">
                  <Upload size={12} />
                  Adicionar ficheiro
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const newFile = {
                          id: `f-${Date.now()}`,
                          memberId: member.id,
                          fileName: file.name,
                          fileType: (file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'imagem' : 'texto') as 'pdf' | 'imagem' | 'texto',
                          uploadedAt: new Date().toISOString(),
                          processingStatus: 'pendente' as any,
                        }
                        setUploadedFiles([...uploadedFiles, newFile])
                        e.target.value = ''
                      }
                    }}
                  />
                </label>
              </div>
              {uploadedFiles.length > 0 ? (
                <div className="space-y-2">
                  {uploadedFiles.map((f: any) => {
                    const isExpanded = expandedFileId === f.id
                    return (
                    <div key={f.id} className="bg-[#f3f4f3] rounded-2xl overflow-hidden transition-all">
                      <div 
                        className="flex items-center gap-3 p-3 cursor-pointer select-none active:scale-[0.99]"
                        onClick={() => setExpandedFileId(isExpanded ? null : f.id)}
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#c5ebd7] flex items-center justify-center shrink-0">
                          <FileText size={14} className="text-[#446656]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#303333] truncate">{f.fileName}</p>
                          <p className="text-[10px] text-[#b0b2b1] mt-0.5">
                            {new Date(f.uploadedAt).toLocaleDateString('pt-PT')} · {
                              f.processingStatus === 'concluído' ? '✓ Revisto' : 
                              f.processingStatus === 'processando' ? '⟳ A processar' : 'Pendente'
                            }
                          </p>
                        </div>
                        <ChevronRight size={14} className={`text-[#b0b2b1] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div className="px-3 pb-3 pt-1 border-t border-[#e1e3e2]/40">
                              <div className="bg-white rounded-xl p-3 shadow-sm mb-3 space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-[#8b8d8c]">Membro</span>
                                  <span className="font-medium text-[#303333]">{member.name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#8b8d8c]">Tipo</span>
                                  <span className="font-medium text-[#303333] uppercase">{f.fileType}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 mt-1 border-t border-[#f3f4f3]">
                                  <span className="text-[#8b8d8c]">Progresso</span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const nextStatus = f.processingStatus === 'concluído' ? 'pendente' : 'concluído'
                                      setUploadedFiles(uploadedFiles.map((uf: any) => uf.id === f.id ? { ...uf, processingStatus: nextStatus } : uf))
                                    }}
                                    className={`px-2 py-1.5 flex items-center gap-1 rounded-lg font-bold transition-all active:scale-[0.95] ${f.processingStatus === 'concluído' ? 'bg-[#c5ebd7] text-[#446656]' : 'bg-[#e1e3e2] text-[#5d605f] hover:bg-[#d1d3d2]'}`}
                                  >
                                    {f.processingStatus === 'concluído' ? <Check size={12} /> : null}
                                    {f.processingStatus === 'concluído' ? 'Revisto' : 'Marcar revisto'}
                                  </button>
                                </div>
                              </div>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setUploadedFiles(uploadedFiles.filter((uf: any) => uf.id !== f.id))
                                }}
                                className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-[#a83836] bg-[#ffd7d6]/50 hover:bg-[#ffd7d6] transition-colors active:scale-[0.98]"
                              >
                                <Trash2 size={14} /> Remover Ficheiro
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )})}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FlaskConical size={24} className="text-[#e1e3e2] mx-auto mb-2" />
                  <p className="text-sm text-[#b0b2b1]">Nenhum ficheiro carregado</p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-3xl p-4 shadow-ambient">
              <h3 className="font-display font-bold text-sm text-[#303333] mb-2">Notas</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicionar notas ou recomendações..."
                className="w-full text-sm text-[#5d605f] leading-relaxed bg-transparent border-none outline-none resize-none placeholder:text-[#b0b2b1]"
                rows={3}
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="w-full btn-primary-gradient text-white py-4 rounded-3xl font-bold mb-4 mt-2 shadow-ambient-md flex items-center justify-center gap-2 relative z-10"
            >
              Guardar Alterações
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
