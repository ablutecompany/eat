'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Check, ChevronRight, Leaf } from 'lucide-react'

const GOALS = [
  { id: 'saúde-familiar', label: 'Saúde Familiar', emoji: '💚', desc: 'Alimentação equilibrada para toda a família' },
  { id: 'praticidade', label: 'Praticidade', emoji: '⚡', desc: 'Refeições rápidas e simples' },
  { id: 'gestão-restrições', label: 'Gerir Restrições', emoji: '🛡', desc: 'Alergias, intolerâncias e exclusões' },
  { id: 'poupança', label: 'Poupar', emoji: '💶', desc: 'Refeições económicas e sem desperdício' },
  { id: 'energia-performance', label: 'Energia e Performance', emoji: '🏃', desc: 'Nutrição para alto desempenho' },
]

const slide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

export default function Onboarding() {
  const { setOnboardingComplete, setOnboardingStep, updateHousehold, setDataSource } = useAppStore()
  const [step, setStep] = useState(0)
  const [householdName, setHouseholdName] = useState('')
  const [selectedGoal, setSelectedGoal] = useState('saúde-familiar')
  const [sourceActivated, setSourceActivated] = useState(false)

  const totalSteps = 5

  const nextStep = () => {
    if (step < totalSteps - 1) {
      if (step === 3 && !sourceActivated) {
        // Do nothing if on source step and not activated
        return
      }
      setStep(step + 1)
      setOnboardingStep(step + 1)
    } else {
      // Complete onboarding
      updateHousehold({
        name: householdName || 'A Minha Casa',
        goal: selectedGoal as any,
      })
      setOnboardingComplete(true)
    }
  }

  return (
    <div className="fixed inset-0 bg-[#faf9f8] flex flex-col" style={{ maxWidth: 430, margin: '0 auto' }}>
      {/* Progress */}
      <div className="flex gap-1.5 px-5 pt-12">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ width: i === step ? '100%' : i < step ? '100%' : '8px' }}
            className={`h-1 rounded-full transition-all duration-500 ${
              i <= step ? 'bg-[#446656]' : 'bg-[#e1e3e2]'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <motion.div key="s0" {...slide} className="flex-1 flex flex-col px-5 pt-12 pb-8">
            <div className="flex-1">
              <div className="w-16 h-16 rounded-3xl bg-[#c5ebd7] flex items-center justify-center mb-6">
                <Leaf size={28} className="text-[#446656]" />
              </div>
              <h1 className="text-4xl font-display font-bold text-[#303333] leading-tight mb-3">
                Bem-vindo ao<br />
                <span className="text-[#446656]">eat</span>
              </h1>
              <p className="text-[#5d605f] leading-relaxed text-base mb-4">
                Planeamento alimentar inteligente para toda a tua família.
              </p>
              <p className="text-sm text-[#5d605f] leading-relaxed">
                Cruza as necessidades de cada membro, encontra receitas compatíveis, gera planos semanais e sincroniza a lista de compras — tudo numa só app.
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={nextStep}
              className="w-full btn-primary-gradient text-white py-4 rounded-3xl font-semibold flex items-center justify-center gap-2"
            >
              Começar
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* Step 1: Household name */}
        {step === 1 && (
          <motion.div key="s1" {...slide} className="flex-1 flex flex-col px-5 pt-12 pb-8">
            <div className="flex-1">
              <h2 className="text-3xl font-display font-bold text-[#303333] mb-2">Como chamas<br />a tua família?</h2>
              <p className="text-sm text-[#5d605f] mb-8">Este nome aparece ao longo da app.</p>
              <input
                type="text"
                placeholder="ex: Casa Silva, A Nossa Família..."
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                className="w-full bg-white rounded-2xl px-4 py-4 text-base text-[#303333] outline-none shadow-ambient focus:ring-2 focus:ring-[#c5ebd7] transition-all"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="px-6 py-4 bg-[#f3f4f3] text-[#5d605f] rounded-3xl font-semibold text-sm">
                Voltar
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={nextStep}
                className="flex-1 btn-primary-gradient text-white py-4 rounded-3xl font-semibold text-sm"
              >
                Continuar
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <motion.div key="s2" {...slide} className="flex-1 flex flex-col px-5 pt-10 pb-8">
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <h2 className="text-3xl font-display font-bold text-[#303333] mb-2">Qual é o vosso<br />objetivo principal?</h2>
              <p className="text-sm text-[#5d605f] mb-6">Irá personalizar as recomendações.</p>
              <div className="space-y-2">
                {GOALS.map((g) => (
                  <motion.button
                    key={g.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedGoal(g.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all ${
                      selectedGoal === g.id
                        ? 'bg-[#c5ebd7] ring-2 ring-[#446656]'
                        : 'bg-white shadow-ambient'
                    }`}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-[#303333] text-sm">{g.label}</p>
                      <p className="text-xs text-[#5d605f]">{g.desc}</p>
                    </div>
                    {selectedGoal === g.id && (
                      <div className="w-5 h-5 rounded-full bg-[#446656] flex items-center justify-center">
                        <Check size={11} className="text-white" strokeWidth={2.5} />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(1)} className="px-6 py-4 bg-[#f3f4f3] text-[#5d605f] rounded-3xl font-semibold text-sm">
                Voltar
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={nextStep}
                className="flex-1 btn-primary-gradient text-white py-4 rounded-3xl font-semibold text-sm"
              >
                Continuar
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 3: DataSource Connection */}
        {step === 3 && (
          <motion.div key="s3_source" {...slide} className="flex-1 flex flex-col px-5 pt-12 pb-8">
            <div className="flex-1">
              <div className="w-16 h-16 rounded-3xl bg-[#d1e0ff] flex items-center justify-center mb-6">
                <Leaf size={28} className="text-[#3b5bdb]" />
              </div>
              <h2 className="text-3xl font-display font-bold text-[#303333] mb-3">Conectar Dados</h2>
              <p className="text-sm text-[#5d605f] leading-relaxed mb-8">
                Esta app utiliza dados nutricionais e resultados relevantes dos utilizadores ativos associados à sua conta em ablute_ wellness, para criar planos alimentares personalizados e convergentes entre os perfis selecionados. Ao continuar, aceita a partilha destes dados com esta app para efeitos de planeamento alimentar.
              </p>
              
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSourceActivated(true)
                  setDataSource({
                    id: 'ds-001',
                    householdId: 'hh-001',
                    sourceName: 'ablute_wellness',
                    isActive: true,
                    consentAcceptedAt: new Date().toISOString(),
                    lastSyncedAt: new Date().toISOString(),
                  })
                }}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all ${
                  sourceActivated 
                    ? 'bg-[#c5ebd7] text-[#446656] font-bold border-2 border-[#446656]' 
                    : 'bg-white border-2 border-dashed border-[#e1e3e2] text-[#5d605f]'
                }`}
              >
                {sourceActivated ? <Check size={20} /> : null}
                {sourceActivated ? 'Source Ativada' : 'Ativar Source'}
              </motion.button>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(2)} className="px-6 py-4 bg-[#f3f4f3] text-[#5d605f] rounded-3xl font-semibold text-sm">
                Voltar
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={nextStep}
                disabled={!sourceActivated}
                className={`flex-1 py-4 rounded-3xl font-semibold text-sm ${
                  sourceActivated ? 'btn-primary-gradient text-white' : 'bg-[#e1e3e2] text-[#a0a3a2]'
                }`}
              >
                Continuar
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Ready */}
        {step === 4 && (
          <motion.div key="s3" {...slide} className="flex-1 flex flex-col px-5 pt-12 pb-8">
            <div className="flex-1">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-display font-bold text-[#303333] mb-3">Tudo pronto!</h2>
              <p className="text-[#5d605f] leading-relaxed text-base mb-4">
                O teu agregado está configurado com dados de demonstração — a{' '}
                <span className="font-semibold text-[#303333]">Casa Silva</span> com os membros Ana, Pedro e Lucas.
              </p>
              <p className="text-sm text-[#5d605f] leading-relaxed">
                Podes editar tudo em <strong>Agregado</strong> e <strong>Perfil</strong>. O plano semanal já está gerado e pronto a usar.
              </p>

              {/* Preview chips */}
              <div className="flex gap-2 mt-6 flex-wrap">
                {[
                  { label: '7 dias planeados', emoji: '📅' },
                  { label: '7 receitas', emoji: '🍽' },
                  { label: '3 membros', emoji: '👨‍👩‍👧' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5 bg-white rounded-2xl px-3 py-2 shadow-ambient">
                    <span>{item.emoji}</span>
                    <span className="text-xs font-medium text-[#303333]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={nextStep}
              className="w-full btn-primary-gradient text-white py-4 rounded-3xl font-semibold flex items-center justify-center gap-2"
            >
              Ver o meu Plano
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
