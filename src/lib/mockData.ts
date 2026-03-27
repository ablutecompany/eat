import {
  Household,
  HouseholdMember,
  Recipe,
  Ingredient,
  MealPlan,
  ShoppingItem,
} from './types'

// ============================================================
// HOUSEHOLD
// ============================================================

export const mockHousehold: Household = {
  id: 'hh-001',
  name: 'Casa Silva',
  goal: 'saúde-familiar',
  budgetWeekly: 150,
  maxCookTime: 30,
  mealsPerDay: 2,
  applyOnlyToActiveMembers: false,
  createdAt: '2026-01-15T00:00:00Z',
  updatedAt: '2026-03-26T00:00:00Z',
}

// ============================================================
// MEMBERS
// ============================================================

export const mockMembers: HouseholdMember[] = [
  {
    id: 'm-ana',
    householdId: 'hh-001',
    name: 'Ana',
    avatar: '👩',
    color: '#E07B6A',
    colorName: 'coral',
    type: 'adulto',
    age: 38,
    isActive: true,
    notes: 'Sensível a glúten e lactose. Prefere refeições leves ao almoço.',
    portionFactor: 1.0,
    preferences: {
      memberId: 'm-ana',
      dietTags: ['sem-glúten', 'sem-lactose'],
      allergies: [],
      excludedIngredients: ['trigo', 'leite', 'queijo', 'manteiga', 'iogurte'],
      dislikes: ['couve-de-bruxelas'],
      avoidTemporarily: [],
      preferredMeals: ['saladas', 'peixe', 'legumes'],
      maxCookTimeOverride: 20,
      budgetWeight: 0.3,
    },
    nutrientTargets: [
      { id: 'nt-ana-1', memberId: 'm-ana', name: 'Magnésio', unit: 'mg', targetValue: 310, currentValue: 210, priority: 'alta', source: 'médico', notes: 'Déficit identificado em análises' },
      { id: 'nt-ana-2', memberId: 'm-ana', name: 'Ferro', unit: 'mg', targetValue: 18, currentValue: 12, priority: 'alta', source: 'médico' },
      { id: 'nt-ana-3', memberId: 'm-ana', name: 'Vitamina D', unit: 'UI', targetValue: 2000, currentValue: 800, priority: 'média', source: 'médico' },
      { id: 'nt-ana-4', memberId: 'm-ana', name: 'Fibra', unit: 'g', targetValue: 25, currentValue: 18, priority: 'média', source: 'nutricionista' },
    ],
    uploadedFiles: [
      {
        id: 'f-ana-1',
        memberId: 'm-ana',
        fileName: 'analises_sangue_jan2026.pdf',
        fileType: 'pdf',
        uploadedAt: '2026-01-20T10:00:00Z',
        processingStatus: 'concluído',
        extractedSummary: {
          id: 'ext-ana-1',
          fileId: 'f-ana-1',
          detectedAllergies: [],
          detectedRestrictions: ['sem-glúten', 'sem-lactose'],
          detectedNutrients: [
            { name: 'Magnésio', value: 210, unit: 'mg', note: 'Abaixo do ideal' },
            { name: 'Ferro', value: 12, unit: 'mg', note: 'Borderline' },
          ],
          confidence: 0.92,
          needsReview: false,
        },
      },
      {
        id: 'f-ana-2',
        memberId: 'm-ana',
        fileName: 'plano_nutricional_2026.pdf',
        fileType: 'pdf',
        uploadedAt: '2026-02-10T14:30:00Z',
        processingStatus: 'concluído',
        extractedSummary: {
          id: 'ext-ana-2',
          fileId: 'f-ana-2',
          detectedAllergies: [],
          detectedRestrictions: ['sem-glúten', 'sem-lactose'],
          detectedNutrients: [
            { name: 'Vitamina D', value: 800, unit: 'UI' },
          ],
          confidence: 0.88,
          needsReview: false,
        },
      },
    ],
  },
  {
    id: 'm-pedro',
    householdId: 'hh-001',
    name: 'Pedro',
    avatar: '👨',
    color: '#4A7DB5',
    colorName: 'azul',
    type: 'adulto',
    age: 41,
    isActive: true,
    notes: 'Faz musculação, foco em proteína e recuperação muscular.',
    portionFactor: 1.2,
    preferences: {
      memberId: 'm-pedro',
      dietTags: ['alto-em-proteína'],
      allergies: [],
      excludedIngredients: [],
      dislikes: ['tofu', 'curgete'],
      avoidTemporarily: [],
      preferredMeals: ['carne', 'peixe', 'ovos'],
      maxCookTimeOverride: 45,
      budgetWeight: 0.35,
    },
    nutrientTargets: [
      { id: 'nt-pedro-1', memberId: 'm-pedro', name: 'Proteína', unit: 'g', targetValue: 160, currentValue: 120, priority: 'alta', source: 'nutricionista' },
      { id: 'nt-pedro-2', memberId: 'm-pedro', name: 'Zinco', unit: 'mg', targetValue: 11, currentValue: 8, priority: 'média', source: 'médico' },
      { id: 'nt-pedro-3', memberId: 'm-pedro', name: 'Ómega-3', unit: 'g', targetValue: 2.5, currentValue: 1.2, priority: 'alta', source: 'médico' },
      { id: 'nt-pedro-4', memberId: 'm-pedro', name: 'Magnésio', unit: 'mg', targetValue: 420, currentValue: 320, priority: 'média', source: 'nutricionista' },
      { id: 'nt-pedro-5', memberId: 'm-pedro', name: 'Vitamina D', unit: 'UI', targetValue: 2000, currentValue: 1200, priority: 'baixa', source: 'médico' },
      { id: 'nt-pedro-6', memberId: 'm-pedro', name: 'Cálcio', unit: 'mg', targetValue: 1000, currentValue: 750, priority: 'média', source: 'médico' },
    ],
    uploadedFiles: [
      {
        id: 'f-pedro-1',
        memberId: 'm-pedro',
        fileName: 'relatorio_treino_mar2026.pdf',
        fileType: 'pdf',
        uploadedAt: '2026-03-01T09:00:00Z',
        processingStatus: 'concluído',
        extractedSummary: {
          id: 'ext-pedro-1',
          fileId: 'f-pedro-1',
          detectedAllergies: [],
          detectedRestrictions: [],
          detectedNutrients: [
            { name: 'Proteína', value: 120, unit: 'g', note: 'Para atingir 160g' },
            { name: 'Ómega-3', value: 1.2, unit: 'g', note: 'Suplementar' },
          ],
          confidence: 0.85,
          needsReview: false,
        },
      },
    ],
  },
  {
    id: 'm-clara',
    householdId: 'hh-001',
    name: 'Clara',
    avatar: '👧',
    color: '#5aaa7a',
    colorName: 'verde',
    type: 'criança',
    age: 9,
    isActive: false,
    notes: 'Alergia a amendoim. Não gosta de brócolos. Em período de férias — inativa por agora.',
    portionFactor: 0.65,
    preferences: {
      memberId: 'm-clara',
      dietTags: ['kids'],
      allergies: ['amendoim'],
      excludedIngredients: ['amendoim', 'manteiga-de-amendoim'],
      dislikes: ['brócolos', 'espinafre'],
      avoidTemporarily: [],
      preferredMeals: ['macarrão', 'frango', 'arroz'],
      maxCookTimeOverride: 25,
    },
    nutrientTargets: [
      { id: 'nt-clara-1', memberId: 'm-clara', name: 'Cálcio', unit: 'mg', targetValue: 1300, currentValue: 900, priority: 'alta', source: 'pediatra' },
      { id: 'nt-clara-2', memberId: 'm-clara', name: 'Ferro', unit: 'mg', targetValue: 8, currentValue: 6, priority: 'média', source: 'pediatra' },
      { id: 'nt-clara-3', memberId: 'm-clara', name: 'Vitamina D', unit: 'UI', targetValue: 600, currentValue: 400, priority: 'média', source: 'pediatra' },
    ],
    uploadedFiles: [],
  },
  {
    id: 'm-lucas',
    householdId: 'hh-001',
    name: 'Lucas',
    avatar: '👦',
    color: '#D4A847',
    colorName: 'dourado',
    type: 'criança',
    age: 14,
    isActive: true,
    notes: 'Adolescente desportista. Necessidades calóricas elevadas.',
    portionFactor: 0.85,
    preferences: {
      memberId: 'm-lucas',
      dietTags: ['alto-em-proteína', 'energia'],
      allergies: [],
      excludedIngredients: [],
      dislikes: ['cogumelos', 'coentros'],
      avoidTemporarily: [],
      preferredMeals: ['massa', 'frango', 'batata-doce'],
      maxCookTimeOverride: 30,
    },
    nutrientTargets: [
      { id: 'nt-lucas-1', memberId: 'm-lucas', name: 'Proteína', unit: 'g', targetValue: 90, currentValue: 70, priority: 'alta', source: 'nutricionista' },
      { id: 'nt-lucas-2', memberId: 'm-lucas', name: 'Cálcio', unit: 'mg', targetValue: 1300, currentValue: 1000, priority: 'alta', source: 'nutricionista' },
      { id: 'nt-lucas-3', memberId: 'm-lucas', name: 'Ferro', unit: 'mg', targetValue: 11, currentValue: 9, priority: 'média', source: 'pediatra' },
    ],
    uploadedFiles: [],
  },
]

