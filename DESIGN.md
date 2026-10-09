---
name: CrediGo
description: Web pública de CrediGo, financiamiento semanal para conductores de Yango e InDrive.
colors:
  primary: "#0f1037"
  accent: "#f8ec34"
  primary-deep: "#04051a"
  primary-ink-soft: "#21254a"
  primary-mute: "#4b5070"
  primary-rule: "#c2c5d0"
  primary-hairline: "#e3e4ea"
  primary-wash: "#f1f2f4"
  accent-soft: "#f9f388"
  paper: "#ffffff"
typography:
  display:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 6vw, 4.75rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  day-letter:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 700
    lineHeight: 0.8
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  figure:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  title:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.375
  body:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.025em"
rounded:
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  gutter-sm: "16px"
  gutter-md: "24px"
  gutter-lg: "32px"
  section-sm: "64px"
  section-md: "80px"
  section-lg: "96px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.accent-soft}"
  button-secondary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.primary-ink-soft}"
  button-outline:
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "44px"
  button-outline-light:
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    padding: "0 32px"
    height: "56px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "48px"
  pill-today:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  week-strip:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    rounded: "{rounded.lg}"
  nav-bar:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    height: "64px"
---

# Design System: CrediGo

## Overview

**Creative North Star: "La semana del conductor"**

CrediGo's public site is a deep-blue field with one yellow voice. The blue is the brand's own ground: it owns the sticky bar, the first viewport, the "Nosotros" band and the footer, and outside the home's banner carousel (which shows the images uploaded in the panel) it is never softened with photography or decorative gradients. Yellow is reserved for what the driver acts on or is paid by: the main action, the weekly cuota, today, the discount, the top level. Everything else is white paper, blue ink and blue-tinted rules.

Type does the heavy lifting. One family, Instrument Sans, at extreme ends: huge, tight day letters and headlines; large tabular money figures; small uppercase labels attached to data. Structure comes from thin rules and segmented ticks (the visual language of trips counted in a week) rather than from cards and shadows. Density is calm on the page and tight inside the data pieces.

Both brand colors are owned by the business, not the code: the values below are the shipped defaults, and the panel (Admin → Apariencia) overrides `--color-primary` and `--color-accent` at runtime. Every tint is derived from those two bases, so no surface may hardcode a brand hex.

**Key Characteristics:**
- Deep-blue brand field; yellow only as signal.
- Instrument Sans in extreme weights and sizes, tabular figures for money.
- Ruled lists and segmented progress instead of card grids.
- Pill-shaped actions, 16px-rounded data pieces, no ornamental shadows.
- Reveal-on-scroll motion with an exponential settle, fully disabled under reduced motion.

## Colors

Two runtime-editable brand bases, with every tint mixed from them in OKLab against white (light steps) or black (deep steps).

