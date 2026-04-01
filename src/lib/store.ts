'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const safeStorage = {
  getItem: (name: string) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value)
    } catch {
      // Ignore: Storage is blocked
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name)
    } catch {
      // Ignore
    }
  },
}
import {
  Household,
  HouseholdMember,
  Recipe,
  Ingredient,
  MealPlan,
  ShoppingItem,
  MealSlot,
  DataSourceConnection,
  SubscriptionPeriod,
  MemberCompatibility,
  ShoppingCategory,
  RelationType,
  SourceProfile
} from './types'
import {
  mockHousehold,
  mockMembers,
  mockRecipes,
  mockIngredients,
  mockMealPlan,
  mockShoppingItems,
} from './mockData'

interface AppStore {
  // Onboarding
  onboardingComplete: boolean
  onboardingStep: number
  setOnboardingComplete: (val: boolean) => void
  setOnboardingStep: (step: number) => void

  // Household
  household: Household
  updateHousehold: (updates: Partial<Household>) => void

  // Members
  members: HouseholdMember[]
  addMember: (member: HouseholdMember) => void
  updateMember: (id: string, updates: Partial<HouseholdMember>) => void
  removeMember: (id: string) => void
  toggleMemberActive: (id: string) => void

  // External Profiles
  availableSourceProfiles: SourceProfile[]
  seedMockSourceProfiles: () => void
  linkMemberToSourceProfile: (memberId: string, sourceProfileId: string) => void
  unlinkMemberFromSource: (memberId: string) => void

  // Recipes
  recipes: Recipe[]
  addRecipe: (recipe: Recipe) => void

  // Ingredients
  ingredients: Ingredient[]

  // Plan
  currentPlan: MealPlan
  activeDayIndex: number
  setActiveDayIndex: (day: number) => void
  toggleSlotLock: (slotId: string) => void
  swapMealSlot: (slotId: string, newRecipeId: string) => void
  regeneratePlan: () => void
  addRecipeToNextFreeSlot: (recipeId: string) => void

  // Shopping
  shoppingItems: ShoppingItem[]
  toggleShoppingItem: (id: string) => void
  checkAllShoppingItems: (val: boolean) => void
  toggleInPantry: (id: string) => void
  setPantryQuantity: (id: string, qty: number) => void
  resetShoppingItems: () => void

  // UI
  activeTab: string
  setActiveTab: (tab: string) => void
  toastMessage: string | null
  showToast: (message: string) => void
  clearToast: () => void
  isRegenerating: boolean
  highlightedSlotId: string | null
  focusPlanSlot: (dayIndex: number, slotId: string) => void
  clearHighlightedSlot: () => void
  
  // Data Source & Subscription
  dataSource: DataSourceConnection | null
  subscription: SubscriptionPeriod | null
  acceptDataSourceConsent: (sourceName: string, householdId: string) => void
  markDataSourceSynced: () => void
  clearDataSource: () => void
  setSubscription: (sub: SubscriptionPeriod | null) => void
  
