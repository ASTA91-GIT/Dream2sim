---
name: Urban Kinetic Glass
colors:
  surface: '#fdf8ff'
  surface-dim: '#ddd8e6'
  surface-bright: '#fdf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f1ff'
  surface-container: '#f1ebfa'
  surface-container-high: '#ece6f4'
  surface-container-highest: '#e6e0ee'
  on-surface: '#1c1a24'
  on-surface-variant: '#4e4634'
  inverse-surface: '#312f3a'
  inverse-on-surface: '#f4eefd'
  outline: '#807661'
  outline-variant: '#d2c5ad'
  surface-tint: '#775a00'
  primary: '#775a00'
  on-primary: '#ffffff'
  primary-container: '#ffcb3d'
  on-primary-container: '#715600'
  inverse-primary: '#f2c031'
  secondary: '#376a30'
  on-secondary: '#ffffff'
  secondary-container: '#b7f2a9'
  on-secondary-container: '#3d7035'
  tertiary: '#446735'
  on-tertiary: '#ffffff'
  tertiary-container: '#b5dea0'
  on-tertiary-container: '#406332'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdf97'
  primary-fixed-dim: '#f2c031'
  on-primary-fixed: '#251a00'
  on-primary-fixed-variant: '#5a4400'
  secondary-fixed: '#b7f2a9'
  secondary-fixed-dim: '#9cd58f'
  on-secondary-fixed: '#002201'
  on-secondary-fixed-variant: '#1e511a'
  tertiary-fixed: '#c5eeaf'
  tertiary-fixed-dim: '#aad295'
  on-tertiary-fixed: '#052100'
  on-tertiary-fixed-variant: '#2d4f20'
  background: '#fdf8ff'
  on-background: '#1c1a24'
  surface-variant: '#e6e0ee'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  telemetry-lg:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 22px
  telemetry-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: -0.01em
  telemetry-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system powers an advanced AI urban traffic simulation engine. It merges high-precision geographic telemetry with an ethereal, luminous glassmorphism aesthetic. The design language evokes computational elegance, sovereign clarity, and environmental balance. Rather than appearing as a cold, utilitarian dashboard, it delivers an authoritative and immersive operational workspace.

The style is defined by sophisticated glassmorphism: ultra-fine semi-translucent surfaces, multi-layered visual depth, high-diffusion backdrop filtering (`blur(16px)` to `blur(24px)`), and delicate specular edge highlights. The interface is engineered for high-density spatial data, real-time vehicle flow matrices, and AI agent parameter controls without visual exhaustion.

## Colors

The system uses a strictly differentiated dual-palette architecture. Each theme enforces distinct chromatic boundaries to guarantee semantic clarity without cross-palette bleeding.

### Light Mode (Warm Frosted Glass)
The light theme evokes sunlight diffusing through smart architectural glass over an urban landscape.
- **Canvas Background**: Warm Off-White (`#FBF9F5`).
- **Glass Surfaces**: Frosted translucent white (`rgba(255, 255, 255, 0.70)` to `rgba(255, 255, 255, 0.85)`).
- **Glass Borders**: Ultra-fine frosted boundaries (`rgba(255, 255, 255, 0.60)` on top/left edges, `rgba(28, 26, 36, 0.08)` on bottom/right edges).
- **Primary CTA & Key Highlights**: Golden Yellow (`#FFCB3D`), paired with Deep Charcoal labels for strict contrast compliance.
- **Success & Flow Metrics**: Sage Green (`#5D9253`).
- **Secondary Accents & Environmental Data**: Forest Green (`#557945`).
- **Warning & Congestion Thresholds**: Warm Orange (`#F1A344`).
- **Primary Text**: Deep Charcoal (`#1C1A24`).
- **Muted Text / Metadata**: Neutral Taupe Charcoal (`#656272`).
- *Strict Rule*: Zero purple, blue, cyan, or synthetic neon hues are allowed in light mode.

