# CareBridge Connect — Design System

> This is the source of truth for all design decisions. All new components must fit this vocabulary. Patterns blessed here are never re-debated.

---

## Brand

**Mission:** Give families real-time visibility into their loved one's care — without adding work for staff.
**Voice:** Calm, trustworthy, specific. Never generic. Never clinical jargon. Never "unlock the power of."
**Audience:** Facility directors (buyer), nursing staff (user), adult children of residents (end user).

---

## Color Palette

### Primary — Navy
Used for headings, navigation, primary text, CTA buttons.

| Token | Hex | Usage |
|---|---|---|
| `navy-900` | `#0f172a` | Page headings, hero text |
| `navy-800` | `#1e293b` | Dark card backgrounds, CTA sections |
| `navy-700` | `#334155` | Secondary headings |
| `navy-600` | `#475569` | Body text |
| `navy-500` | `#64748b` | Subtext, captions |
| `navy-400` | `#94a3b8` | Muted text, placeholders |
| `navy-200` | `#e2e8f0` | Borders, dividers |
| `navy-100` | `#f1f5f9` | Subtle backgrounds |

### Accent — Primary Purple
Used for CTAs, interactive highlights, brand accent.

| Token | Hex | Usage |
|---|---|---|
| `primary-700` | `#6d28d9` | CTA hover state |
| `primary-600` | `#7c3aed` | Primary CTA background |
| `primary-500` | `#8b5cf6` | Links, active states |
| `primary-400` | `#a78bfa` | Light accents |
| `primary-200` | `#ddd6fe` | Tag backgrounds |
| `primary-100` | `#ede9fe` | Soft highlight backgrounds |
| `primary-50` | `#f5f3ff` | Page section tints |

### Accent — Warm Orange
Used for secondary CTAs, warm highlights, family-facing elements.

| Token | Hex | Usage |
|---|---|---|
| `accent-600` | `#ea580c` | Secondary CTA hover |
| `accent-500` | `#f97316` | Secondary CTA, warm highlights |
| `accent-400` | `#fb923c` | Tags, badges |
| `accent-100` | `#ffedd5` | Warm card backgrounds |
| `accent-50` | `#fff7ed` | Section tints |

### Mint — Trust Green
Used exclusively for HIPAA/security/compliance elements. Earns its own meaning.

| Token | Hex | Usage |
|---|---|---|
| `mint-600` | `#059669` | Checkmarks, success states |
| `mint-500` | `#10b981` | Security badges |
| `mint-400` | `#34d399` | Icon accents |
| `mint-100` | `#d1fae5` | HIPAA section backgrounds |
| `mint-50` | `#ecfdf5` | Compliance card tints |

### Cream — Background
The page base. Warm, not clinical white.

| Token | Hex | Usage |
|---|---|---|
| `cream-100` | `#fdfcfb` | Page background |
| `cream-200` | `#f9f7f4` | Alternate section background |

---

## Typography

**Font family:** Outfit (Google Fonts) — geometric, modern, legible
**Fallback:** system-ui, sans-serif
**Minimum body size:** 16px (non-negotiable for elderly family users)

| Level | Size | Weight | Usage |
|---|---|---|---|
| Display | `text-5xl` / `text-6xl` | 800 | Hero headline only |
| H1 | `text-4xl` / `text-5xl` | 700 | Page section titles |
| H2 | `text-3xl` / `text-4xl` | 700 | Sub-section headings |
| H3 | `text-xl` / `text-2xl` | 600 | Card titles, feature names |
| Body Large | `text-lg` | 400 | Hero subtext, lead paragraphs |
| Body | `text-base` | 400 | Standard body copy |
| Small | `text-sm` | 400 | Captions, labels, tags |
| Micro | `text-xs` | 500 | Badges, legal, metadata |

**Rules:**
- Never skip heading levels (h1 → h3 is invalid)
- Line height: `leading-relaxed` for body, `leading-tight` for headings
- Max line length: `max-w-2xl` for body paragraphs (65-character sweet spot)

---

## Spacing Scale

Uses Tailwind's default 4px base unit. Key landmarks:

| Space | Value | Usage |
|---|---|---|
| `gap-2` | 8px | Tight inline elements |
| `gap-4` | 16px | Card internal spacing |
| `gap-6` | 24px | Between related elements |
| `gap-8` | 32px | Component sections |
| `py-16` | 64px | Section vertical padding (mobile) |
| `py-24` | 96px | Section vertical padding (desktop) |
| `py-28` | 112px | Hero section padding |

---

## Border Radius

**Rule:** Not everything gets `rounded-2xl`. Radius communicates hierarchy.

| Element | Radius | Token |
|---|---|---|
| Buttons | `rounded-xl` | 12px |
| Cards | `rounded-2xl` | 16px |
| Large CTA sections | `rounded-3xl` | 24px |
| Tags/Pills | `rounded-full` | full |
| Icon containers | `rounded-xl` or `rounded-2xl` | context-dependent |
| Inputs | `rounded-xl` | 12px |