  // Participation
  updateMealParticipants: (slotId: string, participantIds: string[]) => void
  toggleIngredientAvoidance: (ingredientId: string, memberIds: string[]) => void
  toggleIngredientExclusion: (ingredientId: string, memberIds: string[]) => void
  recalculateShoppingList: () => void
  isSettingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set: any, get: any) => ({
      // Onboarding
      onboardingComplete: false as boolean,
      onboardingStep: 0 as number,
      setOnboardingComplete: (val: boolean) => set({ onboardingComplete: val }),
      setOnboardingStep: (step: number) => set({ onboardingStep: step }),

      // Household
      household: mockHousehold,
      updateHousehold: (updates: Partial<Household>) =>
        set((state: AppStore) => ({ household: { ...state.household, ...updates } })),

      // Members
      members: mockMembers,
      addMember: (member: HouseholdMember) => {
        set((state: AppStore) => ({ members: [...state.members, member] }))
        get().recalculateShoppingList()
      },
      updateMember: (id: string, updates: Partial<HouseholdMember>) => {
        set((state: AppStore) => ({
          members: state.members.map((m: HouseholdMember) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }))
        get().recalculateShoppingList()
      },
      removeMember: (id: string) =>
        set((state: AppStore) => ({
          members: state.members.filter((m: HouseholdMember) => m.id !== id),
        })),
      toggleMemberActive: (id: string) => {
        set((state: AppStore) => ({
          members: state.members.map((m: HouseholdMember) =>
            m.id === id ? { ...m, isActive: !m.isActive } : m
          ),
        }))
        const member = get().members.find((m) => m.id === id)
        if (member) {
          get().showToast(
            `${member.name} ${member.isActive ? 'ativado' : 'desativado'} no planeamento`
          )
        }
        get().recalculateShoppingList()
      },

      // External Profiles
      availableSourceProfiles: [] as SourceProfile[],
      seedMockSourceProfiles: () => set({
        availableSourceProfiles: [
          { id: 'ext-p1', displayName: 'João Silva', memberType: 'adulto', age: 35, sourceName: 'ablute_wellness' },
          { id: 'ext-p2', displayName: 'Maria Silva', memberType: 'adulto', age: 33, sourceName: 'ablute_wellness' },
          { id: 'ext-p3', displayName: 'Pedro Silva', memberType: 'criança', age: 8, sourceName: 'ablute_wellness' },
          { id: 'ext-p4', displayName: 'Ana Silva', memberType: 'criança', age: 4, sourceName: 'ablute_wellness' }
        ]
      }),
      linkMemberToSourceProfile: (memberId: string, sourceProfileId: string) => set((state: AppStore) => ({
        members: state.members.map(m => m.id === memberId ? {
          ...m,
          sourceOrigin: 'ablute_wellness',
          sourceProfileId,
          sourceLinkedAt: new Date().toISOString()
        } : m)
      })),
      unlinkMemberFromSource: (memberId: string) => set((state: AppStore) => ({
        members: state.members.map(m => m.id === memberId ? {
          ...m,
          sourceOrigin: 'local',
          sourceProfileId: null,
          sourceLinkedAt: null
        } : m)
      })),

      // Recipes
      recipes: mockRecipes,
      addRecipe: (recipe: Recipe) =>
        set((state: AppStore) => ({ recipes: [...state.recipes, recipe] })),

      // Ingredients
      ingredients: mockIngredients,

      // Plan
      currentPlan: mockMealPlan,
      activeDayIndex: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
      // ===========================================================================
      // DATA & PROFILES ACTIONS
      // ===========================================================================
      setActiveDayIndex: (day: number) => set({ activeDayIndex: day }),
      // ===========================================================================
      // PLANNING ENGINE ACTIONS
      // ===========================================================================
      toggleSlotLock: (slotId: string) => {
        const slot = get().currentPlan.slots.find((s: MealSlot) => s.id === slotId)
        set((state: AppStore) => ({
          currentPlan: {
            ...state.currentPlan,
            slots: state.currentPlan.slots.map((s: MealSlot) =>
              s.id === slotId ? { ...s, isLocked: !s.isLocked } : s
            ),
          },
        }))
        if (slot) {
          get().showToast(slot.isLocked ? 'Refeição desbloqueada' : 'Refeição bloqueada')
        }
      },
      swapMealSlot: (slotId: string, newRecipeId: string) => {
        const recipe = get().recipes.find((r: Recipe) => r.id === newRecipeId)
        const activeMembers = get().members.filter((m: HouseholdMember) => m.isActive)
        
        // Calculate compatibility
        const incompatibleCount = activeMembers.filter((m: HouseholdMember) => {
          const compat = recipe?.compatibilityByMember.find((c: MemberCompatibility) => c.memberId === m.id)
          return compat?.status === 'incompatível'
        }).length

        const adaptedCount = activeMembers.filter((m: HouseholdMember) => {
          const compat = recipe?.compatibilityByMember.find((c: MemberCompatibility) => c.memberId === m.id)
          return compat?.status === 'adaptado'
        }).length

        let status: MealSlot['compatibilityStatus'] = 'todos'
        if (incompatibleCount > 0) status = 'alguns'
        else if (adaptedCount > 0) status = 'adaptada'

        set((state: AppStore) => ({
          currentPlan: {
            ...state.currentPlan,
            slots: state.currentPlan.slots.map((s: MealSlot) =>
              s.id === slotId
                ? {
                    ...s,
                    recipeId: newRecipeId,
                    compatibilityStatus: status,
                    memberIds: activeMembers.map((m: HouseholdMember) => m.id),
                    participantIds: activeMembers.map((m: HouseholdMember) => m.id), // Default to all active
                    adaptedMemberIds: activeMembers
                      .filter((m: HouseholdMember) => {
                        const compat = recipe?.compatibilityByMember.find(
                          (c: MemberCompatibility) => c.memberId === m.id
                        )
                        return compat?.status === 'adaptado'
                      })
                      .map((m: HouseholdMember) => m.id),
                  }
                : s
            ),
          },
        }))
        if (recipe) {
          get().showToast(`Refeição substituída por ${recipe.title}`)
        }
      },
      regeneratePlan: () => {
        set({ isRegenerating: true })
        setTimeout(() => {
          const state = get()
          const recipes = state.recipes
          const goal = state.household.goal
          const activeMembers = state.members.filter((m: HouseholdMember) => m.isActive)

          // ── Goal → preferred tags mapping ──────────────────────────────
          // Priority hierarcy applied per slot:
          // 1. Hard-exclude recipes where ANY active member is 'incompatível' due to allergies
          // 2. Prefer recipes matching goal tags (score), pick from top-score tier
          const GOAL_TAGS: Record<string, string[]> = {
            'saúde-familiar':      ['sem-glúten', 'sem-lactose', 'vegetariano', 'ferro', 'vitamina'],
            'praticidade':         ['rápido', 'kids'],
            'gestão-restrições':   ['sem-glúten', 'sem-lactose', 'vegan', 'vegetariano'],
            'poupança':            ['económico', 'vegetariano', 'vegan'],
            'energia-performance': ['alto-em-proteína', 'proteína', 'ómega-3'],
          }
          const preferredTags = GOAL_TAGS[goal] ?? []

          // The scoring logic is now specific to each slot, defined below.

          const lockedSlotIds = state.currentPlan.slots
            .filter((s: MealSlot) => s.isLocked)
            .map((s: MealSlot) => s.id)

          set((st: AppStore) => {
            const usedRecipeIds = new Set(
              st.currentPlan.slots.filter((s: MealSlot) => s.isLocked).map((s: MealSlot) => s.recipeId)
            )
            const usedTags = new Set(
              st.currentPlan.slots
                .filter((s: MealSlot) => s.isLocked)
                .map((s: MealSlot) => recipes.find((r: Recipe) => r.id === s.recipeId)?.tags || [])
                .flat()
            )

            return {
              isRegenerating: false,
              currentPlan: {
                ...st.currentPlan,
                coveragePercent: Math.floor(Math.random() * 20) + 70,
                nutrientSyncPercent: Math.floor(Math.random() * 20) + 75,
                slots: st.currentPlan.slots.map((slot: MealSlot) => {
                  if (lockedSlotIds.includes(slot.id)) return slot

                  // Filter by meal type and not already used
                  const forType = recipes.filter((r: Recipe) =>
                    r.mealType.includes(slot.mealType) && !usedRecipeIds.has(r.id)
                  )
                  const pool = forType.length > 0
                    ? forType
                    : recipes.filter((r: Recipe) => r.mealType.includes(slot.mealType))

                  const slotMembers = activeMembers.filter(m => slot.participantIds?.includes(m.id))
                  const effectiveParticipants = slotMembers.length > 0 ? slotMembers : activeMembers

                  const scoreRecipeForSlot = (r: Recipe, currentUsedTags: Set<string>): number => {
                    let hasAllergy = false
                    let dislikePenalty = 0
                    const recipeIngredients = r.ingredients.map(i => i.name.toLowerCase())

                    for (const m of effectiveParticipants) {
                      const allergies = [...(m.preferences.allergies || []), ...(m.preferences.excludedIngredients || [])].map(a => a.toLowerCase())
                      if (allergies.some(a => recipeIngredients.some(ing => ing.includes(a)))) hasAllergy = true

                      const dislikes = (m.preferences.dislikes || []).map(d => d.toLowerCase())
                      if (dislikes.some(d => recipeIngredients.some(ing => ing.includes(d)))) dislikePenalty += 1
                    }

                    if (hasAllergy) return -999

                    let score = 0
                    for (const tag of preferredTags) {
                      if (r.tags.includes(tag)) score += 2
                    }
                    for (const tag of r.tags) {
                      if (currentUsedTags.has(tag)) score -= 0.5 
                    }
                    return score - dislikePenalty
                  }

                  // Score & sort — pick from top-score tier (all with max score)
                  const scored: Array<{ r: Recipe; score: number }> = pool
                    .map((r: Recipe) => ({ r, score: scoreRecipeForSlot(r, usedTags) }))
                    .filter(({ score }: { r: Recipe; score: number }) => score > -500)
                    .sort((a: { r: Recipe; score: number }, b: { r: Recipe; score: number }) => b.score - a.score)

                  const topScore = scored[0]?.score ?? 0
                  const topTier = scored.filter(({ score }: { r: Recipe; score: number }) => score === topScore).map(({ r }: { r: Recipe; score: number }) => r)
                  const finalPool = topTier.length > 0 ? topTier : pool

                  const chosen = finalPool[Math.floor(Math.random() * finalPool.length)]
                  if (chosen) {
                    usedRecipeIds.add(chosen.id)
                    chosen.tags.forEach((t: string) => usedTags.add(t))
                  }
                  return chosen ? { ...slot, recipeId: chosen.id } : slot
                }),
              },
            }
          })
          get().showToast('Semana regenerada com sucesso!')
        }, 2000)
      },

      // Shopping
      shoppingItems: mockShoppingItems,
      toggleShoppingItem: (id: string) =>
        set((state: AppStore) => ({
          shoppingItems: state.shoppingItems.map((item: ShoppingItem) =>
            item.id === id ? { ...item, checked: !item.checked } : item
          ),
        })),
      checkAllShoppingItems: (val: boolean) =>
        set((state: AppStore) => ({
          shoppingItems: state.shoppingItems.map((item: ShoppingItem) => ({ ...item, checked: val })),
        })),
      toggleInPantry: (id: string) =>
        set((state: AppStore) => ({
          shoppingItems: state.shoppingItems.map((item: ShoppingItem) =>
            item.id === id ? { ...item, inPantry: !item.inPantry } : item
          ),
        })),
      setPantryQuantity: (id: string, qty: number) =>
        set((state: AppStore) => ({
          shoppingItems: state.shoppingItems.map((item: ShoppingItem) =>
            item.id === id
              ? {
                  ...item,
                  pantryQuantity: qty,
                  // auto-mark as fully in pantry if qty covers the whole amount
                  inPantry: qty >= parseFloat(item.quantity),
                }
              : item
          ),
        })),
      resetShoppingItems: () =>
        set((state: AppStore) => ({
          shoppingItems: state.shoppingItems.map((item: ShoppingItem) => ({
            ...item,
            checked: false,
          })),
        })),

      // UI
      activeTab: 'plano',
      setActiveTab: (tab: string) => set({ activeTab: tab }),
      toastMessage: null as string | null,
      showToast: (message: string) => {
        set({ toastMessage: message })
        setTimeout(() => set({ toastMessage: null }), 3000)
      },
      clearToast: () => set({ toastMessage: null }),
      isRegenerating: false as boolean,
      highlightedSlotId: null as string | null,
      focusPlanSlot: (dayIndex: number, slotId: string) =>
        set({ activeTab: 'plano', activeDayIndex: dayIndex, highlightedSlotId: slotId }),
      clearHighlightedSlot: () => set({ highlightedSlotId: null }),
      
      // Data Source & Subscription
      dataSource: null as DataSourceConnection | null,
      acceptDataSourceConsent: (sourceName: string, householdId: string) => set({
        dataSource: {
          id: `ds-${Date.now()}`,
          householdId,
          sourceName,
          isActive: true,
          consentAcceptedAt: new Date().toISOString(),
          lastSyncedAt: null,
          syncStatus: 'a-aguardar'
        }
      }),
      markDataSourceSynced: () => set((state: AppStore) => ({
        dataSource: state.dataSource ? {
          ...state.dataSource,
          syncStatus: 'sincronizado',
          lastSyncedAt: new Date().toISOString()
        } : null
      })),
      clearDataSource: () => set({ dataSource: null }),
      subscription: {
        id: 'sub-001',
        householdId: 'hh-001',
        planType: 'semanal',
        startsAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Started yesterday
        endsAt: new Date(new Date().setDate(new Date().getDate() + 6)).toISOString(),  // Ends in 6 days
        isActive: true,
      } as SubscriptionPeriod | null,
      setSubscription: (sub: SubscriptionPeriod | null) => set({ subscription: sub }),
      
      // Participation
      updateMealParticipants: (slotId: string, participantIds: string[]) => {
        set((state: AppStore) => ({
          currentPlan: {
            ...state.currentPlan,
            slots: state.currentPlan.slots.map((s: MealSlot) =>
              s.id === slotId ? { ...s, participantIds } : s
            ),
          },
        }))
        get().recalculateShoppingList()
        get().showToast('Participantes da refeição atualizados')
      },
      addRecipeToNextFreeSlot: (recipeId: string) => {
        const state = get()
        const usedRecipeIds = state.currentPlan.slots.map((s: MealSlot) => s.recipeId)
        if (usedRecipeIds.includes(recipeId)) {
          get().showToast('Esta receita já está no plano desta semana')
          return
        }
        const recipe = state.recipes.find((r: any) => r.id === recipeId)
        if (!recipe) return
        const mealType = recipe.mealType[0]
        const activeMembers = state.members.filter((m: any) => m.isActive)
        const participantIds = activeMembers.map((m: any) => m.id)
        // Find first slot of right mealType that has null/empty recipeId or pick first of that type
        const targetSlot = state.currentPlan.slots.find((s: MealSlot) => s.mealType === mealType && !usedRecipeIds.includes(s.recipeId))
          || state.currentPlan.slots.find((s: MealSlot) => s.mealType === mealType)
        if (!targetSlot) {
          get().showToast('Não há slots disponíveis para este tipo de refeição')
          return
        }
        set((s: any) => ({
          currentPlan: {
            ...s.currentPlan,
            slots: s.currentPlan.slots.map((slot: MealSlot) =>
              slot.id === targetSlot.id ? { ...slot, recipeId, participantIds } : slot
            )
          }
        }))
        get().recalculateShoppingList()
        get().showToast(`${recipe.title} adicionada ao plano — ${['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'][targetSlot.day]}`)
      },
      isSettingsOpen: false,
      setSettingsOpen: (open: boolean) => set({ isSettingsOpen: open }),
      toggleIngredientAvoidance: (ingredientId: string, memberIds: string[]) => {
        set((state) => ({
          ingredients: state.ingredients.map((ing) =>
            ing.id === ingredientId ? { 
              ...ing, 
              memberIds, 
              compatibilityType: memberIds.length === 0 ? 'comum' : 'específico' 
            } : ing
          ),
          members: state.members.map((m) => {
            const ingredient = state.ingredients.find(i => i.id === ingredientId)
            const ingredientName = ingredient?.name || ''
            if (memberIds.includes(m.id)) {
              return {
                ...m,
                preferences: {
                  ...m.preferences,
                  dislikes: Array.from(new Set([...m.preferences.dislikes, ingredientName]))
                }
              }
            } else {
              return {
                ...m,
                preferences: {
                  ...m.preferences,
                  dislikes: m.preferences.dislikes.filter(d => d !== ingredientName)
                }
              }
            }
          })
        }))
        get().showToast('Preferências de ingredientes atualizadas')
      },
      toggleIngredientExclusion: (ingredientId: string, memberIds: string[]) => {
        set((state: any) => {
          const ingredient = state.ingredients.find((i: any) => i.id === ingredientId)
          const ingredientName = ingredient?.name || ''
          return {
            ingredients: state.ingredients.map((ing: any) =>
              ing.id === ingredientId ? {
                ...ing,
                memberIds,
                compatibilityType: memberIds.length > 0 ? 'excluído' : 'comum'
              } : ing
            ),
            members: state.members.map((m: any) => {
              if (memberIds.includes(m.id)) {
                return {
                  ...m,
                  preferences: {
                    ...m.preferences,
                    allergies: Array.from(new Set([...m.preferences.allergies, ingredientName])),
                    excludedIngredients: Array.from(new Set([...(m.preferences.excludedIngredients || []), ingredientName])),
                  }
                }
              } else {
                return {
                  ...m,
                  preferences: {
                    ...m.preferences,
                    allergies: m.preferences.allergies.filter((a: string) => a !== ingredientName),
                    excludedIngredients: (m.preferences.excludedIngredients || []).filter((e: string) => e !== ingredientName),
                  }
                }
              }
            })
          }
        })
        get().showToast('Ingrediente marcado como excluído para os membros selecionados')
      },
      recalculateShoppingList: () => {
        const state = get()
        const items: ShoppingItem[] = []
        let idCounter = 1

        state.currentPlan.slots.forEach(slot => {
          const recipe = state.recipes.find(r => r.id === slot.recipeId)
          if (!recipe) return

          recipe.ingredients.forEach(ri => {
            const ingredient = state.ingredients.find(i => i.id === ri.ingredientId)
            const baseQty = parseFloat(ri.quantity) || 0
            
            // Calculate total quantity based on participants and their portion factors
            const participants = state.members.filter((m: any) => slot.participantIds.includes(m.id))
            const totalFactor = participants.reduce((acc: number, m: any) => acc + (m.type === 'criança' ? 0.75 : 1.0), 0)
            const finalQty = baseQty * totalFactor

            // Grouping logic (simplified)
            const existing = items.find(i => i.name === ri.name && i.unit === ri.unit)
            if (existing) {
              existing.quantity = (parseFloat(existing.quantity) + finalQty).toString()
              existing.memberIds = Array.from(new Set([...existing.memberIds, ...slot.participantIds]))
              if (!existing.recipes.includes(recipe.title)) {
                existing.recipes.push(recipe.title)
              }
            } else {
              items.push({
                id: `shop-${idCounter++}`,
                name: ri.name,
                category: (ingredient?.tags?.[0] as ShoppingCategory) || 'Mercearia',
                quantity: finalQty.toString(),
                unit: ri.unit,
                memberIds: [...slot.participantIds],
                relationType: slot.participantIds.length > 1 ? 'comum' : 'individual',
                recipes: [recipe.title],
                checked: false,
                inPantry: false
              })
            }
          })
        })

        set({ shoppingItems: items })
      }
    }),
    {
      name: 'eat-app-storage',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        onboardingComplete: state.onboardingComplete,
        onboardingStep: state.onboardingStep,
        household: state.household,
        members: state.members,
        currentPlan: state.currentPlan,
        shoppingItems: state.shoppingItems,
        activeTab: state.activeTab,
        dataSource: state.dataSource,
        subscription: state.subscription,
      }),
    }
  )
)
