'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Users, Calendar, ShieldCheck, Mail, Replace } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export default function SettingsDrawer() {
  const { isSettingsOpen, setSettingsOpen, household, members, subscription, dataSource, markDataSourceSynced, availableSourceProfiles } = useAppStore()

  if (!isSettingsOpen) return null

  const primaryUser = members.find(m => m.type === 'adulto' && m.isActive) || members[0]
  const apelido = 'Não disponível'
  const email = 'Não disponível'
  const sexo = 'Não definido'
  
  const activeMembers = members.filter(m => m.isActive)
  const linkedMembers = members.filter(m => m.sourceOrigin === 'ablute_wellness')
  const linkedCount = linkedMembers.length
  const unlinkedCount = availableSourceProfiles?.filter(p => !members.some(m => m.sourceProfileId === p.id)).length || 0

  const formatLinkedNames = () => {
    if (linkedCount === 0) return null
    const firstTwo = linkedMembers.slice(0, 2).map((m) => {
      const pName = availableSourceProfiles?.find(p => p.id === m.sourceProfileId)?.displayName?.split(' ')[0]
      return pName || m.name.split(' ')[0]
    })
    return linkedCount > 2 ? `${firstTwo.join(', ')} +${linkedCount - 2}` : firstTwo.join(', ')
  }

  const isExpired = subscription ? new Date() > new Date(subscription.endsAt) : false
  const fmtDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })
  }

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSettingsOpen(false)}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[360px] max-w-[90%] bg-[#faf9f8] z-[60] shadow-2xl flex flex-col overflow-y-auto scrollbar-hide"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#faf9f8]/90 backdrop-blur-md p-5 flex items-center justify-between z-10 border-b border-[#f3f4f3]">
              <h2 className="text-xl font-display font-bold text-[#303333]">Definições</h2>
              <button
                onClick={() => setSettingsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-2xl bg-white shadow-ambient-sm text-[#5d605f]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-6 pb-12">
              
              {/* A. Perfil pessoal */}
              <section>
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#5d605f] mb-3 flex items-center gap-2">
                  <User size={14} /> Perfil Pessoal
                </h3>
                <div className="bg-white rounded-2xl p-4 shadow-ambient-sm space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-[#f3f4f3]">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm"
                      style={{ backgroundColor: primaryUser?.color || '#446656' }}
                    >
                      {primaryUser?.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-[#303333]">{primaryUser?.name || 'Utilizador'}</p>
                      <p className="text-[10px] text-[#8b8d8c] uppercase mt-0.5">{apelido}</p>
                      <p className="text-xs text-[#5d605f] flex items-center gap-1 mt-1">
                        <ShieldCheck size={12} className={dataSource?.isActive ? 'text-[#2e6771]' : 'text-[#b0b2b1]'} />
                        {dataSource ? dataSource.sourceName.replace('_', ' ') : 'Nenhuma source'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div>
                      <p className="text-[10px] text-[#8b8d8c] uppercase font-medium">Idade</p>
                      <p className="text-[#303333]">{primaryUser?.age ? `${primaryUser.age} anos` : 'Não definida'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8b8d8c] uppercase font-medium">Sexo</p>
                      <p className="text-[#b0b2b1]">{sexo}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-[#8b8d8c] uppercase font-medium flex items-center gap-1">
                        <Mail size={10} /> Email
                      </p>
                      <p className="text-[#b0b2b1] truncate">{email}</p>
                    </div>
                  </div>

                  <button className="w-full mt-2 py-2.5 rounded-xl border border-[#e1e3e2] text-sm font-medium text-[#446656] flex items-center justify-center gap-2 hover:bg-[#f3f4f3] transition-colors">
                    <Replace size={14} /> Trocar perfil
                  </button>
                </div>
              </section>

              {/* B. Agregado familiar */}
              <section>
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#5d605f] mb-3 flex items-center gap-2">
                  <Users size={14} /> Agregado Familiar
                </h3>
                <div className="bg-white rounded-2xl p-4 shadow-ambient-sm space-y-4">
                  <div>
                    <p className="text-[10px] text-[#8b8d8c] uppercase font-medium">Nome</p>
                    <p className="text-[#303333] font-medium">{household.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] text-[#8b8d8c] uppercase font-medium mb-1.5">Membros Ativos ({activeMembers.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {activeMembers.map(m => (
                        <div key={m.id} className="flex items-center gap-1.5 bg-[#f3f4f3] px-2 py-1 rounded-lg">
                          <span className="text-xs">{m.avatar}</span>
                          <span className="text-xs font-medium text-[#5d605f]">{m.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#f3f4f3]">
                    <p className="text-[10px] text-[#8b8d8c] uppercase font-medium mb-2">Conexão de Dados (Source)</p>
                    {dataSource ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#5d605f] flex items-center gap-1">
                            <ShieldCheck size={12} className={dataSource.isActive ? "text-[#2e6771]" : "text-[#b0b2b1]"} />
                            <span className="capitalize">{dataSource.sourceName.replace('_', ' ')}</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded-md font-medium text-[10px] ${dataSource.isActive ? 'bg-[#c5ebd7] text-[#446656]' : 'bg-[#e1e3e2] text-[#8b8d8c]'}`}>
                            {dataSource.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#8b8d8c]">Estado Sync</span>
                          <span className="text-[#303333] flex items-center gap-1 capitalize">
                            {dataSource.syncStatus === 'sincronizado' ? '✓ ' : ''}{dataSource.syncStatus.replace('-', ' ')}
                            {dataSource.lastSyncedAt && <span className="text-[9px] text-[#8b8d8c] normal-case">({fmtDate(dataSource.lastSyncedAt)})</span>}
                          </span>
                        </div>
                        {dataSource.syncStatus !== 'sincronizado' ? (
                          <div className="flex justify-between items-center bg-[#f3f4f3]/60 p-2.5 rounded-xl mt-1 border border-[#e1e3e2]/40">
                            <span className="text-[10px] text-[#8b8d8c] italic leading-tight">Sincronize para resgatar<br/>perfis do agregado</span>
                            <button 
                              onClick={markDataSourceSynced}
                              className="text-[10px] bg-white border border-[#e1e3e2]/70 text-[#446656] px-3 py-1.5 rounded-lg shadow-sm font-bold hover:bg-[#f3f4f3] transition-colors"
                            >
                              Sincronizar
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1 bg-[#f3f4f3]/60 p-2.5 rounded-xl border border-[#e1e3e2]/40 mt-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-medium text-[#5d605f]">Membros ligados</span>
                              <span className="text-[10px] font-bold text-[#446656]">{linkedCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-medium text-[#5d605f]">Perfis disponíveis</span>
                              <span className="text-[10px] font-bold text-[#b0b2b1]">{unlinkedCount}</span>
                            </div>
                            {linkedCount > 0 && (
                              <div className="mt-1 pt-1 border-t border-[#e1e3e2]/60">
                                <span className="text-[9px] text-[#8b8d8c] italic">{formatLinkedNames()}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#8b8d8c]">Consentimento</span>
                          <span className="text-[#303333]">
                            {dataSource.consentAcceptedAt ? `Aceite a ${fmtDate(dataSource.consentAcceptedAt)}` : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#8b8d8c]">Nenhuma fonte de dados conectada.</p>
                    )}
                  </div>
                </div>
              </section>

              {/* C. Plano */}
              <section>
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#5d605f] mb-3 flex items-center gap-2">
                  <Calendar size={14} /> Informação do Plano
                </h3>
                <div className="bg-white rounded-2xl p-4 shadow-ambient-sm">
                  {subscription ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[#8b8d8c]">Tipo de Plano</span>
                        <span className="font-medium text-[#303333] capitalize">{subscription.planType}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8b8d8c]">Validade</span>
                        <span className="font-medium text-[#303333]">
                          {fmtDate(subscription.startsAt)} a {fmtDate(subscription.endsAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-[#f3f4f3]">
                        <span className="text-[#8b8d8c]">Estado</span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${isExpired ? 'bg-[#ffd7d6] text-[#a83836]' : 'bg-[#c5ebd7] text-[#446656]'}`}>
                          {isExpired ? 'Expirado' : 'A decorrer'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#5d605f]">Nenhum plano registado.</p>
                  )}
                </div>
              </section>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
