'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Search, Home, Minus, Plus as PlusIcon, X, Check, ShoppingCart } from 'lucide-react'
import { ShoppingCategory, ShoppingItem } from '@/lib/types'

const CATEGORIES: ShoppingCategory[] = [
  'Hortifruti', 'Talho', 'Peixaria', 'Lacticínios', 'Mercearia', 'Congelados', 'Outros'
]

const CATEGORY_EMOJIS: Record<ShoppingCategory, string> = {
  'Hortifruti': '🥦',
  'Talho': '🥩',
  'Peixaria': '🐟',
  'Lacticínios': '🥛',
  'Mercearia': '🛒',
  'Congelados': '❄️',
  'Outros': '📦',
}

function parseQty(q: string): number {
  return parseFloat(q) || 0
}

function remaining(item: ShoppingItem): { value: number; display: string } {
  const total = parseQty(item.quantity)
  const have = item.pantryQuantity ?? 0
  const left = Math.max(0, total - have)
  return { value: left, display: left % 1 === 0 ? String(left) : left.toFixed(1) }
}

function fmtQty(item: ShoppingItem, qty?: number): string {
  const v = qty ?? parseQty(item.quantity)
  const display = v % 1 === 0 ? String(v) : v.toFixed(1)
  return item.unit && item.unit !== 'unidades' ? `${display}${item.unit}` : `${display} ${item.unit}`
}

