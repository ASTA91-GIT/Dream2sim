---
name: Dream2Sim Engine Design System
colors:
  surface: '#0f0645'
  surface-dim: '#0f0645'
  surface-bright: '#36316c'
  surface-container-lowest: '#090040'
  surface-container-low: '#18114c'
  surface-container: '#1c1651'
  surface-container-high: '#27215b'
  surface-container-highest: '#322d67'
  on-surface: '#e4dfff'
  on-surface-variant: '#d1c1d7'
  inverse-surface: '#e4dfff'
  inverse-on-surface: '#2d2862'
  outline: '#9a8ca0'
  outline-variant: '#4e4354'
  surface-tint: '#e3b5ff'
  primary: '#e3b5ff'
  on-primary: '#4d007a'
  primary-container: '#c167ff'
  on-primary-container: '#44006b'
  inverse-primary: '#9100de'
  secondary: '#d2bbff'
  on-secondary: '#3f008e'
  secondary-container: '#582ca7'
  on-secondary-container: '#c6aaff'
  tertiary: '#f1c100'
  on-tertiary: '#3d2f00'
  tertiary-container: '#d0a600'
  on-tertiary-container: '#4f3d00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f3daff'
  primary-fixed-dim: '#e3b5ff'
  on-primary-fixed: '#2f004c'
  on-primary-fixed-variant: '#6e00aa'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5629a5'
  tertiary-fixed: '#ffe08b'
  tertiary-fixed-dim: '#f1c100'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#0f0645'
  on-background: '#e4dfff'
  surface-variant: '#322d67'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  telemetry-lg:
    fontFamily: JetBrains Mono
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
    letterSpacing: -0.01em
  telemetry-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0em
  telemetry-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system establishes an ultra-refined, futuristic, yet rigorously scientific visual identity for an AI-powered simulation platform. It balances computational authority with sensory depth, delivering the precision of modern aerospace and physics tooling fused with an evocative, atmospheric visual atmosphere.

The overarching design aesthetic is **Luminous Glassmorphism**. The interface relies on multi-layered translucent planes suspended over cosmic depths, paired with directional specular borders, delicate purple bioluminescent glows, and high-legibility telemetry typography. Every surface behaves like optically engineered borosilicate glass: refracting ambient illumination, maintaining clear spatial hierarchy across z-planes, and focusing user attention on simulation controls, nodes, and real-time computation states without visual noise.

## Colors

### Dark Mode (Primary Baseline)
Dark mode is the baseline operational environment for intensive engineering workloads:
- **Base Canvas:** Deep Purple `#090040` serves as the infinite spatial plane.
- **Structural Surfaces & Tonal Borders:** Royal Purple `#471396` provides structural framing, panel boundaries, and resting interactive states.
- **Primary Interactive Accents:** Electric Violet `#B13BFF` denotes interactive highlights, active drag handles, AI synthesis states, and primary focus rings.
- **Crucial CTAs & Golden Indicators:** Golden Yellow `#FFCC00` is reserved strictly for primary execution triggers (e.g., "Run Simulation"), alert badges, compute thresholds, and active status indicators.
- **Rule of Discipline:** No unrelated cyan, cool blue, or mint green may appear in dark mode. Informational highlights rely strictly on Electric Violet, Royal Purple, and Golden Yellow.

### Light Mode
Light mode provides a high-clarity alternative for documentation, presentation, and daylight engineering reviews:
- **Base Canvas:** Warm Off-White `#FBF9F5`.
- **Glass Panels:** Frosted Milk Glass `rgba(255, 255, 255, 0.75)` with specular white rims (`rgba(255, 255, 255, 0.9)`).
- **Primary CTAs & Key Accents:** Golden Yellow `#FFCB3D`.
- **Success & Equilibrium:** Sage Green `#5D9253`.
- **Secondary Structure & Navigation:** Forest Green `#557945`.
- **Warning & Divergence:** Warm Orange `#F1A344`.

## Typography

The typographic hierarchy enforces immediate legibility between administrative narrative, conversational AI generation, and raw quantitative telemetry:

- **Display & Headings (Plus Jakarta Sans):** Used for viewports, stage headers, and panel titles. Provides high modern curvature with tight tracking that offsets the technical density of the UI.
- **Interface & Documentation Body (Inter):** Serves general contextual text, forms, instructions, and standard interaction labels. Neutral geometric forms preserve extreme legibility at dense standard resolutions.
- **Simulation Telemetry & Metrics (JetBrains Mono):** Reserved for physics parameters, tensor bounds, floating-point coordinates, frame rates, and token counters. Tabular figures ensure aligned numerical stacks during real-time compute fluctuations.

## Layout & Spacing

The layout operates on a fluid engineering grid designed to host multi-pane docking workspaces, side panels, contextual inspectors, and infinite simulation canvas viewports:

- **Grid Architecture:** Desktop views utilize a fluid 12-column system capable of nesting fixed telemetry sidebars (320px–380px) alongside expanding 3D simulation canvasses.
- **Breakpoints:**
  - **Mobile (< 768px):** Single-column stacked workflow. Lateral simulation panels collapse into bottom-sheet glass drawers with `margin: 1rem`.
  - **Tablet (768px – 1199px):** Split-view workspace with collapsible primary navigation rail and overlay telemetry panels (`margin: 1.5rem`, `gutter: 1rem`).
  - **Desktop (≥ 1200px):** Full viewport multi-tier HUD layout (`margin: 2.5rem`, `gutter: 1.5rem`). Docked glass trays frame the primary viewport with zero margin overflow.
