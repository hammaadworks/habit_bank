# Habit Bank - Design System

This document defines the visual language, component specifications, and UI/UX patterns for the Habit Bank "Industrial Pro" aesthetic.

---

## 1. Global Core (Master Rules)

**Category:** Smart Home/IoT Dashboard
**Mood:** Sleek, technical, precise, data-driven.

### 1.1 Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#0891B2` | `--primary` |
| Secondary | `#CFFAFE` | `--secondary` |
| Accent | `#22D3EE` | `--accent` |
| Background | `#ECFEFF` | `--background` |
| Text | `#164E63` | `--foreground` |
| Dark Background | `#083344` | `--background (dark)` |
| Dark Card | `#062a38` | `--card (dark)` |

**Note:** Focus on Cyan/Teal with Slate/Cyan muted tones for a technical feel.

### 1.2 Typography

- **Heading Font:** Outfit
- **Body Font:** DM Sans
- **CSS Import:**
```css
@theme {
  --font-heading: "Outfit", sans-serif;
  --font-body: "DM Sans", sans-serif;
}
```

### 1.3 Spacing & Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | `1.5rem` | Standard corner radius |
| `p-4` | `1rem` | Small padding |
| `p-6` | `1.5rem` | Standard card padding |
| `p-8` | `2rem` | Large section padding |

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-md` | `0 10px 15px -3px rgba(0,0,0,0.05)` | Standard cards |
| `--shadow-xl` | `0 25px 50px -12px rgba(0,0,0,0.1)` | Modals, overlays |

---

## 2. Component Specifications

### 2.1 Glass Cards
```css
.glass-card {
  background: var(--card);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  border-radius: 2.5rem; /* Heavy rounding for dashboard feel */
}
```

### 2.2 Sidebar
- **Light:** `rgba(255, 255, 255, 0.6)` with `backdrop-blur(30px)`.
- **Dark:** `rgba(8, 51, 68, 0.6)`.

### 2.3 Interactive Elements
- **Primary Buttons:** High-contrast accent color, `1rem 2rem` padding, bold uppercase labels with `0.1em` letter spacing.
- **Nav Items:** High-contrast active states with subtle primary-colored glow (`box-shadow`).

---

## 3. Page Overrides

### 3.1 Dashboard View
*Overrides global rules for data-density.*
- **Max Width:** 1440px.
- **Grid Strategy:** 12-column system (8 main + 4 aside).
- **Typography:** Primary metrics use `text-5xl` for maximum impact.
- **Specifics:** Recommendation cards use `p-6` to maintain density.

### 3.2 Home / Landing Page
*Overrides global rules for narrative flow.*
- **Max Width:** 1200px.
- **Layout:** Vertical sections with a horizontal "Journey Track."
- **Visuals:** Continuous palette transitions between chapters.

---

## 4. Anti-Patterns (Do NOT Use)

- ❌ **Hardcoded Colors:** Always use CSS variables for light/dark compatibility.
- ❌ **Sharp Corners:** Use `rounded-[2.5rem]` for main cards; `rounded-2xl` for sub-elements.
- ❌ **Low Contrast:** Ensure unselected items and secondary text meet a 4.5:1 minimum ratio.
- ❌ **Horizontal Scroll:** strictly forbidden on mobile; use stacking or carousels.

---

## 5. UI Quality Checklist

- [ ] All icons from a consistent set (Lucide/Heroicons).
- [ ] Hover states have smooth transitions (150-300ms).
- [ ] `prefers-reduced-motion` is respected in Framer Motion configs.
- [ ] Responsive breakpoints verified at 375px, 768px, 1024px, and 1440px.
- [ ] No emojis used as functional icons.
