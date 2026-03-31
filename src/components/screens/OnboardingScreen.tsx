'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Check, Shield, Users } from 'lucide-react'

export default function OnboardingScreen() {
  const {
    household,
    updateHousehold,
    members,
    toggleMemberActive,
    setOnboardingComplete,
    regeneratePlan,
    acceptDataSourceConsent,
  } = useAppStore()

  const [householdName, setHouseholdName] = useState(household.name || '')
  const [consentAccepted, setConsentAccepted] = useState(false)

  const handleComplete = () => {
    if (!consentAccepted || !householdName.trim()) return
    updateHousehold({ name: householdName })
    acceptDataSourceConsent('ablute_wellness', household.id)
    regeneratePlan() // generate a fresh plan based on the active members selected
    setOnboardingComplete(true)
  }

  const activeMembersCount = members.filter(m => m.isActive).length

  return (
    <div className="fixed inset-0 flex flex-col bg-[#faf9f8] p-5 h-full z-[100] max-w-[430px] mx-auto overflow-y-auto scrollbar-hide">
      <div className="pt-10 pb-6 flex-1 flex flex-col">
        {/* Banner/Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-[#303333] mb-2 text-balance leading-tight">
            Bem-vindo ao teu Planeador Alimentar
          </h1>
          <p className="text-[#5d605f] text-sm">Organiza as refeições de forma simples, respeitando perfis e necessidades.</p>
        </div>

        {/* Agregado name input */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#5d605f] mb-3">
            A. Nome do agregado familiar
          </label>
          <input
            type="text"
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
            className="w-full h-12 rounded-2xl bg-white border-0 shadow-ambient-sm px-4 focus:outline-none focus:ring-2 focus:ring-[#446656] transition-all text-[#303333]"
            placeholder="Ex: Família Silva"
          />
        </div>

        {/* Source connection */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#5d605f] mb-3 flex items-center gap-2">
            <Shield size={14} className="text-[#2e6771]" />
            B. Fonte de Dados (Source)
          </label>
          <div className="bg-[#b7effb]/30 border border-[#2e6771]/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-ambient-sm flex items-center justify-center">
                <Shield size={20} className="text-[#2e6771]" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#303333]">ablute_ wellness</p>
                <p className="text-xs text-[#5d605f]">Sincronização Ativa</p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#2e6771] flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
          </div>
        </div>

        {/* Consent Text */}
        <div className="mb-8">
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#5d605f] mb-3">
            C. Consentimento
          </label>
          <button
            onClick={() => setConsentAccepted(!consentAccepted)}
            className="w-full text-left"
          >
            <div className={`rounded-2xl p-4 border-2 transition-all ${consentAccepted ? 'border-[#446656] bg-white' : 'border-transparent bg-white shadow-ambient-sm'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 shrink-0 rounded-[8px] flex items-center justify-center mt-0.5 transition-colors ${consentAccepted ? 'bg-[#446656]' : 'bg-[#e1e3e2]'}`}>
                   {consentAccepted && <Check size={14} className="text-white" />}
                </div>
                <p className="text-[13px] leading-relaxed text-[#5d605f]">
                  Esta app utiliza dados nutricionais e resultados relevantes dos utilizadores ativos associados à sua conta em <strong>ablute_ wellness</strong>, para criar planos alimentares personalizados e convergentes entre os perfis selecionados. Ao continuar, aceita a partilha destes dados com esta app para efeitos de planeamento alimentar.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Active Members Choice */}
        <div className="mb-auto">
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#5d605f] mb-3 flex items-center gap-2">
            <Users size={14} />
            D. Seleção de Membros
          </label>
          <p className="text-xs text-[#5d605f] mb-3">Importados de ablute_ wellness. Ativa quem vai fazer parte deste plano inicial.</p>
          <div className="flex flex-wrap gap-2">
            {members.map(m => (
              <button
                key={m.id}
                onClick={() => toggleMemberActive(m.id)}
                className={`py-2 px-3 rounded-2xl border flex items-center gap-2 transition-all ${
                  m.isActive 
                    ? 'bg-white border-[#e1e3e2] shadow-ambient-sm' 
                    : 'bg-[#f3f4f3] border-transparent opacity-60'
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: m.color }}
                >
                  {m.name[0]}
                </div>
                <span className={`text-sm ${m.isActive ? 'font-medium text-[#303333]' : 'text-[#8b8d8c]'}`}>
                  {m.name}
                </span>
                {m.isActive && <Check size={14} className="text-[#446656] ml-1" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="pt-4 pb-6 mt-6 sticky bottom-0 bg-[#faf9f8]">
        <motion.button
          whileTap={consentAccepted && householdName && activeMembersCount > 0 ? { scale: 0.98 } : {}}
          disabled={!consentAccepted || !householdName.trim() || activeMembersCount === 0}
          onClick={handleComplete}
          className="w-full h-14 bg-[#446656] text-white rounded-2xl font-semibold text-lg hover:bg-[#365245] disabled:bg-[#b0b2b1] disabled:opacity-50 transition-all flex items-center justify-center shadow-ambient-md disabled:shadow-none"
        >
          E. Começar Planeamento
        </motion.button>
        {activeMembersCount === 0 && (
          <p className="text-center text-xs text-[#a83836] mt-3 font-medium">
            Ativa pelo menos um membro para continuar.
          </p>
        )}
      </div>
    </div>
  )
}