### Primary
- **Noche CrediGo** (#0f1037): the brand field (nav bar, first viewport, dark sections, footer), body ink on white, the numbered track stations, plan icon tiles, the highest level panel.
- **Noche Profunda** (primary-deep): one-step-deeper blue grounds. Canonical value is `color-mix(in oklab, primary 65%, black)`.

### Secondary
- **Amarillo Señal** (#f8ec34): the primary button, the Monday cuota cell, the "Hoy" pill, filled trip ticks, the discount line, the top level medal and bar, active nav pill, text selection, the closing CTA band.
- **Amarillo Suave** (accent-soft): hover state of the primary button only.

### Neutral
- **Papel** (#ffffff): default section ground and text on blue.
- **Tinta Suave** (primary-ink-soft): secondary-button hover; at 80% opacity, all body copy on white (`primary-700/80`).
- **Gris Azulado** (primary-mute): small data labels and periods next to prices ("Cuota desde", "por semana").
- **Regla** (primary-rule): track line and mid-level medal ground.
- **Hairline** (primary-hairline): list dividers, ruled borders, rings around light panels.
- **Lavado** (primary-wash): the muted section ground and the ring around track stations.
- **White at fixed opacities on blue** (not tokens, a usage scale): 15% for rules and rings, 20% for empty ticks, 3% / 9% for day-cell fills, 60-75% for secondary text.

### Named Rules
**The Signal Rule.** Yellow marks only what the driver acts on or earns: the action, the cuota, today, the discount, the top tier. It is never a decorative fill, a section-title color or a background for neutral content (the closing CTA band is itself an action).

**The Panel Owns the Hex Rule.** Use `primary`/`accent` and their derived steps via the theme variables; never hardcode a brand hex in a component, because the business changes them from the panel.

## Typography

**Display Font:** Instrument Sans (with ui-sans-serif, system-ui, sans-serif)
**Body Font:** Instrument Sans
**Label/Mono Font:** Instrument Sans with tabular numerals for figures

**Character:** A single grotesque pushed to its extremes: compressed-tracking giants for headlines and day letters against quiet regular body text. Weights shipped as font files are 400, 500, 600 and 700 (`vite.config.js`, bunny fonts); bold (700) is the top step and renders from its own face.

### Hierarchy
- **Display** (bold, 2.6rem mobile to 4.75rem at xl, line-height 1.02, -0.035em): the first-viewport headline only, max two lines, balanced.
- **Day letter** (bold, 4.5rem / 5.5rem lg / 6rem xl; 2.5rem on mobile; line-height 0.8, -0.04em): the L M M J V S D of the week strip.
- **Headline** (bold, 1.875rem → 2.25rem → 3rem, line-height 1.08, -0.03em, balanced): section titles, left-aligned.
- **Figure** (bold, 1.5rem–2rem, -0.02em, tabular): money amounts and proof numbers.
- **Title** (bold, 1.125rem–1.5rem, snug): plan names, track step names, level names.
- **Body** (regular, 1rem; 1.125rem for section lead-ins, max ~42rem): descriptions in `primary-700/80` on white, `white/75` on blue.
- **Label** (semibold, 0.75rem, +0.025em, uppercase): only attached to a datum (day name under its letter, "Cuota desde" above a price, the "Hoy" pill at 11px bold).

### Named Rules
**The Label-Belongs-to-Data Rule.** Small uppercase text labels a value it sits next to (a day, a price, today). It never floats above a headline as a section kicker.

**The Tabular Money Rule.** Every amount and count uses tabular numerals at bold weight; the period ("por semana") follows in small muted text.

## Layout

One container for the whole site: max 80rem (1280px) with 16 / 24 / 32px side gutters at base / sm / lg. Sections stack full-bleed with vertical padding of 64 / 80 / 96px (sm / lg breakpoints); the home's first viewport is the banner carousel from the panel (full-height, with the banner image, its two actions and the proof figures at its foot). Section heads are left-aligned in a two-column grid on lg (title and lead on the left, an outline action bottom-right). Lists go full container width with 32px row padding. Breakpoints are Tailwind's defaults (640 / 768 / 1024 / 1280px); the week strip and proof row switch layout at md (768px), multi-column lists at lg. The sticky nav is 56px (64px from sm) and anchored sections carry an 80px scroll margin.

## Elevation & Depth

Flat. Depth comes from tonal grounds (white, wash, blue, deep blue) and from 1px rings and rules, not shadows. The only shadows are functional overlays: the sticky nav gains a dark shadow once the page scrolls or a menu opens, and the dropdown / mobile menu panels float with a large soft shadow.

### Shadow Vocabulary
- **Nav lift** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / .3), 0 4px 6px -4px rgb(0 0 0 / .3)`): sticky bar after 8px of scroll or with a menu open.
- **Menu float** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / .25)`): dropdown and mobile menu panels.

### Named Rules
**The Ruled-Not-Raised Rule.** Group content with hairline rules and 1px rings; shadows belong only to things that float over the page.

## Shapes

Three radii: fully round for every action, pill, tick and numbered station; 16px for data pieces (week strip, levels bar, images, FAQ list); 12px for icon tiles and form fields. Rules are 1px (white at 15% on blue, hairline on white). Progress is drawn as rows of 6px-tall rounded segments with 4px gaps.

## Components

### Buttons
Confident pills, color-swap on hover, no lift.
- **Shape:** fully round (9999px), semibold, icon 16–20px with 8px gap.
- **Sizes:** sm 36px tall / 16px padding; md 44px / 24px; lg 48px→56px / 28px→32px, 16→18px text.
- **Primary:** yellow ground, blue text; hover to the soft yellow. The one main action per view (WhatsApp first on the home).
- **Secondary:** blue ground, white text; hover to the soft ink.
- **Outline / Outline-light:** 2px border in blue (or white at 70% on blue), fills solid on hover with inverted text.
- **Focus:** 2px ring in the variant's color with 2px offset; globally, any focusable element gets a 2px currentColor outline offset 3px.

### Inputs / Fields
- **Style:** white field, 1px rule-blue border, 12px radius, 44→48px tall, placeholder in a light blue tint.
- **Focus:** border goes full blue with a 2px yellow ring.
- **Error / Disabled:** red border and red-200 ring; disabled takes the wash ground.

### Navigation
Full-width blue sticky bar, the logo pair left, semibold 14px items as pills: inactive at white 85% with a white/10 hover, active filled yellow with blue text. A yellow "Cotiza tu plan" pill sits right. Desktop groups open a white 32px-radius panel with a pointer arrow and a blue promo tile; under lg everything collapses into a white 24px-radius sheet with 12px-radius rows.

**Logo pair (`Logo` / `ParLogos`):** the company logo (Arequipa GO, a solid yellow badge) then the CrediGo logo (white lettering), split by a 1px white/25 line. The badge sits one step shorter than the CrediGo logo because a solid block reads heavier than open lettering (nav 28/32px against 32/40px). The pair goes everywhere the brand signs a blue surface: nav bar, footer, login and the panel sidebar. The collapsed sidebar keeps only the CrediGo logo. Both images are uploaded in Admin → Apariencia.

### Week Strip (signature)
Seven equal columns inside a 16px-rounded box ringed in white/15, divided by white/15 rules. Monday is the yellow cell carrying "cuota desde" and the lowest real weekly amount; Tuesday–Saturday carry five trip ticks that fill progressively in yellow; Sunday is the brighter cell with the yellow "cuota baja" line; today wears the "Hoy" pill. Below, a three-part legend (pay / drive / discount) on the same 7-column grid. It lives on /beneficios, right under the page header, as the explanation of the trip discount. When it enters the viewport the days light from 35% to full opacity one every 140ms. Under md it becomes a vertical ruled list, one row per day, with the item title leading and the day name beside it.

### Ruled Plan List
Plans as rows between hairline rules, not cards: 48px blue icon tile with a yellow glyph, bold title with an optional yellow pill tag, up to three checked features, and a right column with "Cuota desde" + tabular price + period over a small action (Cotizar secondary, or Consultar outline when the plan has no quoter options).

### Numbered Track
How-it-works as stations on one line: 48px round blue badges with yellow tabular numerals, ringed by the section's ground color, on a 1px rule-blue line (horizontal on lg, vertical below). Shared component (`Recorrido`): home "Cómo funciona", Requisitos "Qué pasa después", Cómo pagar "Después de pagar".

### Page Header
Every inner page opens on the blue ground with a left-aligned 36→60px bold title and its lead in white/80; no label above the title and no glows. An image uploaded in the panel shows as the full background, as uploaded, with a soft text shadow.

### Icon Rows
Repeated items of a section (documents, data, payment methods, company requirements) are hairline-ruled rows with a 48px blue icon tile (yellow glyph; inverted on blue grounds), bold title and muted copy, not grids of same-size cards. On lg the section title sits left and sticks while the rows scroll on the right.

### Segmented Levels Bar
Levels as one 16px-rounded panel split into equal tiers by hairlines; each tier has a round medal (wash-blue, rule-blue, then yellow for the top), its name and copy, and a bottom bar of segments filled up to that tier. The top tier inverts to the blue ground with yellow segments.

### Proof Row
Real figures in one wrapping line of text (bold tabular number + plain description, 24px apart) under a white/15 rule; never as a grid of stat tiles.

### Motion
Reveal-on-scroll: content enters from 40px below (or from the side, or 90% scale) over 700ms ease-out when its top passes 88% of the viewport, staggered 80–120ms per item and capped after five. The week strip uses an exponential settle (`cubic-bezier(0.16, 1, 0.3, 1)`). With reduced motion or no IntersectionObserver, everything renders in its final state with no transition.

## Do's and Don'ts

### Do:
- **Do** let the deep blue own the first viewport and the nav; put yellow only on the action, the cuota, today, the discount and the top tier.
- **Do** read brand colors from the theme variables so the panel's Apariencia settings keep working.
- **Do** set money and counts in bold tabular numerals, with the period in small muted text after.
- **Do** group repeated content as ruled rows (hairline dividers) or segmented bars before reaching for cards.
- **Do** keep pill-shaped actions with color-swap hovers and the 2px focus ring.
- **Do** honor reduced motion in every animated piece by rendering the final state immediately.
- **Do** keep the branded browser surfaces: yellow-on-blue selection, blue-tinted scrollbar, 0.22em link underline offset.

### Don't:
- **Don't** put a small uppercase label or badge above a section headline as a kicker.
- **Don't** use yellow as a decorative fill, a headline color or a neutral-content background.
- **Don't** hardcode `#0f1037` or `#f8ec34` in components.
- **Don't** show figures as a dashboard of stat tiles; keep proof to one line of text.
- **Don't** add shadows to content at rest; shadows are for floating overlays only.
- **Don't** request weights above bold (extrabold/black): no heavier face is shipped.