// ============================================================
// INGREDIENTS
// ============================================================

export const mockIngredients: Ingredient[] = [
  { id: 'ing-1', name: 'Espinafre', emoji: '🥬', portionLabel: '1 maço', quantityBase: '200g', nutrientPrimary: 'Magnésio', nutrientValue: '157mg', memberIds: ['m-pedro', 'm-lucas', 'm-ana'], compatibilityType: 'comum', tags: ['vegetariano', 'sem-glúten'], recipesRelated: ['rec-1', 'rec-5'] },
  { id: 'ing-2', name: 'Salmão', emoji: '🐟', portionLabel: '2 filés', quantityBase: '500g', nutrientPrimary: 'Ómega-3', nutrientValue: '4.8g', memberIds: ['m-pedro', 'm-ana'], compatibilityType: 'comum', tags: ['sem-glúten', 'sem-lactose', 'alto-em-proteína'], recipesRelated: ['rec-1'] },
  { id: 'ing-3', name: 'Lentilhas', emoji: '🫘', portionLabel: '1 chávena', quantityBase: '200g', nutrientPrimary: 'Ferro', nutrientValue: '6.6mg', memberIds: ['m-pedro', 'm-ana', 'm-lucas', 'm-clara'], compatibilityType: 'comum', tags: ['vegetariano', 'sem-glúten', 'sem-lactose'], recipesRelated: ['rec-4'] },
  { id: 'ing-4', name: 'Iogurte Grego', emoji: '🥛', portionLabel: '1 pote', quantityBase: '150g', nutrientPrimary: 'Cálcio', nutrientValue: '190mg', memberIds: ['m-pedro', 'm-lucas'], compatibilityType: 'específico', tags: ['vegetariano', 'alto-em-proteína'], recipesRelated: ['rec-7'] },
  { id: 'ing-5', name: 'Nozes', emoji: '🌰', portionLabel: '1/2 chávena', quantityBase: '60g', nutrientPrimary: 'Zinco', nutrientValue: '1.9mg', memberIds: ['m-pedro'], compatibilityType: 'específico', tags: ['vegetariano', 'sem-glúten', 'sem-lactose'], recipesRelated: ['rec-5'] },
  { id: 'ing-6', name: 'Aveia', emoji: '🌾', portionLabel: '1/2 chávena', quantityBase: '80g', nutrientPrimary: 'Fibra', nutrientValue: '8g', memberIds: ['m-pedro', 'm-lucas'], compatibilityType: 'específico', tags: ['vegetariano'], recipesRelated: ['rec-7'] },
  { id: 'ing-7', name: 'Frango', emoji: '🍗', portionLabel: '1 peito', quantityBase: '200g', nutrientPrimary: 'Proteína', nutrientValue: '44g', memberIds: ['m-pedro', 'm-ana', 'm-lucas', 'm-clara'], compatibilityType: 'comum', tags: ['sem-glúten', 'sem-lactose', 'alto-em-proteína'], recipesRelated: ['rec-3'] },
  { id: 'ing-8', name: 'Quinoa', emoji: '🌱', portionLabel: '1 chávena', quantityBase: '185g', nutrientPrimary: 'Proteína', nutrientValue: '8g', memberIds: ['m-pedro', 'm-ana', 'm-lucas'], compatibilityType: 'comum', tags: ['vegetariano', 'sem-glúten', 'sem-lactose'], recipesRelated: ['rec-2', 'rec-5'] },
  { id: 'ing-9', name: 'Cenoura', emoji: '🥕', portionLabel: '2 cenouras', quantityBase: '200g', nutrientPrimary: 'Vitamina A', nutrientValue: '1684µg', memberIds: ['m-pedro', 'm-ana', 'm-lucas', 'm-clara'], compatibilityType: 'comum', tags: ['vegetariano', 'sem-glúten', 'sem-lactose', 'kids'], recipesRelated: ['rec-3'] },
  { id: 'ing-10', name: 'Ovos', emoji: '🥚', portionLabel: '2 ovos', quantityBase: '100g', nutrientPrimary: 'Proteína', nutrientValue: '12g', memberIds: ['m-pedro', 'm-ana', 'm-lucas', 'm-clara'], compatibilityType: 'comum', tags: ['vegetariano', 'sem-glúten', 'sem-lactose'], recipesRelated: ['rec-7'] },
]