### Dark Mode (Nocturnal Cyber-Vessel)
The dark theme mimics an illuminated night-time traffic command deck operating in deep spectrum frequencies.
- **Canvas Background**: Deep Midnight Purple (`#090040`).
- **Glass Surfaces**: Translucent Royal Purple tiers (`rgba(71, 19, 150, 0.35)` to `rgba(71, 19, 150, 0.60)`).
- **Interactive Accents & Specular Borders**: Electric Violet (`#B13BFF`) and fine violet rim boundaries (`rgba(177, 59, 255, 0.30)`).
- **Primary CTAs & Peak Alert Indicators**: Radiant Golden Yellow (`#FFCC00`).
- **Primary Text**: Pure Luminescent White (`#FFFFFF`).
- **Muted Text / Metadata**: Subdued Lavender Grey (`#A39AC2`).
- *Strict Rule*: Zero blue, cyan, or green hues are allowed in dark mode. Positive states must be indicated via high-key white or glowing violet states rather than green.

## Typography

The typographic hierarchy balances modern editorial authority with engineering rigor:
- **Headlines & Structural Titles (Plus Jakarta Sans)**: Delivers geometric warmth with contemporary curves that soften complex technical interfaces.
- **Body & Controls (Inter)**: Provides crystal-clear legibility across complex operational settings, side-drawers, and spatial controls.
- **Telemetry, Coordinates & Machine Tokens (JetBrains Mono)**: Dedicated to coordinates, simulation timestamps, velocity indices, agent IDs, and live metric streams.

Ensure strict tabular numerical alignment (`font-variant-numeric: tabular-nums`) across all numerical metrics inside tables and spatial cards.

## Layout & Spacing

The interface operates on an adaptive 12-column fluid grid system with persistent floating glass viewports. Because urban simulation demands uninterrupted map views, telemetry sidebars and control docks float above the core simulation canvas rather than pushing canvas boundaries.

### Breakpoint Matrix
- **Mobile (< 768px)**: 4-column layout. Section margins are `1rem`. Secondary telemetry collapses into bottom-anchored frosted glass sheets.
- **Tablet (768px - 1199px)**: 8-column layout. Section margins are `1.5rem`. Controls split between a compact top telemetry bar and collapsible tool drawers.
- **Desktop (1200px+)**: 12-column layout. Margin is fixed at `2rem`. Allows simultaneous left parameter floating docks, right analytical HUDs, and an unobstructed spatial viewport.

All UI containers honor an 8px base rhythmic cadence for interior structural padding and external visual breathing room.

## Elevation & Depth

Visual depth is achieved through stacked frosted glass surfaces rather than opaque heavy dropshadows.

### Light Mode Glass Hierarchy
- **Canvas Base**: Pure `#FBF9F5`.
- **Level 1 (Dock & Side Panels)**: `background: rgba(255, 255, 255, 0.70)`, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(255, 255, 255, 0.80)`, `box-shadow: 0 8px 32px -4px rgba(28, 26, 36, 0.05)`.
- **Level 2 (Cards & Active Floating Elements)**: `background: rgba(255, 255, 255, 0.85)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255, 255, 255, 0.90)`, `box-shadow: 0 12px 40px -6px rgba(28, 26, 36, 0.08)`.
- **Level 3 (Modals & Command Palettes)**: `background: rgba(255, 255, 255, 0.92)`, `backdrop-filter: blur(24px)`, `border: 1px solid #FFFFFF`, `box-shadow: 0 20px 48px -8px rgba(28, 26, 36, 0.12)`.

