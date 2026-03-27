# Design System: The Organic Minimalist

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Living Editorial."** 

Unlike standard health apps that feel clinical or overly mechanical, this system treats meal planning as a high-end lifestyle experience. We move away from the "grid of boxes" to a fluid, breathable layout that mimics a premium wellness magazine. By utilizing intentional asymmetry, oversized typography scales, and layered surfaces, we create an interface that feels less like a tool and more like a personal concierge for well-being.

The goal is to evoke a sense of **calm control**. We achieve this by prioritizing negative space (whitespace) and using "soft-touch" geometry that avoids harsh 90-degree angles, ensuring the Portuguese (PT) copy—often longer than English—has the room it needs to breathe without feeling cramped.

---

## 2. Colors & Atmospheric Depth
Our palette is rooted in the "Sage and Stone" philosophy, using natural tones to establish a connection to fresh ingredients and organic health.

### The "No-Line" Rule
**Explicit Instruction:** Use of 1px solid borders for sectioning is strictly prohibited. 
Boundaries must be defined through background color shifts. To separate a recipe card from the main feed, place a `surface_container_lowest` element onto a `surface_container_low` background. If you feel the need for a line, you haven't used your spacing scale or tonal shifts effectively.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine paper.
- **Level 0 (Base):** `surface` (#faf9f8) - The canvas.
- **Level 1 (Sections):** `surface_container_low` (#f3f4f3) - For large grouped content areas.
- **Level 2 (Interactive Elements):** `surface_container_lowest` (#ffffff) - For primary cards and input fields.
- **Accent:** `primary_container` (#c5ebd7) - To highlight an active meal plan or a "Success" state.

### The "Glass & Gradient" Rule
To elevate the premium feel, use **Glassmorphism** for floating navigation bars or modal headers. 
- **Recipe Overlays:** Use `surface` at 80% opacity with a 20px backdrop-blur.
- **Signature Gradients:** For primary CTAs (e.g., "Gerar Plano"), use a subtle linear gradient from `primary` (#446656) to `primary_dim` (#385a4a) at a 135° angle to add "soul" and depth.

---

## 3. Typography: Editorial Authority
We utilize a pairing of **Manrope** for structural impact and **Plus Jakarta Sans** for modern readability.

*   **Display & Headlines (Manrope):** Use `display-lg` and `headline-lg` for daily caloric totals or "Bom dia" greetings. The tight tracking and bold weights create an authoritative, editorial look.
*   **Body & Labels (Plus Jakarta Sans):** Designed for high legibility at small sizes. Use `body-md` for ingredient lists and `label-md` for nutritional macros.
*   **The Portuguese Factor:** Because Portuguese uses more characters (e.g., "Pequeno-almoço" vs "Breakfast"), always default to a 1.5x line-height for `body` text to maintain the "breathable" aesthetic.

---

## 4. Elevation & Depth: Tonal Layering
We reject traditional drop shadows in favor of **Tonal Layering**.

### The Layering Principle
Hierarchy is achieved by "stacking." A white card (`surface_container_lowest`) placed on a light grey background (`surface_container_low`) provides all the visual separation needed for a premium look.

### Ambient Shadows
When an element must "float" (e.g., a Floating Action Button or a Modal), use the following:
- **Shadow:** `on_surface` (#303333) at 6% opacity.
- **Blur:** 24px.
- **Y-Offset:** 8px.
- **Tinting:** The shadow must be tinted with a hint of the background color to appear as a natural occlusion rather than a "dirty" grey mark.

### The "Ghost Border" Fallback
If accessibility requirements demand a border (e.g., high-sunlight outdoor usage), use a **Ghost Border**: `outline_variant` (#b0b2b1) at **15% opacity**. Never use 100% opacity.

---

## 5. Components: The Building Blocks

### Buttons (Botões)
- **Primary:** Gradient from `primary` to `primary_dim`. Text in `on_primary`. Radius: `full`.
- **Secondary:** Surface: `surface_container_highest`. Text: `on_surface`. No border.
- **Interaction:** On tap, scale down to 0.96 with a 200ms spring curve.

### Chips (Etiquetas)
- Use for dietary preferences (Vegetariano, Sem Glúten). 
- **Inactive:** `surface_container_high` background.
- **Active:** `primary` background with `on_primary` text. Radius: `md` (1.5rem).

### Inputs (Campos de Texto)
- Use `surface_container_lowest` for the field background. 
- Rounding: `DEFAULT` (1rem). 
- Label should be `label-md` in `on_surface_variant`. 
- **Error State:** Border becomes `error` (#a83836) at 40% opacity; helper text uses `error`.

### Cards & Recipe Lists
- **Rule:** **No Divider Lines.** 
- Separate meals in the "Plano Diário" using `spacing-6` (2rem) of vertical white space.
- Use `surface_container_low` as a subtle background for the entire card to differentiate it from the page background.

### Custom Component: The "Macro-Gauge"
A sophisticated progress bar for Protein, Carbs, and Fats. Use a `surface_container_highest` track with a `tertiary` (#2e6771) fill. Use `xl` (3rem) rounding for the track to create a "pill" look that feels soft and inviting.

---

## 6. Do’s and Don’ts

### Do
- **Do** use asymmetric margins (e.g., 24dp on left, 32dp on right) for hero headers to create a custom editorial feel.
- **Do** prioritize "Portuguese-friendly" containers. Ensure buttons can fit words like "Submeter" or "Personalizar" without breaking.
- **Do** use micro-interactions. A subtle 2px "lift" when a user selects a recipe adds to the "Premium" feel.

### Don't
- **Don't** use pure black (#000000). Use `on_surface` (#303333) for all high-contrast text.
- **Don't** use standard 4px or 8px corners. Our brand identity lives in the `lg` (2rem) and `xl` (3rem) range. Small radii feel "techy"; large radii feel "lifestyle."
- **Don't** use dividers. If the content feels messy, increase the spacing (`spacing-8` or `spacing-10`) rather than adding a line.