// ============================================================
// RECIPES
// ============================================================

export const mockRecipes: Recipe[] = [
  {
    id: 'rec-1',
    title: 'Salmão com Espargos',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
    description: 'Salmão grelhado com espargos frescos salteados em azeite e limão. Rico em ómega-3 e magnésio.',
    durationMinutes: 25,
    mealType: ['almoço', 'jantar'],
    ingredients: [
      { ingredientId: 'ing-2', name: 'Salmão fresco', quantity: '500', unit: 'g' },
      { ingredientId: 'ing-1', name: 'Espargos', quantity: '300', unit: 'g' },
      { ingredientId: 'ing-9', name: 'Azeite', quantity: '2', unit: 'colheres de sopa' },
    ],
    nutrients: [
      { name: 'Proteína', value: '42g' },
      { name: 'Ómega-3', value: '4.8g' },
      { name: 'Magnésio', value: '85mg' },
    ],
    steps: [
      { step: 1, description: 'Temperar o salmão com sal, pimenta e sumo de limão.', duration: 5 },
      { step: 2, description: 'Grelhar o salmão em frigideira antiaderente, 4 min de cada lado.', duration: 8 },
      { step: 3, description: 'Saltear os espargos em azeite durante 5 minutos.', duration: 5 },
      { step: 4, description: 'Servir com rodelas de limão.', duration: 2 },
    ],
    tags: ['sem-glúten', 'sem-lactose', 'alto-em-proteína', 'rápido', 'ómega-3'],
    compatibilityByMember: [
      { memberId: 'm-ana', status: 'compatível' },
      { memberId: 'm-pedro', status: 'compatível' },
      { memberId: 'm-lucas', status: 'compatível' },
      { memberId: 'm-clara', status: 'incompatível', note: 'Inativo' },
    ],
    adaptationNotes: [],
  },
  {
    id: 'rec-2',
    title: 'Salada de Quinoa Tropical',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    description: 'Quinoa cozida com manga, abacate, pepino e molho de limão e coentros. Fresca e nutritiva.',
    durationMinutes: 20,
    mealType: ['almoço'],
    ingredients: [
      { ingredientId: 'ing-8', name: 'Quinoa', quantity: '185', unit: 'g' },
      { ingredientId: 'ing-9', name: 'Manga', quantity: '1', unit: 'unidade' },
      { ingredientId: 'ing-9', name: 'Abacate', quantity: '1', unit: 'unidade' },
    ],
    nutrients: [
      { name: 'Proteína', value: '12g' },
      { name: 'Fibra', value: '8g' },
      { name: 'Vitamina C', value: '60mg' },
    ],
    steps: [
      { step: 1, description: 'Cozer a quinoa em água com sal por 15 minutos.', duration: 15 },
      { step: 2, description: 'Cortar manga, abacate e pepino.', duration: 5 },
      { step: 3, description: 'Misturar tudo com sumo de limão e coentros.', duration: 3 },
    ],
    tags: ['vegetariano', 'sem-glúten', 'sem-lactose', 'rápido', 'kids'],
    compatibilityByMember: [
      { memberId: 'm-ana', status: 'compatível' },
      { memberId: 'm-pedro', status: 'compatível' },
      { memberId: 'm-lucas', status: 'compatível' },
      { memberId: 'm-clara', status: 'adaptado', note: 'Sem coentros' },
    ],
    adaptationNotes: ['Para a Clara: omitir coentros'],
  },
  {
    id: 'rec-3',
    title: 'Frango Assado com Legumes',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    description: 'Peito de frango assado no forno com cenoura, batata-doce e alecrim. Reconfortante e equilibrado.',
    durationMinutes: 45,
    mealType: ['almoço', 'jantar'],
    ingredients: [
      { ingredientId: 'ing-7', name: 'Peito de frango', quantity: '800', unit: 'g' },
      { ingredientId: 'ing-9', name: 'Cenoura', quantity: '400', unit: 'g' },
      { ingredientId: 'ing-9', name: 'Batata-doce', quantity: '600', unit: 'g' },
    ],
    nutrients: [
      { name: 'Proteína', value: '44g' },
      { name: 'Vitamina A', value: '1200µg' },
      { name: 'Potássio', value: '850mg' },
    ],
    steps: [
      { step: 1, description: 'Marinar o frango com azeite, alho e alecrim por 10 min.', duration: 10 },
      { step: 2, description: 'Cortar legumes em cubos e temperar.', duration: 5 },
      { step: 3, description: 'Assar tudo a 200°C por 30 minutos.', duration: 30 },
    ],
    tags: ['sem-glúten', 'sem-lactose', 'alto-em-proteína', 'kids', 'económico'],
    compatibilityByMember: [
      { memberId: 'm-ana', status: 'compatível' },
      { memberId: 'm-pedro', status: 'compatível' },
      { memberId: 'm-lucas', status: 'compatível' },
      { memberId: 'm-clara', status: 'compatível' },
    ],
    adaptationNotes: [],
  },
  {
    id: 'rec-4',
    title: 'Dhal de Lentilhas e Caril',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    description: 'Lentilhas vermelhas cozidas com leite de coco, caril e gengibre. Reconfortante e rico em ferro.',
    durationMinutes: 30,
    mealType: ['almoço', 'jantar'],
    ingredients: [
      { ingredientId: 'ing-3', name: 'Lentilhas vermelhas', quantity: '300', unit: 'g' },
      { ingredientId: 'ing-9', name: 'Leite de coco', quantity: '400', unit: 'ml' },
      { ingredientId: 'ing-9', name: 'Caril em pó', quantity: '2', unit: 'colheres de chá' },
    ],
    nutrients: [
      { name: 'Ferro', value: '9mg' },
      { name: 'Fibra', value: '15g' },
      { name: 'Proteína', value: '24g' },
    ],
    steps: [
      { step: 1, description: 'Refogar cebola, alho e gengibre em azeite.', duration: 5 },
      { step: 2, description: 'Adicionar lentilhas e leite de coco, cozinhar 20 min.', duration: 20 },
      { step: 3, description: 'Temperar com caril, sal e sumo de limão.', duration: 5 },
    ],
    tags: ['vegetariano', 'vegan', 'sem-glúten', 'sem-lactose', 'económico', 'ferro'],
    compatibilityByMember: [
      { memberId: 'm-ana', status: 'compatível' },
      { memberId: 'm-pedro', status: 'compatível' },
      { memberId: 'm-lucas', status: 'compatível' },
      { memberId: 'm-clara', status: 'adaptado', note: 'Reduzir tempero de caril' },
    ],
    adaptationNotes: ['Para a Clara: caril suave'],
  },
  {
    id: 'rec-5',
    title: 'Bowl Mediterrâneo de Grão e Quinoa',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
    description: 'Bowl fresco com quinoa, grão de bico, espinafre, tomate seco, pepino e molho tahini.',
    durationMinutes: 20,
    mealType: ['almoço'],
    ingredients: [
      { ingredientId: 'ing-8', name: 'Quinoa', quantity: '185', unit: 'g' },
      { ingredientId: 'ing-1', name: 'Espinafre baby', quantity: '100', unit: 'g' },
      { ingredientId: 'ing-3', name: 'Grão de bico', quantity: '200', unit: 'g' },
    ],
    nutrients: [
      { name: 'Proteína', value: '18g' },
      { name: 'Magnésio', value: '120mg' },
      { name: 'Ferro', value: '5mg' },
    ],
    steps: [
      { step: 1, description: 'Cozer a quinoa e refrescar.', duration: 15 },
      { step: 2, description: 'Montar o bowl com todos os ingredientes.', duration: 5 },
      { step: 3, description: 'Regar com molho tahini e sumo de limão.', duration: 2 },
    ],
    tags: ['vegetariano', 'sem-glúten', 'sem-lactose', 'rápido', 'mediterrâneo'],
    compatibilityByMember: [
      { memberId: 'm-ana', status: 'compatível' },
      { memberId: 'm-pedro', status: 'compatível' },
      { memberId: 'm-lucas', status: 'compatível' },
      { memberId: 'm-clara', status: 'incompatível', note: 'Inativo' },
    ],
    adaptationNotes: [],
  },
  {
    id: 'rec-6',
    title: 'Refogado de Vegetais',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    description: 'Wok colorido com brócolos, pimento, cogumelos e tofu num molho de gengibre e soja.',
    durationMinutes: 20,
    mealType: ['jantar'],
    ingredients: [
      { ingredientId: 'ing-9', name: 'Brócolos', quantity: '300', unit: 'g' },
      { ingredientId: 'ing-9', name: 'Pimento vermelho', quantity: '2', unit: 'unidades' },
      { ingredientId: 'ing-9', name: 'Cogumelos', quantity: '200', unit: 'g' },
    ],
    nutrients: [
      { name: 'Vitamina C', value: '120mg' },
      { name: 'Fibra', value: '10g' },
      { name: 'Vitamina K', value: '180µg' },
    ],
    steps: [
      { step: 1, description: 'Cortar todos os legumes em pedaços iguais.', duration: 5 },
      { step: 2, description: 'Saltear em wok com azeite quente.', duration: 10 },
      { step: 3, description: 'Adicionar molho e servir.', duration: 5 },
    ],
    tags: ['vegetariano', 'vegan', 'sem-glúten', 'sem-lactose', 'rápido'],
    compatibilityByMember: [
      { memberId: 'm-ana', status: 'compatível' },
      { memberId: 'm-pedro', status: 'adaptado', note: 'Vai preferir adicionar proteína' },
      { memberId: 'm-lucas', status: 'adaptado', note: 'Acompanhar com frango' },
      { memberId: 'm-clara', status: 'incompatível', note: 'Não gosta de brócolos' },
    ],
    adaptationNotes: ['Ana: adicionar grão de bico', 'Pedro/Lucas: adicionar peito de frango grelhado'],
  },
  {
    id: 'rec-7',
    title: 'Pequeno-almoço Proteico com Iogurte e Fruta',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
    description: 'Iogurte grego com granola sem glúten, frutos vermelhos e mel. Rico em cálcio e proteína.',
    durationMinutes: 5,
    mealType: ['pequeno-almoço'],
    ingredients: [
      { ingredientId: 'ing-4', name: 'Iogurte grego', quantity: '150', unit: 'g' },
      { ingredientId: 'ing-6', name: 'Granola sem glúten', quantity: '40', unit: 'g' },
      { ingredientId: 'ing-9', name: 'Frutos vermelhos', quantity: '100', unit: 'g' },
    ],
    nutrients: [
      { name: 'Proteína', value: '18g' },
      { name: 'Cálcio', value: '190mg' },
      { name: 'Vitamina C', value: '40mg' },
    ],
    steps: [
      { step: 1, description: 'Colocar o iogurte na taça.', duration: 1 },
      { step: 2, description: 'Adicionar granola e frutos vermelhos.', duration: 2 },
      { step: 3, description: 'Regar com mel a gosto.', duration: 1 },
    ],
    tags: ['vegetariano', 'sem-glúten', 'rápido', 'proteína', 'kids'],
    compatibilityByMember: [
      { memberId: 'm-ana', status: 'incompatível', note: 'Sem lactose' },
      { memberId: 'm-pedro', status: 'compatível' },
      { memberId: 'm-lucas', status: 'compatível' },
      { memberId: 'm-clara', status: 'compatível' },
    ],
    adaptationNotes: ['Para a Ana: usar iogurte de coco como alternativa'],
  },
]