### Dark Mode Glass Hierarchy
- **Canvas Base**: `#090040`.
- **Level 1 (Dock & Side Panels)**: `background: rgba(71, 19, 150, 0.35)`, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(177, 59, 255, 0.20)`, `box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.40)`.
- **Level 2 (Cards & Active Floating Elements)**: `background: rgba(71, 19, 150, 0.50)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(177, 59, 255, 0.35)`, `box-shadow: 0 12px 40px -6px rgba(0, 0, 0, 0.55), inset 0 0 12px rgba(177, 59, 255, 0.15)`.
- **Level 3 (Modals & Command Palettes)**: `background: rgba(71, 19, 150, 0.70)`, `backdrop-filter: blur(24px)`, `border: 1px solid rgba(177, 59, 255, 0.50)`, `box-shadow: 0 24px 60px -8px rgba(0, 0, 0, 0.70), 0 0 20px rgba(177, 59, 255, 0.25)`.

## Shapes

The geometric form factor relies on balanced curvature (`0.5rem` / `8px` baseline). This structure creates a clean architectural container while softening high-density analytical screens:
- **Base Components (Inputs, Chips, Telemetry badges)**: `8px` (`0.5rem`).
- **Floating Panels, Data Cards, Modal Containers**: `16px` (`rounded-lg` / `1rem`).
- **Pills, Simulation Scrubbers, Play/Pause Controller Docks**: Fully rounded capsules (`9999px`).

## Components

### Buttons
- **Primary CTA**:
  - *Light Mode*: Solid Golden Yellow `#FFCB3D` with text `#1C1A24`, font weight 600. Subtle warm glow on hover (`box-shadow: 0 0 16px rgba(255, 203, 61, 0.4)`).
  - *Dark Mode*: Solid Golden Yellow `#FFCC00` with text `#090040`, font weight 600. High-luminance perimeter radiance on hover (`box-shadow: 0 0 20px rgba(255, 204, 0, 0.45)`).
- **Secondary Glass Action**:
  - *Light Mode*: `rgba(255, 255, 255, 0.75)` surface, 1px border `rgba(28, 26, 36, 0.12)`, text `#1C1A24`.
  - *Dark Mode*: `rgba(71, 19, 150, 0.40)` surface, 1px border Electric Violet `#B13BFF`, text `#FFFFFF`.

### Chips & Telemetry Tags
- Compact height (`24px` - `28px`) featuring `JetBrains Mono` font sizing.
- *Light Mode Positive*: Tinted frosted Sage Green `rgba(93, 146, 83, 0.12)` with solid `#5D9253` border and text.
- *Dark Mode Active*: Frosted Electric Violet `rgba(177, 59, 255, 0.20)` with vibrant `#B13BFF` text.

### Form Inputs & Slider Controls
- Inputs use translucent cutouts with `backdrop-filter: blur(12px)`.
- *Light Mode*: Background `rgba(255, 255, 255, 0.50)`, text `#1C1A24`, border `rgba(28, 26, 36, 0.15)`. Focus state rings with Golden Yellow `#FFCB3D`.
- *Dark Mode*: Background `rgba(9, 0, 64, 0.60)`, text `#FFFFFF`, border `rgba(177, 59, 255, 0.30)`. Focus state glows with Electric Violet `#B13BFF`.

### Lists & Data Grids
- Alternating rows use translucent zebra striping (`rgba(255, 255, 255, 0.25)` light; `rgba(71, 19, 150, 0.20)` dark).
- Row hover states trigger an instant specular highlight shift and subtle X-axis translation (`+2px`).

### Cards & HUD Panels
- Outfitted with crisp top-edge specular borders using linear gradients: `rgba(255,255,255,0.8)` to `rgba(255,255,255,0.1)` in light mode, and `rgba(177,59,255,0.6)` to `transparent` in dark mode.

### Simulation Player & Scrub Controller
- A floating capsule (`rounded-full`) anchored at the bottom viewport center. Translucent glass housing with mono speed markers (`0.5x`, `1.0x`, `5.0x`, `MAX`) and custom golden scrub handles.

### Empty States & Simulation Reset
- Empty states must avoid flat static icons. Use layered translucent glass wireframes (nested concentric glass rings with dashed vector outlines) paired with authoritative terminal guidance:
  - *Light Mode*: Charcoal text with Sage Green secondary action triggers.
  - *Dark Mode*: High-contrast white headline with Electric Violet dashed radar outlines and Golden Yellow initialization buttons.