export default function ShoppingScreen() {
  const {
    shoppingItems,
    members,
    toggleShoppingItem,
    checkAllShoppingItems,
    setPantryQuantity,
  } = useAppStore()

  const [search, setSearch] = useState('')
  const [pantryItem, setPantryItem] = useState<ShoppingItem | null>(null)
  const [pantryInput, setPantryInput] = useState('')

  const getMemberColor = (id: string) => members.find((m) => m.id === id)?.color || '#b0b2b1'
  const getMemberName = (id: string) => members.find((m) => m.id === id)?.name || ''

  const filtered = useMemo(() => {
    if (!search) return shoppingItems
    return shoppingItems.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [shoppingItems, search])

  const selectedCount = shoppingItems.filter((i) => i.checked).length
  const totalCount = shoppingItems.length
  const allSelected = selectedCount === totalCount

  const openPantryDrawer = (item: ShoppingItem) => {
    setPantryItem(item)
    setPantryInput(item.pantryQuantity != null ? String(item.pantryQuantity) : '')
  }

  const confirmPantry = () => {
    if (!pantryItem) return
    const qty = parseFloat(pantryInput)
    if (!isNaN(qty) && qty >= 0) {
      setPantryQuantity(pantryItem.id, qty)
    }
    setPantryItem(null)
  }

  const nudge = (delta: number) => {
    if (!pantryItem) return
    const total = parseQty(pantryItem.quantity)
    const step = Math.max(1, Math.round(total * 0.1))
    const current = parseFloat(pantryInput) || 0
    const next = Math.min(total, Math.max(0, current + delta * step))
    setPantryInput(String(next))
  }

  return (
    <div className="px-5 pt-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-display font-bold text-[#303333] leading-tight">
          Lista de Compras
        </h1>
        <div className="flex items-center justify-between mt-1">
          {/* Counter — "para comprar" framing */}
          <p className="text-sm text-[#5d605f]">
            {selectedCount > 0 ? (
              <>
                <span className="font-semibold text-[#446656]">{selectedCount}</span>
                {' '}de {totalCount} para comprar
              </>
            ) : (
              `${totalCount} itens na lista`
            )}
          </p>

          {/* Select-all / Deselect-all */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => checkAllShoppingItems(!allSelected)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              allSelected
                ? 'bg-[#446656] text-white'
                : 'bg-white text-[#5d605f] shadow-ambient'
            }`}
          >
            {allSelected ? (
              <>
                <X size={11} />
                Desselecionar todos
              </>
            ) : (
              <>
                <ShoppingCart size={11} />
                Selecionar todos
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Progress bar — shows "para comprar" fill */}
      {selectedCount > 0 && (
        <div className="h-2 bg-[#f3f4f3] rounded-full overflow-hidden mb-4">
          <motion.div
            animate={{ width: `${(selectedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-[#446656] to-[#2e6771]"
          />
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2.5 shadow-ambient mb-5">
        <Search size={16} className="text-[#b0b2b1]" />
        <input
          type="text"
          placeholder="Procurar itens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm bg-transparent outline-none text-[#303333] placeholder-[#b0b2b1]"
        />
      </div>

      {/* Categories */}
      <div className="space-y-5 mb-6">
        {CATEGORIES.map((category) => {
          const items = filtered.filter((i) => i.category === category)
          if (items.length === 0) return null

          const catSelected = items.filter((i) => i.checked).length

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{CATEGORY_EMOJIS[category]}</span>
                <h2 className="text-base font-display font-bold text-[#303333]">{category}</h2>
                <span className="text-xs text-[#b0b2b1] ml-auto">
                  {catSelected}/{items.length} selecionados
                </span>
              </div>

              <div className="bg-white rounded-3xl overflow-hidden shadow-ambient">
                {items.map((item, i) => {
                  const rem = remaining(item)
                  const hasPantry = (item.pantryQuantity ?? 0) > 0
                  const fullyInPantry = item.inPantry || rem.value === 0

                  return (
                    <div key={item.id}>
                      <motion.div
                        animate={{
                          backgroundColor: item.checked ? '#f0f9f4' : '#ffffff',
                        }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 px-4 py-3.5"
                      >
                        {/* Checkbox — "para comprar" state */}
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => toggleShoppingItem(item.id)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                            item.checked
                              ? 'bg-[#446656] border-[#446656]'
                              : 'border-[#b0b2b1] bg-white'
                          }`}
                          aria-label={item.checked ? 'Remover da lista' : 'Adicionar à lista'}
                        >
                          {item.checked && (
                            <ShoppingCart size={12} className="text-white" />
                          )}
                        </motion.button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            {/* Name — NO strikethrough; checked = "to buy" */}
                            <span className={`text-sm font-medium text-[#303333] transition-all`}>
                              {item.name}
                            </span>

                            {/* Quantity */}
                            <span className="text-xs text-[#5d605f]">
                              {hasPantry && !fullyInPantry ? (
                                <>
                                  <span className="font-semibold text-[#446656]">
                                    faltam {fmtQty(item, rem.value)}
                                  </span>
                                  <span className="text-[#b0b2b1] ml-1">
                                    (tens {fmtQty(item, item.pantryQuantity)})
                                  </span>
                                </>
                              ) : fullyInPantry ? (
                                <span className="text-[#446656] font-medium">✓ tens em casa</span>
                              ) : (
                                `(${fmtQty(item)})`
                              )}
                            </span>
                          </div>

                          {item.recipes.length > 0 && (
                            <p className="text-[10px] text-[#b0b2b1] mt-0.5">
                              {item.recipes.join(', ')}
                            </p>
                          )}

                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {item.memberIds.map((mid) => (
                              <div
                                key={mid}
                                className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                                style={{ backgroundColor: getMemberColor(mid) }}
                              >
                                {getMemberName(mid)}
                              </div>
                            ))}
                            <span className="text-[10px] text-[#5d605f] ml-1">
                              {item.relationType === 'comum' ? 'Comum' :
                               item.relationType === 'individual' ? 'Individual' : 'Subgrupo'}
                            </span>
                          </div>
                        </div>

                        {/* Pantry home button */}
                        <motion.button
                          whileTap={{ scale: 0.88 }}
                          onClick={() => openPantryDrawer(item)}
                          className={`relative p-2 rounded-xl transition-all ${
                            hasPantry || fullyInPantry
                              ? 'bg-[#c5ebd7] text-[#446656]'
                              : 'bg-[#f3f4f3] text-[#b0b2b1]'
                          }`}
                          title="Já tenho em casa"
                        >
                          <Home size={15} />
                          {hasPantry && !fullyInPantry && (
                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#446656] border-2 border-white" />
                          )}
                        </motion.button>
                      </motion.div>
                      {i < items.length - 1 && <div className="h-px bg-[#f3f4f3] mx-4" />}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ===== PANTRY QUANTITY DRAWER ===== */}
      <AnimatePresence>
        {pantryItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPantryItem(null)}
              className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-3xl z-[60] pb-safe"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-[#e1e3e2] rounded-full" />
              </div>

              <div className="px-5 pt-3 pb-8">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-display font-bold text-lg text-[#303333]">
                      {pantryItem.name}
                    </h2>
                    <p className="text-sm text-[#5d605f]">
                      Necessário: <span className="font-medium text-[#303333]">{fmtQty(pantryItem)}</span>
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPantryItem(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#f3f4f3] text-[#5d605f]"
                  >
                    <X size={15} />
                  </motion.button>
                </div>

                <p className="text-sm font-medium text-[#5d605f] mb-4">Quanto tens em casa?</p>

                <div className="flex items-center gap-3 mb-3">
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => nudge(-1)}
                    className="w-11 h-11 rounded-2xl bg-[#f3f4f3] flex items-center justify-center text-[#5d605f]"
                  >
                    <Minus size={18} />
                  </motion.button>

                  <div className="flex-1 flex items-center gap-2 bg-[#f3f4f3] rounded-2xl px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      max={parseFloat(pantryItem.quantity) * 2}
                      step="any"
                      value={pantryInput}
                      onChange={(e) => setPantryInput(e.target.value)}
                      className="flex-1 text-xl font-display font-bold text-[#303333] bg-transparent outline-none text-center"
                      placeholder="0"
                    />
                    <span className="text-sm text-[#5d605f] font-medium shrink-0">
                      {pantryItem.unit}
                    </span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => nudge(1)}
                    className="w-11 h-11 rounded-2xl bg-[#f3f4f3] flex items-center justify-center text-[#5d605f]"
                  >
                    <PlusIcon size={18} />
                  </motion.button>
                </div>

                <div className="flex gap-2 mb-5 flex-wrap">
                  {[0, 25, 50, 75, 100].map((pct) => {
                    const qty = Math.round((parseFloat(pantryItem.quantity) * pct) / 100)
                    return (
                      <motion.button
                        key={pct}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => setPantryInput(String(qty))}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all min-w-[48px] ${
                          pantryInput === String(qty)
                            ? 'bg-[#446656] text-white'
                            : 'bg-[#f3f4f3] text-[#5d605f]'
                        }`}
                      >
                        {pct === 0 ? 'Nada' : pct === 100 ? 'Tudo' : `${pct}%`}
                      </motion.button>
                    )
                  })}
                </div>

                {pantryInput !== '' && parseFloat(pantryInput) > 0 && (
                  <div className="bg-[#c5ebd7] rounded-2xl px-4 py-3 mb-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#446656] flex items-center justify-center">
                      <Home size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-[#446656] font-medium">Falta comprar</p>
                      <p className="text-base font-display font-bold text-[#303333]">
                        {(() => {
                          const total = parseFloat(pantryItem.quantity)
                          const have = parseFloat(pantryInput) || 0
                          const left = Math.max(0, total - have)
                          const display = left % 1 === 0 ? String(left) : left.toFixed(1)
                          return left === 0
                            ? 'Nada — tens o suficiente! ✓'
                            : `${display} ${pantryItem.unit}`
                        })()}
                      </p>
                    </div>
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={confirmPantry}
                  className="w-full flex items-center justify-center gap-2 btn-primary-gradient text-white py-4 rounded-3xl font-semibold text-sm"
                >
                  <Check size={16} />
                  Confirmar
                </motion.button>

                {(pantryItem.pantryQuantity ?? 0) > 0 && (
                  <button
                    onClick={() => {
                      setPantryQuantity(pantryItem.id, 0)
                      setPantryItem(null)
                    }}
                    className="w-full text-center text-sm text-[#b0b2b1] mt-3 py-2"
                  >
                    Limpar quantidade em casa
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
