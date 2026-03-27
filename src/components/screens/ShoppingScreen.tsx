'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Search, Home } from 'lucide-react'
import { ShoppingCategory } from '@/lib/types'

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

export default function ShoppingScreen() {
  const { shoppingItems, members, toggleShoppingItem, toggleInPantry } = useAppStore()
  const [search, setSearch] = useState('')
  const [hideChecked, setHideChecked] = useState(false)

  const getMemberColor = (id: string) => members.find((m) => m.id === id)?.color || '#b0b2b1'
  const getMemberName = (id: string) => members.find((m) => m.id === id)?.name || ''

  const filtered = useMemo(() => {
    return shoppingItems.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
      const matchHide = hideChecked ? !item.checked : true
      return matchSearch && matchHide
    })
  }, [shoppingItems, search, hideChecked])

  const checkedCount = shoppingItems.filter((i) => i.checked).length
  const totalCount = shoppingItems.length

  return (
    <div className="px-5 pt-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-display font-bold text-[#303333] leading-tight">
          Lista de Compras
        </h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-[#5d605f]">
            {checkedCount} de {totalCount} itens comprados
          </p>
          <button
            onClick={() => setHideChecked(!hideChecked)}
            className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
              hideChecked ? 'bg-[#446656] text-white' : 'bg-white text-[#5d605f] shadow-ambient'
            }`}
          >
            {hideChecked ? 'Mostrar todos' : 'Ocultar comprados'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-[#f3f4f3] rounded-full overflow-hidden mb-4">
        <motion.div
          animate={{ width: `${(checkedCount / totalCount) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-[#446656] to-[#2e6771]"
        />
      </div>

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

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{CATEGORY_EMOJIS[category]}</span>
                <h2 className="text-base font-display font-bold text-[#303333]">{category}</h2>
                <span className="text-xs text-[#b0b2b1] ml-auto">
                  {items.filter((i) => i.checked).length}/{items.length}
                </span>
              </div>

              <div className="bg-white rounded-3xl overflow-hidden shadow-ambient">
                {items.map((item, i) => (
                  <div key={item.id}>
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      {/* Checkbox */}
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => toggleShoppingItem(item.id)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                          item.checked
                            ? 'bg-[#446656] border-[#446656]'
                            : 'border-[#b0b2b1] bg-white'
                        }`}
                      >
                        {item.checked && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </motion.button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium transition-all ${item.checked ? 'line-through text-[#b0b2b1]' : 'text-[#303333]'}`}>
                            {item.name}
                          </span>
                          <span className={`text-xs text-[#5d605f] ${item.checked ? 'opacity-50' : ''}`}>
                            ({item.quantity}{item.unit !== 'unidades' ? item.unit : item.unit === 'unidades' ? '' : ''})
                          </span>
                        </div>
                        
                        {/* Recipes */}
                        {item.recipes.length > 0 && (
                          <p className="text-[10px] text-[#b0b2b1] mt-0.5">
                            {item.recipes.join(', ')}
                          </p>
                        )}

                        {/* Members + relation type */}
                        <div className="flex items-center gap-1.5 mt-1.5">
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

                      {/* In pantry button */}
                      {!item.checked && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleInPantry(item.id)}
                          className={`p-1.5 rounded-xl transition-all ${
                            item.inPantry ? 'bg-[#c5ebd7] text-[#446656]' : 'bg-[#f3f4f3] text-[#b0b2b1]'
                          }`}
                          title="Já tenho em casa"
                        >
                          <Home size={14} />
                        </motion.button>
                      )}
                    </div>
                    {i < items.length - 1 && <div className="h-px bg-[#f3f4f3] mx-4" />}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
