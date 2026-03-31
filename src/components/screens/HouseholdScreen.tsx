'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Plus, ChevronRight, FileText, FlaskConical, Link, Search } from 'lucide-react'
import AddMemberModal from '../AddMemberModal'
import EditMemberModal from '../EditMemberModal'
import MemberDetailModal from '../MemberDetailModal'

export default function HouseholdScreen() {
  const { members, toggleMemberActive, availableSourceProfiles, dataSource, addMember, linkMemberToSourceProfile } = useAppStore()
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [viewingMember, setViewingMember] = useState<{ id: string; context?: 'link' | 'swap'; suggestedProfileId?: string } | null>(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddFromSource, setShowAddFromSource] = useState(false)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)

  type FilterType = 'todos' | 'ligados' | 'locais'
  const [filter, setFilter] = useState<FilterType>('todos')

  const [confirmDuplicate, setConfirmDuplicate] = useState<{ profile: any, existingMemberId: string } | null>(null)
  const [justLinkedId, setJustLinkedId] = useState<string | null>(null)
  const [sourceSearchQuery, setSourceSearchQuery] = useState('')
  const [openSummaryId, setOpenSummaryId] = useState<string | null>(null)
  const [confirmLinkDirect, setConfirmLinkDirect] = useState<string | null>(null)
  const [postponedProfileIds, setPostponedProfileIds] = useState<string[]>([])
  const [sessionResolvedCount, setSessionResolvedCount] = useState(0)
  const [confirmSessionClose, setConfirmSessionClose] = useState(false)

  const unlinkedProfiles = availableSourceProfiles?.filter(p => !members.some(m => m.sourceProfileId === p.id)) || []
  const activeProfiles = unlinkedProfiles.filter(p => !postponedProfileIds.includes(p.id))
  const postponedProfiles = unlinkedProfiles.filter(p => postponedProfileIds.includes(p.id))

  const analyzeDuplicate = (p: any) => {
    for (const m of members) {
      if (m.sourceProfileId === p.id) continue
      const sameFirstName = m.name.split(' ')[0].toLowerCase() === p.displayName.split(' ')[0].toLowerCase()
      const sameFullName = m.name.toLowerCase() === p.displayName.toLowerCase()
      const sameType = m.type === p.memberType
      
      if (sameFirstName) {
        if (sameFullName || sameType) {
          return { member: m, strength: 'strong' as const }
        }
        return { member: m, strength: 'partial' as const }
      }
    }
    return null
  }

  const isProfileDuplicate = (p: any) => !!analyzeDuplicate(p)

  const filteredSourceProfiles = activeProfiles.filter(p => p.displayName.toLowerCase().includes(sourceSearchQuery.toLowerCase()))

  const sortedSourceProfiles = [...filteredSourceProfiles].sort((a, b) => {
    const aAnalysis = analyzeDuplicate(a)
    const bAnalysis = analyzeDuplicate(b)
    
    const aScore = aAnalysis ? (aAnalysis.strength === 'strong' ? 2 : 1) : 0
    const bScore = bAnalysis ? (bAnalysis.strength === 'strong' ? 2 : 1) : 0
    
    return bScore - aScore
  })

  const handlePostpone = (p: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setPostponedProfileIds(prev => [...prev, p.id])
    setConfirmDuplicate(null)
    setOpenSummaryId(null)
    
    const activeAfter = activeProfiles.filter(up => up.id !== p.id)
    const filteredAfter = activeAfter.filter(up => up.displayName.toLowerCase().includes(sourceSearchQuery.toLowerCase()))
    
    if (filteredAfter.length === 0 && activeAfter.length > 0) {
      setSourceSearchQuery('')
    }
  }

  const handleRevertPostponed = () => {
    setPostponedProfileIds([])
    setConfirmDuplicate(null)
    setOpenSummaryId(null)
    setConfirmLinkDirect(null)
  }

  const handleRestorePostponed = (id: string) => {
    setPostponedProfileIds(prev => prev.filter(pid => pid !== id))
    setConfirmDuplicate(null)
    setOpenSummaryId(null)
    setConfirmLinkDirect(null)
  }

  const executeCloseSession = () => {
    setConfirmSessionClose(false)
    setShowAddFromSource(false)
    setSessionResolvedCount(0)
    setPostponedProfileIds([])
    setSourceSearchQuery('')
    setOpenSummaryId(null)
    setConfirmDuplicate(null)
    setConfirmLinkDirect(null)
  }

  const handleCloseSession = () => {
    if (unlinkedProfiles.length > 0) {
      setConfirmSessionClose(true)
    } else {
      executeCloseSession()
    }
  }

  const handleDirectLink = (p: any, duplicateMember: any) => {
    linkMemberToSourceProfile(duplicateMember.id, p.id)
    setSessionResolvedCount(prev => prev + 1)
    setConfirmLinkDirect(null)
    setOpenSummaryId(null)
    
    const remaining = unlinkedProfiles.length - 1
    if (remaining === 0) {
      setShowAddFromSource(false)
      setSourceSearchQuery('')
    } else {
      const remainingFiltered = unlinkedProfiles.filter(up => up.id !== p.id && up.displayName.toLowerCase().includes(sourceSearchQuery.toLowerCase()))
      if (remainingFiltered.length === 0) setSourceSearchQuery('')
    }

    if (filter === 'locais') setFilter('todos')
    setActionFeedback(`Perfil ligado a ${duplicateMember.name.split(' ')[0]}`)
    setTimeout(() => setActionFeedback(null), 3000)
  }

  const handleCreateMember = (p: any) => {
    const newId = Math.random().toString(36).substr(2, 9)
    addMember({
      id: newId,
      householdId: 'h1',
      name: p.displayName,
      type: p.memberType || 'adulto',
      age: p.age,
      avatar: p.displayName.charAt(0).toUpperCase(),
      color: '#c5ebd7',
      colorName: 'verde',
      isActive: true,
      portionFactor: 1,
      preferences: { 
        memberId: '', 
        allergies: [], 
        dislikes: [], 
        dietTags: [],
        excludedIngredients: [],
        avoidTemporarily: [],
        preferredMeals: []
      },
      nutrientTargets: [],
      uploadedFiles: [],
      sourceOrigin: 'ablute_wellness',
      sourceProfileId: p.id,
      sourceLinkedAt: new Date().toISOString()
    })
    setSessionResolvedCount(prev => prev + 1)
    setConfirmDuplicate(null)
    setOpenSummaryId(null)

    const remaining = unlinkedProfiles.length - 1
    if (remaining === 0) {
      setShowAddFromSource(false)
      setSourceSearchQuery('')
    } else {
      const remainingFiltered = unlinkedProfiles.filter(up => up.id !== p.id && up.displayName.toLowerCase().includes(sourceSearchQuery.toLowerCase()))
      if (remainingFiltered.length === 0) setSourceSearchQuery('')
    }

    setActionFeedback('Membro adicionado')
    setTimeout(() => setActionFeedback(null), 3000)
  }

  const linkedMembers = members.filter(m => m.sourceOrigin === 'ablute_wellness')
  const localMembers = members.filter(m => m.sourceOrigin !== 'ablute_wellness')

  const filteredMembers = members.filter(m => {
    if (filter === 'ligados') return m.sourceOrigin === 'ablute_wellness'
    if (filter === 'locais') return m.sourceOrigin !== 'ablute_wellness'
    return true
  })

  const renderMemberCard = (member: typeof members[0]) => (
    <motion.div
      layout
      key={member.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-3xl p-4 shadow-ambient transition-all duration-300 cursor-pointer ${
        !member.isActive ? 'opacity-60' : ''
      } ${justLinkedId === member.id ? 'ring-2 ring-[#c5ebd7] ring-offset-2' : ''}`}
      onClick={() => setViewingMember({ id: member.id })}
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
            <div className="flex flex-col items-start gap-0.5">
              <h3 className="font-display font-bold text-[#303333] leading-none mb-0.5">{member.name}</h3>
              {member.sourceOrigin === 'ablute_wellness' ? (
                <div className="flex items-center gap-1 text-[9px] bg-[#c5ebd7]/60 text-[#2e6771] px-1.5 py-0.5 rounded shadow-sm border border-[#c5ebd7]">
                  <Link size={8} />
                  <span className="font-medium">Ligado a {availableSourceProfiles?.find(p => p.id === member.sourceProfileId)?.displayName?.split(' ')[0] || 'Conta'}</span>
                </div>
              ) : (
                <div className="text-[9px] text-[#8b8d8c] px-1.5 py-0.5 bg-[#f3f4f3] rounded border border-[#e1e3e2]/40 font-medium">Local</div>
              )}
            </div>
            {/* Active toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5d605f]">
                {member.isActive ? 'Ativo' : 'Inativo'}
              </span>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleMemberActive(member.id)
                }}
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
                  Excluído: {member.preferences.allergies[0]}
                </span>
              )}
              {member.preferences.dislikes.length > 0 && (
                <span className="text-[10px] bg-[#f8dfc0] text-[#6e5c44] px-2 py-0.5 rounded-full">
                  A evitar: {member.preferences.dislikes[0]}
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
              onClick={(e) => {
                e.stopPropagation()
                setSelectedMemberId(member.id)
              }}
              className="ml-auto flex items-center gap-0.5 text-xs text-[#446656] font-medium p-2 rounded-xl hover:bg-[#c5ebd7]/20 transition-colors"
            >
              Editar perfil
              <ChevronRight size={12} />
            </button>
          </div>

          {/* Quick Actions Footer */}
          <div className="mt-3 pt-2.5 border-t border-[#f3f4f3] flex items-center">
            {justLinkedId === member.id ? (
              <span className="text-[10px] text-[#446656] font-bold flex items-center gap-1.5 w-full justify-center bg-[#c5ebd7]/30 py-1 rounded-lg">
                ✓ Perfil ligado
              </span>
            ) : (!dataSource?.isActive || dataSource?.syncStatus !== 'sincronizado') ? (
              <span className="text-[9px] text-[#b0b2b1] italic">Sincronize para ligar perfil</span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setViewingMember({ id: member.id, context: member.sourceOrigin === 'ablute_wellness' ? 'swap' : 'link' })
                }}
                className="text-[10px] text-[#446656] font-semibold hover:underline underline-offset-2 flex items-center gap-0.5 transition-all"
              >
                {member.sourceOrigin === 'ablute_wellness' ? 'Trocar perfil' : 'Ligar perfil'} <ChevronRight size={10} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="px-5 pt-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-display font-bold text-[#303333] mb-1">
          Agregado Familiar
        </h1>
        <p className="text-xs text-[#5d605f] flex items-center gap-2">
          <span>{members.length} {members.length === 1 ? 'membro' : 'membros'}</span>
          <span className="text-[#b0b2b1]">•</span>
          <span className="text-[#446656] inline-flex items-center gap-1 font-medium bg-[#c5ebd7]/40 px-1.5 py-0.5 rounded">
            <Link size={10} /> {linkedMembers.length}
          </span>
          <span className="text-[#b0b2b1]">•</span>
          <span className="text-[#8b8d8c] font-medium bg-[#f3f4f3] px-1.5 py-0.5 rounded">
            {localMembers.length} locais
          </span>
        </p>
      </div>

      {/* Filters */}
      <div className="flex bg-[#f3f4f3] p-1 rounded-xl mb-5">
        {(['todos', 'ligados', 'locais'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
              filter === f ? 'bg-white text-[#303333] shadow-sm' : 'text-[#8b8d8c] hover:text-[#5d605f]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Member cards */}
      <div className="space-y-3 mb-5">
        <AnimatePresence mode="popLayout">
          {filteredMembers.length > 0 ? (
            <>
              {filter === 'todos' && linkedMembers.length > 0 && (
                <motion.div
                  layout
                  key="header-ligados"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-2 pt-1 pb-1"
                >
                  <h2 className="text-[10px] font-bold text-[#8b8d8c] uppercase tracking-widest">Ligados</h2>
                </motion.div>
              )}
              
              {(filter === 'todos' || filter === 'ligados' ? linkedMembers : []).map(renderMemberCard)}

              {filter === 'todos' && localMembers.length > 0 && (
                <motion.div
                  layout
                  key="header-locais"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-2 pt-3 pb-1"
                >
                  <h2 className="text-[10px] font-bold text-[#8b8d8c] uppercase tracking-widest">Locais</h2>
                </motion.div>
              )}

              {(filter === 'todos' || filter === 'locais' ? localMembers : []).map(renderMemberCard)}
            </>
          ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 text-center"
          >
            <p className="text-sm text-[#8b8d8c] italic">
              {filter === 'ligados' && 'Ainda não há membros ligados'}
              {filter === 'locais' && 'Não há membros locais por mostrar'}
              {filter === 'todos' && 'Nenhum membro encontrado'}
            </p>
          </motion.div>
        )}
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

      {/* Add from source area */}
      <div className="mt-4 flex flex-col items-center">
        <AnimatePresence>
          {actionFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-2 text-[10px] font-bold text-[#446656] bg-[#c5ebd7] px-3 py-1.5 rounded-lg shadow-sm"
            >
              ✓ {actionFeedback}
            </motion.div>
          )}
        </AnimatePresence>

        {dataSource?.isActive && dataSource?.syncStatus === 'sincronizado' ? (
          unlinkedProfiles.length > 0 ? (
            <div className="w-full flex justify-center flex-col items-center">
              <button 
                onClick={() => {
                  if (showAddFromSource) setSourceSearchQuery('')
                  setOpenSummaryId(null)
                  setShowAddFromSource(!showAddFromSource)
                }}
                className="text-[11px] font-medium text-[#446656] hover:underline underline-offset-2 flex items-center gap-1 transition-all"
              >
                {showAddFromSource ? 'Cancelar' : <><Link size={12} /> Adicionar a partir da source</>}
              </button>
              <AnimatePresence>
                {showAddFromSource && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden w-full max-w-[280px]"
                  >
                    <div className="mt-3 bg-white p-2 flex flex-col gap-1 rounded-2xl shadow-ambient border border-[#e1e3e2]/40">
                      {unlinkedProfiles.length > 5 && (
                        <div className="px-1.5 pb-2 pt-1 border-b border-[#e1e3e2]/40 mb-1">
                          <div className="relative">
                            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b8d8c]" />
                            <input
                              type="text"
                              placeholder="Procurar perfil"
                              value={sourceSearchQuery}
                              onChange={(e) => setSourceSearchQuery(e.target.value)}
                              className="w-full pl-7 pr-3 py-1.5 text-[11px] bg-[#f3f4f3] rounded-lg border-none text-[#303333] placeholder:text-[#8b8d8c] focus:ring-1 focus:ring-[#c5ebd7] outline-none transition-shadow"
                            />
                          </div>
                        </div>
                      )}

                      {(activeProfiles.length > 0 || postponedProfiles.length > 0 || sessionResolvedCount > 0) && (
                        <div className="px-2 pt-1.5 pb-2 text-[10px] text-[#5d605f] font-medium flex justify-between items-center bg-[#f9fdfa] border border-[#e1e3e2]/40 rounded-lg mb-2 mx-0.5 shadow-ambient">
                          <div className="flex gap-2.5">
                            <span className="text-[#303333]">Por rever <span className="text-[#8b8d8c] px-0.5">·</span> <span className="text-[#446656]">{activeProfiles.length}</span></span>
                            {postponedProfiles.length > 0 && <span className="text-[#303333]">Adiados <span className="text-[#8b8d8c] px-0.5">·</span> <span className="text-[#6e5c44]">{postponedProfiles.length}</span></span>}
                            {sessionResolvedCount > 0 && <span className="text-[#303333]">Resolvidos <span className="text-[#8b8d8c] px-0.5">·</span> <span className="text-[#446656]">{sessionResolvedCount}</span></span>}
                          </div>
                        </div>
                      )}

                      {(() => {
                        const duplicateProfiles = sortedSourceProfiles.filter(p => isProfileDuplicate(p))
                        const otherProfiles = sortedSourceProfiles.filter(p => !isProfileDuplicate(p))
                        const hasDuplicates = duplicateProfiles.length > 0

                        const getDuplicateMember = (p: any) => undefined

                        const renderHighlightedName = (name: string, query: string) => {
                          if (!query) return name
                          const regex = new RegExp(`(${query})`, 'gi')
                          const parts = name.split(regex)
                          return parts.map((part, i) => 
                            part.toLowerCase() === query.toLowerCase() ? 
                              <span key={i} className="bg-[#c5ebd7] text-[#303333] rounded-sm px-0.5">{part}</span> 
                              : part
                          )
                        }

                        const renderProfileItem = (p: any) => {
                          const analysis = analyzeDuplicate(p)
                          const duplicateMember = analysis?.member
                          const isStrong = analysis?.strength === 'strong'
                          const confirmedDuplicateUser = confirmDuplicate?.profile.id === p.id ? members.find(m => m.id === confirmDuplicate?.existingMemberId) : null

                          return (
                          <div key={p.id}>
                            {confirmDuplicate?.profile.id === p.id ? (
                              <div className="w-full text-left flex flex-col items-start justify-between p-2 rounded-xl bg-[#fff2f2] border border-[#ffd7d6] gap-2">
                                <div className="flex flex-col gap-1 w-full">
                                  <span className="text-[10px] text-[#a83836] font-medium leading-tight">Já existe um membro com este nome. O que pretende fazer?</span>
                                  {isStrong && (
                                    <span className="text-[9px] text-[#5d4f3b] font-medium leading-tight">Este perfil parece corresponder a este membro.</span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-1.5 w-full justify-end">
                                  <button onClick={() => setConfirmDuplicate(null)} className="text-[9px] text-[#5d605f] font-medium bg-white px-2 py-1.5 rounded shadow-sm border border-[#e1e3e2] hover:bg-[#f3f4f3]">Cancelar</button>
                                  <button onClick={() => handleCreateMember(p)} className="text-[9px] text-[#446656] font-medium bg-white px-2 py-1.5 rounded shadow-sm border border-[#e1e3e2] hover:bg-[#f3f4f3]">Adicionar novo</button>
                                  <button onClick={() => {
                                    const exId = confirmDuplicate?.existingMemberId
                                    const profId = confirmDuplicate?.profile.id
                                    setShowAddFromSource(false)
                                    setConfirmDuplicate(null)
                                    setSourceSearchQuery('')
                                    setOpenSummaryId(null)
                                    if (exId && profId) {
                                      setTimeout(() => setViewingMember({ id: exId, context: 'link', suggestedProfileId: profId }), 200)
                                    }
                                  }} className="text-[9px] text-white font-medium bg-[#446656] hover:bg-[#2e6771] transition-colors px-2 py-1.5 rounded shadow-sm cursor-pointer whitespace-nowrap">Abrir {confirmedDuplicateUser ? confirmedDuplicateUser.name.split(' ')[0] : 'existente'}</button>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full bg-white rounded-xl hover:bg-[#f3f4f3] transition-colors border border-transparent">
                                <div
                                  onClick={() => {
                                    if (duplicateMember) setConfirmDuplicate({ profile: p, existingMemberId: duplicateMember.id })
                                    else handleCreateMember(p)
                                  }}
                                  className="w-full text-left flex items-start justify-between p-2 gap-2 cursor-pointer"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <p className="text-xs font-bold text-[#303333]">{renderHighlightedName(p.displayName, sourceSearchQuery)}</p>
                                      {analysis && (
                                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm border ${isStrong ? 'bg-[#c5ebd7]/40 text-[#446656] border-[#a6d9be]/60' : 'text-[#8b8d8c] bg-[#e1e3e2]/40 border-[#e1e3e2]'}`}>
                                          {isStrong ? 'Correspondência forte' : 'Nome semelhante'}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-[#8b8d8c] capitalize">{p.memberType} {p.age ? `· ${p.age} anos` : ''}</p>
                                    
                                    {duplicateMember && (
                                      <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-[#5d605f] bg-[#f9fdfa] border border-[#e1e3e2]/40 px-1.5 py-0.5 rounded-md inline-flex w-fit max-w-full overflow-hidden">
                                        <span className="font-semibold text-[#446656] shrink-0">Pode corresponder a:</span>
                                        <span className="truncate">{duplicateMember.name.split(' ')[0]}</span>
                                        {duplicateMember.type && <span className="shrink-0 font-medium">· {duplicateMember.type === 'criança' ? 'Criança' : 'Adulto'}</span>}
                                        {duplicateMember.age && <span className="shrink-0 font-medium">· {duplicateMember.age}</span>}
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setOpenSummaryId(openSummaryId === p.id ? null : p.id)
                                          }}
                                          className="ml-1 text-[9px] text-[#446656] underline decoration-[#c5ebd7] font-medium shrink-0 hover:text-[#2e6771] transition-colors"
                                        >
                                          {openSummaryId === p.id ? 'Fechar' : 'Ver resumo'}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-center justify-between h-full py-0.5 shrink-0 gap-3 border-l border-[#e1e3e2]/40 pl-2 ml-1">
                                    <Plus size={14} className="text-[#446656] mt-0.5" />
                                    <button 
                                      onClick={(e) => handlePostpone(p, e)} 
                                      className="text-[9px] text-[#8b8d8c] font-medium hover:text-[#5d605f] hover:underline underline-offset-2 transition-colors mt-auto"
                                    >
                                      Adiar
                                    </button>
                                  </div>
                                </div>
                                <AnimatePresence>
                                  {openSummaryId === p.id && duplicateMember && (
                                    <motion.div
                                       initial={{ height: 0, opacity: 0 }}
                                       animate={{ height: 'auto', opacity: 1 }}
                                       exit={{ height: 0, opacity: 0 }}
                                       className="overflow-hidden"
                                    >
                                      <div className="px-2 pb-2 border-t border-[#e1e3e2]/40 mx-2 pt-2">
                                        {isStrong && (
                                          <p className="text-[9px] font-medium text-[#6e5c44] mb-2 px-1">Vale a pena rever antes de adicionar</p>
                                        )}
                                        <div className="flex gap-1.5 w-full">
                                          <div className="flex-1 bg-[#f9fdfa] border border-[#e1e3e2]/40 rounded-lg p-2">
                                            <p className="text-[8px] font-bold text-[#8b8d8c] mb-1.5 uppercase tracking-wider">Perfil da source</p>
                                            <p className="text-[10px] text-[#303333] mb-0.5"><span className={duplicateMember.name.toLowerCase() === p.displayName.toLowerCase() || duplicateMember.name.split(' ')[0].toLowerCase() === p.displayName.split(' ')[0].toLowerCase() ? 'bg-[#c5ebd7]/60 px-0.5 py-0.5 -mx-0.5 rounded' : ''}>{p.displayName}</span></p>
                                            {(p.memberType || p.age) && (
                                              <p className="text-[10px] text-[#5d605f] capitalize">
                                                {p.memberType && <span className={duplicateMember.type === p.memberType ? 'bg-[#c5ebd7]/60 px-0.5 py-0.5 -mx-0.5 rounded' : ''}>{p.memberType}</span>}
                                                {p.memberType && p.age && ' · '}
                                                {p.age && <span className={duplicateMember.age && Math.abs(duplicateMember.age - p.age) <= 2 ? 'bg-[#c5ebd7]/60 px-0.5 py-0.5 -mx-0.5 rounded' : ''}>{p.age}</span>}
                                              </p>
                                            )}
                                          </div>

                                          <div className="flex-1 bg-[#f9fdfa] border border-[#e1e3e2]/40 rounded-lg p-2">
                                            <p className="text-[8px] font-bold text-[#8b8d8c] mb-1.5 uppercase tracking-wider">Membro existente</p>
                                            <p className="text-[10px] text-[#303333] mb-0.5"><span className={duplicateMember.name.toLowerCase() === p.displayName.toLowerCase() || duplicateMember.name.split(' ')[0].toLowerCase() === p.displayName.split(' ')[0].toLowerCase() ? 'bg-[#c5ebd7]/60 px-0.5 py-0.5 -mx-0.5 rounded' : ''}>{duplicateMember.name}</span></p>
                                            {(duplicateMember.type || duplicateMember.age) && (
                                              <p className="text-[10px] text-[#5d605f] capitalize">
                                                {duplicateMember.type && <span className={duplicateMember.type === p.memberType ? 'bg-[#c5ebd7]/60 px-0.5 py-0.5 -mx-0.5 rounded' : ''}>{duplicateMember.type}</span>}
                                                {duplicateMember.type && duplicateMember.age && ' · '}
                                                {duplicateMember.age && <span className={p.age && Math.abs(duplicateMember.age - p.age) <= 2 ? 'bg-[#c5ebd7]/60 px-0.5 py-0.5 -mx-0.5 rounded' : ''}>{duplicateMember.age}</span>}
                                              </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                              <span className="text-[8px] font-medium bg-[#e1e3e2]/40 text-[#5d605f] px-1 py-0.5 rounded">{duplicateMember.isActive ? 'Ativo' : 'Inativo'}</span>
                                              {duplicateMember.sourceOrigin === 'ablute_wellness' ? (
                                                <span className="text-[8px] font-medium bg-[#e1e3e2]/40 text-[#5d605f] px-1 py-0.5 rounded border border-[#e1e3e2]/40">Ligado</span>
                                              ) : (
                                                <span className="text-[8px] font-medium bg-[#e1e3e2]/40 text-[#5d605f] px-1 py-0.5 rounded">Local</span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="flex justify-end gap-1.5 mt-2">
                                          {confirmLinkDirect === p.id ? (
                                            <div className="flex flex-col gap-1.5 w-full bg-[#f9fdfa] p-2 rounded-lg border border-[#a6d9be]/30 pt-3">
                                              <span className="text-[10px] text-[#446656] font-medium leading-tight text-center mb-1">Ligar este perfil a {duplicateMember.name.split(' ')[0]}?</span>
                                              <div className="flex justify-center gap-2 w-full">
                                                <button onClick={() => setConfirmLinkDirect(null)} className="text-[9px] text-[#5d605f] font-medium bg-white px-3 py-1.5 rounded shadow-sm border border-[#e1e3e2] hover:bg-[#f3f4f3] flex-1">Cancelar</button>
                                                <button onClick={() => handleDirectLink(p, duplicateMember)} className="text-[9px] text-white font-medium bg-[#446656] hover:bg-[#2e6771] transition-colors px-3 py-1.5 rounded shadow-sm flex-1">Ligar</button>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="flex justify-between gap-1.5 w-full">
                                              <button onClick={() => {
                                                setOpenSummaryId(null)
                                                handleCreateMember(p)
                                              }} className="text-[9px] text-[#446656] font-medium bg-transparent hover:underline underline-offset-2 transition-colors px-2 py-1.5 rounded shrink-0">
                                                Adicionar novo
                                              </button>
                                              <div className="flex justify-end gap-1.5 flex-1 w-full">
                                                <button onClick={() => {
                                                  setShowAddFromSource(false)
                                                  setSourceSearchQuery('')
                                                  setOpenSummaryId(null)
                                                  setTimeout(() => setViewingMember({ id: duplicateMember.id, context: 'link', suggestedProfileId: p.id }), 200)
                                                }} className="text-[9px] text-[#446656] font-medium bg-[#c5ebd7]/30 border border-[#a6d9be]/30 hover:bg-[#c5ebd7]/50 transition-colors px-2.5 py-1.5 rounded shadow-sm shrink-0">
                                                  Abrir {duplicateMember.name.split(' ')[0]}
                                                </button>
                                                {dataSource?.isActive && dataSource?.syncStatus === 'sincronizado' && duplicateMember.sourceOrigin !== 'ablute_wellness' && (
                                                  <button onClick={() => {
                                                     setConfirmLinkDirect(p.id)
                                                  }} className="text-[9px] text-white font-medium bg-[#446656] border border-[#2e6771]/30 hover:bg-[#2e6771] transition-colors px-2.5 py-1.5 rounded shadow-sm shrink-0 whitespace-nowrap">
                                                    Ligar a este membro
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </div>
                        )}

                        if (activeProfiles.length === 0 && postponedProfiles.length > 0) {
                          return (
                            <div className="w-full bg-[#f9fdfa] rounded-xl p-4 flex flex-col items-center justify-center gap-2 border border-[#e1e3e2]/40 text-center mx-auto my-4 max-w-[260px]">
                              <p className="text-[10px] text-[#5d605f] font-medium leading-relaxed">Já reviu todos os perfis ativos. Só faltam os perfis adiados.</p>
                              <button onClick={handleRevertPostponed} className="text-[9px] text-[#446656] font-medium bg-[#c5ebd7]/30 border border-[#a6d9be]/30 hover:bg-[#c5ebd7]/50 transition-colors px-3 py-1.5 rounded shadow-sm mt-1">
                                Rever adiados
                              </button>
                            </div>
                          )
                        }

                        if (sortedSourceProfiles.length === 0 && activeProfiles.length > 0) {
                          return <p className="text-[10px] font-medium text-[#8b8d8c] text-center p-3">Sem perfis por mostrar</p>
                        }

                        return (
                          <>
                            {sourceSearchQuery && sortedSourceProfiles.length > 0 && (
                              <div className="px-1.5 pt-0.5 pb-2 text-[10px] font-medium text-[#8b8d8c]">
                                {sortedSourceProfiles.length === 1 ? '1 perfil encontrado' : `${sortedSourceProfiles.length} perfis encontrados`}
                              </div>
                            )}

                            {!hasDuplicates ? (
                              sortedSourceProfiles.map(renderProfileItem)
                            ) : (
                              <>
                                <div className="px-1.5 pt-1 pb-1">
                                  <h3 className="text-[9px] font-bold text-[#8b8d8c] uppercase tracking-wider">Rever primeiro <span className="text-[#b0b2b1] px-0.5">•</span> {duplicateProfiles.length}</h3>
                                </div>
                                {duplicateProfiles.map(renderProfileItem)}
                                
                                {otherProfiles.length > 0 && (
                                  <>
                                    <div className="px-1.5 pt-3 pb-1 mt-1 border-t border-[#e1e3e2]/40">
                                      <h3 className="text-[9px] font-bold text-[#8b8d8c] uppercase tracking-wider">Outros perfis <span className="text-[#b0b2b1] px-0.5">•</span> {otherProfiles.length}</h3>
                                    </div>
                                    {otherProfiles.map(renderProfileItem)}
                                  </>
                                )}
                              </>
                            )}
                            
                            {postponedProfiles.length > 0 && (
                              <div className="px-1.5 pt-3 pb-1 mt-2 border-t border-[#e1e3e2]/40">
                                <div className="flex justify-between items-center mb-2 px-0.5">
                                  <h3 className="text-[9px] font-bold text-[#8b8d8c] uppercase tracking-wider">Adiados <span className="text-[#b0b2b1] px-0.5">•</span> {postponedProfiles.length}</h3>
                                  {postponedProfiles.length > 1 && (
                                    <button onClick={handleRevertPostponed} className="text-[9px] text-[#446656] font-medium decoration-[#c5ebd7] hover:underline underline-offset-2 transition-colors">
                                      Rever adiados
                                    </button>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  {postponedProfiles.map(p => (
                                    <div key={p.id} className="w-full bg-[#f3f4f3]/60 rounded-lg p-2 flex items-center justify-between border border-transparent">
                                      <div className="flex-1">
                                        <p className="text-xs font-bold text-[#5d605f]">{p.displayName}</p>
                                        <p className="text-[9px] text-[#8b8d8c] capitalize">
                                          {p.memberType} {p.age ? `· ${p.age} anos` : ''}
                                        </p>
                                      </div>
                                      <button 
                                        onClick={() => handleRestorePostponed(p.id)}
                                        className="text-[9px] text-[#5d605f] font-medium bg-white border border-[#e1e3e2] hover:bg-[#f9fdfa] transition-colors px-2 py-1.5 rounded shadow-sm shrink-0"
                                      >
                                        Voltar a mostrar
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mt-4 pt-2 flex flex-col gap-2">
                              {confirmSessionClose ? (
                                <div className="w-full flex items-center justify-between p-2 rounded-lg bg-[#fff2f2] border border-[#ffd7d6]">
                                  <span className="text-[9px] text-[#a83836] font-medium leading-tight ml-1 w-2/3">Ainda faltam perfis por rever. Fechar por agora?</span>
                                  <div className="flex gap-1.5 w-1/3 justify-end items-center">
                                    <button onClick={() => setConfirmSessionClose(false)} className="text-[9px] text-[#5d605f] font-medium bg-white px-2 py-1.5 rounded shadow-sm border border-[#e1e3e2] hover:bg-[#f3f4f3] flex-1">Cancelar</button>
                                    <button onClick={executeCloseSession} className="text-[9px] text-[#a83836] font-medium bg-white border border-[#ffd7d6] hover:bg-[#fff2f2] transition-colors px-2 py-1.5 rounded shadow-sm flex-1">Fechar</button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={handleCloseSession} className="text-[9px] text-[#8b8d8c] font-medium self-end md:hover:text-[#5d605f] transition-colors px-1 py-0.5 border-b border-transparent md:hover:border-[#e1e3e2]/40">
                                  Fechar por agora
                                </button>
                              )}
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <span className="text-[10px] text-[#b0b2b1] italic">Não há perfis na source por adicionar</span>
          )
        ) : null}
      </div>

      {/* Modals */}
      {viewingMember && (
        <MemberDetailModal
          memberId={viewingMember.id}
          openContext={viewingMember.context}
          suggestedProfileId={viewingMember.suggestedProfileId}
          onClose={() => setViewingMember(null)}
          onLinkedSuccess={() => {
            setFilter('todos')
            setJustLinkedId(viewingMember.id)
            setTimeout(() => setJustLinkedId(null), 3000)
          }}
        />
      )}
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
