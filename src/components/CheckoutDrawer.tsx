'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import {
  X, ShoppingCart, MessageCircle, Mail, Truck, Download,
  FileText, ChevronRight, AlertCircle, Check, Share2, ExternalLink,
} from 'lucide-react'
import {
  generateShoppingList,
  downloadShoppingList,
  shareShoppingList,
  shareWhatsApp,
  shareMail,
} from '@/lib/generateShoppingList'

interface Props {
  onClose: () => void
}

type Step = 'confirm' | 'share'

export default function CheckoutDrawer({ onClose }: Props) {
  const { shoppingItems, members, household, showToast } = useAppStore()
  const [step, setStep] = useState<Step>('confirm')
  const [isGenerating, setIsGenerating] = useState(false)
  const [listGenerated, setListGenerated] = useState(false)

  const selectedItems = shoppingItems.filter((i) => i.checked)
  const itemCount = selectedItems.length > 0 ? selectedItems.length : shoppingItems.length
  const hasSelection = selectedItems.length > 0

  const memberNames: Record<string, string> = Object.fromEntries(
    members.map((m) => [m.id, m.name])
  )

  const generateAndProceed = async () => {
    setIsGenerating(true)
    await new Promise((res) => setTimeout(res, 800)) // brief UX pause for generation feel
    setIsGenerating(false)
    setListGenerated(true)
    setStep('share')
  }

  const getList = () =>
    generateShoppingList(shoppingItems, household.name, memberNames)

  const handleWhatsApp = () => {
    const list = getList()
    shareWhatsApp(list)
    showToast('A abrir WhatsApp...')
  }

  const handleMail = () => {
    const list = getList()
    shareMail(list)
    showToast('A abrir o email...')
  }

  const handleNativeShare = async () => {
    const list = getList()
    const shared = await shareShoppingList(list)
    if (!shared) {
      downloadShoppingList(list)
      showToast('Ficheiro descarregado!')
    } else {
      showToast('Lista partilhada com sucesso!')
    }
  }

  const handleDownload = () => {
    const list = getList()
    downloadShoppingList(list)
    showToast('Ficheiro descarregado!')
  }

  const handleOnlineOrder = () => {
    showToast('Disponível em breve 🚀')
  }

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[32px] z-[60]"
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-[#e1e3e2] rounded-full" />
          </div>

          <div className="px-5 pb-10">
            {/* ===== STEP 1: CONFIRM ===== */}
            {step === 'confirm' && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between pt-3 mb-5">
                  <div>
                    <h2 className="font-display font-bold text-xl text-[#303333]">
                      Confirmar Compra
                    </h2>
                    <p className="text-sm text-[#5d605f] mt-0.5">
                      {hasSelection
                        ? `${itemCount} itens selecionados para comprar`
                        : `${itemCount} itens na lista de compras`}
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#f3f4f3] text-[#5d605f]"
                  >
                    <X size={16} />
                  </motion.button>
                </div>

                {/* Summary card */}
                <div className="bg-[#c5ebd7] rounded-3xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#446656] flex items-center justify-center">
                      <FileText size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-[#303333]">Lista de Compras</p>
                      <p className="text-xs text-[#446656]">{household.name} · {itemCount} itens</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#446656] leading-relaxed">
                    Ao confirmar, será gerado um ficheiro com a tua lista de compras completa, incluindo quantidades e membros associados a cada item.
                  </p>
                </div>

                {/* Options info */}
                <div className="bg-white rounded-3xl border border-[#f3f4f3] overflow-hidden mb-5 shadow-ambient">
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-8 h-8 rounded-xl bg-[#f0f9f4] flex items-center justify-center">
                      <Share2 size={14} className="text-[#446656]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#303333]">Partilhar ficheiro</p>
                      <p className="text-xs text-[#5d605f]">WhatsApp, email ou outra app</p>
                    </div>
                    <Check size={14} className="text-[#446656]" />
                  </div>
                  <div className="h-px bg-[#f3f4f3] mx-4" />
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-8 h-8 rounded-xl bg-[#f0f9f4] flex items-center justify-center">
                      <Truck size={14} className="text-[#446656]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#303333]">Compra online</p>
                      <p className="text-xs text-[#5d605f]">Levantamento no local ou entrega ao domicílio</p>
                    </div>
                    <span className="text-[10px] font-medium text-[#2e6771] bg-[#b7effb] px-2 py-0.5 rounded-full">
                      Em breve
                    </span>
                  </div>
                </div>

                {/* Notice */}
                <div className="flex items-start gap-2 mb-6 px-1">
                  <AlertCircle size={14} className="text-[#b0b2b1] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#b0b2b1] leading-relaxed">
                    A opção de compra online permitirá efectuar a encomenda directamente para levantamento no supermercado mais próximo, ou com entrega ao domicílio mediante taxa adicional.
                  </p>
                </div>

                {/* CTA */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={generateAndProceed}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 btn-primary-gradient text-white py-4 rounded-3xl font-semibold text-sm shadow-ambient-md disabled:opacity-70"
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                      />
                      A gerar lista...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      Confirmar e gerar lista
                    </>
                  )}
                </motion.button>

                <button
                  onClick={onClose}
                  className="w-full text-center text-sm text-[#b0b2b1] mt-3 py-2"
                >
                  Cancelar
                </button>
              </>
            )}

            {/* ===== STEP 2: SHARE ===== */}
            {step === 'share' && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between pt-3 mb-2">
                  <div>
                    <h2 className="font-display font-bold text-xl text-[#303333]">
                      Lista Gerada ✓
                    </h2>
                    <p className="text-sm text-[#5d605f] mt-0.5">
                      Escolhe como partilhar ou efectuar a compra
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#f3f4f3] text-[#5d605f]"
                  >
                    <X size={16} />
                  </motion.button>
                </div>

                {/* File preview pill */}
                <div className="flex items-center gap-3 bg-[#f3f4f3] rounded-2xl px-4 py-3 mb-5 mt-4">
                  <div className="w-9 h-9 rounded-xl bg-[#446656] flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#303333] truncate">
                      lista-compras-{new Date().toISOString().slice(0, 10)}.txt
                    </p>
                    <p className="text-xs text-[#5d605f]">{itemCount} itens · {household.name}</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDownload}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-[#5d605f] shadow-ambient"
                  >
                    <Download size={14} />
                  </motion.button>
                </div>

                {/* Share options */}
                <p className="text-xs font-semibold text-[#b0b2b1] uppercase tracking-wider mb-3 px-1">
                  Partilhar lista
                </p>

                <div className="bg-white rounded-3xl overflow-hidden shadow-ambient mb-4">
                  {/* WhatsApp */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWhatsApp}
                    className="w-full flex items-center gap-3 px-4 py-4 text-left"
                  >
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#25D366]/10">
                      <MessageCircle size={18} className="text-[#25D366]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-[#303333]">WhatsApp</p>
                      <p className="text-xs text-[#5d605f]">Enviar lista por mensagem</p>
                    </div>
                    <ChevronRight size={16} className="text-[#b0b2b1]" />
                  </motion.button>

                  <div className="h-px bg-[#f3f4f3] mx-4" />

                  {/* Email */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMail}
                    className="w-full flex items-center gap-3 px-4 py-4 text-left"
                  >
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-50">
                      <Mail size={18} className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-[#303333]">Email</p>
                      <p className="text-xs text-[#5d605f]">Enviar por correio eletrónico</p>
                    </div>
                    <ChevronRight size={16} className="text-[#b0b2b1]" />
                  </motion.button>

                  <div className="h-px bg-[#f3f4f3] mx-4" />

                  {/* Native Share / Download */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNativeShare}
                    className="w-full flex items-center gap-3 px-4 py-4 text-left"
                  >
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#f3f4f3]">
                      <Share2 size={18} className="text-[#5d605f]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-[#303333]">Outra app</p>
                      <p className="text-xs text-[#5d605f]">Partilhar ou guardar ficheiro</p>
                    </div>
                    <ChevronRight size={16} className="text-[#b0b2b1]" />
                  </motion.button>
                </div>

                {/* Online order — coming soon */}
                <p className="text-xs font-semibold text-[#b0b2b1] uppercase tracking-wider mb-3 px-1">
                  Compra online
                </p>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOnlineOrder}
                  className="w-full flex items-center gap-3 px-4 py-4 bg-white rounded-3xl shadow-ambient relative overflow-hidden"
                >
                  {/* "Em breve" overlay tint */}
                  <div className="absolute inset-0 bg-white/60" />
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#f8dfc0] relative z-10">
                    <Truck size={18} className="text-[#6e5c44]" />
                  </div>
                  <div className="flex-1 text-left relative z-10">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-[#303333]">Encomendar online</p>
                      <span className="text-[10px] font-medium text-[#2e6771] bg-[#b7effb] px-2 py-0.5 rounded-full">
                        Em breve
                      </span>
                    </div>
                    <p className="text-xs text-[#5d605f]">
                      Levantamento no local · Entrega ao domicílio (+taxa)
                    </p>
                  </div>
                  <ExternalLink size={14} className="text-[#b0b2b1] relative z-10" />
                </motion.button>

                <p className="text-xs text-[#b0b2b1] text-center mt-3 leading-relaxed px-4">
                  A compra online estará disponível em breve com integração directa a supermercados parceiros.
                </p>
              </>
            )}
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  )
}