- **Spacing Rhythm:** Internal card structures and modular telemetry chips strictly observe the `0.25rem` (4px) scale increment, keeping density tight and information-dense without visual crowding.

## Elevation & Depth

Depth is conveyed through progressive optical refractions, layered glass substrates, and directional purple luminance rather than standard opaque dropshadows:

1. **Canvas Zero (Root Layer):** Deep Purple `#090040` with an underlying radial atmospheric gradient (`rgba(177, 59, 255, 0.08)` to `transparent`).
2. **Glass Tier 1 (Background Shelves & Sidebars):**
   - Background: `rgba(71, 19, 150, 0.15)`
   - Backdrop Filter: `blur(16px) saturate(180%)`
   - Borders: 1px solid `rgba(71, 19, 150, 0.35)`
3. **Glass Tier 2 (Floating Panels, Cards, Control Trays):**
   - Background: `rgba(71, 19, 150, 0.3)`
   - Backdrop Filter: `blur(24px) saturate(200%)`
   - Specular Border: Linear gradient (135deg, `rgba(177, 59, 255, 0.5)` 0%, `rgba(71, 19, 150, 0.15)` 100%)
   - Ambient Glow: `0 12px 32px -4px rgba(9, 0, 64, 0.8), 0 0 20px 0 rgba(177, 59, 255, 0.12)`
4. **Glass Tier 3 (Modals, Context Overlays, Active HUD Elements):**
   - Background: `rgba(18, 5, 54, 0.7)`
   - Backdrop Filter: `blur(32px) saturate(210%)`
   - Specular Rim: 1px solid `rgba(255, 204, 0, 0.45)` for critical modal focus, or `rgba(177, 59, 255, 0.65)` for standard alerts.
   - Glow: `0 24px 48px -8px rgba(0, 0, 0, 0.9), 0 0 32px 2px rgba(177, 59, 255, 0.25)`

## Shapes

The design system standardizes on a **Rounded (Level 2)** shape vocabulary, blending modern software elegance with structural cohesion:
- **Small Controls & Chips:** `rounded` (0.5rem / 8px) for buttons, input fields, telemetry chips, and toggles.
- **Cards & Floating Trays:** `rounded-lg` (1rem / 16px) for glass panels, inspectors, and persistent heads-up displays.
- **Top-Level Overlays:** `rounded-xl` (1.5rem / 24px) for execution dialogs, simulation view framing, and macro canvases.
- **Presence & Circular Indicators:** Fully circular (`rounded-full`) for user avatars, status pings, and telemetry dials.

## Components

### Buttons
- **Primary CTA ("Run Simulation / Deploy"):** Filled Golden Yellow `#FFCC00` with dark contrast label `#090040` (`font-weight: 600`). On hover, emits a golden specular corona (`box-shadow: 0 0 24px rgba(255, 204, 0, 0.45)`).
- **Secondary Action:** Frosted glass panel with Electric Violet border (`1px solid #B13BFF`), translucent background (`rgba(177, 59, 255, 0.15)`), and white text. Transitions to `rgba(177, 59, 255, 0.28)` on hover with purple underglow.
- **Ghost/Tertiary:** Zero background, translucent lavender text, gaining subtle glass backfill (`rgba(71, 19, 150, 0.25)`) on hover.

### Floating Glassmorphic Navbars
- Positioned floating 16px above the canvas.
- Built with Tier 2 glass (`blur(24px)`), hairline specular borders (`rgba(177, 59, 255, 0.3)`), and segmented pill switches.
- Embedded telemetry summaries (CPU/GPU allocation, active AI model) styled with JetBrains Mono.

### Simulation Control Panels (Sliders & Toggles)
- **Track Sliders:** Recessed glass track (`rgba(71, 19, 150, 0.4)`) with an illuminated active bar in Electric Violet `#B13BFF`. Thumb control is a frosted pill with a center Golden Yellow indicator dot.
- **Toggle Switches:** Glass chassis; when toggled active, the pill slides over a Golden Yellow or Electric Violet background with an immediate 8px ambient glow.

### Velt Live Presence Avatars
- Stacked overlapping circular avatars with frosted borders (`2px solid rgba(71, 19, 150, 0.8)`).
- **Active Real-Time Pulse:** A bottom-right indicator beacon in Golden Yellow `#FFCC00` featuring a continuous ping keyframe animation (`rgba(255, 204, 0, 0.6)`).
- Tooltips display user cursor positions and active simulation nodes in `telemetry-sm` monospaced tags.

### Telemetry Chips & AI Badges
- **Telemetry Chips:** Monospaced data tags wrapped in thin glass boundaries with subtle background saturation (`rgba(71, 19, 150, 0.25)`). Values are rendered in bright white with parameter labels in muted lavender.
- **Contextual AI Status Badges:** Translucent pill featuring a rotating or pulsing Electric Violet dot indicating simulation states (`TRAINING`, `INFERENCE`, `STABILIZED`, `CONVERGED`).

### Input Fields & Data Charts
- **Input Fields:** Dark inset glass with 1px border in Royal Purple `#471396`. Focus state shifts the border to Electric Violet `#B13BFF` with an inner reflection. All numerical entries use JetBrains Mono.
- **Data Charts:** Vector line charts mapped across dark purple planes using Electric Violet paths with filled gradient fades into base canvas. Thresholds, peaks, and convergence markers use pinpoint Golden Yellow nodes.