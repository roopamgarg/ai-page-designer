/**
 * Style preset definitions for landing page generation
 * Each preset includes specific design instructions for the LLM
 */

import { StylePreset, StylePresetId, StylePresetConfig } from '@/types/stylePresets';

const minimalist: StylePreset = {
  id: 'minimalist',
  name: 'Minimalist',
  description: 'Clean, spacious design with focus on content',
  colors: {
    primary: '#1a1a1a',
    secondary: '#f5f5f5',
    accent: '#666666',
  },
  instructions: `
MINIMALIST DESIGN STYLE:
- Color palette: Monochromatic or very limited colors (black, white, one accent)
- Typography: Clean sans-serif fonts like Inter, Helvetica Neue, or System UI
- Spacing: Generous whitespace, breathing room between sections (80-120px vertical padding)
- Layout: Simple, single-column or asymmetric layouts
- Elements: Thin borders, subtle shadows, no heavy decorations
- Images: High-quality, simple compositions with lots of negative space
- Animations: Minimal, subtle fade-ins only
- Buttons: Ghost buttons or simple filled rectangles with no rounded corners
- Icons: Thin line icons, minimal detail
`,
};

const bold: StylePreset = {
  id: 'bold',
  name: 'Bold & Vibrant',
  description: 'Eye-catching gradients and large typography',
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#FFE66D',
  },
  instructions: `
BOLD & VIBRANT DESIGN STYLE:
- Color palette: Bright, saturated colors with striking gradients (pink to orange, blue to purple, etc.)
- Typography: Extra bold weights (700-900), oversized headings (clamp(3rem, 8vw, 6rem))
- Spacing: Asymmetric layouts with overlapping elements
- Layout: Dynamic grid layouts, broken grids, elements breaking out of containers
- Elements: Thick borders (3-4px), colorful shadows, blob shapes in background
- Gradients: Mesh gradients, linear gradients at 135deg angles
- Animations: Playful hover effects, scale transforms, color transitions
- Buttons: Large, pill-shaped with gradient backgrounds
- Background: Colorful gradient meshes or geometric patterns
`,
};

const corporate: StylePreset = {
  id: 'corporate',
  name: 'Corporate',
  description: 'Professional and trustworthy business design',
  colors: {
    primary: '#1E3A5F',
    secondary: '#F8FAFC',
    accent: '#3B82F6',
  },
  instructions: `
CORPORATE/PROFESSIONAL DESIGN STYLE:
- Color palette: Navy blue (#1E3A5F), slate grays, white backgrounds, blue accents
- Typography: Professional fonts like Inter, Source Sans Pro, or Roboto (400, 500, 600 weights)
- Spacing: Consistent, grid-aligned spacing (16px base unit)
- Layout: Structured grid layouts, clear visual hierarchy
- Elements: Subtle shadows (0 4px 6px rgba), light borders, contained sections
- Trust signals: Include stats/numbers sections, certification badges placeholder, testimonials
- Images: Professional photography style, team/office imagery placeholders
- Animations: Subtle, professional transitions (0.2s ease)
- Buttons: Solid blue buttons with subtle hover darken effect
- Sections: Clear separation with alternating white/light gray backgrounds
`,
};

const startup: StylePreset = {
  id: 'startup',
  name: 'Modern Startup',
  description: 'Dark mode with glassmorphism and modern effects',
  colors: {
    primary: '#0F172A',
    secondary: '#8B5CF6',
    accent: '#22D3EE',
  },
  instructions: `
MODERN STARTUP/TECH DESIGN STYLE:
- Color palette: Dark backgrounds (#0F172A, #1E293B), purple/cyan gradients, bright accent colors
- Typography: Modern geometric fonts like Space Grotesk, Outfit, or Satoshi
- Spacing: Generous padding, breathing room for dark theme
- Layout: Bento grid layouts, card-based sections
- Elements: Glassmorphism (backdrop-filter: blur(12px), semi-transparent backgrounds)
- Glow effects: Subtle colored shadows (0 0 40px rgba(139, 92, 246, 0.3))
- Borders: Subtle light borders (1px solid rgba(255,255,255,0.1))
- Gradients: Dark gradient backgrounds with purple/blue/cyan accents
- Animations: Smooth hover lifts, glow intensification, gradient shifts
- Buttons: Gradient buttons with glow effects on hover
- Background: Subtle grid pattern or gradient mesh overlay
`,
};

const playful: StylePreset = {
  id: 'playful',
  name: 'Playful',
  description: 'Friendly, approachable design with rounded elements',
  colors: {
    primary: '#6366F1',
    secondary: '#FEF3C7',
    accent: '#F472B6',
  },
  instructions: `
PLAYFUL/FRIENDLY DESIGN STYLE:
- Color palette: Bright pastels, warm yellows, friendly purples and pinks
- Typography: Rounded, friendly fonts like Nunito, Quicksand, or Poppins (500-700 weights)
- Spacing: Comfortable, not too tight
- Layout: Organic layouts, slightly asymmetric, fun compositions
- Elements: Very rounded corners (16-24px), soft shadows, emoji usage welcome
- Shapes: Organic blob shapes, wavy dividers between sections, circles
- Illustrations: Illustrated style imagery, hand-drawn elements
- Animations: Bouncy hover effects (transform with cubic-bezier), playful transitions
- Buttons: Pill-shaped, bright colors, fun hover animations (slight bounce)
- Background: Light, warm backgrounds with subtle patterns or floating shapes
- Personality: Friendly copy, exclamation points okay, casual tone
`,
};

export const stylePresets: StylePresetConfig = {
  presets: {
    minimalist,
    bold,
    corporate,
    startup,
    playful,
  },
  default: 'startup',
};

export function getStylePreset(id: StylePresetId): StylePreset {
  return stylePresets.presets[id];
}

export function getAllStylePresets(): StylePreset[] {
  return Object.values(stylePresets.presets);
}

