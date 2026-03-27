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
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Onboarding
      onboardingComplete: false,
      onboardingStep: 0,
      setOnboardingComplete: (val) => set({ onboardingComplete: val }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),

      // Household
      household: mockHousehold,
      updateHousehold: (updates) =>
        set((state) => ({ household: { ...state.household, ...updates } })),

      // Members
      members: mockMembers,
      addMember: (member) =>
        set((state) => ({ members: [...state.members, member] })),
      updateMember: (id, updates) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        })),
      toggleMemberActive: (id) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, isActive: !m.isActive } : m
          ),
        }))
        const member = get().members.find((m) => m.id === id)
        if (member) {
          get().showToast(
            `${member.name} ${member.isActive ? 'desativado' : 'ativado'} no planeamento`
          )
        }
      },

      // Recipes
      recipes: mockRecipes,
      addRecipe: (recipe) =>
        set((state) => ({ recipes: [...state.recipes, recipe] })),

      // Ingredients
      ingredients: mockIngredients,

      // Plan
      currentPlan: mockMealPlan,
      activeDayIndex: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
      setActiveDayIndex: (day) => set({ activeDayIndex: day }),
      toggleSlotLock: (slotId) => {
        const slot = get().currentPlan.slots.find((s) => s.id === slotId)
        set((state) => ({
          currentPlan: {
            ...state.currentPlan,
            slots: state.currentPlan.slots.map((s) =>
              s.id === slotId ? { ...s, isLocked: !s.isLocked } : s
            ),
          },
        }))
        if (slot) {
          get().showToast(slot.isLocked ? 'Refeição desbloqueada' : 'Refeição bloqueada')
        }
      },
      swapMealSlot: (slotId, newRecipeId) => {
        const recipe = get().recipes.find((r) => r.id === newRecipeId)
        const activeMembers = get().members.filter((m) => m.isActive)
        
        // Calculate compatibility
        const incompatibleCount = activeMembers.filter((m) => {
          const compat = recipe?.compatibilityByMember.find((c) => c.memberId === m.id)
          return compat?.status === 'incompatível'
        }).length

        const adaptedCount = activeMembers.filter((m) => {
          const compat = recipe?.compatibilityByMember.find((c) => c.memberId === m.id)
          return compat?.status === 'adaptado'
        }).length

        let status: MealSlot['compatibilityStatus'] = 'todos'
        if (incompatibleCount > 0) status = 'alguns'
        else if (adaptedCount > 0) status = 'adaptada'

        set((state) => ({
          currentPlan: {
            ...state.currentPlan,
            slots: state.currentPlan.slots.map((s) =>
              s.id === slotId
                ? {
                    ...s,
                    recipeId: newRecipeId,
                    compatibilityStatus: status,
                    memberIds: activeMembers.map((m) => m.id),
                    adaptedMemberIds: activeMembers
                      .filter((m) => {
                        const compat = recipe?.compatibilityByMember.find(
                          (c) => c.memberId === m.id
                        )
                        return compat?.status === 'adaptado'
                      })
                      .map((m) => m.id),
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
            .currentPlan.slots.filter((s) => s.isLocked)
            .map((s) => s.id)

          set((state) => ({
            isRegenerating: false,
            currentPlan: {
              ...state.currentPlan,
              coveragePercent: Math.floor(Math.random() * 20) + 70,
              nutrientSyncPercent: Math.floor(Math.random() * 20) + 75,
              slots: state.currentPlan.slots.map((slot) => {
                if (lockedSlotIds.includes(slot.id)) return slot
                const availableRecipes = recipes.filter((r) =>
                  r.mealType.includes(slot.mealType)
                )
                const randomRecipe =
                  availableRecipes[Math.floor(Math.random() * availableRecipes.length)]
                return randomRecipe ? { ...slot, recipeId: randomRecipe.id } : slot
              }),
            },
          }))
          get().showToast('Semana regenerada com sucesso!')
        }, 2000)
      },

      // Shopping
      shoppingItems: mockShoppingItems,
      toggleShoppingItem: (id) =>
        set((state) => ({
          shoppingItems: state.shoppingItems.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item
          ),
        })),
      checkAllShoppingItems: (val) =>
        set((state) => ({
          shoppingItems: state.shoppingItems.map((item) => ({ ...item, checked: val })),
        })),
      toggleInPantry: (id) =>
        set((state) => ({
          shoppingItems: state.shoppingItems.map((item) =>
            item.id === id ? { ...item, inPantry: !item.inPantry } : item
          ),
        })),
      setPantryQuantity: (id, qty) =>
        set((state) => ({
          shoppingItems: state.shoppingItems.map((item) =>
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
        set((state) => ({
          shoppingItems: state.shoppingItems.map((item) => ({
            ...item,
            checked: false,
          })),
        })),

      // UI
      activeTab: 'plano',
      setActiveTab: (tab) => set({ activeTab: tab }),
      toastMessage: null,
      showToast: (message) => {
        set({ toastMessage: message })
        setTimeout(() => set({ toastMessage: null }), 3000)
      },
      clearToast: () => set({ toastMessage: null }),
      isRegenerating: false,
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
      }),
    }
  )
)