// ============================================================
// MEAL PLAN
// ============================================================

export const mockMealPlan: MealPlan = {
  id: 'plan-001',
  householdId: 'hh-001',
  weekStart: '2026-03-23',
  coveragePercent: 78,
  nutrientSyncPercent: 82,
  slots: [
    // Segunda (0)
    { id: 'slot-0-alm', day: 0, mealType: 'almoço', recipeId: 'rec-1', isLocked: true, compatibilityStatus: 'alguns', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], participantIds: ['m-ana', 'm-pedro', 'm-lucas'], adaptedMemberIds: [], notes: 'Clara inativa' },
    { id: 'slot-0-jan', day: 0, mealType: 'jantar', recipeId: 'rec-3', isLocked: false, compatibilityStatus: 'todos', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], participantIds: ['m-ana', 'm-pedro', 'm-lucas'], adaptedMemberIds: [] },
    // Terça (1)
    { id: 'slot-1-alm', day: 1, mealType: 'almoço', recipeId: 'rec-2', isLocked: false, compatibilityStatus: 'adaptada', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], participantIds: ['m-ana', 'm-pedro', 'm-lucas'], adaptedMemberIds: ['m-lucas'] },
    { id: 'slot-1-jan', day: 1, mealType: 'jantar', recipeId: 'rec-4', isLocked: false, compatibilityStatus: 'adaptada', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], participantIds: ['m-ana', 'm-pedro', 'm-lucas'], adaptedMemberIds: ['m-lucas'] },
    // Quarta (2)
    { id: 'slot-2-alm', day: 2, mealType: 'almoço', recipeId: 'rec-5', isLocked: false, compatibilityStatus: 'alguns', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], participantIds: ['m-ana', 'm-pedro', 'm-lucas'], adaptedMemberIds: [] },
    { id: 'slot-2-jan', day: 2, mealType: 'jantar', recipeId: 'rec-6', isLocked: false, compatibilityStatus: 'adaptada', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], participantIds: ['m-ana', 'm-pedro', 'm-lucas'], adaptedMemberIds: ['m-pedro', 'm-lucas'] },
    // Quinta (3)
    { id: 'slot-3-alm', day: 3, mealType: 'almoço', recipeId: 'rec-7', isLocked: false, compatibilityStatus: 'alguns', memberIds: ['m-pedro', 'm-lucas'], participantIds: ['m-pedro', 'm-lucas'], adaptedMemberIds: [], notes: 'Ana n\u00e3o come l\u00e1cteos' },
    { id: 'slot-3-jan', day: 3, mealType: 'jantar', recipeId: 'rec-3', isLocked: false, compatibilityStatus: 'todos', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], participantIds: ['m-ana', 'm-pedro', 'm-lucas'], adaptedMemberIds: [] },
    // Sexta (4)
    { id: 'slot-4-alm', day: 4, mealType: 'almoço', recipeId: 'rec-4', isLocked: true, compatibilityStatus: 'adaptada', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], participantIds: ['m-ana', 'm-pedro', 'm-lucas'], adaptedMemberIds: ['m-lucas'] },
    { id: 'slot-4-jan', day: 4, mealType: 'jantar', recipeId: 'rec-1', isLocked: false, compatibilityStatus: 'alguns', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], participantIds: ['m-ana', 'm-pedro', 'm-lucas'], adaptedMemberIds: [] },
    // S\u00e1bado (5)
    { id: 'slot-5-alm', day: 5, mealType: 'almoço', recipeId: 'rec-2', isLocked: false, compatibilityStatus: 'adaptada', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], participantIds: ['m-ana', 'm-pedro', 'm-lucas'], adaptedMemberIds: ['m-lucas'] },
    { id: 'slot-5-jan', day: 5, mealType: 'jantar', recipeId: 'rec-5', isLocked: false, compatibilityStatus: 'alguns', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], participantIds: ['m-ana', 'm-pedro', 'm-lucas'], adaptedMemberIds: [] },
    // Domingo (6)
    { id: 'slot-6-alm', day: 6, mealType: 'almoço', recipeId: 'rec-6', isLocked: false, compatibilityStatus: 'adaptada', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], participantIds: ['m-ana', 'm-pedro', 'm-lucas'], adaptedMemberIds: ['m-pedro', 'm-lucas'] },
    { id: 'slot-6-jan', day: 6, mealType: 'jantar', recipeId: 'rec-7', isLocked: false, compatibilityStatus: 'alguns', memberIds: ['m-pedro', 'm-lucas'], participantIds: ['m-pedro', 'm-lucas'], adaptedMemberIds: [], notes: 'Ana sem l\u00e1cteos' },
  ],
}

