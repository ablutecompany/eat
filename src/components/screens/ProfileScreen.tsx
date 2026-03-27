'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { RefreshCw, Users, ChevronRight, Target, Clock, Euro, CreditCard, Settings } from 'lucide-react'

const GOAL_LABELS: Record<string, string> = {
  'saúde-familiar': 'Saúde Familiar',
  'praticidade': 'Praticidade',
  'gestão-restrições': 'Gestão de Restrições',
  'poupança': 'Poupança',
  'energia-performance': 'Energia e Performance',
}

export default function ProfileScreen() {
  const { household, updateHousehold, members, regeneratePlan, isRegenerating, showToast, subscription, dataSource } = useAppStore()
  const [budget, setBudget] = useState(household.budgetWeekly)

  const activeCount = members.filter((m) => m.isActive).length

  return (
    <div className="px-5 pt-4 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-[#303333] mb-1">Perfil</h1>
        <p className="text-sm text-[#5d605f]">{household.name} · {activeCount} membros ativos</p>
      </div>

      {/* Household summary card */}
      <div className="bg-[#c5ebd7] rounded-3xl p-5 mb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#446656] flex items-center justify-center">
            <Users size={18} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-[#303333]">{household.name}</p>
            <p className="text-xs text-[#446656]">{GOAL_LABELS[household.goal]}</p>
          </div>
        </div>
        <div className="flex gap-4 mb-3">
          {members.filter(m => m.isActive).map((m) => (
            <div key={m.id} className="flex flex-col items-center gap-1">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg"
                style={{ backgroundColor: m.color }}
              >
                {m.avatar}
              </div>
              <span className="text-[10px] font-medium text-[#446656]">{m.name}</span>
            </div>
          ))}
        </div>
        {dataSource && (
          <div className="flex items-center gap-2 pt-3 border-t border-[#446656]/20">
            <div className="w-2 h-2 rounded-full bg-[#446656]" />
            <span className="text-xs text-[#446656] font-medium">
              {dataSource.sourceName === 'ablute_wellness' ? 'ablute_ wellness' : dataSource.sourceName} · sincronizado
            </span>
          </div>
        )}
      </div>

      {/* Metas do Agregado */}
      <div className="mb-5">
        <h2 className="text-sm font-display font-bold text-[#303333] mb-3 uppercase tracking-wider">Metas do Agregado</h2>
        <div className="bg-white rounded-3xl overflow-hidden shadow-ambient">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#c5ebd7] flex items-center justify-center">
                <Target size={14} className="text-[#446656]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#303333]">Objetivo Geral</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#5d605f] text-sm">
              <span>{GOAL_LABELS[household.goal]}</span>
              <ChevronRight size={14} />
            </div>
          </div>
          <div className="h-px bg-[#f3f4f3] mx-4" />
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#c5ebd7] flex items-center justify-center">
                  <Euro size={14} className="text-[#446656]" />
                </div>
                <p className="text-sm font-medium text-[#303333]">Orçamento Semanal</p>
              </div>
              <span className="text-sm text-[#5d605f] font-medium">€{budget}/sem</span>
            </div>
            <input
              type="range"
              min={50}
              max={300}
              step={5}
              value={budget}
              onChange={(e) => {
                setBudget(Number(e.target.value))
                updateHousehold({ budgetWeekly: Number(e.target.value) })
              }}
              className="w-full accent-[#446656]"
            />
            <div className="flex justify-between text-[10px] text-[#b0b2b1] mt-1">
              <span>€50</span>
              <span>€300</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferências */}
      <div className="mb-5">
        <h2 className="text-sm font-display font-bold text-[#303333] mb-3 uppercase tracking-wider">Preferências</h2>
        <div className="bg-white rounded-3xl overflow-hidden shadow-ambient">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#f8dfc0] flex items-center justify-center">
                <Clock size={14} className="text-[#6e5c44]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#303333]">Tempo de Cozinhar</p>
                <p className="text-xs text-[#5d605f]">Máx. {household.maxCookTime} min por refeição</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-[#b0b2b1]" />
          </div>
          <div className="h-px bg-[#f3f4f3] mx-4" />
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#f8dfc0] flex items-center justify-center">
                <Settings size={14} className="text-[#6e5c44]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#303333]">Restrições Alimentares</p>
                <p className="text-xs text-[#5d605f]">3 restrições ativas</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-[#b0b2b1]" />
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-3 mb-5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={regeneratePlan}
          disabled={isRegenerating}
          className="w-full flex items-center justify-center gap-2 btn-primary-gradient text-white py-4 rounded-3xl font-semibold text-sm shadow-ambient-md disabled:opacity-70"
        >
          <motion.div
            animate={{ rotate: isRegenerating ? 360 : 0 }}
            transition={{ duration: 1, repeat: isRegenerating ? Infinity : 0, ease: 'linear' }}
          >
            <RefreshCw size={16} />
          </motion.div>
          {isRegenerating ? 'A regenerar semana...' : 'Regerar Semana'}
        </motion.button>

        <button
          onClick={() => showToast('A aplicar apenas a membros ativos...')}
          className="w-full bg-white text-[#446656] py-3.5 rounded-3xl font-semibold text-sm shadow-ambient"
        >
          Aplicar apenas a membros ativos
        </button>
      </div>

      {/* Conta e Assinatura */}
      <div className="mb-5">
        <h2 className="text-sm font-display font-bold text-[#303333] mb-3 uppercase tracking-wider">Conta e Assinatura</h2>
        <div className="bg-white rounded-3xl overflow-hidden shadow-ambient">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#f3f4f3] flex items-center justify-center">
                <Settings size={14} className="text-[#5d605f]" />
              </div>
              <p className="text-sm font-medium text-[#303333]">Definições da Conta</p>
            </div>
            <ChevronRight size={14} className="text-[#b0b2b1]" />
          </div>
          <div className="h-px bg-[#f3f4f3] mx-4" />
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#c5ebd7] flex items-center justify-center">
                <CreditCard size={14} className="text-[#446656]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#303333]">Assinatura</p>
                <p className="text-xs text-[#446656] font-medium">
                  {subscription?.planType === 'semanal' ? 'Plano Semanal' :
                   subscription?.planType === 'mensal' ? 'Plano Mensal' :
                   'Plano Premium'}
                  {subscription?.isActive ? ' · Ativo' : ' · Inativo'}
                </p>
              </div>
            </div>
            <ChevronRight size={14} className="text-[#b0b2b1]" />
          </div>
        </div>
      </div>
    </div>
  )
}
