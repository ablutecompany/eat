// ============================================================
// TYPES — eat app
// ============================================================

export type MemberType = 'adulto' | 'criança' | 'outro'
export type MealType = 'pequeno-almoço' | 'almoço' | 'jantar' | 'snack'
export type CompatibilityStatus = 'todos' | 'alguns' | 'adaptada' | 'bloqueada'
export type ProcessingStatus = 'pendente' | 'processando' | 'concluído' | 'erro'
export type RelationType = 'comum' | 'individual' | 'subgrupo'
export type ShoppingCategory = 'Hortifruti' | 'Talho' | 'Peixaria' | 'Lacticínios' | 'Mercearia' | 'Congelados' | 'Outros'
export type ExclusionReason = 'não-gosto' | 'alergia' | 'evitar-agora'
export type HouseholdGoal = 'saúde-familiar' | 'praticidade' | 'gestão-restrições' | 'poupança' | 'energia-performance'

export interface DataSourceConnection {
  id: string
  householdId: string
  sourceName: 'ablute_wellness' | string
  isActive: boolean
  consentAcceptedAt: string
  lastSyncedAt: string
}

export interface SubscriptionPeriod {
  id: string
  householdId: string
  planType: 'semanal' | 'mensal'
  startsAt: string
  endsAt: string
  isActive: boolean
}

export interface HouseholdMember {
  id: string
  householdId: string
  name: string
  avatar: string // emoji or color-based
  color: string  // hex color for chips/dots
  colorName: string // e.g., "coral", "azul"
  type: MemberType
  age?: number
  isActive: boolean
  notes?: string
  portionFactor: number // e.g., 1.0 (adulto), 0.75 (criança)
  preferences: MemberPreferences
  nutrientTargets: NutrientTarget[]
  uploadedFiles: MemberUploadedFile[]
}

export interface MemberPreferences {
  memberId: string
  dietTags: string[]
  allergies: string[]
  excludedIngredients: string[]
  dislikes: string[]
  avoidTemporarily: string[]
  preferredMeals: string[]
  maxCookTimeOverride?: number
  budgetWeight?: number
}

export interface NutrientTarget {
  id: string
  memberId: string
  name: string
  unit: string
  targetValue: number
  currentValue?: number
  priority: 'alta' | 'média' | 'baixa'
  source: string
  notes?: string
}

export interface MemberUploadedFile {
  id: string
  memberId: string
  fileName: string
  fileType: 'pdf' | 'imagem' | 'texto'
  uploadedAt: string
  processingStatus: ProcessingStatus
  extractedSummary?: ExtractedNutritionData
}

export interface ExtractedNutritionData {
  id: string
  fileId: string
  detectedAllergies: string[]
  detectedRestrictions: string[]
  detectedNutrients: DetectedNutrient[]
  confidence: number
  needsReview: boolean
}

export interface DetectedNutrient {
  name: string
  value?: number
  unit?: string
  note?: string
}

export interface Household {
  id: string
  name: string
  goal: HouseholdGoal
  budgetWeekly: number
  maxCookTime: number
  mealsPerDay: number
  applyOnlyToActiveMembers: boolean
  createdAt: string
  updatedAt: string
}

export interface Ingredient {
  id: string
  name: string
  emoji: string
  portionLabel: string
  quantityBase: string
  nutrientPrimary: string
  nutrientValue?: string
  memberIds: string[]
  compatibilityType: 'comum' | 'específico' | 'excluído'
  tags: string[]
  recipesRelated: string[]
}

export interface RecipeIngredient {
  ingredientId: string
  name: string
  quantity: string
  unit: string
  optional?: boolean
}

export interface RecipeStep {
  step: number
  description: string
  duration?: number
}

export interface MemberCompatibility {
  memberId: string
  status: 'compatível' | 'adaptado' | 'incompatível'
  note?: string
}

export interface Recipe {
  id: string
  title: string
  image: string
  description: string
  durationMinutes: number
  mealType: MealType[]
  ingredients: RecipeIngredient[]
  nutrients: { name: string; value: string }[]
  steps: RecipeStep[]
  tags: string[]
  compatibilityByMember: MemberCompatibility[]
  adaptationNotes: string[]
}

export interface MealSlot {
  id: string
  day: number // 0=Seg, 1=Ter, ...6=Dom
  mealType: MealType
  recipeId: string
  isLocked: boolean
  compatibilityStatus: CompatibilityStatus
  memberIds: string[]
  participantIds: string[] // List of members specifically participating in this meal
  adaptedMemberIds: string[]
  notes?: string
}

export interface MealPlan {
  id: string
  householdId: string
  weekStart: string
  coveragePercent: number
  nutrientSyncPercent: number
  slots: MealSlot[]
}

export interface ShoppingItem {
  id: string
  category: ShoppingCategory
  name: string
  quantity: string       // total needed (e.g. "500")
  unit: string           // e.g. "g", "kg", "unidades", "ml"
  memberIds: string[]
  relationType: RelationType
  recipes: string[]
  checked: boolean
  inPantry: boolean
  pantryQuantity?: number  // amount already at home (same unit as quantity)
}

export interface AppState {
  // Onboarding
  onboardingComplete: boolean
  onboardingStep: number
  
  // Household
  household: Household
  
  // Members
  members: HouseholdMember[]
  
  // Recipes
  recipes: Recipe[]
  
  // Ingredients
  ingredients: Ingredient[]
  
  // Plan
  currentPlan: MealPlan
  activeDayIndex: number
  
  // Shopping
  shoppingItems: ShoppingItem[]
  
  // UI state
  activeTab: string
  isRegenerating: boolean
  toastMessage: string | null
  
  // New: Data Source & Subscription
  dataSource: DataSourceConnection | null
  subscription: SubscriptionPeriod | null
}