// ============================================================
// SHOPPING
// ============================================================

export const mockShoppingItems: ShoppingItem[] = [
  // Hortifruti
  { id: 'sh-1', category: 'Hortifruti', name: 'Maçãs Gala', quantity: '2', unit: 'kg', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], relationType: 'comum', recipes: [], checked: false, inPantry: false },
  { id: 'sh-2', category: 'Hortifruti', name: 'Tomates', quantity: '500', unit: 'g', memberIds: ['m-ana'], relationType: 'individual', recipes: ['Salada de Quinoa Tropical', 'Bowl Mediterrâneo'], checked: false, inPantry: false },
  { id: 'sh-3', category: 'Hortifruti', name: 'Espinafres', quantity: '1', unit: 'maço', memberIds: ['m-lucas'], relationType: 'individual', recipes: ['Bowl Mediterrâneo'], checked: true, inPantry: false },
  { id: 'sh-4', category: 'Hortifruti', name: 'Espargos frescos', quantity: '300', unit: 'g', memberIds: ['m-ana', 'm-pedro'], relationType: 'subgrupo', recipes: ['Salmão com Espargos'], checked: false, inPantry: false },
  { id: 'sh-5', category: 'Hortifruti', name: 'Cenouras', quantity: '400', unit: 'g', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], relationType: 'comum', recipes: ['Frango Assado com Legumes'], checked: false, inPantry: false },
  { id: 'sh-6', category: 'Hortifruti', name: 'Batata-doce', quantity: '600', unit: 'g', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], relationType: 'comum', recipes: ['Frango Assado com Legumes'], checked: false, inPantry: false },
  // Talho
  { id: 'sh-7', category: 'Talho', name: 'Peito de frango', quantity: '800', unit: 'g', memberIds: ['m-ana', 'm-pedro'], relationType: 'comum', recipes: ['Frango Assado com Legumes'], checked: false, inPantry: false },
  { id: 'sh-8', category: 'Talho', name: 'Carne moída', quantity: '500', unit: 'g', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], relationType: 'comum', recipes: [], checked: false, inPantry: false },
  // Peixaria
  { id: 'sh-9', category: 'Peixaria', name: 'Salmão fresco', quantity: '1', unit: 'kg', memberIds: ['m-ana', 'm-pedro'], relationType: 'subgrupo', recipes: ['Salmão com Espargos'], checked: false, inPantry: false },
  // Lacticínios
  { id: 'sh-10', category: 'Lacticínios', name: 'Iogurte grego natural', quantity: '500', unit: 'g', memberIds: ['m-pedro', 'm-lucas'], relationType: 'subgrupo', recipes: ['Pequeno-almoço Proteico'], checked: false, inPantry: false },
  { id: 'sh-11', category: 'Lacticínios', name: 'Ovos', quantity: '12', unit: 'unidades', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], relationType: 'comum', recipes: [], checked: false, inPantry: false },
  // Mercearia
  { id: 'sh-12', category: 'Mercearia', name: 'Arroz integral', quantity: '1', unit: 'kg', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], relationType: 'comum', recipes: [], checked: false, inPantry: true },
  { id: 'sh-13', category: 'Mercearia', name: 'Leite de coco', quantity: '400', unit: 'ml', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], relationType: 'comum', recipes: ['Dhal de Lentilhas'], checked: false, inPantry: false },
  { id: 'sh-14', category: 'Mercearia', name: 'Lentilhas vermelhas', quantity: '500', unit: 'g', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], relationType: 'comum', recipes: ['Dhal de Lentilhas'], checked: false, inPantry: false },
  { id: 'sh-15', category: 'Mercearia', name: 'Quinoa', quantity: '400', unit: 'g', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], relationType: 'comum', recipes: ['Salada de Quinoa', 'Bowl Mediterrâneo'], checked: false, inPantry: false },
  { id: 'sh-16', category: 'Mercearia', name: 'Azeite virgem extra', quantity: '750', unit: 'ml', memberIds: ['m-ana', 'm-pedro', 'm-lucas'], relationType: 'comum', recipes: [], checked: false, inPantry: true },
]
