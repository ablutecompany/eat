import { ShoppingItem } from './types'

export interface ShoppingListExport {
  text: string      // plain-text version for WhatsApp/Email body
  filename: string  // suggested filename
  blob: Blob        // .txt blob ready to share via File API
}

const CATEGORY_ORDER = [
  'Hortifruti', 'Talho', 'Peixaria', 'Lacticínios',
  'Mercearia', 'Congelados', 'Outros',
]

const CATEGORY_EMOJIS: Record<string, string> = {
  'Hortifruti': '🥦',
  'Talho': '🥩',
  'Peixaria': '🐟',
  'Lacticínios': '🥛',
  'Mercearia': '🛒',
  'Congelados': '❄️',
  'Outros': '📦',
}

function fmtQty(quantity: string, unit: string, pantryQty?: number): string {
  const total = parseFloat(quantity) || 0
  const have = pantryQty ?? 0
  const need = Math.max(0, total - have)
  const v = need % 1 === 0 ? String(need) : need.toFixed(1)
  return unit && unit !== 'unidades' ? `${v}${unit}` : `${v} ${unit}`
}

/**
 * Generates a formatted shopping list from the provided items.
 * Only items that are checked ("para comprar") are included.
 * If none are checked, falls back to all non-pantry-complete items.
 */
export function generateShoppingList(
  items: ShoppingItem[],
  householdName: string,
  memberNames: Record<string, string>
): ShoppingListExport {
  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-PT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  // Filter: use checked items if any, else all items not fully in pantry
  const checkedItems = items.filter((i) => i.checked)
  const targetItems = checkedItems.length > 0
    ? checkedItems
    : items.filter((i) => {
        const total = parseFloat(i.quantity) || 0
        const have = i.pantryQuantity ?? 0
        return total - have > 0
      })

  if (targetItems.length === 0) {
    const text = `eat — Lista de Compras\n${householdName}\n${dateStr}\n\nNenhum item selecionado.`
    return { text, filename: 'lista-compras.txt', blob: new Blob([text], { type: 'text/plain' }) }
  }

  const lines: string[] = [
    `🛒  eat — Lista de Compras`,
    `📍  ${householdName}`,
    `📅  ${dateStr}`,
    `─────────────────────────────`,
    '',
  ]

  // Group by category keeping order
  const byCategory = CATEGORY_ORDER.reduce<Record<string, ShoppingItem[]>>((acc, cat) => {
    const catItems = targetItems.filter((i) => i.category === cat)
    if (catItems.length) acc[cat] = catItems
    return acc
  }, {})

  for (const [category, catItems] of Object.entries(byCategory)) {
    lines.push(`${CATEGORY_EMOJIS[category] ?? '📦'}  ${category.toUpperCase()}`)
    for (const item of catItems) {
      const qty = fmtQty(item.quantity, item.unit, item.pantryQuantity)
      const members = item.memberIds
        .map((id) => memberNames[id])
        .filter(Boolean)
        .join(', ')

      const memberNote = members ? ` (${members})` : ''
      const pantryNote = (item.pantryQuantity ?? 0) > 0
        ? ` [tens ${fmtQty(String(item.pantryQuantity ?? 0), item.unit)} em casa]`
        : ''

      lines.push(`  ☐  ${item.name} — ${qty}${memberNote}${pantryNote}`)
    }
    lines.push('')
  }

  lines.push(`─────────────────────────────`)
  lines.push(`Total: ${targetItems.length} itens`)
  lines.push(``)
  lines.push(`Gerado pela app eat ✨`)
  lines.push(`https://eat-psi-three.vercel.app`)

  const text = lines.join('\n')
  const filename = `lista-compras-${now.toISOString().slice(0, 10)}.txt`
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })

  return { text, filename, blob }
}

/** Download the blob as a file (fallback when Web Share API unavailable) */
export function downloadShoppingList(list: ShoppingListExport) {
  const url = URL.createObjectURL(list.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = list.filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Share via Web Share API (mobile) */
export async function shareShoppingList(list: ShoppingListExport): Promise<boolean> {
  if (typeof navigator === 'undefined') return false

  // Try native file share first (mobile)
  if (navigator.canShare?.({ files: [new File([list.blob], list.filename)] })) {
    try {
      await navigator.share({
        title: 'Lista de Compras — eat',
        text: list.text,
        files: [new File([list.blob], list.filename, { type: 'text/plain' })],
      })
      return true
    } catch {
      // user cancelled or not supported
    }
  }

  // Fallback: text share
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Lista de Compras — eat',
        text: list.text,
      })
      return true
    } catch { /* cancelled */ }
  }

  return false
}

/** Open WhatsApp with the list as pre-filled message */
export function shareWhatsApp(list: ShoppingListExport) {
  const encoded = encodeURIComponent(list.text)
  window.open(`whatsapp://send?text=${encoded}`, '_blank')
  // Fallback web WhatsApp
  setTimeout(() => {
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }, 500)
}

/** Open mail client with the list */
export function shareMail(list: ShoppingListExport) {
  const subject = encodeURIComponent('Lista de Compras — eat')
  const body = encodeURIComponent(list.text)
  window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
}