---

## Shadows & Glass

```css
/* Standard card */
.card-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 24px -4px rgba(15, 23, 42, 0.08);
}

/* Elevated card / modal */
.card-glass-lg {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 8px 40px -8px rgba(15, 23, 42, 0.12);
}

/* Hover state for interactive cards */
.card-glass:hover {
  box-shadow: 0 8px 32px -4px rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.2);
}
```

---

## Motion Principles

**Library:** Framer Motion
**Rule:** Motion earns its pixels. Every animation must either:
1. Guide attention to what's important
2. Confirm an action was received
3. Reveal information progressively

**Never:** Animate just to look fancy. The HIPAA/Trust section is intentionally still.

| Pattern | Duration | Easing | Used For |
|---|---|---|---|
| Slide up + fade in | 500ms | `easeOut` | Section reveals on scroll |
| Word-by-word reveal | 60ms/word stagger | `easeOut` | Hero headline |
| Count-up | 2000ms | `easeOut` | Stats on scroll |
| Card hover | 200ms | `easeInOut` | Bento cards |
| Button shimmer | 1500ms loop | linear | Primary CTA |
| Moving border | 2000ms loop | linear | "Request Demo" button |

**Reduced motion:** All animations respect `prefers-reduced-motion`. Use `useReducedMotion()` from Framer Motion.

---

## Components

### Buttons

**Primary CTA** — "Request Demo", "Get Started"
```
bg-primary-600 text-white rounded-xl px-6 py-3 font-semibold
hover:bg-primary-700 transition-colors
min-height: 44px (touch target)
```

**Secondary CTA** — "Learn More", "See It in Action"
```
bg-white border-2 border-navy-200 text-navy-700 rounded-xl px-6 py-3 font-semibold
hover:border-primary-300 hover:text-primary-700 transition-colors
min-height: 44px
```

**Moving Border CTA** — Main navbar "Request Demo" (animated)
```
Framer Motion rotating gradient border
Interior: white/95 backdrop-blur text-navy-800
```

**Ghost** — Navigation links
```
text-navy-600 hover:text-navy-900 px-3 py-2 font-medium transition-colors
```

### Cards

**Standard card** — Feature cards, stat cards
```
card-glass rounded-2xl p-6
```

**Large feature card** — Bento grid (col-span-2)
```
card-glass rounded-2xl p-8
```

**Dark CTA card** — Final CTA section
```
bg-gradient-to-br from-navy-800 to-navy-900 rounded-3xl p-12 text-white
```

### Tags / Badges

```
px-3 py-1 rounded-full text-sm font-medium
bg-{color}-100 text-{color}-700
```

---

## Layout

**Max content width:** `max-w-7xl mx-auto` (1280px)
**Standard padding:** `px-4 sm:px-6 lg:px-8`
**Section rhythm:** Alternating `cream-100` and `cream-200` backgrounds

**Grid system:**
- Mobile: single column
- Tablet (md): 2 columns
- Desktop (lg): 3 columns for bento, 4 columns for benefits

---

## Interaction States

Every interactive component must have all four states designed:

| State | Visual Treatment |
|---|---|
| **Loading** | Skeleton shimmer (`animate-pulse`) in the shape of content |
| **Empty** | Warm illustration + primary action + context message |
| **Error** | Red-50 background, specific error message, retry action |
| **Success** | Mint checkmark, confirmation message |

**Empty states are features.** "No items found" is not an empty state. Every empty state needs:
1. A warm, contextual icon or illustration
2. A headline explaining why it's empty
3. A primary action to fix it

---

## Accessibility

- **Touch targets:** 44px minimum on all interactive elements
- **Focus indicators:** Never `outline: none` without a replacement. Use `focus:ring-2 focus:ring-primary-500`
- **Color contrast:** All text meets WCAG AA (4.5:1 for body, 3:1 for large text)
- **Screen readers:** All icon-only buttons have `aria-label`
- **Keyboard navigation:** Tab order is logical, modals trap focus

---

## Anti-Patterns (gstack AI Slop — Never Do These)

- ❌ Purple/violet gradient backgrounds as decorative elements
- ❌ 3-column feature grid: icon-in-circle + bold title + 2-line description
- ❌ `text-align: center` on everything
- ❌ Generic hero copy: "Welcome to X", "Unlock the power of...", "Your all-in-one solution"
- ❌ `outline: none` without a replacement focus indicator
- ❌ Body text under 16px
- ❌ Motion that serves no informational purpose
- ❌ Blob background animations as the primary visual interest

---

## File Conventions

- Landing page components: `src/components/landing/`
- Shared UI primitives: `src/components/ui/`
- App dashboard components: `src/components/` (root)
- All component files: PascalCase
- All utility files: camelCase
