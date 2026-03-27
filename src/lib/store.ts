'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
  RelationType
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
  
  // Data Source & Subscription
  dataSource: DataSourceConnection | null
  subscription: SubscriptionPeriod | null
  setDataSource: (source: DataSourceConnection | null) => void
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
          // Shuffle non-locked slots
          const recipes = get().recipes
          const lockedSlotIds = get()
            .currentPlan.slots.filter((s: MealSlot) => s.isLocked)
            .map((s: MealSlot) => s.id)

          set((state: AppStore) => {
            const usedRecipeIds = new Set(
              state.currentPlan.slots.filter((s: MealSlot) => s.isLocked).map((s: MealSlot) => s.recipeId)
            )

            return {
              isRegenerating: false,
              currentPlan: {
                ...state.currentPlan,
                coveragePercent: Math.floor(Math.random() * 20) + 70,
                nutrientSyncPercent: Math.floor(Math.random() * 20) + 75,
                slots: state.currentPlan.slots.map((slot: MealSlot) => {
                  if (lockedSlotIds.includes(slot.id)) return slot
                  const availableRecipes = recipes.filter((r: Recipe) =>
                    r.mealType.includes(slot.mealType) && !usedRecipeIds.has(r.id)
                  )
                  
                  // If no unused recipes available, fallback to any available for that type
                  const pool = availableRecipes.length > 0 ? availableRecipes : recipes.filter(r => r.mealType.includes(slot.mealType))
                  const randomRecipe = pool[Math.floor(Math.random() * pool.length)]
                  
                  if (randomRecipe) usedRecipeIds.add(randomRecipe.id)
                  return randomRecipe ? { ...slot, recipeId: randomRecipe.id } : slot
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
      toastMessage: null,
      showToast: (message: string) => {
        set({ toastMessage: message })
        setTimeout(() => set({ toastMessage: null }), 3000)
      },
      clearToast: () => set({ toastMessage: null }),
      isRegenerating: false,
      
      // Data Source & Subscription
      dataSource: null,
      subscription: {
        id: 'sub-001',
        householdId: 'hh-001',
        planType: 'semanal',
        startsAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Started yesterday
        endsAt: new Date(new Date().setDate(new Date().getDate() + 6)).toISOString(),  // Ends in 6 days
        isActive: true,
      },
      setDataSource: (source: DataSourceConnection | null) => set({ dataSource: source }),
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
              compatibilityType: memberIds.length === 0 ? 'excluído' : 'específico' 
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
                memberIds: state.members.filter((m: any) => !memberIds.includes(m.id)).map((m: any) => m.id),
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
            const participants = state.members.filter(m => slot.participantIds.includes(m.id))
            const totalFactor = participants.reduce((acc, m) => acc + (m.portionFactor || 1), 0)
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
